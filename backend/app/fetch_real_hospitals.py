"""
Fetches real hospital locations across Tamil Nadu AND Maharashtra from
OpenStreetMap's Overpass API (free, no API key needed).

Run this locally (needs internet access):
    python3 app/fetch_real_hospitals.py

Saves results to app/osm_hospitals_raw.json
"""
import json
import urllib.request
import urllib.parse
import time

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

STATES = ["Tamil Nadu", "Maharashtra"]


def build_query(state_name: str) -> str:
    return f"""
[out:json][timeout:90];
area["name"="{state_name}"]["admin_level"="4"]->.st;
(
  node["amenity"="hospital"]["name"](area.st);
  way["amenity"="hospital"]["name"](area.st);
);
out center;
"""


def fetch_state(state_name: str):
    data = urllib.parse.urlencode({"data": build_query(state_name)}).encode()
    req = urllib.request.Request(
        OVERPASS_URL,
        data=data,
        headers={
            "User-Agent": "MaatriMarg-SIH2026-Hackathon-Project/1.0 (student project, contact: prakshal13)",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    print(f"Querying OpenStreetMap for hospitals in {state_name}... (may take 30-60s)")
    with urllib.request.urlopen(req, timeout=90) as response:
        result = json.loads(response.read().decode())

    hospitals = []
    for el in result.get("elements", []):
        name = el.get("tags", {}).get("name")
        if not name:
            continue
        if el["type"] == "node":
            lat, lng = el["lat"], el["lon"]
        else:
            center = el.get("center", {})
            lat, lng = center.get("lat"), center.get("lon")
        if lat is None or lng is None:
            continue

        hospitals.append({
            "name": name,
            "lat": lat,
            "lng": lng,
            "source_state": state_name,  # tagged directly, no guessing later
            "tags": el.get("tags", {}),
        })

    print(f"  Found {len(hospitals)} named hospitals in {state_name}.")
    return hospitals


def fetch():
    all_hospitals = []
    for state in STATES:
        all_hospitals.extend(fetch_state(state))
        time.sleep(2)  # be polite to the free public API between queries

    print(f"\nTotal across both states: {len(all_hospitals)}")

    with open("app/osm_hospitals_raw.json", "w") as f:
        json.dump(all_hospitals, f, indent=2)

    print("Saved to app/osm_hospitals_raw.json")


if __name__ == "__main__":
    fetch()