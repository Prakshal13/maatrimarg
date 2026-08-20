import { useState, useEffect } from "react";
import { fetchHospitals, updateHospital } from "./api";

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const BLOOD_FIELD_MAP = {
  "O+": "stock_o_pos", "O-": "stock_o_neg",
  "A+": "stock_a_pos", "A-": "stock_a_neg",
  "B+": "stock_b_pos", "B-": "stock_b_neg",
  "AB+": "stock_ab_pos", "AB-": "stock_ab_neg",
};

function timeAgo(isoString) {
  if (!isoString) return "never";
  const diffMs = Date.now() - new Date(isoString + "Z").getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export default function App() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  async function loadHospitals() {
    try {
      const data = await fetchHospitals();
      setHospitals(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHospitals();
    const interval = setInterval(loadHospitals, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hospital = hospitals.find((h) => h.id === selectedId);
    if (hospital) {
      setForm({
        beds_available: hospital.beds_available,
        nicu_beds_available: hospital.nicu_beds_available,
        surgeon_on_duty: hospital.surgeon_on_duty,
        stock_o_pos: hospital.blood_stock["O+"],
        stock_o_neg: hospital.blood_stock["O-"],
        stock_a_pos: hospital.blood_stock["A+"],
        stock_a_neg: hospital.blood_stock["A-"],
        stock_b_pos: hospital.blood_stock["B+"],
        stock_b_neg: hospital.blood_stock["B-"],
        stock_ab_pos: hospital.blood_stock["AB+"],
        stock_ab_neg: hospital.blood_stock["AB-"],
      });
    }
  }, [selectedId, hospitals]);

  const selectedHospital = hospitals.find((h) => h.id === selectedId);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    try {
      await updateHospital(selectedId, form);
      setSaveMessage("Saved successfully");
      await loadHospitals();
    } catch (err) {
      setSaveMessage("Failed to save — try again");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-teal-400 animate-pulse">Loading hospitals...</div>
      </div>
    );
  }

  const totalBloodUnits = form
    ? BLOOD_TYPES.reduce((sum, type) => sum + (form[BLOOD_FIELD_MAP[type]] || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header with gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400"></div>
      <header className="px-6 py-6 border-b border-slate-800/60 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
              MaatriMarg
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Hospital Status Dashboard</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-full px-4 py-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hospital selector */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2 font-medium">Select your hospital</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.village_area}
              </option>
            ))}
          </select>
        </div>

        {selectedHospital && (
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Updated {timeAgo(selectedHospital.last_updated)}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {totalBloodUnits} total blood units in stock
            </div>
          </div>
        )}

        {form && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Capacity card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h2 className="font-semibold mb-5 text-teal-300 flex items-center gap-2">
                <span className="w-1 h-5 bg-teal-400 rounded-full"></span>
                Capacity
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Beds available</label>
                  <input
                    type="number"
                    min="0"
                    value={form.beds_available}
                    onChange={(e) => handleChange("beds_available", Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-medium focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">NICU beds available</label>
                  <input
                    type="number"
                    min="0"
                    value={form.nicu_beds_available}
                    onChange={(e) => handleChange("nicu_beds_available", Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-medium focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 mt-5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.surgeon_on_duty}
                    onChange={(e) => handleChange("surgeon_on_duty", e.target.checked)}
                    className="w-5 h-5 rounded accent-teal-500 cursor-pointer"
                  />
                </div>
                <span className="text-sm group-hover:text-teal-300 transition-colors">Surgeon on duty</span>
              </label>
            </div>

            {/* Blood stock card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h2 className="font-semibold mb-5 text-rose-300 flex items-center gap-2">
                <span className="w-1 h-5 bg-rose-400 rounded-full"></span>
                Blood Stock (units)
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {BLOOD_TYPES.map((type) => {
                  const field = BLOOD_FIELD_MAP[type];
                  const isEmpty = form[field] === 0;
                  const isLow = form[field] > 0 && form[field] <= 2;
                  return (
                    <div key={type}>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">{type}</label>
                      <input
                        type="number"
                        min="0"
                        value={form[field]}
                        onChange={(e) => handleChange(field, Number(e.target.value))}
                        className={`w-full rounded-xl px-2 py-2.5 text-center text-lg font-semibold focus:outline-none focus:ring-2 transition-all ${isEmpty
                            ? "bg-rose-950/50 border-2 border-rose-500/60 text-rose-300 focus:ring-rose-400/30"
                            : isLow
                              ? "bg-amber-950/30 border border-amber-600/40 text-amber-300 focus:ring-amber-400/20"
                              : "bg-slate-950/80 border border-slate-700 text-white focus:border-teal-400 focus:ring-teal-400/20"
                          }`}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-4">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span>
                Out of stock
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-4 mr-1.5"></span>
                Low stock (≤2 units)
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 transition-all rounded-xl py-3.5 font-semibold text-slate-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
            >
              {saving ? "Saving..." : "Save Status"}
            </button>

            {saveMessage && (
              <p
                className={`text-center text-sm font-medium ${saveMessage.includes("Failed") ? "text-rose-400" : "text-emerald-400"
                  }`}
              >
                {saveMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}