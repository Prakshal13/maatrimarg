"""Train MaatriMarg decision-support models; never use as autonomous diagnosis."""
import json
import os
import sys
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

THIS_DIR = os.path.dirname(os.path.abspath(__file__))

CONFIGS = {
    "maternal": {
        "csv": "Maternal_Risk.csv",
        "features": ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"],
        "label_col": "RiskLevel",
        "label_map": {"low risk": 0, "mid risk": 1, "medium risk": 1, "high risk": 2},
        "evidence_level": "development dataset; requires independent clinical validation",
    },
    "child": {
        "csv": "child_risk.csv",
        "features": ["AgeMonths", "RespRate", "HeartRate", "SpO2", "TempC"],
        "label_col": "RiskLevel",
        "label_map": {"low risk": 0, "mid risk": 1, "high risk": 2},
        "evidence_level": "synthetic rule-reproduction dataset; not clinically validated",
    },
    "chronic": {
        "csv": "chronic_risk.csv",
        "features": ["age_years", "gender", "bmi", "ap_hi", "ap_lo", "cholesterol", "gluc", "smoke", "alco", "active"],
        "label_col": "cardio",
        "label_map": {0: 0, 1: 2},
        "evidence_level": "retrospective cardiovascular dataset; internal validation only",
    },
}


def _prepare_chronic(df: pd.DataFrame) -> pd.DataFrame:
    """Convert age from days and remove implausible measurements."""
    df = df.copy()
    df["age_years"] = df["age"] / 365.25
    df["bmi"] = df["weight"] / (df["height"] / 100) ** 2
    return df[
        df["age_years"].between(18, 100)
        & df["height"].between(120, 230)
        & df["weight"].between(30, 250)
        & df["bmi"].between(12, 60)
        & df["ap_hi"].between(70, 250)
        & df["ap_lo"].between(40, 160)
        & (df["ap_hi"] > df["ap_lo"])
    ]


def _metrics(y_true, predictions, probabilities, classes) -> dict:
    result = {
        "accuracy": round(float(accuracy_score(y_true, predictions)), 4),
        "balanced_accuracy": round(float(balanced_accuracy_score(y_true, predictions)), 4),
        "macro_precision": round(float(precision_score(y_true, predictions, average="macro", zero_division=0)), 4),
        "macro_recall": round(float(recall_score(y_true, predictions, average="macro", zero_division=0)), 4),
        "macro_f1": round(float(f1_score(y_true, predictions, average="macro", zero_division=0)), 4),
    }
    if len(classes) == 2 and 2 in classes:
        high_index = list(classes).index(2)
        result["high_risk_roc_auc"] = round(float(roc_auc_score((y_true == 2).astype(int), probabilities[:, high_index])), 4)
    return result


def train(case_type: str):
    config = CONFIGS[case_type]
    csv_path = os.path.join(THIS_DIR, "..", "..", "data", config["csv"])
    model_path = os.path.join(THIS_DIR, f"{case_type}_risk_model.pkl")
    importance_path = os.path.join(THIS_DIR, f"{case_type}_feature_importance.json")
    metadata_path = os.path.join(THIS_DIR, f"{case_type}_model_metadata.json")

    df = pd.read_csv(csv_path, sep=None, engine="python")
    df.columns = [column.strip() for column in df.columns]
    original_rows = len(df)
    if case_type == "chronic":
        df = _prepare_chronic(df)
    label_col = config["label_col"]
    if df[label_col].dtype == object:
        df[label_col] = df[label_col].str.strip().str.lower()
    df["_encoded"] = df[label_col].map(config["label_map"])
    df = df.dropna(subset=["_encoded"] + config["features"])
    if df["_encoded"].nunique() < 2:
        raise ValueError("Training data must contain at least two risk classes.")

    X = df[config["features"]]
    y = df["_encoded"].astype(int)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    metrics = _metrics(y_test, predictions, model.predict_proba(X_test), model.classes_)

    joblib.dump(model, model_path)
    importances = dict(sorted(zip(config["features"], model.feature_importances_.tolist()), key=lambda item: item[1], reverse=True))
    with open(importance_path, "w") as file:
        json.dump(importances, file, indent=2)
    metadata = {
        "case_type": case_type,
        "source_file": config["csv"],
        "original_rows": original_rows,
        "rows_used": len(df),
        "features": config["features"],
        "metrics": metrics,
        "evidence_level": config["evidence_level"],
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(metadata_path, "w") as file:
        json.dump(metadata, file, indent=2)
    print(f"[{case_type}] Loaded {len(df)} usable rows ({original_rows - len(df)} excluded).")
    print(f"[{case_type}] Internal test metrics: {metrics}")
    print(f"[{case_type}] Evidence: {config['evidence_level']}")
    print(f"[{case_type}] Saved model to {model_path}")
    return metadata


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in CONFIGS:
        print("Usage: python3 -m app.ml.train_generic_model [maternal|child|chronic]")
        sys.exit(1)
    train(sys.argv[1])
