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

from app.db import Hospital, get_db

router = APIRouter()


class HospitalUpdateInput(BaseModel):
    beds_available: int
    nicu_beds_available: int
    surgeon_on_duty: bool
    stock_o_pos: int = 0
    stock_o_neg: int = 0
    stock_a_pos: int = 0
    stock_a_neg: int = 0
    stock_b_pos: int = 0
    stock_b_neg: int = 0
    stock_ab_pos: int = 0
    stock_ab_neg: int = 0


def _hospital_to_dict(h: Hospital) -> dict:
    return {
        "id": h.id,
        "name": h.name,
        "village_area": h.village_area,
        "lat": h.lat,
        "lng": h.lng,
        "beds_available": h.beds_available,
        "nicu_beds_available": h.nicu_beds_available,
        "surgeon_on_duty": h.surgeon_on_duty,
        "blood_stock": h.blood_stock_dict(),
        "last_updated": h.last_updated.isoformat() if h.last_updated else None,
    }


@router.get("/hospitals")
def list_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
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
    hospital.stock_o_pos = data.stock_o_pos  # type: ignore
    hospital.stock_o_neg = data.stock_o_neg  # type: ignore
    hospital.stock_a_pos = data.stock_a_pos  # type: ignore
    hospital.stock_a_neg = data.stock_a_neg  # type: ignore
    hospital.stock_b_pos = data.stock_b_pos  # type: ignore
    hospital.stock_b_neg = data.stock_b_neg  # type: ignore
    hospital.stock_ab_pos = data.stock_ab_pos  # type: ignore
    hospital.stock_ab_neg = data.stock_ab_neg  # type: ignore
    hospital.last_updated = datetime.now(timezone.utc)  # type: ignore

    db.commit()
    db.refresh(hospital)
    return _hospital_to_dict(hospital)