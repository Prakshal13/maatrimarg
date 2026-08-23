#!/bin/bash
backend/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend &
PID=$!
sleep 3

echo "--- Testing /health ---"
curl -s http://127.0.0.1:8000/health

echo -e "\n\n--- Testing /predict-risk ---"
curl -s -X POST http://127.0.0.1:8000/predict-risk \
     -H "Content-Type: application/json" \
     -d '{"Age": 25, "SystolicBP": 120, "DiastolicBP": 80, "BS": 90, "BodyTemp": 98, "HeartRate": 75}'

echo -e "\n\n--- Testing /assessments/child-triage ---"
curl -s -X POST http://127.0.0.1:8000/assessments/child-triage \
     -H "Content-Type: application/json" \
     -d '{"AgeMonths": 12, "RespRate": 30, "HeartRate": 110, "SpO2": 98, "TempC": 37.0}'

echo -e "\n\n--- Testing /assessments/chronic-cardio ---"
curl -s -X POST http://127.0.0.1:8000/assessments/chronic-cardio \
     -H "Content-Type: application/json" \
     -d '{"age_years": 50, "gender": 1, "bmi": 25.5, "ap_hi": 130, "ap_lo": 85, "cholesterol": 1, "gluc": 1, "smoke": 0, "alco": 0, "active": 1}'

echo -e "\n\n--- Testing /hospitals ---"
curl -s http://127.0.0.1:8000/hospitals | head -c 100
echo "..."

kill $PID
