"""
ASHA Worker Live Tracking & Safety Gateway
Provides real-time location streaming, status check-ins, and emergency SOS triggers.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import AshaWorker, get_db, log_audit_event, utcnow

router = APIRouter(prefix="/asha-workers", tags=["asha_workers"])

class LocationUpdateInput(BaseModel):
    lat: float
    lng: float
    status: Optional[str] = "active_in_field"
    battery_level: Optional[int] = 85

class SosAlertInput(BaseModel):
    lat: float
    lng: float
    reason: Optional[str] = "Lone-worker safety emergency beacon triggered"

SAMPLE_ASHA_WORKERS = [
    {
        "asha_id": "MH-GAD-401",
        "name": "Sunita Patil",
        "phone": "+91 98231 45012",
        "village_area": "Bhamragad Sub-Centre",
        "district": "Gadchiroli",
        "state": "Maharashtra",
        "lat": 19.3421,
        "lng": 80.3524,
        "status": "active_in_field",
        "active_mothers_count": 6,
        "battery_level": 78,
    },
    {
        "asha_id": "MH-GAD-402",
        "name": "Shobha Madavi",
        "phone": "+91 97654 32189",
        "village_area": "Aheri PHC",
        "district": "Gadchiroli",
        "state": "Maharashtra",
        "lat": 19.4125,
        "lng": 79.9984,
        "status": "in_anc_visit",
        "active_mothers_count": 4,
        "battery_level": 92,
    },
    {
        "asha_id": "MH-AMR-205",
        "name": "Pooja Jadhav",
        "phone": "+91 94221 88390",
        "village_area": "Melghat Tribal Belt",
        "district": "Amravati",
        "state": "Maharashtra",
        "lat": 21.4328,
        "lng": 77.2185,
        "status": "active_in_field",
        "active_mothers_count": 8,
        "battery_level": 64,
    },
    {
        "asha_id": "TN-CHE-101",
        "name": "Kavitha Raman",
        "phone": "+91 98401 23456",
        "village_area": "Mylapore Health Post",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "lat": 13.0337,
        "lng": 80.2673,
        "status": "active_in_field",
        "active_mothers_count": 5,
        "battery_level": 88,
    },
    {
        "asha_id": "TN-CHE-102",
        "name": "Lakshmi Narayanan",
        "phone": "+91 94440 98765",
        "village_area": "T. Nagar PHC",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "lat": 13.0418,
        "lng": 80.2341,
        "status": "in_anc_visit",
        "active_mothers_count": 3,
        "battery_level": 81,
    },
    {
        "asha_id": "TN-CBE-304",
        "name": "Deepa Sundaram",
        "phone": "+91 98940 11223",
        "village_area": "Pollachi Rural",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "lat": 10.6582,
        "lng": 77.0078,
        "status": "active_in_field",
        "active_mothers_count": 7,
        "battery_level": 95,
    },
    {
        "asha_id": "TN-VIL-108",
        "name": "Ananya Devi",
        "phone": "+91 97890 33445",
        "village_area": "Gingee Sub-District",
        "district": "Villupuram",
        "state": "Tamil Nadu",
        "lat": 12.2536,
        "lng": 79.4182,
        "status": "active_in_field",
        "active_mothers_count": 5,
        "battery_level": 70,
    }
]

def seed_asha_workers_if_empty(db: Session):
    count = db.query(AshaWorker).count()
    if count == 0:
        for item in SAMPLE_ASHA_WORKERS:
            w = AshaWorker(**item)
            db.add(w)
        db.commit()

@router.get("")
def list_asha_workers(district: Optional[str] = None, state: Optional[str] = None, db: Session = Depends(get_db)):
    seed_asha_workers_if_empty(db)
    query = db.query(AshaWorker)
    if district:
        query = query.filter(AshaWorker.district.ilike(f"%{district}%"))
    if state:
        query = query.filter(AshaWorker.state.ilike(f"%{state}%"))
    workers = query.all()
    return [
        {
            "id": w.id,
            "asha_id": w.asha_id,
            "name": w.name,
            "phone": w.phone,
            "village_area": w.village_area,
            "district": w.district,
            "state": w.state,
            "lat": w.lat,
            "lng": w.lng,
            "status": w.status,
            "active_mothers_count": w.active_mothers_count,
            "battery_level": w.battery_level,
            "last_checkin": w.last_checkin.isoformat() if w.last_checkin else None,
        }
        for w in workers
    ]

@router.post("/{worker_id}/location")
def update_asha_location(worker_id: int, payload: LocationUpdateInput, db: Session = Depends(get_db)):
    worker = db.query(AshaWorker).filter(AshaWorker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="ASHA worker not found")
    
    worker.lat = payload.lat
    worker.lng = payload.lng
    if payload.status:
        worker.status = payload.status
    if payload.battery_level is not None:
        worker.battery_level = payload.battery_level
    worker.last_checkin = utcnow()
    worker.updated_at = utcnow()
    db.commit()

    log_audit_event(
        db,
        actor_type="asha",
        actor_id=worker.asha_id,
        action="location_updated",
        target_type="asha_worker",
        target_id=worker.id,
        details={"lat": payload.lat, "lng": payload.lng, "status": payload.status}
    )
    return {"status": "ok", "worker_id": worker.id, "last_checkin": worker.last_checkin.isoformat()}

@router.post("/{worker_id}/sos")
def trigger_asha_sos(worker_id: int, payload: SosAlertInput, db: Session = Depends(get_db)):
    worker = db.query(AshaWorker).filter(AshaWorker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="ASHA worker not found")
    
    worker.status = "emergency_sos"
    worker.lat = payload.lat
    worker.lng = payload.lng
    worker.last_checkin = utcnow()
    db.commit()

    log_audit_event(
        db,
        actor_type="asha",
        actor_id=worker.asha_id,
        action="emergency_sos_beacon_triggered",
        target_type="asha_worker",
        target_id=worker.id,
        details={"lat": payload.lat, "lng": payload.lng, "reason": payload.reason}
    )
    return {
        "status": "emergency_broadcast_active",
        "alert": f"🚨 EMERGENCY BEACON: ASHA Worker {worker.name} ({worker.asha_id}) triggered SOS at lat {payload.lat:.4f}, lng {payload.lng:.4f} in {worker.village_area}!",
        "timestamp": utcnow().isoformat()
    }
