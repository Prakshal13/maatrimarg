"""
Filters the raw OSM hospital dump down to real GOVERNMENT hospitals capable
of general/emergency/maternal care across Tamil Nadu. Keeps ALL matches
(deduplicated) - no artificial cap.
"""
import json

# Only strong, government-specific signals - "medical college" alone is
# removed since private colleges (ACS, Sathya Sai, Vinayaka Mission, etc.)
# also use that phrase and would otherwise slip through.
GOVT_KEYWORDS = [
    "government", "govt", "goverment",  # common misspelling seen in OSM data
    "district hospital", "corporation hospital", "municipal hospital",
    "primary health centre", "phc", "chc", "taluk hospital",
]

HARD_EXCLUDE = [
    "veterinary", "vetinary", "animal",
    "siddha only", "homeo only", "ayurved only",
    "dental", "eye hospital", "ent hospital",
]


def load_raw():
    with open("app/osm_hospitals_raw.json") as f:
        return json.load(f)


def is_usable_government_hospital(name: str) -> bool:
    name_lower = name.lower()
    if any(kw in name_lower for kw in HARD_EXCLUDE):
        return False
    return any(kw in name_lower for kw in GOVT_KEYWORDS)


def dedupe(hospitals):
    seen = set()
    unique = []
    for h in hospitals:
        key = h["name"].strip().lower()
        if key not in seen:
            seen.add(key)
            unique.append(h)
    return unique


def main():
    raw = load_raw()
    print(f"Loaded {len(raw)} raw entries.")

    govt = [h for h in raw if is_usable_government_hospital(h["name"])]
    print(f"Filtered to {len(govt)} usable government hospitals.")

    unique = dedupe(govt)
    print(f"After dedupe: {len(unique)} unique hospitals kept.")

    with open("app/filtered_hospitals.json", "w") as f:
        json.dump(unique, f, indent=2)

    print("Saved to app/filtered_hospitals.json")
    print("\nSample (first 15):")
    for h in unique[:15]:
        print(f"  - {h['name']}  ({h['lat']:.4f}, {h['lng']:.4f})")


if __name__ == "__main__":
    main()