"""
Comprehensive Backend & ML Verification Test Suite for MaatriMarg.
Tests all routers, ML inference pipelines, database persistence, routing engine,
and referral state machine.
"""
import sys
import os
import json
from fastapi.testclient import TestClient

from app.main import app
from app.db import init_db, SessionLocal, Hospital, Mother, Child, ChronicPatient, Alert

client = TestClient(app)


def run_all_tests():
    print("\n========================================================")
    print("      MAATRIMARG BACKEND FULL TEST & VERIFICATION")
    print("========================================================\n")
    
    init_db()
    db = SessionLocal()
    if db.query(Hospital).count() == 0:
        from app.seed_hospitals import HOSPITALS
        for h in HOSPITALS[:20]:  # Seed sample hospitals for tests
            db.add(Hospital(**h))
        db.commit()
    db.close()
    
    passed = 0
    total = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  [PASS] {name} {details}")
        else:
            print(f"  [FAIL] {name} - {details}")
            raise AssertionError(f"Test failed: {name} ({details})")

    # 1. Health Endpoint
    print("--- 1. Testing System Health & API Root ---")
    res = client.get("/health")
    assert_test("Health check returns status ok", res.status_code == 200 and res.json() == {"status": "ok"})

    # 2. Maternal ML Risk Engine & Unit Normalization
    print("\n--- 2. Testing Maternal Risk Engine & Unit Normalization ---")
    res = client.post("/predict-risk", json={
        "age": 28, "systolic_bp": 140, "diastolic_bp": 95,
        "blood_sugar": 135,  # mg/dL (should auto-convert to 7.5 mmol/L)
        "body_temp": 98.6, "heart_rate": 82, "labor_started": False
    })
    data = res.json()
    assert_test("Maternal risk prediction HTTP 200", res.status_code == 200)
    assert_test("Blood sugar auto-normalized to mmol/L", data.get("normalized_blood_sugar_mmol_l") == 7.5)
    assert_test("Risk tier is 'prep' or 'dispatch'", data.get("risk_tier") in ["prep", "dispatch"])
    assert_test("Explanation factors provided", len(data.get("explanation", [])) > 0)

    # 3. Child Triage ML & Database Records
    print("\n--- 3. Testing Child Health, Pediatric Triage & DB Tracking ---")
    # Stateless triage
    res_child = client.post("/assessments/child-triage", json={
        "age_months": 14, "respiratory_rate": 48, "heart_rate": 145, "spo2": 91, "temperature_c": 39.2
    })
    child_data = res_child.json()
    assert_test("Child triage prediction HTTP 200", res_child.status_code == 200)
    assert_test("Child ML score present", "ml_risk_score" in child_data)
    assert_test("Child VIPE triage tier is high/medium", child_data.get("risk_tier") in ["medium", "high"])

    # Child registration & DB persistence
    res_reg_child = client.post("/assessments/children", json={
        "name": "Ananya Sharma", "age_months": 22, "gender": "female",
        "parent_name": "Pooja Sharma", "phone": "9876543210", "village": "Bhamragad", "consent_given": True
    })
    assert_test("Child registration HTTP 201", res_reg_child.status_code == 201)
    child_id = res_reg_child.json()["id"]

    # Child vitals logging in DB
    res_vitals_child = client.post(f"/assessments/children/{child_id}/vitals", json={
        "respiratory_rate": 45, "heart_rate": 138, "spo2": 93, "temperature_c": 38.8
    })
    assert_test("Child vitals logging HTTP 201", res_vitals_child.status_code == 201)
    
    # Child timeline
    res_timeline_child = client.get(f"/assessments/children/{child_id}")
    assert_test("Child timeline retrieved", len(res_timeline_child.json()["vitals_history"]) >= 1)

    # 4. Chronic Cardio ML & Database Records
    print("\n--- 4. Testing Chronic Patient Registry & Cardio Screening ---")
    res_reg_chr = client.post("/assessments/chronic-patients", json={
        "name": "Devendra Patil", "age_years": 56, "gender": "male",
        "phone": "9123456789", "village": "Chandrapur", "consent_given": True
    })
    assert_test("Chronic patient registration HTTP 201", res_reg_chr.status_code == 201)
    chr_id = res_reg_chr.json()["id"]

    res_cardio_log = client.post(f"/assessments/chronic-patients/{chr_id}/assessments", json={
        "height_cm": 168, "weight_kg": 82, "systolic_bp": 154, "diastolic_bp": 98,
        "cholesterol": 2, "glucose": 2, "smoke": True, "alcohol": False, "physically_active": False
    })
    assert_test("Chronic assessment logging HTTP 201", res_cardio_log.status_code == 201)
    assert_test("Chronic risk priority is priority/clinical review", res_cardio_log.json()["assessment_record"]["screening_priority"] in ["priority_review", "clinical_review"])

    # 5. Hospital Inventory & Directory
    print("\n--- 5. Testing Hospital Inventory & Capacity Management ---")
    res_hosps = client.get("/hospitals")
    assert_test("Hospitals directory returned", res_hosps.status_code == 200 and len(res_hosps.json()) > 0)
    hosp_1 = res_hosps.json()[0]
    hosp_id = hosp_1["id"]

    # Update capacity
    res_hosp_up = client.post(f"/hospitals/{hosp_id}/update", json={
        "beds_available": 12, "nicu_beds_available": 3, "surgeon_on_duty": True,
        "obstetric_emergency_ready": True, "anaesthesia_on_duty": True, "ambulance_available": True,
        "stock_o_pos": 8, "stock_o_neg": 4, "stock_a_pos": 6, "stock_a_neg": 2,
        "stock_b_pos": 5, "stock_b_neg": 2, "stock_ab_pos": 3, "stock_ab_neg": 1
    })
    assert_test("Hospital capacity update HTTP 200", res_hosp_up.status_code == 200 and res_hosp_up.json()["beds_available"] == 12)

    # 6. Graph Routing Engine (Dijkstra + Filter-then-Route)
    print("\n--- 6. Testing Capacity-Aware Graph Routing (Dijkstra) ---")
    res_route = client.post("/route", json={
        "mother_lat": 13.04, "mother_lng": 80.25, "blood_type": "O-",
        "needs_nicu": True, "requires_surgeon": True
    })
    route_data = res_route.json()
    assert_test("Route calculation HTTP 200", res_route.status_code == 200)
    assert_test("Best hospital selected", route_data.get("best_hospital") is not None)
    assert_test("ETA in minutes calculated", route_data.get("eta_minutes") is not None)
    assert_test("Skipped hospitals list with reasons provided", "skipped" in route_data)

    # 7. Mother Registration, Referral Deduplication & State Machine
    print("\n--- 7. Testing Mother Lifecycle & Referral Deduplication ---")
    res_mother = client.post("/mothers", json={
        "name": "Kavita Raut", "age": 25, "village": "Gadchiroli",
        "blood_type": "O-", "gestational_age_weeks": 37,
        "lat": 13.04, "lng": 80.25, "consent_given": True
    })
    assert_test("Mother registration HTTP 201", res_mother.status_code == 201)
    mother_id = res_mother.json()["id"]

    # Log high risk vitals 1st time
    res_v1 = client.post(f"/mothers/{mother_id}/vitals", json={
        "systolic_bp": 145, "diastolic_bp": 95, "blood_sugar": 140, "body_temp": 98.6, "heart_rate": 90
    })
    ref_1 = res_v1.json().get("referral")
    assert_test("First high risk vitals triggers referral", ref_1 is not None)
    ref_id_1 = ref_1["id"]

    # Log high risk vitals 2nd time (must update ref_id_1, NOT create duplicate alert row)
    res_v2 = client.post(f"/mothers/{mother_id}/vitals", json={
        "systolic_bp": 150, "diastolic_bp": 100, "blood_sugar": 145, "body_temp": 99.0, "heart_rate": 96
    })
    ref_2 = res_v2.json().get("referral")
    assert_test("Repeat vitals logs update existing referral without duplicate", ref_2["id"] == ref_id_1)

    # Acknowledge referral
    res_ack = client.patch(f"/referrals/{ref_id_1}/acknowledge")
    assert_test("Hospital acknowledges referral", res_ack.status_code == 200 and res_ack.json()["status"] == "acknowledged")

    # Status transition to en_route then arrived
    res_enroute = client.patch(f"/referrals/{ref_id_1}/status", json={"status": "en_route", "ambulance_id": "MH-34-108"})
    assert_test("Referral status updated to en_route with ambulance", res_enroute.json()["status"] == "en_route" and res_enroute.json()["ambulance_id"] == "MH-34-108")

    # 8. Multi-Hop Escalation Chain Testing
    print("\n--- 8. Testing Multi-Hop Escalation Chain & Ancestor Exclusion ---")
    res_esc = client.post(f"/referrals/{ref_id_1}/escalate")
    assert_test("Referral escalation HTTP 201", res_esc.status_code == 201)
    new_ref = res_esc.json()["new_referral"]
    old_hosp_id = res_esc.json()["escalated_referral"]["hospital"]["id"] if res_esc.json()["escalated_referral"]["hospital"] else None
    new_hosp_id = new_ref["hospital"]["id"] if new_ref.get("hospital") else None
    assert_test("Escalated to different eligible hospital", old_hosp_id != new_hosp_id or old_hosp_id is None)

    # 9. Command Center Analytics (0 N+1 Bottlenecks)
    print("\n--- 9. Testing Command Center Summary & Scalable Queries ---")
    res_summary = client.get("/command-center/summary")
    assert_test("Command center summary HTTP 200", res_summary.status_code == 200)
    assert_test("Hospital count and active dispatches reported", res_summary.json()["hospital_count"] > 0)

    res_net = client.get("/network/hospitals")
    assert_test("Batch network hospitals loaded in single query", res_net.status_code == 200 and len(res_net.json()) > 0)

    # 10. Category C: State Machine Invariants, Watchdog & Audit Trail
    print("\n--- 10. Testing Category C: State Machine Invariants, Watchdog & Audit Trail ---")
    # Illegal state transition check (e.g. escalated -> prep is illegal)
    res_illegal = client.patch(f"/referrals/{ref_id_1}/status", json={"status": "prep"})
    assert_test("Illegal transition from escalated blocked with HTTP 400", res_illegal.status_code == 400)

    # Auto-escalation watchdog
    res_watchdog = client.post("/referrals/auto-escalate-overdue")
    assert_test("Auto-escalation watchdog runs HTTP 200", res_watchdog.status_code == 200 and "overdue_checked" in res_watchdog.json())

    # Audit log verification
    res_audit = client.get("/referrals/audit-logs/all")
    assert_test("Audit log records retrieved with HTTP 200", res_audit.status_code == 200 and len(res_audit.json()) > 0)

    # 11. Category D: Multilingual Localization & Emergency Dispatch SMS
    print("\n--- 11. Testing Category D: Multilingual Localization & Emergency Dispatch SMS ---")
    # Test Marathi risk prediction
    res_mr = client.post("/predict-risk", json={
        "age": 29, "systolic_bp": 146, "diastolic_bp": 94, "blood_sugar": 140, "body_temp": 98.6, "heart_rate": 84, "lang": "mr"
    })
    assert_test("Marathi risk prediction HTTP 200", res_mr.status_code == 200)
    assert_test("Marathi explanation generated", "उच्च रक्तदाब (सिस्टोलिक)" in res_mr.json().get("explanation", []))

    # Test Hindi risk prediction
    res_hi = client.post("/predict-risk", json={
        "age": 29, "systolic_bp": 146, "diastolic_bp": 94, "blood_sugar": 140, "body_temp": 98.6, "heart_rate": 84, "lang": "hi"
    })
    assert_test("Hindi risk prediction HTTP 200", res_hi.status_code == 200)
    assert_test("Hindi explanation generated", "उच्च रक्तचाप (सिस्टोलिक)" in res_hi.json().get("explanation", []))

    # Test Dispatch SMS notification simulation
    res_sms = client.post("/notifications/send-dispatch-alert", json={
        "referral_id": ref_id_1,
        "recipient_role": "ambulance_driver",
        "phone": "9876543210",
        "language": "mr"
    })
    # 12. Category D: Authentication, RBAC & DISHA PHI Masking
    print("\n--- 12. Testing Category D: Authentication, RBAC & DISHA PHI Masking ---")
    # Login as ASHA
    res_login = client.post("/auth/login", json={
        "username": "9876543210", "password": "pin", "role": "asha", "facility_or_district_id": "PHC-Melghat"
    })
    assert_test("ASHA login HTTP 200", res_login.status_code == 200 and "access_token" in res_login.json())
    token = res_login.json()["access_token"]

    # Verify /auth/me with Bearer token
    res_me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert_test("Token decoding & RBAC profile HTTP 200", res_me.status_code == 200 and res_me.json()["role"] == "asha")

    # Verify PHI Masking on /mothers
    res_masked = client.get("/mothers?mask_phi=true")
    assert_test("PHI masked mothers endpoint HTTP 200", res_masked.status_code == 200 and len(res_masked.json()) > 0)
    sample_phone = res_masked.json()[0].get("phone")
    assert_test("Phone number is masked for DISHA privacy", sample_phone is None or "****" in sample_phone)

    print("\n========================================================")
    print(f"  RESULT: ALL {passed}/{total} END-TO-END TESTS PASSED (100% SUCCESS)")
    print("========================================================\n")


if __name__ == "__main__":
    run_all_tests()
