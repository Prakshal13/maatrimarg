import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppSidebar from '../components/AppSidebar';
import PortalHeader from '../components/PortalHeader';
import { ActivitySquare, UserPlus, HeartPulse, ShieldCheck, ChevronRight, Activity, Flame } from 'lucide-react';

const ChronicPortal = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
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
    <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f7f9fb] dark:bg-slate-950">
        
        {/* Top Header */}
        <PortalHeader 
          title={t('chronic_portal')} 
          subtitle={t('chronic_subtitle')} 
          badgeText="NCD ML Engine" 
        />

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto text-left">
          
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>{t('chronic_banner_tag')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
                {t('chronic_title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {t('chronic_subtitle')}
              </p>
            </div>

            <button
              onClick={() => setShowRegModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-teal-300" />
              <span>{t('register_patient')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Input Form */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ActivitySquare className="w-5 h-5 text-[#006b5f] dark:text-teal-400" />
                    {t('chronic_form_title')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('chronic_form_sub')}</p>
                </div>

                {patientsList.length > 0 && (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none"
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_height')}</label>
                    <input
                      type="number"
                      value={cardioVitals.height_cm}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, height_cm: Number(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_weight')}</label>
                    <input
                      type="number"
                      value={cardioVitals.weight_kg}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, weight_kg: Number(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_sbp')} (mmHg)</label>
                    <input
                      type="number"
                      value={cardioVitals.systolic_bp}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, systolic_bp: Number(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_dbp')} (mmHg)</label>
                    <input
                      type="number"
                      value={cardioVitals.diastolic_bp}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, diastolic_bp: Number(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_cholesterol')}</label>
                    <select
                      value={cardioVitals.cholesterol}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, cholesterol: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    >
                      <option value="1">{t('chol_normal')}</option>
                      <option value="2">{t('chol_above')}</option>
                      <option value="3">{t('chol_high')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_glucose')}</label>
                    <select
                      value={cardioVitals.glucose}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, glucose: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    >
                      <option value="1">{t('gluc_normal')}</option>
                      <option value="2">{t('gluc_above')}</option>
                      <option value="3">{t('gluc_high')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardioVitals.smoke}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, smoke: e.target.checked })}
                      className="rounded text-[#006b5f]"
                    />
                    <span>{t('tobacco')}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardioVitals.alcohol}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, alcohol: e.target.checked })}
                      className="rounded text-[#006b5f]"
                    />
                    <span>{t('alcohol')}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardioVitals.physically_active}
                      onChange={(e) => setCardioVitals({ ...cardioVitals, physically_active: e.target.checked })}
                      className="rounded text-[#006b5f]"
                    />
                    <span>{t('physically_active')}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? t('evaluating_model') : t('btn_calc_cvd')}</span>
                </button>

              </form>
            </div>

            {/* Right: Output Scorecard */}
            <div className="lg:col-span-6 space-y-6">
              {result ? (
                <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg space-y-5 transition-colors ${
                  result.risk_level === 'High Risk'
                    ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                    : result.risk_level === 'Moderate Risk'
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                    : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block">
                        {t('cvd_scorecard')}
                      </span>
                      <h3 className="text-2xl font-black font-['Plus_Jakarta_Sans'] mt-0.5">
                        {result.risk_level}
                      </h3>
                      <p className="text-xs opacity-80 mt-1">
                        {t('cvd_probability')}: <strong>{result.probability_percentage}</strong>
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      result.risk_level === 'High Risk' ? 'bg-rose-600 text-white' : result.risk_level === 'Moderate Risk' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {result.risk_level}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-current/20 space-y-2 text-xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                      <span>{t('clinical_guidance')}</span>
                    </div>
                    <p className="opacity-90 leading-relaxed font-medium">
                      {result.clinical_recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <ActivitySquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    {t('awaiting_cvd')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    {t('awaiting_cvd_desc')}
                  </p>
                </div>
              )}
            </div>

          </div>

        </main>

      </div>

      {/* Register Patient Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowRegModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4 text-left">
            <h3 className="text-base font-black text-slate-900 dark:text-white">{t('register_ncd_patient')}</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('patient_full_name')}</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('age_years')}</label>
                  <input
                    type="number"
                    required
                    value={newPatient.age_years}
                    onChange={(e) => setNewPatient({ ...newPatient, age_years: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('gender')}</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('village_ward')}</label>
                <input
                  type="text"
                  required
                  value={newPatient.village}
                  onChange={(e) => setNewPatient({ ...newPatient, village: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#006b5f] hover:bg-[#005047] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer mt-2"
              >
                {t('register_for_screening')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChronicPortal;
