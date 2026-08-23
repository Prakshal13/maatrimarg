"""
Hospital Status Dashboard API.

GET  /hospitals              -> list all hospitals (for map + dashboard dropdown)
GET  /hospitals/{id}         -> single hospital detail
POST /hospitals/{id}/update  -> hospital staff update beds/blood stock/surgeon status
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import Hospital, get_db, log_audit_event

router = APIRouter()


class HospitalUpdateInput(BaseModel):
    beds_available: int
    nicu_beds_available: int
    surgeon_on_duty: bool
    obstetric_emergency_ready: bool = True
    anaesthesia_on_duty: bool = False
    ambulance_available: bool = False
    stock_o_pos: int = 0
    stock_o_neg: int = 0
    stock_a_pos: int = 0
    stock_a_neg: int = 0
    stock_b_pos: int = 0
    stock_b_neg: int = 0
    stock_ab_pos: int = 0
    stock_ab_neg: int = 0
    actor_id: str | None = "hospital_staff"


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
        "last_updated": h.last_updated.isoformat() if h.last_updated else None,
    }


@router.get("/hospitals")
def list_hospitals(state: str | None = None, district: str | None = None, db: Session = Depends(get_db)):
    if db.query(Hospital).count() < 100:
        try:
            from app.seed_hospitals import HOSPITALS
            for h in HOSPITALS:
                db.add(Hospital(**h))
            db.commit()
        except Exception as e:
            print(f"[Warning] Auto-seed hospitals failed: {e}")

    query = db.query(Hospital)
    if state:
        query = query.filter(Hospital.state == state)
    if district:
        query = query.filter(Hospital.district == district)
    hospitals = query.all()
    return [_hospital_to_dict(h) for h in hospitals]


@router.get("/hospitals/{hospital_id}")
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return _hospital_to_dict(hospital)


@router.post("/hospitals/{hospital_id}/update")
def update_hospital(hospital_id: int, data: HospitalUpdateInput, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    hospital.beds_available = data.beds_available  # type: ignore
    hospital.nicu_beds_available = data.nicu_beds_available  # type: ignore
    hospital.surgeon_on_duty = data.surgeon_on_duty  # type: ignore
    hospital.obstetric_emergency_ready = data.obstetric_emergency_ready  # type: ignore
    hospital.anaesthesia_on_duty = data.anaesthesia_on_duty  # type: ignore
    hospital.ambulance_available = data.ambulance_available  # type: ignore
    hospital.stock_o_pos = data.stock_o_pos  # type: ignore
    hospital.stock_o_neg = data.stock_o_neg  # type: ignore
    hospital.stock_a_pos = data.stock_a_pos  # type: ignore
    hospital.stock_a_neg = data.stock_a_neg  # type: ignore
    hospital.stock_b_pos = data.stock_b_pos  # type: ignore
    hospital.stock_b_neg = data.stock_b_neg  # type: ignore
    hospital.stock_ab_pos = data.stock_ab_pos  # type: ignore
    hospital.stock_ab_neg = data.stock_ab_neg  # type: ignore
    hospital.last_updated = datetime.now(timezone.utc)  # type: ignore

    log_audit_event(
        db,
        actor_type="hospital_staff",
        actor_id=data.actor_id,
        action="hospital_capacity_updated",
        target_type="hospital",
        target_id=hospital.id,
        details={
            "beds_available": data.beds_available,
            "nicu_beds_available": data.nicu_beds_available,
            "surgeon_on_duty": data.surgeon_on_duty,
        },
    )

    db.commit()
    db.refresh(hospital)
    return _hospital_to_dict(hospital)
