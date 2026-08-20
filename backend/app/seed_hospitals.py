"""
Seeds the database with demo hospitals around Chennai/Chengalpattu district.
Run this once (or re-run anytime to reset) from the backend/ folder:

    python3 -m app.seed_hospitals

IMPORTANT: One hospital (Chengalpattu GH) is deliberately set to 0 O-negative
stock so that during your demo, a high-risk O-negative mother's route will
visibly SKIP the nearest hospital and go to the next-best one instead -
this is the core "wow" moment of the routing engine, guaranteed to trigger.
"""
from app.db import Hospital, SessionLocal, init_db

HOSPITALS = [
    {
        "name": "Chengalpattu Government Hospital",
        "village_area": "Chengalpattu",
        "lat": 12.6932, "lng": 79.9832,
        "beds_available": 12, "nicu_beds_available": 3, "surgeon_on_duty": True,
        "stock_o_pos": 8, "stock_o_neg": 0,  # <- deliberately empty for demo
        "stock_a_pos": 6, "stock_a_neg": 2,
        "stock_b_pos": 5, "stock_b_neg": 1,
        "stock_ab_pos": 3, "stock_ab_neg": 1,
    },
    {
        "name": "Kanchipuram Medical College Hospital",
        "village_area": "Kanchipuram",
        "lat": 12.8342, "lng": 79.7036,
        "beds_available": 20, "nicu_beds_available": 5, "surgeon_on_duty": True,
        "stock_o_pos": 10, "stock_o_neg": 4,
        "stock_a_pos": 8, "stock_a_neg": 3,
        "stock_b_pos": 6, "stock_b_neg": 2,
        "stock_ab_pos": 4, "stock_ab_neg": 1,
    },
    {
        "name": "Tambaram Sanatorium Hospital",
        "village_area": "Tambaram",
        "lat": 12.9249, "lng": 80.1000,
        "beds_available": 15, "nicu_beds_available": 2, "surgeon_on_duty": False,
        "stock_o_pos": 5, "stock_o_neg": 1,
        "stock_a_pos": 4, "stock_a_neg": 0,
        "stock_b_pos": 3, "stock_b_neg": 1,
        "stock_ab_pos": 2, "stock_ab_neg": 0,
    },
    {
        "name": "Maraimalai Nagar Primary Health Centre",
        "village_area": "Maraimalai Nagar",
        "lat": 12.7924, "lng": 80.0059,
        "beds_available": 6, "nicu_beds_available": 0, "surgeon_on_duty": False,
        "stock_o_pos": 2, "stock_o_neg": 0,
        "stock_a_pos": 2, "stock_a_neg": 0,
        "stock_b_pos": 1, "stock_b_neg": 0,
        "stock_ab_pos": 1, "stock_ab_neg": 0,
    },
    {
        "name": "Guduvancheri Community Hospital",
        "village_area": "Guduvancheri",
        "lat": 12.8449, "lng": 80.0656,
        "beds_available": 10, "nicu_beds_available": 2, "surgeon_on_duty": True,
        "stock_o_pos": 6, "stock_o_neg": 3,
        "stock_a_pos": 5, "stock_a_neg": 2,
        "stock_b_pos": 4, "stock_b_neg": 1,
        "stock_ab_pos": 2, "stock_ab_neg": 1,
    },
    {
        "name": "Vandalur Government Hospital",
        "village_area": "Vandalur",
        "lat": 12.8930, "lng": 80.0817,
        "beds_available": 8, "nicu_beds_available": 1, "surgeon_on_duty": False,
        "stock_o_pos": 4, "stock_o_neg": 1,
        "stock_a_pos": 3, "stock_a_neg": 1,
        "stock_b_pos": 2, "stock_b_neg": 0,
        "stock_ab_pos": 1, "stock_ab_neg": 0,
    },
    {
        "name": "Chrompet General Hospital",
        "village_area": "Chrompet",
        "lat": 12.9516, "lng": 80.1367,
        "beds_available": 18, "nicu_beds_available": 4, "surgeon_on_duty": True,
        "stock_o_pos": 9, "stock_o_neg": 5,
        "stock_a_pos": 7, "stock_a_neg": 3,
        "stock_b_pos": 5, "stock_b_neg": 2,
        "stock_ab_pos": 3, "stock_ab_neg": 1,
    },
    {
        "name": "Singaperumal Koil Rural Hospital",
        "village_area": "Singaperumal Koil",
        "lat": 12.7666, "lng": 79.9600,
        "beds_available": 5, "nicu_beds_available": 1, "surgeon_on_duty": False,
        "stock_o_pos": 3, "stock_o_neg": 1,
        "stock_a_pos": 2, "stock_a_neg": 0,
        "stock_b_pos": 1, "stock_b_neg": 0,
        "stock_ab_pos": 1, "stock_ab_neg": 0,
    },
]


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

        print(f"Seeded {len(HOSPITALS)} hospitals successfully.")
        print("Note: Chengalpattu Government Hospital has 0 O-negative stock")
        print("(intentional, for the routing-skip demo moment).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()