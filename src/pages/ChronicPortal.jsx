import React, { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { ActivitySquare, UserPlus, HeartPulse, ShieldCheck, ChevronRight, Activity, Flame } from 'lucide-react';

const ChronicPortal = () => {
  const { t } = useLanguage();
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: '',
    age_years: 54,
    gender: 'male',
    phone: '9123456789',
    village: 'Chandrapur',
    consent_given: true,
  });

  const [cardioVitals, setCardioVitals] = useState({
    height_cm: 168,
    weight_kg: 82,
    systolic_bp: 154,
    diastolic_bp: 98,
    cholesterol: 2,
    glucose: 2,
    smoke: true,
    alcohol: false,
    physically_active: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await api.getChronicPatients();
      if (res.data && res.data.length > 0) {
        setPatientsList(res.data);
        if (!selectedPatientId) {
          setSelectedPatientId(res.data[0].id.toString());
        }
      }
    } catch (e) {
      console.warn('Could not fetch chronic patients:', e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createChronicPatient(newPatient);
      await fetchPatients();
      setSelectedPatientId(res.data.id.toString());
      setShowRegModal(false);
      alert('Patient registered for chronic screening.');
    } catch (err) {
      alert('Registration error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleScreenCardio = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selected = patientsList.find(p => p.id.toString() === selectedPatientId);
      const res = await api.screenChronicCardio({
        age_years: selected ? Number(selected.age_years) : 54,
        gender: selected?.gender === 'female' ? 1 : 2,
        height_cm: Number(cardioVitals.height_cm),
        weight_kg: Number(cardioVitals.weight_kg),
        systolic_bp: Number(cardioVitals.systolic_bp),
        diastolic_bp: Number(cardioVitals.diastolic_bp),
        cholesterol: Number(cardioVitals.cholesterol),
        glucose: Number(cardioVitals.glucose),
        smoke: Boolean(cardioVitals.smoke),
        alcohol: Boolean(cardioVitals.alcohol),
        physically_active: Boolean(cardioVitals.physically_active),
      });
      setResult(res.data);

      if (selectedPatientId) {
        await api.recordChronicAssessment(selectedPatientId, {
          height_cm: Number(cardioVitals.height_cm),
          weight_kg: Number(cardioVitals.weight_kg),
          systolic_bp: Number(cardioVitals.systolic_bp),
          diastolic_bp: Number(cardioVitals.diastolic_bp),
          cholesterol: Number(cardioVitals.cholesterol),
          glucose: Number(cardioVitals.glucose),
          smoke: Boolean(cardioVitals.smoke),
          alcohol: Boolean(cardioVitals.alcohol),
          physically_active: Boolean(cardioVitals.physically_active),
        });
      }
    } catch (err) {
      alert('Screening error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <ActivitySquare className="w-3.5 h-3.5" />
            <span>Cardiovascular Decision Support Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
            {t('chronic_portal')} & Lifestyle Risk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Trained on 70,000 patient records to screen for cardiovascular complications, computing BMI and hypertension risk stratification for rural health programs.
          </p>
        </div>

        <button
          onClick={() => setShowRegModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4 text-indigo-300" />
          <span>+ Register Adult Patient</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Vitals & Lifestyle Input
              </h2>
              <p className="text-xs text-slate-500">Record biometrics and behavioral markers</p>
            </div>

            {patientsList.length > 0 && (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none"
              >
                {patientsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age_years}y, {p.village || 'Village'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <form onSubmit={handleScreenCardio} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={cardioVitals.height_cm}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, height_cm: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={cardioVitals.weight_kg}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, weight_kg: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={cardioVitals.systolic_bp}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, systolic_bp: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={cardioVitals.diastolic_bp}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, diastolic_bp: Number(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cholesterol Level</label>
                <select
                  value={cardioVitals.cholesterol}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, cholesterol: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>1 - Normal</option>
                  <option value={2}>2 - Above Normal</option>
                  <option value={3}>3 - Well Above Normal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Glucose Level</label>
                <select
                  value={cardioVitals.glucose}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, glucose: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>1 - Normal</option>
                  <option value={2}>2 - Above Normal</option>
                  <option value={3}>3 - Well Above Normal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-bold">
              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardioVitals.smoke}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, smoke: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Smoker</span>
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardioVitals.alcohol}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, alcohol: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Alcohol</span>
              </label>

              <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardioVitals.physically_active}
                  onChange={(e) => setCardioVitals({ ...cardioVitals, physically_active: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Active</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-700 to-slate-900 hover:from-indigo-800 hover:to-black text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <span>Evaluating Cardiovascular Risk...</span> : <span>Run Chronic Cardio Risk Screening</span>}
            </button>

          </form>
        </div>

        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className={`p-6 rounded-3xl border shadow-sm text-left ${
              result.screening_priority === 'priority_review' 
                ? 'bg-rose-50 border-rose-200 text-rose-950' 
                : result.screening_priority === 'clinical_review' 
                ? 'bg-amber-50 border-amber-200 text-amber-950' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Screening Priority</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  result.screening_priority === 'priority_review' ? 'bg-rose-600 text-white' : result.screening_priority === 'clinical_review' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {result.screening_priority.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-4xl sm:text-5xl font-black font-['Plus_Jakarta_Sans']">
                  {result.risk_score}%
                </span>
                <span className="text-xs font-bold text-slate-500">Predicted Complication Probability</span>
              </div>

              <div className="my-3 inline-block px-3 py-1 bg-white/70 border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
                Calculated BMI: <strong>{result.bmi} kg/m²</strong>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="text-xs font-bold">Identified Risk Factors:</div>
                <ul className="space-y-1 text-xs font-medium pl-4 list-disc">
                  {result.contributing_factors?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
              <ActivitySquare className="w-12 h-12 text-slate-300" />
              <div className="text-sm font-bold text-slate-600">No Assessment Completed</div>
              <p className="text-xs max-w-xs text-slate-400">
                Enter biometric measurements and lifestyle flags to run the ML cardiovascular risk engine.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Adult Patient Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Register Adult Patient
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  required
                  placeholder="e.g. Devendra Patil"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={newPatient.age_years}
                    onChange={(e) => setNewPatient({ ...newPatient, age_years: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Village / District</label>
                <input
                  type="text"
                  value={newPatient.village}
                  onChange={(e) => setNewPatient({ ...newPatient, village: e.target.value })}
                  placeholder="e.g. Chandrapur Sub-Centre"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors mt-2"
              >
                Confirm Patient Registration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChronicPortal;
