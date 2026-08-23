"""Referral selection and serialisation shared by clinical and command APIs."""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db import Alert, Hospital, Mother
from app.routing.graph import (
    build_graph,
    capacity_score,
    dijkstra,
    filter_eligible_hospitals,
)


ACTIVE_STATUSES = {"watch", "prep", "dispatch", "acknowledged", "en_route"}
VALID_STATUSES = ACTIVE_STATUSES | {"arrived", "closed", "escalated"}


def now():
    return datetime.now(timezone.utc)


def hospital_to_dict(hospital: Hospital) -> dict:
    return {
        "id": hospital.id,
        "name": hospital.name,
        "village_area": hospital.village_area,
        "district": hospital.district,
        "state": hospital.state,
        "lat": hospital.lat,
        "lng": hospital.lng,
        "beds_available": hospital.beds_available,
        "nicu_beds_available": hospital.nicu_beds_available,
        "surgeon_on_duty": hospital.surgeon_on_duty,
        "obstetric_emergency_ready": hospital.obstetric_emergency_ready,
        "anaesthesia_on_duty": hospital.anaesthesia_on_duty,
        "ambulance_available": hospital.ambulance_available,
        "blood_stock": hospital.blood_stock_dict(),
        "last_updated": hospital.last_updated.isoformat() if hospital.last_updated else None,
    }


def mother_to_summary(mother: Mother) -> dict:
    return {
        "id": mother.id,
        "name": mother.name,
        "age": mother.age,
        "village": mother.village,
        "blood_type": mother.blood_type,
        "gestational_age_weeks": mother.gestational_age_weeks,
        "current_risk_score": mother.current_risk_score,
        "current_tier": mother.current_tier,
        "labor_started": mother.labor_started,
        "needs_nicu": mother.needs_nicu,
    }


def ranked_hospitals(
    db: Session,
    mother: Mother,
    excluded_hospital_ids: set[int] | None = None,
    requires_surgeon: bool = True,
) -> tuple[list[dict], list[dict]]:
    """Return medically eligible destinations followed by explainable rejects."""
    excluded_hospital_ids = excluded_hospital_ids or set()
    hospitals = [hospital_to_dict(h) for h in db.query(Hospital).all()]

    from sqlalchemy import func
    counts_map = dict(
        db.query(Alert.hospital_id, func.count(Alert.id))
        .filter(Alert.status.in_(ACTIVE_STATUSES))
        .group_by(Alert.hospital_id)
        .all()
    )

    eligible, skipped = filter_eligible_hospitals(
        hospitals,
        mother.blood_type or "",
        bool(mother.needs_nicu),
        requires_surgeon=requires_surgeon,
        active_incoming_map=counts_map,
    )
    if excluded_hospital_ids:
        for hospital in list(eligible):
            if hospital["id"] in excluded_hospital_ids:
                eligible.remove(hospital)
                skipped.append({"hospital": hospital, "reasons": ["Already escalated from this hospital"]})

    if not eligible or mother.lat is None or mother.lng is None:
        return [], skipped

    source = {"id": "mother", "lat": mother.lat, "lng": mother.lng}
    graph = build_graph(source, [{"id": h["id"], "lat": h["lat"], "lng": h["lng"]} for h in eligible])
    distances, _ = dijkstra(graph, "mother")
    active_counts = {h["id"]: counts_map.get(h["id"], 0) for h in eligible}
    ranked = sorted(
        eligible,
        key=lambda hospital: (
            distances[hospital["id"]],
            capacity_score(hospital, active_counts[hospital["id"]]),
        ),
    )
    return [{**hospital, "eta_minutes": distances[hospital["id"]]} for hospital in ranked], skipped


def priority_for_tier(tier: str) -> str:
    return {"dispatch": "critical", "prep": "urgent"}.get(tier, "routine")


def create_referral(
    db: Session,
    mother: Mother,
    tier: str,
    message: str | None = None,
    priority: str | None = None,
    parent_referral_id: int | None = None,
    excluded_hospital_ids: set[int] | None = None,
    requires_surgeon: bool | None = None,
) -> tuple[Alert, list[dict]]:
    # Dispatch emergency requires on-duty surgeon, whereas prep/watch can monitor at equipped facilities
    if requires_surgeon is None:
        requires_surgeon = (tier == "dispatch")
    ranked, skipped = ranked_hospitals(db, mother, excluded_hospital_ids, requires_surgeon=requires_surgeon)
    best = ranked[0] if ranked else None
    referral = Alert(
        mother_id=mother.id,
        hospital_id=best["id"] if best else None,
        tier=tier,
        priority=priority or priority_for_tier(tier),
        status="dispatch" if tier == "dispatch" else "prep" if tier == "prep" else "watch",
        message=message or f"{tier.title()} maternal referral for {mother.name}",
        eta_minutes=best["eta_minutes"] if best else None,
        parent_referral_id=parent_referral_id,
    )
    db.add(referral)
    db.flush()
    return referral, skipped


def referral_to_dict(referral: Alert) -> dict:
    return {
        "id": referral.id,
        "mother": mother_to_summary(referral.mother) if referral.mother else None,
        "hospital": hospital_to_dict(referral.hospital) if referral.hospital else None,
        "tier": referral.tier,
        "priority": referral.priority,
        "status": referral.status,
        "message": referral.message,
        "eta_minutes": referral.eta_minutes,
        "acknowledged": referral.acknowledged,
        "escalated": referral.escalated,
        "ambulance_id": referral.ambulance_id,
        "parent_referral_id": referral.parent_referral_id,
        "last_status_note": referral.last_status_note,
        "created_at": referral.created_at.isoformat() if referral.created_at else None,
        "updated_at": referral.updated_at.isoformat() if referral.updated_at else None,
        "acknowledged_at": referral.acknowledged_at.isoformat() if referral.acknowledged_at else None,
        "dispatched_at": referral.dispatched_at.isoformat() if referral.dispatched_at else None,
        "arrived_at": referral.arrived_at.isoformat() if referral.arrived_at else None,
        "closed_at": referral.closed_at.isoformat() if referral.closed_at else None,
    }
