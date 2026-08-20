"""
Trains the maternal health risk model.
Run this ONCE from the backend/ folder after placing the Kaggle CSV at
backend/data/maternal_risk.csv:

    python app/ml/train_model.py

It saves two files into backend/app/ml/:
  - risk_model.pkl            (the trained RandomForest model)
  - feature_importance.json   (which vitals matter most, for explainability)
"""
import json
import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(THIS_DIR, "..", "..", "data", "maternal_risk.csv")
MODEL_PATH = os.path.join(THIS_DIR, "risk_model.pkl")
IMPORTANCE_PATH = os.path.join(THIS_DIR, "feature_importance.json")

FEATURE_COLUMNS = ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"]

# Maps the dataset's text labels to numeric classes.
# Some versions of this dataset use "low risk"/"mid risk"/"high risk",
# others use "low risk"/"medium risk"/"high risk" - we handle both.
RISK_LABEL_MAP = {
    "low risk": 0,
    "mid risk": 1,
    "medium risk": 1,
    "high risk": 2,
}


def load_and_clean_data():
    df = pd.read_csv(DATA_PATH)

    # Normalize column names in case of stray spaces/casing differences
    df.columns = [c.strip() for c in df.columns]

    # Normalize the risk label text (lowercase, strip spaces) then map to 0/1/2
    df["RiskLevel"] = df["RiskLevel"].str.strip().str.lower()
    df["RiskLevelEncoded"] = df["RiskLevel"].map(RISK_LABEL_MAP)

    # Drop any rows that didn't match a known label (safety net)
    before = len(df)
    df = df.dropna(subset=["RiskLevelEncoded"] + FEATURE_COLUMNS)
    after = len(df)
    if before != after:
        print(f"Dropped {before - after} rows with missing/unrecognized values.")

    return df


def train():
    df = load_and_clean_data()
    print(f"Loaded {len(df)} rows.")
    print(df["RiskLevel"].value_counts())

    X = df[FEATURE_COLUMNS]
    y = df["RiskLevelEncoded"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Test accuracy: {acc:.3f}")

    # Save model
    joblib.dump(model, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

    # Save feature importances for the explainability layer
    importances = dict(zip(FEATURE_COLUMNS, model.feature_importances_.tolist()))
    importances = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))
    with open(IMPORTANCE_PATH, "w") as f:
        json.dump(importances, f, indent=2)
    print(f"Saved feature importances to {IMPORTANCE_PATH}")
    print(importances)


if __name__ == "__main__":
    train()
