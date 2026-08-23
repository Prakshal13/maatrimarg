"""
Converts app/hospitals_with_district.json into the final seed_hospitals.py,
adding deterministic mock capacity data (same hospital always gets the same
numbers across re-runs, based on a hash of its name).

Run once after assign_districts.py:
    python3 app/generate_seed.py
"""
import json
import hashlib


def _python_repr(entries: list) -> str:
    """Formats the entries list as valid Python source (True/False, not JSON's true/false)"""
    import pprint
    return pprint.pformat(entries, indent=4, width=100)


def deterministic_value(name: str, salt: str, low: int, high: int) -> int:
    """Same hospital + same salt always produces the same 'random' number."""
    h = hashlib.md5(f"{name}-{salt}".encode()).hexdigest()
    return low + (int(h, 16) % (high - low + 1))


def build_hospital_entry(h: dict, index: int) -> dict:
    name = h["name"]
    beds = deterministic_value(name, "beds", 4, 25)
    nicu = deterministic_value(name, "nicu", 0, 6)
    surgeon = deterministic_value(name, "surgeon", 0, 1) == 1

    entry = {
        "name": name,
        "village_area": h.get("district", "Unknown"),
        "district": h.get("district", "Unknown"),
        "state": h.get("state", "Tamil Nadu"),
        "lat": h["lat"],
        "lng": h["lng"],
        "beds_available": beds,
        "nicu_beds_available": nicu,
        "surgeon_on_duty": surgeon,
        "stock_o_pos": deterministic_value(name, "o_pos", 0, 12),
        "stock_o_neg": deterministic_value(name, "o_neg", 0, 5),
        "stock_a_pos": deterministic_value(name, "a_pos", 0, 10),
        "stock_a_neg": deterministic_value(name, "a_neg", 0, 4),
        "stock_b_pos": deterministic_value(name, "b_pos", 0, 8),
        "stock_b_neg": deterministic_value(name, "b_neg", 0, 3),
        "stock_ab_pos": deterministic_value(name, "ab_pos", 0, 5),
        "stock_ab_neg": deterministic_value(name, "ab_neg", 0, 2),
    }

    # Force ONE known hospital to have 0 O-negative, guaranteeing the
    # "skip the closer hospital" demo moment works every time.
    if index == 0:
        entry["stock_o_neg"] = 0

    return entry


def main():
    with open("app/hospitals_with_district.json") as f:
        hospitals = json.load(f)

    entries = [build_hospital_entry(h, i) for i, h in enumerate(hospitals)]

    header = '''"""
Seeds the database with real government hospitals across Tamil Nadu and
Maharashtra (sourced from OpenStreetMap, filtered to government facilities,
deduplicated, and district-assigned).

All names, districts, states, and coordinates are REAL. All capacity numbers
(beds, NICU, blood stock, surgeon status) are DETERMINISTIC MOCK DATA -
generated from a hash of each hospital's name so the same hospital always
gets the same demo numbers on every re-seed. No public source provides live
hospital inventory data anywhere in India - this is intentional, matching
the realistic self-reporting deployment model this system is designed for.

Run this once (or re-run anytime to reset) from the backend/ folder:
    python3 -m app.seed_hospitals
"""
from app.db import Hospital, SessionLocal, init_db

HOSPITALS = ''' + _python_repr(entries) + '''


def seed():
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(Hospital).count()
        if existing > 0:
            print(f"Clearing {existing} existing hospital records...")
            db.query(Hospital).delete()
            db.commit()

        for h in HOSPITALS:
            db.add(Hospital(**h))
        db.commit()

        print(f"Seeded {len(HOSPITALS)} hospitals across Tamil Nadu and Maharashtra.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
'''

    with open("app/seed_hospitals.py", "w") as f:
        f.write(header)

    print(f"Generated app/seed_hospitals.py with {len(entries)} hospitals.")


if __name__ == "__main__":
    main()