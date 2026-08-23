import React, { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { Baby, Activity, UserPlus, ShieldCheck, HeartPulse, ChevronRight, AlertCircle, Thermometer, Wind } from 'lucide-react';

const ChildPortal = () => {
  const { t } = useLanguage();
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);

  const [newChild, setNewChild] = useState({
    name: '',
    age_months: 18,
    gender: 'female',
    parent_name: 'Pooja Sharma',
    phone: '9876543210',
    village: 'Bhamragad',
    consent_given: true,
  });

  const [vitals, setVitals] = useState({
    age_months: 18,
    respiratory_rate: 46,
    heart_rate: 135,
    spo2: 93,
    temperature_c: 38.8,
  });

  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChildren = async () => {
    try {
      const res = await api.getChildren();
      if (res.data && res.data.length > 0) {
        setChildrenList(res.data);
        if (!selectedChildId) {
          setSelectedChildId(res.data[0].id.toString());
          setVitals(prev => ({ ...prev, age_months: res.data[0].age_months || 18 }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch children:', e);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleRegisterChild = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createChild(newChild);
      await fetchChildren();
      setSelectedChildId(res.data.id.toString());
      setShowRegModal(false);
      alert('Pediatric patient registered successfully.');
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEvaluateChild = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.triageChild({
        age_months: Number(vitals.age_months),
        respiratory_rate: Number(vitals.respiratory_rate),
        heart_rate: Number(vitals.heart_rate),
        spo2: Number(vitals.spo2),
        temperature_c: Number(vitals.temperature_c),
      });
      setTriageResult(res.data);

      if (selectedChildId) {
        await api.recordChildVitals(selectedChildId, {
          respiratory_rate: Number(vitals.respiratory_rate),
          heart_rate: Number(vitals.heart_rate),
          spo2: Number(vitals.spo2),
          temperature_c: Number(vitals.temperature_c),
        });
      }
    } catch (err) {
      alert('Triage error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
            <Baby className="w-3.5 h-3.5" />
            <span>Pediatric VIPER Triage & Child Health Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
            {t('child_portal')} & Longitudinal Vitals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Age-banded pediatric triage engine evaluating Respiratory Rate, Heart Rate, SpO2, and Core Temperature against VIPER clinical rules and Random Forest probabilities.
          </p>
        </div>

        <button
          onClick={() => setShowRegModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4 text-teal-300" />
          <span>+ Register Child</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Pediatric Vitals Entry
              </h2>
              <p className="text-xs text-slate-500">Record infant vitals (0 to 60 months)</p>
            </div>

            {childrenList.length > 0 && (
              <select
                value={selectedChildId}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                  const c = childrenList.find(item => item.id.toString() === e.target.value);
                  if (c) setVitals(prev => ({ ...prev, age_months: c.age_months || 18 }));
                }}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age_months}m, {c.village || 'Village'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <form onSubmit={handleEvaluateChild} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age in Months</label>
                <input
                  type="number"
                  value={vitals.age_months}
                  onChange={(e) => setVitals({ ...vitals, age_months: Number(e.target.value) })}
                  required
                  min="0"
                  max="60"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SpO2 Level (%)</label>
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                  required
                  min="50"
                  max="100"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Respiratory Rate (Breaths/min)</label>
                <input
                  type="number"
                  value={vitals.respiratory_rate}
                  onChange={(e) => setVitals({ ...vitals, respiratory_rate: Number(e.target.value) })}
                  required
                  min="10"
                  max="120"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={vitals.heart_rate}
                  onChange={(e) => setVitals({ ...vitals, heart_rate: Number(e.target.value) })}
                  required
                  min="40"
                  max="240"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Core Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature_c}
                onChange={(e) => setVitals({ ...vitals, temperature_c: Number(e.target.value) })}
                required
                min="32"
                max="44"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <span>Evaluating Pediatric Triage...</span> : <span>Run Pediatric VIPER Triage</span>}
            </button>

          </form>
        </div>

        {/* Right: Triage Results */}
        <div className="lg:col-span-6 space-y-6">
          {triageResult ? (
            <div className={`p-6 rounded-3xl border shadow-sm text-left ${
              triageResult.risk_tier === 'high' 
                ? 'bg-rose-50 border-rose-200 text-rose-950' 
                : triageResult.risk_tier === 'medium' 
                ? 'bg-amber-50 border-amber-200 text-amber-950' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Pediatric Triage Priority</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  triageResult.risk_tier === 'high' ? 'bg-rose-600 text-white' : triageResult.risk_tier === 'medium' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {triageResult.risk_tier} Priority
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-4xl sm:text-5xl font-black font-['Plus_Jakarta_Sans']">
                  {triageResult.ml_risk_score ?? triageResult.score}
                </span>
                <span className="text-xs font-bold text-slate-500">/ 100 Clinical Index</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="text-xs font-bold">Clinical Flags (VIPER Rules):</div>
                <ul className="space-y-1 text-xs font-medium pl-4 list-disc">
                  {triageResult.reasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
              <Baby className="w-12 h-12 text-slate-300" />
              <div className="text-sm font-bold text-slate-600">No Child Triage Evaluated</div>
              <p className="text-xs max-w-xs text-slate-400">
                Enter age in months, SpO2, respiratory rate, and temperature on the left to trigger instant pediatric triage.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Child Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                Register Child Patient
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleRegisterChild} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Child Full Name</label>
                <input
                  type="text"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  required
                  placeholder="e.g. Ananya Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age in Months</label>
                  <input
                    type="number"
                    value={newChild.age_months}
                    onChange={(e) => setNewChild({ ...newChild, age_months: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newChild.gender}
                    onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={newChild.parent_name}
                  onChange={(e) => setNewChild({ ...newChild, parent_name: e.target.value })}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-colors mt-2"
              >
                Confirm Child Registration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChildPortal;
