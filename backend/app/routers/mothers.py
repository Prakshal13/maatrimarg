"""Frontline-worker APIs for maternal records and longitudinal vitals."""
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import Alert, Mother, VitalsRecord, get_db
from app.routers.risk import VitalsInput, score_vitals
from app.services.referrals import create_referral, mother_to_summary, referral_to_dict

router = APIRouter(prefix="/mothers", tags=["mothers"])


class MotherCreateInput(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=12, le=65)
    phone: str | None = Field(default=None, max_length=30)
    village: str | None = Field(default=None, max_length=120)
    blood_type: str = Field(min_length=2, max_length=3)
    gestational_age_weeks: int | None = Field(default=None, ge=1, le=45)
    lat: float
    lng: float
    needs_nicu: bool = False
    consent_given: bool


class LaborStatusInput(BaseModel):
    labor_started: bool
    needs_nicu: bool | None = None


class MotherVitalsInput(BaseModel):
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    body_temp: float
    heart_rate: float


def _mother_or_404(db: Session, mother_id: int) -> Mother:
    mother = db.query(Mother).filter(Mother.id == mother_id).first()
    if not mother:
        raise HTTPException(status_code=404, detail="Mother not found")
    return mother


def mask_phone(phone: str | None) -> str | None:
    """Masks patient phone number for DISHA / HIPAA compliance e.g. 9876****10."""
    if not phone or len(phone) < 6:
        return phone
    return phone[:4] + "****" + phone[-2:]


def _serialize_mother(mother: Mother, mask_phi: bool = False) -> dict:
    return {
        **mother_to_summary(mother),
        "phone": mask_phone(mother.phone) if mask_phi else mother.phone,
        "lat": mother.lat,
        "lng": mother.lng,
        "consent_given": mother.consent_given,
        "created_at": mother.created_at.isoformat() if mother.created_at else None,
        "updated_at": mother.updated_at.isoformat() if mother.updated_at else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_mother(data: MotherCreateInput, db: Session = Depends(get_db)):
    if not data.consent_given:
        raise HTTPException(status_code=400, detail="Documented patient consent is required")
    mother = Mother(**data.model_dump())
    db.add(mother)
    db.commit()
    db.refresh(mother)
    return _serialize_mother(mother)


@router.get("")
def list_mothers(mask_phi: bool = False, db: Session = Depends(get_db)):
    return [_serialize_mother(mother, mask_phi=mask_phi) for mother in db.query(Mother).order_by(Mother.id.desc()).all()]


@router.get("/{mother_id}")
def get_mother(mother_id: int, mask_phi: bool = False, db: Session = Depends(get_db)):
    return _serialize_mother(_mother_or_404(db, mother_id), mask_phi=mask_phi)


@router.post("/{mother_id}/vitals", status_code=status.HTTP_201_CREATED)
def record_vitals(mother_id: int, data: MotherVitalsInput, db: Session = Depends(get_db)):
    mother = _mother_or_404(db, mother_id)
    result = score_vitals(VitalsInput(age=mother.age, labor_started=mother.labor_started, **data.model_dump()))
    record = VitalsRecord(
        mother_id=mother.id,
        **data.model_dump(),
        risk_score=result["risk_score"],
        risk_tier=result["risk_tier"],
        explanation=json.dumps(result["explanation"]),
    )
    mother.current_risk_score = result["risk_score"]
    mother.current_tier = result["risk_tier"]
    mother.updated_at = datetime.now(timezone.utc)
    db.add(record)
    referral = None
    if result["risk_tier"] in {"prep", "dispatch"}:
        existing_referral = db.query(Alert).filter(
            Alert.mother_id == mother.id,
            Alert.status.in_(["watch", "prep", "dispatch", "acknowledged", "en_route"]),
        ).order_by(Alert.created_at.desc()).first()
        if existing_referral:
            existing_referral.tier = result["risk_tier"]
            if result["risk_tier"] == "dispatch" and existing_referral.status in {"watch", "prep"}:
                existing_referral.status = "dispatch"
                existing_referral.priority = "critical"
            existing_referral.message = f"{result['risk_tier'].title()} maternal referral for {mother.name}"
            referral = existing_referral
        else:
            referral, _ = create_referral(db, mother, result["risk_tier"])
    db.commit()
    db.refresh(record)
    return {
        "vitals_record": _serialize_record(record),
        "risk": result,
        "referral": referral_to_dict(referral) if referral else None,
    }


@router.get("/{mother_id}/timeline")
def mother_timeline(mother_id: int, db: Session = Depends(get_db)):
    mother = _mother_or_404(db, mother_id)
    records = db.query(VitalsRecord).filter(VitalsRecord.mother_id == mother.id).order_by(VitalsRecord.timestamp.desc()).all()
    return {"mother": _serialize_mother(mother), "vitals": [_serialize_record(record) for record in records]}


@router.patch("/{mother_id}/labor-status")
def update_labor_status(mother_id: int, data: LaborStatusInput, db: Session = Depends(get_db)):
    mother = _mother_or_404(db, mother_id)
    mother.labor_started = data.labor_started
    if data.needs_nicu is not None:
        mother.needs_nicu = data.needs_nicu
    # A high-risk mother entering labour becomes dispatch-ready immediately.
    referral = None
    if mother.labor_started and (mother.current_risk_score or 0) > 70:
        mother.current_tier = "dispatch"
        referral = db.query(Alert).filter(
            Alert.mother_id == mother.id,
            Alert.status.in_(["watch", "prep"]),
        ).order_by(Alert.created_at.desc()).first()
        if referral:
            referral.tier = "dispatch"
            referral.priority = "critical"
            referral.status = "dispatch"
            referral.message = f"Dispatch maternal referral for {mother.name}"
        else:
            referral, _ = create_referral(db, mother, "dispatch")
    db.commit()
    return {"mother": _serialize_mother(mother), "referral": referral_to_dict(referral) if referral else None}


def _serialize_record(record: VitalsRecord) -> dict:
    return {
        "id": record.id,
        "timestamp": record.timestamp.isoformat() if record.timestamp else None,
        "systolic_bp": record.systolic_bp,
        "diastolic_bp": record.diastolic_bp,
        "blood_sugar": record.blood_sugar,
        "body_temp": record.body_temp,
        "heart_rate": record.heart_rate,
        "risk_score": record.risk_score,
        "risk_tier": record.risk_tier,
        "explanation": json.loads(record.explanation or "[]"),
    }
