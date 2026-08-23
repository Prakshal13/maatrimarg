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
# Check for generic trained maternal model first, fallback to legacy model
PRIMARY_MODEL_PATH = os.path.join(THIS_DIR, "..", "ml", "maternal_risk_model.pkl")
LEGACY_MODEL_PATH = os.path.join(THIS_DIR, "..", "ml", "risk_model.pkl")
PRIMARY_IMPORTANCE_PATH = os.path.join(THIS_DIR, "..", "ml", "maternal_feature_importance.json")
LEGACY_IMPORTANCE_PATH = os.path.join(THIS_DIR, "..", "ml", "feature_importance.json")

_model = None
_feature_importance = None


def _load_model():
    """Lazy-load the trained maternal model with fallback."""
    global _model, _feature_importance
    if _model is None:
        model_path = PRIMARY_MODEL_PATH if os.path.exists(PRIMARY_MODEL_PATH) else LEGACY_MODEL_PATH
        importance_path = PRIMARY_IMPORTANCE_PATH if os.path.exists(PRIMARY_IMPORTANCE_PATH) else LEGACY_IMPORTANCE_PATH
        _model = joblib.load(model_path)
        with open(importance_path) as f:
            _feature_importance = json.load(f)
    return _model, _feature_importance


from typing import Any
from pydantic import BaseModel, field_validator


class VitalsInput(BaseModel):
    age: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: Any  # Supports float (e.g. 140) or string with unit (e.g. "140 mg/dL")
    body_temp: float
    heart_rate: float
    labor_started: bool = False
    lang: str = "en"  # "en" | "mr" | "hi"

    @field_validator("blood_sugar", mode="before")
    @classmethod
    def parse_blood_sugar_input(cls, v):
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            clean = v.lower().replace("mg/dl", "").replace("mmol/l", "").strip()
            try:
                val = float(clean)
                if "mmol" in v.lower():
                    return val
                return val
            except ValueError:
                raise ValueError(f"Could not parse blood sugar value: {v}")
        return v


# Clinically reasonable "normal" ranges used purely for the explanation layer -
# NOT used by the model itself, just to describe WHY a score is high in plain terms.
NORMAL_RANGES = {
    "systolic_bp": (90, 120),
    "diastolic_bp": (60, 80),
    "blood_sugar": (3.9, 7.8),  # mmol/L, roughly normal random glucose range
    "body_temp": (97, 99),      # Fahrenheit
    "heart_rate": (60, 100),
}

MULTILINGUAL_EXPLANATIONS = {
    "en": {
        "SystolicBP": "High blood pressure (systolic)",
        "DiastolicBP": "High blood pressure (diastolic)",
        "BS": "Elevated blood sugar",
        "BodyTemp": "Abnormal body temperature",
        "HeartRate": "Abnormal heart rate",
        "Age": "Age-related risk",
    },
    "mr": {
        "SystolicBP": "उच्च रक्तदाब (सिस्टोलिक)",
        "DiastolicBP": "उच्च रक्तदाब (डायस्टोलिक)",
        "BS": "रक्तातील साखरेचे प्रमाण वाढले आहे",
        "BodyTemp": "शरीराचे असामान्य तापमान",
        "HeartRate": "असामान्य हृदयाचे ठोके",
        "Age": "वयाशी संबंधित जोखीम",
    },
    "hi": {
        "SystolicBP": "उच्च रक्तचाप (सिस्टोलिक)",
        "DiastolicBP": "उच्च रक्तचाप (डायस्टोलिक)",
        "BS": "रक्त शर्करा का बढ़ा हुआ स्तर",
        "BodyTemp": "असामान्य शारीरिक तापमान",
        "HeartRate": "असामान्य हृदय गति",
        "Age": "आयु संबंधित जोखिम",
    },
    "ta": {
        "SystolicBP": "உயர் இரத்த அழுத்தம் (சிஸ்டாலிக்)",
        "DiastolicBP": "உயர் இரத்த அழுத்தம் (டயஸ்டாலிக்)",
        "BS": "இரத்த சர்க்கரை அளவு அதிகரித்துள்ளது",
        "BodyTemp": "அசாதாரண உடல் வெப்பநிலை",
        "HeartRate": "அசாதாரண இதயத் துடிப்பு",
        "Age": "வயது தொடர்பான ஆபத்து",
    },
}

