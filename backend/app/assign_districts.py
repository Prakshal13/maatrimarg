"""
Assigns each filtered hospital to its nearest district within its own state
(Tamil Nadu or Maharashtra), using each hospital's source_state tag from the
fetch step to pick the correct district reference list.
"""
import json
import math

TN_DISTRICT_HQ = {
    "Chennai": (13.0827, 80.2707), "Chengalpattu": (12.6819, 79.9888),
    "Kanchipuram": (12.8342, 79.7036), "Tiruvallur": (13.1231, 79.9080),
    "Vellore": (12.9165, 79.1325), "Ranipet": (12.9249, 79.3308),
    "Tirupattur": (12.4964, 78.5730), "Krishnagiri": (12.5186, 78.2137),
    "Dharmapuri": (12.1357, 78.1580), "Salem": (11.6643, 78.1460),
    "Namakkal": (11.2189, 78.1677), "Erode": (11.3410, 77.7172),
    "Tiruppur": (11.1085, 77.3411), "Coimbatore": (11.0168, 76.9558),
    "Nilgiris": (11.4064, 76.6932), "Karur": (10.9601, 78.0766),
    "Tiruchirappalli": (10.7905, 78.7047), "Perambalur": (11.2342, 78.8807),
    "Ariyalur": (11.1401, 79.0782), "Cuddalore": (11.7480, 79.7714),
    "Villupuram": (11.9401, 79.4861), "Kallakurichi": (11.7384, 78.9594),
    "Thanjavur": (10.7870, 79.1378), "Tiruvarur": (10.7661, 79.6345),
    "Nagapattinam": (10.7672, 79.8449), "Pudukkottai": (10.3833, 78.8214),
    "Madurai": (9.9252, 78.1198), "Theni": (10.0104, 77.4768),
    "Dindigul": (10.3624, 77.9695), "Sivaganga": (9.8433, 78.4809),
    "Ramanathapuram": (9.3639, 78.8395), "Virudhunagar": (9.5851, 77.9622),
    "Tirunelveli": (8.7139, 77.7567), "Tenkasi": (8.9598, 77.3153),
    "Thoothukudi": (8.7642, 78.1348), "Kanyakumari": (8.0883, 77.5385),
}

MH_DISTRICT_HQ = {
    "Mumbai City": (18.9388, 72.8354), "Mumbai Suburban": (19.0760, 72.8777),
    "Thane": (19.2183, 72.9781), "Palghar": (19.6969, 72.7699),
    "Raigad": (18.5158, 73.1822), "Pune": (18.5204, 73.8567),
    "Satara": (17.6805, 74.0183), "Sangli": (16.8524, 74.5815),
    "Solapur": (17.6599, 75.9064), "Kolhapur": (16.7050, 74.2433),
    "Ratnagiri": (16.9902, 73.3120), "Sindhudurg": (16.1667, 73.6833),
    "Nashik": (19.9975, 73.7898), "Dhule": (20.9042, 74.7749),
    "Nandurbar": (21.3667, 74.2500), "Jalgaon": (21.0077, 75.5626),
    "Ahmednagar": (19.0952, 74.7496), "Aurangabad": (19.8762, 75.3433),
    "Jalna": (19.8410, 75.8864), "Beed": (18.9891, 75.7601),
    "Latur": (18.4088, 76.5604), "Osmanabad": (18.1860, 76.0419),
    "Nanded": (19.1383, 77.3210), "Parbhani": (19.2704, 76.7601),
    "Hingoli": (19.7150, 77.1490), "Amravati": (20.9374, 77.7796),
    "Akola": (20.7002, 77.0082), "Washim": (20.1100, 77.1333),
    "Buldhana": (20.5293, 76.1830), "Yavatmal": (20.3897, 78.1307),
    "Nagpur": (21.1458, 79.0882), "Wardha": (20.7453, 78.6022),
    "Chandrapur": (19.9615, 79.2961), "Gadchiroli": (20.1833, 80.0000),
    "Gondia": (21.4602, 80.1922), "Bhandara": (21.1667, 79.6500),
}

STATE_DISTRICTS = {
    "Tamil Nadu": TN_DISTRICT_HQ,
    "Maharashtra": MH_DISTRICT_HQ,
}


def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def nearest_district(lat, lng, district_map):
    best_district, best_dist = None, float("inf")
    for district, (d_lat, d_lng) in district_map.items():
        dist = haversine_km(lat, lng, d_lat, d_lng)
        if dist < best_dist:
            best_dist, best_district = dist, district
    return best_district


def main():
    with open("app/filtered_hospitals.json") as f:
        hospitals = json.load(f)

    for h in hospitals:
        state = h.get("source_state", "Tamil Nadu")  # fallback for old data
        h["state"] = state
        district_map = STATE_DISTRICTS.get(state, TN_DISTRICT_HQ)
        h["district"] = nearest_district(h["lat"], h["lng"], district_map)

    with open("app/hospitals_with_district.json", "w") as f:
        json.dump(hospitals, f, indent=2)

    from collections import Counter
    by_state = Counter(h["state"] for h in hospitals)
    print(f"Assigned districts to {len(hospitals)} hospitals.\n")
    print("Hospitals per state:")
    for state, count in by_state.items():
        print(f"  {state}: {count}")

    print("\nSaved to app/hospitals_with_district.json")


if __name__ == "__main__":
    main()