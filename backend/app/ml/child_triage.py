"""Transparent child-triage prototype; not validated for autonomous clinical use."""

AGE_BANDS = [
    {"max_age_months": 2, "rr_normal": (30, 60), "hr_normal": (111, 149)},
    {"max_age_months": 11, "rr_normal": (25, 50), "hr_normal": (101, 139)},
    {"max_age_months": 60, "rr_normal": (20, 40), "hr_normal": (90, 130)},
]


def _band(age_months: int) -> dict:
    return next((band for band in AGE_BANDS if age_months <= band["max_age_months"]), AGE_BANDS[-1])


def _score(value: float, normal_range: tuple[int, int], severe_deviation: float) -> int:
    low, high = normal_range
    if low <= value <= high:
        return 0
    return 2 if min(abs(value - low), abs(value - high)) > severe_deviation else 1


def assess_child(age_months: int, respiratory_rate: float, heart_rate: float, spo2: float, temperature_c: float) -> dict:
    band = _band(age_months)
    scores = {
        "respiratory_rate": _score(respiratory_rate, band["rr_normal"], 15),
        "heart_rate": _score(heart_rate, band["hr_normal"], 30),
        "spo2": 2 if spo2 < 90 else 1 if spo2 < 95 else 0,
        "temperature_c": 2 if temperature_c >= 39.5 or temperature_c < 36 else 1 if temperature_c >= 38 else 0,
    }
    reasons = []
    if scores["respiratory_rate"]:
        reasons.append("Respiratory rate is outside the age-banded reference range")
    if scores["heart_rate"]:
        reasons.append("Heart rate is outside the age-banded reference range")
    if scores["spo2"]:
        reasons.append("Oxygen saturation is below the configured threshold")
    if scores["temperature_c"]:
        reasons.append("Temperature is outside the configured threshold")
    total = sum(scores.values())
    tier = "low" if total <= 1 else "medium" if total <= 4 else "high"
    return {
        "risk_tier": tier,
        "score": total,
        "reasons": reasons,
        "reference_range": {"respiratory_rate": band["rr_normal"], "heart_rate": band["hr_normal"]},
        "requires_clinician_review": tier != "low",
        "validation_status": "prototype rule-based triage; not clinically validated for autonomous use",
    }
