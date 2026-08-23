"""
Routing API.

POST /route
  Body: { mother_lat, mother_lng, blood_type, needs_nicu }
  Returns: {
    best_hospital: {...},
    eta_minutes: float,
    alternatives: [...],      # other eligible hospitals, ranked
    skipped: [...]            # ineligible hospitals + why they were skipped
  }
"""
from typing import Literal
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import Hospital, Alert, get_db
from app.routing.graph import (
    build_graph,
    dijkstra,
    filter_eligible_hospitals,
    capacity_score,
    haversine_km,
    travel_time_minutes,
)
from app.services.referrals import ACTIVE_STATUSES

router = APIRouter()


class RouteRequest(BaseModel):
    mother_lat: float = Field(description="Patient GPS latitude")
    mother_lng: float = Field(description="Patient GPS longitude")
    blood_type: str | None = Field(default="O+", description="Patient blood group, e.g. O+, O-, A+, AB-")
    needs_nicu: bool = False
    requires_surgeon: bool = True
    requires_anaesthesia: bool = False
    case_type: Literal["maternal", "child", "chronic"] = "maternal"


def _hospital_to_dict(h: Hospital) -> dict:
    return {
        "id": h.id,
        "name": h.name,
        "village_area": h.village_area,
        "district": h.district,
        "state": h.state,
        "lat": h.lat,
        "lng": h.lng,
        "beds_available": h.beds_available,
        "nicu_beds_available": h.nicu_beds_available,
        "surgeon_on_duty": h.surgeon_on_duty,
        "obstetric_emergency_ready": h.obstetric_emergency_ready,
        "anaesthesia_on_duty": h.anaesthesia_on_duty,
        "ambulance_available": h.ambulance_available,
        "blood_stock": h.blood_stock_dict(),
    }


@router.post("/route")
def route_to_best_hospital(req: RouteRequest, db: Session = Depends(get_db)):
    all_hospitals = [_hospital_to_dict(h) for h in db.query(Hospital).all()]

    # Single batch query for active in-flight referral counts across all facilities
    active_counts_query = (
        db.query(Alert.hospital_id, func.count(Alert.id))
        .filter(Alert.status.in_(ACTIVE_STATUSES))
        .group_by(Alert.hospital_id)
        .all()
    )
    active_counts_map = dict(active_counts_query)

    # Adjust clinical requirements based on case_type
    requires_surgeon = req.requires_surgeon if req.case_type == "maternal" else False
    needs_nicu = req.needs_nicu or (req.case_type == "child" and req.needs_nicu)

    eligible, skipped = filter_eligible_hospitals(
        all_hospitals,
        blood_type=req.blood_type or "",
        needs_nicu=needs_nicu,
        requires_surgeon=requires_surgeon,
        requires_anaesthesia=req.requires_anaesthesia,
        active_incoming_map=active_counts_map,
    )

    source_node = {"id": "patient", "lat": req.mother_lat, "lng": req.mother_lng}

    # If no hospital meets 100% of criteria, provide fallback nearest stabilization center
    if not eligible:
        fallback_candidates = [h for h in all_hospitals if h["beds_available"] > 0] or all_hospitals
        closest_fallback = min(
            fallback_candidates,
            key=lambda h: haversine_km(req.mother_lat, req.mother_lng, h["lat"], h["lng"]),
        ) if fallback_candidates else None

        fallback_eta = travel_time_minutes(
            haversine_km(req.mother_lat, req.mother_lng, closest_fallback["lat"], closest_fallback["lng"])
        ) if closest_fallback else None

        return {
            "best_hospital": None,
            "eta_minutes": None,
            "alternatives": [],
            "skipped": skipped,
            "message": "No fully-eligible hospital found meeting all surgical/NICU/blood requirements simultaneously.",
            "fallback_stabilization_hospital": {
                **closest_fallback,
                "eta_minutes": fallback_eta,
                "note": "Geographically closest facility for vital resuscitation and stabilization while emergency blood/specialist is requested."
            } if closest_fallback else None,
        }

    hospital_nodes = [{"id": h["id"], "lat": h["lat"], "lng": h["lng"]} for h in eligible]
    graph = build_graph(source_node, hospital_nodes)
    distances, _ = dijkstra(graph, "patient")

    ranked = sorted(
        eligible,
        key=lambda h: (
            distances[h["id"]],
            capacity_score(h, active_counts_map.get(h["id"], 0)),
        ),
    )

    best = ranked[0]
    alternatives = [
        {**h, "eta_minutes": distances[h["id"]]} for h in ranked[1:]
    ]

    return {
        "case_type": req.case_type,
        "best_hospital": {**best, "eta_minutes": distances[best["id"]]},
        "eta_minutes": distances[best["id"]],
        "alternatives": alternatives,
        "skipped": skipped,
    }
