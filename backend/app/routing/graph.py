"""
Graph Routing Engine.

Core idea: hospitals aren't all equally reachable, and not every hospital
can actually help a given mother (missing blood type, no NICU bed). So routing
happens in two stages:

  1. FILTER - remove hospitals that cannot medically accept this mother
  2. ROUTE  - among the remaining eligible hospitals, find the best one using
     a graph search (Dijkstra's algorithm) weighted by travel time, with a
     capacity-awareness tiebreaker

This means a hospital can be geographically closer but still get skipped if
it can't actually treat her - which is the core "wow" of the whole project.
"""
import heapq
import math

AVERAGE_SPEED_KMPH = 40  # Rough rural/semi-urban average speed
RURAL_ROAD_TORTUOSITY = 1.25  # Real rural road winding factor vs straight line

# Standard Medical ABO / Rh Red Blood Cell Transfusion Compatibility Matrix
BLOOD_COMPATIBILITY_MAP = {
    "O-": ["O-"],
    "O+": ["O+", "O-"],
    "A-": ["A-", "O-"],
    "A+": ["A+", "A-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],  # Universal Recipient
}


def get_compatible_blood_units(blood_stock: dict, recipient_blood_type: str) -> tuple[int, list[str]]:
    """Calculates total medically compatible blood units available for the recipient."""
    recipient = (recipient_blood_type or "").upper().strip()
    compatible_types = BLOOD_COMPATIBILITY_MAP.get(recipient, [recipient])
    total = 0
    breakdown = []
    for b_type in compatible_types:
        units = blood_stock.get(b_type, 0)
        if units > 0:
            total += units
            breakdown.append(f"{units}U {b_type}")
    return total, breakdown


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two lat/lng points, in kilometers."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def travel_time_minutes(distance_km: float, speed_kmph: float = AVERAGE_SPEED_KMPH, road_factor: float = RURAL_ROAD_TORTUOSITY) -> float:
    """Estimates travel time in minutes considering real-world rural road curvature."""
    actual_road_distance = distance_km * road_factor
    return round((actual_road_distance / speed_kmph) * 60, 1)


def build_graph(source_node: dict, hospital_nodes: list) -> dict:
    """
    Builds a weighted graph as an adjacency dict: {node_id: {neighbor_id: weight_minutes}}.
    'source_node' is the mother/patient location: {"id": "source", "lat": ..., "lng": ...}
    'hospital_nodes' is a list of {"id": hospital_id, "lat": ..., "lng": ...}
    """
    all_nodes = [source_node] + hospital_nodes
    graph = {node["id"]: {} for node in all_nodes}

    for i, a in enumerate(all_nodes):
        for b in all_nodes[i + 1:]:
            dist = haversine_km(a["lat"], a["lng"], b["lat"], b["lng"])
            weight = travel_time_minutes(dist)
            graph[a["id"]][b["id"]] = weight
            graph[b["id"]][a["id"]] = weight

    return graph


def dijkstra(graph: dict, source_id: str):
    """
    Standard Dijkstra's algorithm. Returns (distances, previous) where
    distances[node_id] = shortest travel time in minutes from source,
    previous[node_id] = the node before it on the shortest path (for path reconstruction).
    """
    distances: dict[str, float] = {node_id: math.inf for node_id in graph}
    previous: dict[str, str | None] = {node_id: None for node_id in graph}
    distances[source_id] = 0

    visited = set()
    heap = [(0, source_id)]

    while heap:
        current_dist, current_id = heapq.heappop(heap)
        if current_id in visited:
            continue
        visited.add(current_id)

        for neighbor_id, weight in graph[current_id].items():
            if neighbor_id in visited:
                continue
            new_dist = current_dist + weight
            if new_dist < distances[neighbor_id]:
                distances[neighbor_id] = new_dist
                previous[neighbor_id] = current_id
                heapq.heappush(heap, (new_dist, neighbor_id))

    return distances, previous


def filter_eligible_hospitals(
    hospitals: list,
    blood_type: str,
    needs_nicu: bool,
    requires_surgeon: bool = True,
    requires_anaesthesia: bool = False,
    active_incoming_map: dict | None = None,
) -> tuple:
    """
    Splits hospitals into (eligible, skipped_with_reasons).
    A hospital is eligible if:
      1. It has medically compatible blood stock (ABO/Rh transfusion rules)
      2. It has free general beds (accounting for active in-flight referrals)
      3. It has free NICU beds (if requested)
      4. It has an on-duty emergency surgeon (if requested)
      5. It has an on-duty anaesthesiologist (if requested for surgical C-sections)
    """
    eligible = []
    skipped = []
    active_map = active_incoming_map or {}

    for h in hospitals:
        reasons = []
        
        # 1. Blood Transfusion Compatibility
        if blood_type:
            compat_units, breakdown = get_compatible_blood_units(h["blood_stock"], blood_type)
            if compat_units <= 0:
                compat_types = BLOOD_COMPATIBILITY_MAP.get(blood_type.upper(), [blood_type])
                reasons.append(f"No compatible blood stock for {blood_type} (checked: {', '.join(compat_types)})")
            else:
                h["compatible_blood_units"] = compat_units
                h["compatible_blood_breakdown"] = breakdown

        # 2. General Bed Availability
        beds = h.get("beds_available", 0)
        active_in = active_map.get(h["id"], 0)
        effective_beds = beds - active_in
        if effective_beds <= 0:
            if beds <= 0:
                reasons.append("No general beds available (0 capacity)")
            else:
                reasons.append(f"All {beds} beds occupied by {active_in} active incoming emergency referrals")

        # 3. NICU Availability
        if needs_nicu and h.get("nicu_beds_available", 0) <= 0:
            reasons.append("No NICU beds available")

        # 4. Emergency Surgeon on Duty
        if requires_surgeon and not h.get("surgeon_on_duty", False):
            reasons.append("No emergency surgeon on duty")

        # 5. Anaesthesia on Duty
        if requires_anaesthesia and not h.get("anaesthesia_on_duty", False):
            reasons.append("No anaesthesiologist on duty for emergency surgical intervention")

        if reasons:
            skipped.append({"hospital": h, "reasons": reasons})
        else:
            eligible.append(h)

    return eligible, skipped


def capacity_score(hospital: dict, active_incoming_count: int = 0) -> float:
    """
    Lower is better. Combines available beds with active incoming patients,
    so the router balances patient distribution instead of overwhelming a single facility.
    """
    beds = hospital.get("beds_available", 0)
    return -(beds - active_incoming_count)
