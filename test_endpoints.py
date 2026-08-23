import requests
import time
import subprocess
import sys

def run_tests():
    base = "http://127.0.0.1:8000"
    errors = 0
    
    print("Starting backend server...")
    server = subprocess.Popen(["backend/venv/bin/python", "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--app-dir", "backend"])
    time.sleep(3) # Wait for startup
    
    try:
        # 1. Health
        print("Testing /health")
        r = requests.get(f"{base}/health")
        if r.status_code != 200:
            print("❌ /health failed")
            errors += 1
        else:
            print("✅ /health passed")
            
        # 2. Maternal Prediction
        print("Testing /predict-risk")
        r = requests.post(f"{base}/predict-risk", json={
            "Age": 25, "SystolicBP": 120, "DiastolicBP": 80, "BS": 90, "BodyTemp": 98, "HeartRate": 75
        })
        if r.status_code != 200 or "risk_level" not in r.json():
            print(f"❌ /predict-risk failed: {r.text}")
            errors += 1
        else:
            print(f"✅ /predict-risk passed ({r.json()['risk_level']})")

        # 3. Child Prediction
        print("Testing /assessments/child-triage")
        r = requests.post(f"{base}/assessments/child-triage", json={
            "AgeMonths": 12, "RespRate": 30, "HeartRate": 110, "SpO2": 98, "TempC": 37.0
        })
        if r.status_code != 200 or "risk_level" not in r.json():
            print(f"❌ /assessments/child-triage failed: {r.text}")
            errors += 1
        else:
            print(f"✅ /assessments/child-triage passed ({r.json()['risk_level']})")

        # 4. Chronic Prediction
        print("Testing /assessments/chronic-cardio")
        r = requests.post(f"{base}/assessments/chronic-cardio", json={
            "age_years": 50, "gender": 1, "bmi": 25.5, "ap_hi": 130, "ap_lo": 85, 
            "cholesterol": 1, "gluc": 1, "smoke": 0, "alco": 0, "active": 1
        })
        if r.status_code != 200 or "risk_level" not in r.json():
            print(f"❌ /assessments/chronic-cardio failed: {r.text}")
            errors += 1
        else:
            print(f"✅ /assessments/chronic-cardio passed ({r.json()['risk_level']})")
            
        # 5. Hospitals
        print("Testing /hospitals")
        r = requests.get(f"{base}/hospitals")
        if r.status_code != 200 or len(r.json()) == 0:
            print(f"❌ /hospitals failed: {r.status_code}")
            errors += 1
        else:
            print(f"✅ /hospitals passed (found {len(r.json())} hospitals)")

    except Exception as e:
        print(f"Test script exception: {e}")
        errors += 1
    finally:
        server.terminate()
        
    sys.exit(errors)

if __name__ == "__main__":
    run_tests()
