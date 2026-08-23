"""Read models for the real-time maternal logistics command centre."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import Alert, Hospital, get_db
from app.services.referrals import ACTIVE_STATUSES, hospital_to_dict, referral_to_dict

router = APIRouter(tags=["command center"])


def _filtered_hospitals(db: Session, state: str | None, district: str | None):
    query = db.query(Hospital)
    if state:
        query = query.filter(Hospital.state == state)
    if district:
        query = query.filter(Hospital.district == district)
    return query.all()


def _is_fresh(dt: datetime | None, cutoff: datetime) -> bool:
    if not dt:
        return False
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt >= cutoff


@router.get("/command-center/summary")
def command_center_summary(
    state: str | None = None,
    district: str | None = None,
    db: Session = Depends(get_db),
):
    hospitals = _filtered_hospitals(db, state, district)
    hospital_ids = [hospital.id for hospital in hospitals]
    active_query = db.query(Alert).filter(Alert.status.in_(ACTIVE_STATUSES))
    if hospital_ids:
        active_query = active_query.filter(Alert.hospital_id.in_(hospital_ids))
    else:
        active_query = active_query.filter(False) if (state or district) else active_query
    active = active_query.all()
    usable = [
        hospital for hospital in hospitals
        if hospital.beds_available > 0 and hospital.surgeon_on_duty and hospital.obstetric_emergency_ready
    ]
    recently_updated_cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    fresh = [
        hospital for hospital in usable
        if _is_fresh(hospital.last_updated, recently_updated_cutoff)
    ]
    diversions_query = db.query(Alert).filter(Alert.escalated.is_(True))
    if hospital_ids:
        diversions_query = diversions_query.filter(Alert.hospital_id.in_(hospital_ids))
    elif state or district:
        diversions_query = diversions_query.filter(False)

    return {
        "state": state,
        "district": district,
        "hospital_count": len(hospitals),
        "network_efficiency_percent": round((len(fresh) / len(hospitals)) * 100, 1) if hospitals else 0,
        "active_dispatches": sum(1 for referral in active if referral.status in {"dispatch", "acknowledged", "en_route"}),
        "active_referrals": len(active),
        "available_nicu_beds": sum(max(0, hospital.nicu_beds_available or 0) for hospital in hospitals),
        "emergency_diversions": diversions_query.count(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/network/hospitals")
def network_hospitals(
    state: str | None = None,
    district: str | None = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
):
    hospitals = _filtered_hospitals(db, state, district)
    if not hospitals:
        return []

    hospital_ids = [h.id for h in hospitals]
    # Single batch query to avoid N+1 queries across hundreds of hospitals
    active_counts_raw = (
        db.query(Alert.hospital_id, func.count(Alert.id))
        .filter(Alert.hospital_id.in_(hospital_ids), Alert.status.in_(ACTIVE_STATUSES))
        .group_by(Alert.hospital_id)
        .all()
    )
    counts_map = dict(active_counts_raw)

    result = []
    for hospital in hospitals:
        if available_only and not (hospital.beds_available > 0 and hospital.surgeon_on_duty):
            continue
        active_referrals = counts_map.get(hospital.id, 0)
        result.append({
            **hospital_to_dict(hospital),
            "active_referrals": active_referrals,
            "operational_status": "ready" if hospital.beds_available > 0 and hospital.surgeon_on_duty else "limited",
        })
    return result


@router.get("/network/hospitals/{hospital_id}/route-context")
def hospital_route_context(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        return {"hospital": None, "active_referrals": []}
    referrals = db.query(Alert).filter(
        Alert.hospital_id == hospital_id, Alert.status.in_(ACTIVE_STATUSES)
    ).order_by(Alert.created_at.desc()).all()
    return {"hospital": hospital_to_dict(hospital), "active_referrals": [referral_to_dict(referral) for referral in referrals]}
