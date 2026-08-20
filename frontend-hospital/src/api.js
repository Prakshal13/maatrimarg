const API_BASE = "http://localhost:8000";

export async function fetchHospitals() {
    const res = await fetch(`${API_BASE}/hospitals`);
    if (!res.ok) throw new Error("Failed to fetch hospitals");
    return res.json();
}

export async function fetchHospital(id) {
    const res = await fetch(`${API_BASE}/hospitals/${id}`);
    if (!res.ok) throw new Error("Failed to fetch hospital");
    return res.json();
}

export async function updateHospital(id, data) {
    const res = await fetch(`${API_BASE}/hospitals/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update hospital");
    return res.json();
}