import json
import os
from datetime import datetime, timezone

import joblib
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import Child, ChildVitalsRecord, ChronicAssessment, ChronicPatient, get_db
from app.ml.child_triage import assess_child

router = APIRouter(prefix="/assessments", tags=["risk assessments"])
THIS_DIR = os.path.dirname(os.path.abspath(__file__))


# --- Input Models ---
class ChildCreateInput(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age_months: int = Field(ge=0, le=60)
    gender: str = Field(default="unspecified", pattern="^(male|female|other|unspecified)$")
    parent_name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    village: str | None = Field(default=None, max_length=120)
    lat: float | None = None
    lng: float | None = None
    consent_given: bool = True


class ChildTriageInput(BaseModel):
    age_months: int = Field(ge=0, le=60)
    respiratory_rate: float = Field(gt=0, le=150)
    heart_rate: float = Field(gt=0, le=300)
    spo2: float = Field(ge=50, le=100)
    temperature_c: float = Field(ge=30, le=45)


class ChildVitalsLogInput(BaseModel):
    respiratory_rate: float = Field(gt=0, le=150)
    heart_rate: float = Field(gt=0, le=300)
    spo2: float = Field(ge=50, le=100)
    temperature_c: float = Field(ge=30, le=45)


class ChronicPatientCreateInput(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age_years: float = Field(ge=18, le=120)
    gender: str = Field(default="unspecified", pattern="^(female|male|other|unspecified)$")
    phone: str | None = Field(default=None, max_length=30)
    village: str | None = Field(default=None, max_length=120)
    lat: float | None = None
    lng: float | None = None
    consent_given: bool = True


class ChronicCardioInput(BaseModel):
    age_years: float = Field(ge=18, le=100)
    gender: int = Field(ge=1, le=2, description="Dataset encoding: 1 for female, 2 for male")
    height_cm: float = Field(ge=120, le=230)
    weight_kg: float = Field(ge=30, le=250)
    systolic_bp: float = Field(ge=70, le=250)
    diastolic_bp: float = Field(ge=40, le=160)
    cholesterol: int = Field(ge=1, le=3, description="1: normal, 2: above normal, 3: well above normal")
    glucose: int = Field(ge=1, le=3, description="1: normal, 2: above normal, 3: well above normal")
    smoke: bool = False
    alcohol: bool = False
    physically_active: bool = True


class ChronicAssessmentLogInput(BaseModel):
    height_cm: float = Field(ge=120, le=230)
    weight_kg: float = Field(ge=30, le=250)
    systolic_bp: float = Field(ge=70, le=250)
    diastolic_bp: float = Field(ge=40, le=160)
    cholesterol: int = Field(ge=1, le=3)
    glucose: int = Field(ge=1, le=3)
    smoke: bool = False
    alcohol: bool = False
    physically_active: bool = True


# --- Artifact Loaders ---
def _load_child_artifacts():
    model_path = os.path.join(THIS_DIR, "..", "ml", "child_risk_model.pkl")
    metadata_path = os.path.join(THIS_DIR, "..", "ml", "child_model_metadata.json")
    importance_path = os.path.join(THIS_DIR, "..", "ml", "child_feature_importance.json")
    if not all(os.path.exists(path) for path in (model_path, metadata_path, importance_path)):
        return None, None, None
    with open(metadata_path) as file:
        metadata = json.load(file)
    with open(importance_path) as file:
        importances = json.load(file)
    return joblib.load(model_path), metadata, importances


def _load_chronic_artifacts():
    model_path = os.path.join(THIS_DIR, "..", "ml", "chronic_risk_model.pkl")
    metadata_path = os.path.join(THIS_DIR, "..", "ml", "chronic_model_metadata.json")
    importance_path = os.path.join(THIS_DIR, "..", "ml", "chronic_feature_importance.json")
    if not all(os.path.exists(path) for path in (model_path, metadata_path, importance_path)):
        raise HTTPException(status_code=503, detail="Chronic model is not trained. Run python3 -m app.ml.train_generic_model chronic first.")
    with open(metadata_path) as file:
        metadata = json.load(file)
    with open(importance_path) as file:
        importances = json.load(file)
    return joblib.load(model_path), metadata, importances


def _evaluate_child_triage(age_months: int, rr: float, hr: float, spo2: float, temp_c: float) -> dict:
    clinical = assess_child(age_months, rr, hr, spo2, temp_c)
    child_model, metadata, importances = _load_child_artifacts()
    ml_result = {}
    if child_model is not None:
        features = pd.DataFrame([{
            "AgeMonths": age_months,
            "RespRate": rr,
            "HeartRate": hr,
            "SpO2": spo2,
            "TempC": temp_c,
        }])
        probabilities = dict(zip(child_model.classes_, child_model.predict_proba(features)[0]))
        p_low = float(probabilities.get(0, 0.0))
        p_mid = float(probabilities.get(1, 0.0))
        p_high = float(probabilities.get(2, 0.0))
        ml_score = round(p_low * 0 + p_mid * 50 + p_high * 100, 1)
        ml_predicted_class = int(child_model.predict(features)[0])
        ml_class_name = "high risk" if ml_predicted_class == 2 else "mid risk" if ml_predicted_class == 1 else "low risk"
        ml_result = {
            "ml_risk_score": ml_score,
            "ml_predicted_class": ml_class_name,
            "ml_probabilities": {"low": p_low, "mid": p_mid, "high": p_high},
            "ml_feature_importance": importances,
        }
    return {
        "assessment_type": "paediatric triage decision support",
        **clinical,
        **ml_result,
        "disclaimer": "Decision support only. Assess emergency signs and obtain clinician review; do not use as an autonomous diagnosis or discharge decision.",
    }


def _evaluate_chronic_cardio(age_years: float, gender_code: int, height_cm: float, weight_kg: float,
                             sys_bp: float, dia_bp: float, chol: int, gluc: int,
                             smoke: bool, alco: bool, active: bool) -> dict:
    if sys_bp <= dia_bp:
        raise HTTPException(status_code=422, detail="Systolic blood pressure must exceed diastolic blood pressure")
    model, metadata, importances = _load_chronic_artifacts()
    bmi = weight_kg / (height_cm / 100) ** 2
    features = pd.DataFrame([{
        "age_years": age_years,
        "gender": gender_code,
        "bmi": bmi,
        "ap_hi": sys_bp,
        "ap_lo": dia_bp,
        "cholesterol": chol,
        "gluc": gluc,
        "smoke": int(smoke),
        "alco": int(alco),
        "active": int(active),
    }])
    probabilities = dict(zip(model.classes_, model.predict_proba(features)[0]))
    high_probability = float(probabilities.get(2, 0.0))
    priority = "priority_review" if high_probability >= 0.65 else "clinical_review" if high_probability >= 0.35 else "routine_screening"
    factors = []
    if sys_bp >= 140 or dia_bp >= 90:
        factors.append("Elevated blood pressure input")
    if chol > 1:
        factors.append("Elevated cholesterol category")
    if gluc > 1:
        factors.append("Elevated glucose category")
    if smoke:
        factors.append("Smoking recorded")
    if bmi >= 30:
        factors.append("BMI is in the obesity range")
    return {
        "assessment_type": "cardiovascular screening support",
        "risk_score": round(high_probability * 100, 1),
        "screening_priority": priority,
        "bmi": round(bmi, 1),
        "contributing_factors": factors,
        "model_feature_importance": importances,
        "model_metadata": metadata,
        "disclaimer": "Internal-validation screening support only; not a diagnosis, treatment recommendation, or replacement for clinician assessment.",
    }


# --- Stateless ML Prediction Endpoints ---
@router.post("/child-triage")
def child_triage(data: ChildTriageInput):
    return _evaluate_child_triage(data.age_months, data.respiratory_rate, data.heart_rate, data.spo2, data.temperature_c)


@router.post("/chronic-cardio")
def chronic_cardio_assessment(data: ChronicCardioInput):
    return _evaluate_chronic_cardio(
        data.age_years, data.gender, data.height_cm, data.weight_kg,
        data.systolic_bp, data.diastolic_bp, data.cholesterol, data.glucose,
        data.smoke, data.alcohol, data.physically_active
    )


# --- Database CRUD & Longitudinal Patient Records ---
@router.post("/children", status_code=status.HTTP_201_CREATED)
def create_child(data: ChildCreateInput, db: Session = Depends(get_db)):
    if not data.consent_given:
        raise HTTPException(status_code=400, detail="Documented patient/parent consent is required")
    child = Child(**data.model_dump())
    db.add(child)
    db.commit()
    db.refresh(child)
    return child


@router.get("/children")
def list_children(db: Session = Depends(get_db)):
    return db.query(Child).order_by(Child.id.desc()).all()


@router.get("/children/{child_id}")
def get_child(child_id: int, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child patient not found")
    vitals = db.query(ChildVitalsRecord).filter(ChildVitalsRecord.child_id == child_id).order_by(ChildVitalsRecord.timestamp.desc()).all()
    return {
        "child": child,
        "vitals_history": [{
            "id": v.id,
            "timestamp": v.timestamp.isoformat() if v.timestamp else None,
            "respiratory_rate": v.respiratory_rate,
            "heart_rate": v.heart_rate,
            "spo2": v.spo2,
            "temperature_c": v.temperature_c,
            "risk_score": v.risk_score,
            "risk_tier": v.risk_tier,
            "reasons": json.loads(v.reasons or "[]"),
            "ml_risk_score": v.ml_risk_score,
            "ml_probabilities": json.loads(v.ml_probabilities or "{}"),
        } for v in vitals],
    }


@router.post("/children/{child_id}/vitals", status_code=status.HTTP_201_CREATED)
def record_child_vitals(child_id: int, data: ChildVitalsLogInput, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child patient not found")
    assessment = _evaluate_child_triage(
        child.age_months, data.respiratory_rate, data.heart_rate, data.spo2, data.temperature_c
    )
    record = ChildVitalsRecord(
        child_id=child.id,
        respiratory_rate=data.respiratory_rate,
        heart_rate=data.heart_rate,
        spo2=data.spo2,
        temperature_c=data.temperature_c,
        risk_score=assessment.get("score"),
        risk_tier=assessment.get("risk_tier"),
        reasons=json.dumps(assessment.get("reasons", [])),
        ml_risk_score=assessment.get("ml_risk_score"),
        ml_probabilities=json.dumps(assessment.get("ml_probabilities", {})),
    )
    child.current_tier = assessment.get("risk_tier", "low")
    child.current_risk_score = assessment.get("ml_risk_score", assessment.get("score", 0))
    child.updated_at = datetime.now(timezone.utc)
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "vitals_record": record,
        "assessment": assessment,
    }


@router.post("/chronic-patients", status_code=status.HTTP_201_CREATED)
def create_chronic_patient(data: ChronicPatientCreateInput, db: Session = Depends(get_db)):
    if not data.consent_given:
        raise HTTPException(status_code=400, detail="Documented patient consent is required")
    patient = ChronicPatient(**data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/chronic-patients")
def list_chronic_patients(db: Session = Depends(get_db)):
    return db.query(ChronicPatient).order_by(ChronicPatient.id.desc()).all()


@router.get("/chronic-patients/{patient_id}")
def get_chronic_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(ChronicPatient).filter(ChronicPatient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Chronic patient not found")
    assessments = db.query(ChronicAssessment).filter(ChronicAssessment.patient_id == patient_id).order_by(ChronicAssessment.timestamp.desc()).all()
    return {
        "patient": patient,
        "assessments_history": [{
            "id": a.id,
            "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            "bmi": a.bmi,
            "systolic_bp": a.systolic_bp,
            "diastolic_bp": a.diastolic_bp,
            "cholesterol": a.cholesterol,
            "glucose": a.glucose,
            "smoke": a.smoke,
            "alcohol": a.alcohol,
            "physically_active": a.physically_active,
            "risk_score": a.risk_score,
            "screening_priority": a.screening_priority,
            "contributing_factors": json.loads(a.contributing_factors or "[]"),
        } for a in assessments],
    }


@router.post("/chronic-patients/{patient_id}/assessments", status_code=status.HTTP_201_CREATED)
def record_chronic_assessment(patient_id: int, data: ChronicAssessmentLogInput, db: Session = Depends(get_db)):
    patient = db.query(ChronicPatient).filter(ChronicPatient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Chronic patient not found")
    gender_code = 1 if (patient.gender or "").lower() in {"female", "f"} else 2
    assessment = _evaluate_chronic_cardio(
        patient.age_years, gender_code, data.height_cm, data.weight_kg,
        data.systolic_bp, data.diastolic_bp, data.cholesterol, data.glucose,
        data.smoke, data.alcohol, data.physically_active
    )
    record = ChronicAssessment(
        patient_id=patient.id,
        height_cm=data.height_cm,
        weight_kg=data.weight_kg,
        bmi=assessment.get("bmi"),
        systolic_bp=data.systolic_bp,
        diastolic_bp=data.diastolic_bp,
        cholesterol=data.cholesterol,
        glucose=data.glucose,
        smoke=data.smoke,
        alcohol=data.alcohol,
        physically_active=data.physically_active,
        risk_score=assessment.get("risk_score"),
        screening_priority=assessment.get("screening_priority"),
        contributing_factors=json.dumps(assessment.get("contributing_factors", [])),
    )
    patient.current_risk_score = assessment.get("risk_score", 0)
    patient.current_priority = assessment.get("screening_priority", "routine_screening")
    patient.updated_at = datetime.now(timezone.utc)
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "assessment_record": record,
        "assessment_details": assessment,
    }


@router.get("/model-info/{case_type}")
def model_info(case_type: str):
    if case_type not in {"maternal", "child", "chronic"}:
        raise HTTPException(status_code=404, detail="Unknown model type")
    metadata_path = os.path.join(THIS_DIR, "..", "ml", f"{case_type}_model_metadata.json")
    if not os.path.exists(metadata_path):
        raise HTTPException(status_code=404, detail="Model metadata not found; train this model first")
    with open(metadata_path) as file:
        return json.load(file)
