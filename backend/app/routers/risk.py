"""
Risk Score Engine API.

POST /predict-risk
  Body: { age, systolic_bp, diastolic_bp, blood_sugar, body_temp, heart_rate, labor_started }
  Returns: { risk_score (0-100), risk_tier, explanation: [...] }
"""
import json
import os

import joblib
from fastapi import APIRouter
from pydantic import BaseModel

from app.ml.tier_mapper import get_tier

router = APIRouter()

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(THIS_DIR, "..", "ml", "risk_model.pkl")
IMPORTANCE_PATH = os.path.join(THIS_DIR, "..", "ml", "feature_importance.json")

_model = None
_feature_importance = None


def _load_model():
    """Lazy-load so the API doesn't crash on startup if the model hasn't
    been trained yet - it'll just error clearly when /predict-risk is called."""
    global _model, _feature_importance
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        with open(IMPORTANCE_PATH) as f:
            _feature_importance = json.load(f)
    return _model, _feature_importance


class VitalsInput(BaseModel):
    age: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    body_temp: float
    heart_rate: float
    labor_started: bool = False


# Clinically reasonable "normal" ranges used purely for the explanation layer -
# NOT used by the model itself, just to describe WHY a score is high in plain terms.
NORMAL_RANGES = {
    "systolic_bp": (90, 120),
    "diastolic_bp": (60, 80),
    "blood_sugar": (3.9, 7.8),  # mmol/L, roughly normal random glucose range
    "body_temp": (97, 99),      # Fahrenheit
    "heart_rate": (60, 100),
}

FRIENDLY_NAMES = {
    "SystolicBP": "High blood pressure (systolic)",
    "DiastolicBP": "High blood pressure (diastolic)",
    "BS": "Elevated blood sugar",
    "BodyTemp": "Abnormal body temperature",
    "HeartRate": "Abnormal heart rate",
    "Age": "Age-related risk",
}


def build_explanation(vitals: VitalsInput, feature_importance: dict) -> list:
    """Compares input vitals against normal ranges, and returns a list of
    contributing factors ordered by how much the model weighs that feature."""
    flags = []

    if vitals.systolic_bp > NORMAL_RANGES["systolic_bp"][1] or vitals.diastolic_bp > NORMAL_RANGES["diastolic_bp"][1]:
        flags.append("SystolicBP" if vitals.systolic_bp > NORMAL_RANGES["systolic_bp"][1] else "DiastolicBP")
    if vitals.blood_sugar > NORMAL_RANGES["blood_sugar"][1]:
        flags.append("BS")
    if not (NORMAL_RANGES["body_temp"][0] <= vitals.body_temp <= NORMAL_RANGES["body_temp"][1]):
        flags.append("BodyTemp")
    if not (NORMAL_RANGES["heart_rate"][0] <= vitals.heart_rate <= NORMAL_RANGES["heart_rate"][1]):
        flags.append("HeartRate")
    if vitals.age > 35 or vitals.age < 18:
        flags.append("Age")

    # Order flagged factors by how important the model considers that feature
    flags_sorted = sorted(flags, key=lambda f: feature_importance.get(f, 0), reverse=True)
    return [FRIENDLY_NAMES[f] for f in flags_sorted]


@router.post("/predict-risk")
def predict_risk(vitals: VitalsInput):
    model, feature_importance = _load_model()

    X = [[
        vitals.age,
        vitals.systolic_bp,
        vitals.diastolic_bp,
        vitals.blood_sugar,
        vitals.body_temp,
        vitals.heart_rate,
    ]]

    # predict_proba's column order matches model.classes_, which depends on
    # which risk labels actually appeared in the training data (some datasets
    # only have low/high, others have low/mid/high). We map dynamically
    # instead of assuming a fixed 3-class order, so this works either way.
    probs_by_class = dict(zip(model.classes_, model.predict_proba(X)[0]))
    p_low = float(probs_by_class.get(0, 0.0))
    p_mid = float(probs_by_class.get(1, 0.0))
    p_high = float(probs_by_class.get(2, 0.0))

    # Weighted score: low=0, mid=50, high=100 contribution, blended by probability
    risk_score = round(p_low * 0 + p_mid * 50 + p_high * 100, 1)

    tier = get_tier(risk_score, vitals.labor_started)
    explanation = build_explanation(vitals, feature_importance)

    return {
        "risk_score": risk_score,
        "risk_tier": tier,
        "explanation": explanation,
        "probabilities": {"low": p_low, "mid": p_mid, "high": p_high},
    }