MULTILINGUAL_TIERS = {
    "en": {"watch": "Watch (Routine)", "prep": "Prep (Pre-Alert Facility)", "dispatch": "Dispatch (Emergency Ambulance)"},
    "mr": {"watch": "निरीक्षण (नियमित)", "prep": "तयारी (रुग्णालय पूर्व-सूचना)", "dispatch": "तातडीने पाठवा (आपत्कालीन रुग्णवाहिका)"},
    "hi": {"watch": "निगरानी (नियमित)", "prep": "तैयारी (अस्पताल पूर्व-सूचना)", "dispatch": "आपातकालीन प्रेषण (एम्बुलेंस)"},
    "ta": {"watch": "கண்காணிப்பு (வழக்கமான)", "prep": "தயார்நிலை (முன்கூட்டிய எச்சரிக்கை)", "dispatch": "அவசர அனுப்புதல் (அவசர ஊர்தி)"},
}


def normalize_blood_sugar(bs: float) -> float:
    """Auto-detect mg/dL (common in Indian clinics e.g. 90-250) and convert to mmol/L (3.5-19.0)."""
    if bs > 35.0:
        return round(bs / 18.0, 2)
    return float(bs)


def build_explanation(vitals: VitalsInput, normalized_bs: float, feature_importance: dict, lang: str = "en") -> list:
    """Compares input vitals against normal ranges, and returns a list of
    contributing factors in the requested language (en, mr, hi)."""
    flags = []

    if vitals.systolic_bp > NORMAL_RANGES["systolic_bp"][1] or vitals.diastolic_bp > NORMAL_RANGES["diastolic_bp"][1]:
        flags.append("SystolicBP" if vitals.systolic_bp > NORMAL_RANGES["systolic_bp"][1] else "DiastolicBP")
    if normalized_bs > NORMAL_RANGES["blood_sugar"][1]:
        flags.append("BS")
    if not (NORMAL_RANGES["body_temp"][0] <= vitals.body_temp <= NORMAL_RANGES["body_temp"][1]):
        flags.append("BodyTemp")
    if not (NORMAL_RANGES["heart_rate"][0] <= vitals.heart_rate <= NORMAL_RANGES["heart_rate"][1]):
        flags.append("HeartRate")
    if vitals.age > 35 or vitals.age < 18:
        flags.append("Age")

    # Order flagged factors by how important the model considers that feature
    flags_sorted = sorted(flags, key=lambda f: feature_importance.get(f, 0), reverse=True)
    lang_dict = MULTILINGUAL_EXPLANATIONS.get(lang.lower(), MULTILINGUAL_EXPLANATIONS["en"])
    return [lang_dict.get(f, MULTILINGUAL_EXPLANATIONS["en"][f]) for f in flags_sorted]


@router.post("/predict-risk")
def predict_risk(vitals: VitalsInput):
    return score_vitals(vitals)


def score_vitals(vitals: VitalsInput) -> dict:
    """Evaluate vitals for HTTP clients and internal clinical workflows."""
    model, feature_importance = _load_model()
    normalized_bs = normalize_blood_sugar(vitals.blood_sugar)

    X = [[
        vitals.age,
        vitals.systolic_bp,
        vitals.diastolic_bp,
        normalized_bs,
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
    predicted_class_code = int(model.predict(X)[0])
    predicted_class_name = "high risk" if predicted_class_code == 2 else "mid risk" if predicted_class_code == 1 else "low risk"

    tier = get_tier(risk_score, vitals.labor_started)
    lang = (vitals.lang or "en").lower()
    explanation = build_explanation(vitals, normalized_bs, feature_importance, lang=lang)
    tier_display = MULTILINGUAL_TIERS.get(lang, MULTILINGUAL_TIERS["en"]).get(tier, tier)

    return {
        "risk_score": risk_score,
        "risk_tier": tier,
        "risk_tier_display": tier_display,
        "language": lang,
        "predicted_class": predicted_class_name,
        "explanation": explanation,
        "probabilities": {"low": p_low, "mid": p_mid, "high": p_high},
        "normalized_blood_sugar_mmol_l": normalized_bs,
        "feature_importance": feature_importance,
    }
