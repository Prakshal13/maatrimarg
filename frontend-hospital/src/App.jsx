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

// Simple inline SVG icons - no external dependency needed
const IconBed = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
  </svg>
);
const IconBaby = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="5" /><path d="M9 8h.01" /><path d="M15 8h.01" /><path d="M9.5 11a3.5 3.5 0 0 0 5 0" />
    <path d="M6 19c0-3 2.5-5 6-5s6 2 6 5" />
  </svg>
);
const IconStethoscope = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.8 2.3A.3.3 0 1 0 5.4 2 .3.3 0 1 0 4.8 2.3" />
    <path d="M8 2v4a4 4 0 0 1-4 4H3a1 1 0 0 1-1-1V6" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);
const IconDroplet = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
const IconBuilding = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" />
  </svg>
);
const IconAlert = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
  </svg>
);

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

  const criticalShortages = hospitals.filter((h) =>
    Object.values(h.blood_stock).some((v) => v === 0)
  ).length;
  const totalBeds = hospitals.reduce((sum, h) => sum + h.beds_available, 0);

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
      <div className="min-h-screen bg-[#0a0118] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin"></div>
          <div className="text-slate-400 text-sm font-medium">Loading hospitals...</div>
        </div>
      </div>
    );
  }

  const totalBloodUnits = form
    ? BLOOD_TYPES.reduce((sum, type) => sum + (form[BLOOD_FIELD_MAP[type]] || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0118] text-white relative overflow-hidden font-sans">
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        <header className="px-6 py-6 border-b border-white/10 backdrop-blur-xl bg-black/20 animate-in">
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                <IconBuilding className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  MaatriMarg
                </h1>
                <p className="text-slate-400 text-xs font-medium">Hospital Status Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 font-medium">
                <IconBed className="w-3.5 h-3.5 text-cyan-400" />
                {totalBeds} beds district-wide
              </div>
              {criticalShortages > 0 && (
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-400/30 rounded-full px-3 py-1.5 text-xs text-rose-300 font-semibold">
                  <IconAlert className="w-3.5 h-3.5" />
                  {criticalShortages} shortage{criticalShortages > 1 ? "s" : ""}
                </div>
              )}
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 rounded-full px-4 py-1.5 text-xs text-emerald-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px] shadow-emerald-400 animate-pulse-glow"></span>
                LIVE
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6 animate-in delay-1">
            <label className="block text-sm text-slate-300 mb-2 font-semibold uppercase tracking-wide">
              Select your hospital
            </label>
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 text-lg font-medium focus:outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20 transition-all shadow-lg cursor-pointer hover:bg-white/[0.07]"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id} className="bg-[#150a28]">
                  {h.name} — {h.village_area}
                </option>
              ))}
            </select>
          </div>

          {selectedHospital && (
            <div className="flex flex-wrap items-center gap-3 mb-6 animate-in delay-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Updated {timeAgo(selectedHospital.last_updated)}
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-sm text-slate-300">
                <IconDroplet className="w-3.5 h-3.5 text-cyan-400" />
                {totalBloodUnits} total blood units
              </div>
            </div>
          )}

          {form && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in delay-2 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300">
                <h2 className="font-display font-bold mb-5 text-lg flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px] shadow-cyan-400/50"></span>
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Capacity
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5 font-medium">
                      <IconBed className="w-3.5 h-3.5" />
                      Beds available
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.beds_available}
                      onChange={(e) => handleChange("beds_available", Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5 font-medium">
                      <IconBaby className="w-3.5 h-3.5" />
                      NICU beds available
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.nicu_beds_available}
                      onChange={(e) => handleChange("nicu_beds_available", Number(e.target.value))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 mt-5 cursor-pointer group w-fit">
                  <input
                    type="checkbox"
                    checked={form.surgeon_on_duty}
                    onChange={(e) => handleChange("surgeon_on_duty", e.target.checked)}
                    className="w-5 h-5 rounded accent-cyan-400 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                    <IconStethoscope className="w-3.5 h-3.5" />
                    Surgeon on duty
                  </span>
                </label>
              </div>

              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in delay-3 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300">
                <h2 className="font-display font-bold mb-5 text-lg flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-rose-400 to-fuchsia-500 rounded-full shadow-[0_0_10px] shadow-rose-400/50"></span>
                  <span className="bg-gradient-to-r from-rose-300 to-fuchsia-300 bg-clip-text text-transparent">
                    Blood Stock (units)
                  </span>
                </h2>
                <div className="grid grid-cols-4 gap-3">
                  {BLOOD_TYPES.map((type) => {
                    const field = BLOOD_FIELD_MAP[type];
                    const isEmpty = form[field] === 0;
                    const isLow = form[field] > 0 && form[field] <= 2;
                    return (
                      <div key={type} className="group">
                        <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-wide">
                          {type}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form[field]}
                          onChange={(e) => handleChange(field, Number(e.target.value))}
                          className={`w-full rounded-xl px-2 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 transition-all hover:scale-[1.03] ${isEmpty
                              ? "bg-rose-500/10 border-2 border-rose-400/70 text-rose-300 shadow-[0_0_15px] shadow-rose-500/20 focus:ring-rose-400/30"
                              : isLow
                                ? "bg-amber-500/10 border border-amber-400/50 text-amber-300 focus:ring-amber-400/20"
                                : "bg-black/30 border border-white/10 text-white focus:border-cyan-400/60 focus:ring-cyan-400/20"
                            }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    Out of stock
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Low stock (≤2 units)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all rounded-2xl py-4 font-display font-bold text-lg text-white shadow-[0_0_30px] shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 animate-in delay-4 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Save Status"
                )}
              </button>

              {saveMessage && (
                <p
                  className={`text-center text-sm font-semibold flex items-center justify-center gap-1.5 ${saveMessage.includes("Failed") ? "text-rose-400" : "text-emerald-400"
                    }`}
                >
                  {saveMessage.includes("Failed") ? (
                    <IconAlert className="w-3.5 h-3.5" />
                  ) : (
                    <IconCheck className="w-3.5 h-3.5" />
                  )}
                  {saveMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}