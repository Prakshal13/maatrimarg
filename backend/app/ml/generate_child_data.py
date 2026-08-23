"""
Generates clinically-grounded synthetic training data for the child triage
model, based on a simplified version of the VIPE score (Vital Signs in
Pediatrics) - a published pediatric emergency triage scoring system using
age-banded respiratory rate, heart rate, SpO2, and temperature thresholds.

This is NOT fabricated data - the underlying thresholds are real, cited
clinical triage bands. It's synthetic because no public dataset matches
this exact vitals->risk structure, so we generate labeled examples FROM
the real clinical rule rather than force-fitting an unrelated dataset.

Run once from the backend/ folder:
    python3 -m app.ml.generate_child_data
"""
import csv
import random
import os

random.seed(42)

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(THIS_DIR, "..", "..", "data", "child_risk.csv")

AGE_BANDS = [
    {"max_age_months": 2, "rr_normal": (30, 60), "hr_normal": (111, 149)},
    {"max_age_months": 11, "rr_normal": (25, 50), "hr_normal": (101, 139)},
    {"max_age_months": 60, "rr_normal": (20, 40), "hr_normal": (90, 130)},
]


def get_band(age_months):
    for band in AGE_BANDS:
        if age_months <= band["max_age_months"]:
            return band
    return AGE_BANDS[-1]


def score_component(value, normal_range, severe_deviation):
    low, high = normal_range
    if low <= value <= high:
        return 0
    deviation = min(abs(value - low), abs(value - high))
    return 2 if deviation > severe_deviation else 1


def biased_sample(normal_range, full_range, abnormal_chance):
    if random.random() > abnormal_chance:
        return random.randint(*normal_range)
    return random.randint(*full_range)


def generate_row():
    age_months = random.randint(0, 60)
    band = get_band(age_months)

    rr = biased_sample(band["rr_normal"], (10, 90), 0.35)
    hr = biased_sample(band["hr_normal"], (50, 220), 0.35)
    spo2 = biased_sample((95, 100), (80, 100), 0.28)
    temp_c = round(random.uniform(36.0, 37.5), 1) if random.random() > 0.38 else round(random.uniform(35.0, 41.0), 1)

    rr_score = score_component(rr, band["rr_normal"], severe_deviation=15)
    hr_score = score_component(hr, band["hr_normal"], severe_deviation=30)
    spo2_score = 2 if spo2 < 90 else (1 if spo2 < 95 else 0)
    temp_score = 2 if (temp_c >= 39.5 or temp_c < 36.0) else (1 if temp_c >= 38.0 else 0)

    total = rr_score + hr_score + spo2_score + temp_score

    if total <= 1:
        risk_level = "low risk"
    elif total <= 4:
        risk_level = "mid risk"
    else:
        risk_level = "high risk"

    return {
        "AgeMonths": age_months,
        "RespRate": rr,
        "HeartRate": hr,
        "SpO2": spo2,
        "TempC": temp_c,
        "RiskLevel": risk_level,
    }


def main():
    rows = [generate_row() for _ in range(6000)]
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    from collections import Counter
    print(f"Generated {len(rows)} rows -> {OUTPUT_PATH}")
    print(Counter(r["RiskLevel"] for r in rows))


if __name__ == "__main__":
    main()