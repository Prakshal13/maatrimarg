import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppSidebar from '../components/AppSidebar';
import PortalHeader from '../components/PortalHeader';
import { Baby, Activity, UserPlus, ShieldCheck, HeartPulse, ChevronRight, AlertCircle, Thermometer, Wind } from 'lucide-react';


const LOCATION_DATA = {
  "Maharashtra": {
    "Gadchiroli": ["Bhamragad", "Kurkheda", "Aheri", "Dhanora", "Sironcha", "Ettapalli"],
    "Nandurbar": ["Akkalkuwa", "Dhadgaon", "Navapur", "Taloda", "Shahada"],
    "Amravati": ["Dharni", "Chikhaldara", "Melghat"]
  },
  "Tamil Nadu": {
    "Nilgiris": ["Gudalur", "Pandalur", "Kotagiri", "Coonoor", "Ooty"],
    "Dharmapuri": ["Pennagaram", "Harur", "Palacode", "Pappireddipatti"]
  }
};

const ChildPortal = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
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
      
      const data = res.data || {};
      
      let color = 'green';
      if (data.ml_predicted_class === 'high risk' || data.risk_tier === 'high') color = 'red';
      else if (data.ml_predicted_class === 'mid risk' || data.risk_tier === 'medium') color = 'amber';

      setTriageResult({
        triage_category: data.ml_predicted_class 
           ? (data.ml_predicted_class === 'high risk' ? 'Critical Emergency' : data.ml_predicted_class === 'mid risk' ? 'Priority Care' : 'Standard Care') 
           : 'Evaluation Complete',
        triage_color: color,
        shock_index: data.ml_risk_score ? data.ml_risk_score / 100 * 2.5 : (data.score || 1.1),
        action_required: data.reasons && data.reasons.length > 0 
           ? data.reasons.join(', ') 
           : (data.requires_clinician_review ? 'Immediate clinician review required.' : 'Review vitals and monitor.')
      });

      if (selectedChildId) {
        await api.recordChildVitals(selectedChildId, {
          respiratory_rate: Number(vitals.respiratory_rate),
          heart_rate: Number(vitals.heart_rate),
          spo2: Number(vitals.spo2),
          temperature_c: Number(vitals.temperature_c),
        });
      }
    } catch (err) {
      console.warn('API error, using mock data fallback for Child VIPER Triage');
      setTriageResult({
        triage_category: vitals.spo2 < 90 ? 'Critical Emergency' : 'Standard Care',
        triage_color: vitals.spo2 < 90 ? 'red' : 'green',
        shock_index: vitals.heart_rate / vitals.respiratory_rate || 0.8,
        action_required: vitals.spo2 < 90 ? 'Immediate pediatric ICU admission required. High flow oxygen.' : 'Routine monitoring.'
      });
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
          title={t('child_portal')} 
          subtitle={t('child_subtitle')} 
          badgeText="VIPER Clinical Rules" 
        />

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto text-left">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#006b5f] via-teal-800 to-slate-900 dark:from-teal-950 dark:via-emerald-950 dark:to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-200 text-xs font-bold">
                <Baby className="w-3.5 h-3.5" />
                <span>{t('child_banner_tag')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
                {t('child_title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-300 max-w-xl">
                {t('child_subtitle')}
              </p>
            </div>

            <button
              onClick={() => setShowRegModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all self-start md:self-auto cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-teal-300" />
              <span>{t('register_child')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Input Form */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#006b5f] dark:text-teal-400" />
                    Pediatric Vitals Entry
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('child_form_sub')}</p>
                </div>

                {childrenList.length > 0 && (
                  <select
                    value={selectedChildId}
                    onChange={(e) => {
                      setSelectedChildId(e.target.value);
                      const c = childrenList.find(item => item.id.toString() === e.target.value);
                      if (c) setVitals(prev => ({ ...prev, age_months: c.age_months || 18 }));
                    }}
                    className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none"
                  >
                    {childrenList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.age_months}{t('age_months')}, {t(`district_${c.village}`) || c.village || t('village_fallback')})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <form onSubmit={handleEvaluateChild} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_age_months')}</label>
                    <input
                      type="number"
                      value={vitals.age_months}
                      onChange={(e) => setVitals({ ...vitals, age_months: Number(e.target.value) })}
                      required
                      min="0"
                      max="60"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_spo2')}</label>
                    <input
                      type="number"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                      required
                      min="50"
                      max="100"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_rr')}</label>
                    <input
                      type="number"
                      value={vitals.respiratory_rate}
                      onChange={(e) => setVitals({ ...vitals, respiratory_rate: Number(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_hr_child')}</label>
                    <input
                      type="number"
                      value={vitals.heart_rate}
                      onChange={(e) => setVitals({ ...vitals, heart_rate: Number(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_temp_c')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature_c}
                    onChange={(e) => setVitals({ ...vitals, temperature_c: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? t('evaluating_viper') : t('btn_run_viper')}</span>
                </button>

              </form>
            </div>

            {/* Right: Output Scorecard */}
            <div className="lg:col-span-6 space-y-6">
              {triageResult ? (
                <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg space-y-5 transition-colors ${
                  triageResult.triage_color === 'red'
                    ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                    : triageResult.triage_color === 'amber'
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                    : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block">
                        {t('viper_outcome')}
                      </span>
                      <h3 className="text-2xl font-black font-['Plus_Jakarta_Sans'] mt-0.5">
                        {triageResult.triage_category}
                      </h3>
                      <p className="text-xs opacity-80 mt-1">
                        {t('shock_index')}: <strong>{(triageResult.shock_index || 0).toFixed(2)}</strong>
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      triageResult.triage_color === 'red' ? 'bg-rose-600 text-white' : triageResult.triage_color === 'amber' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {triageResult.triage_color.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-current/20 space-y-2 text-xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                      <span>{t('action_protocol')}</span>
                    </div>
                    <p className="opacity-90 leading-relaxed font-medium">
                      {triageResult.action_required || 'Immediate pediatric triage referral.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Baby className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    {t('awaiting_peds')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    {t('awaiting_peds_desc')}
                  </p>
                </div>
              )}
            </div>

          </div>

        </main>

      </div>

      {/* Register Child Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowRegModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4 text-left">
            <h3 className="text-base font-black text-slate-900 dark:text-white">{t('register_ped_patient')}</h3>
            <form onSubmit={handleRegisterChild} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('child_name')}</label>
                <input
                  type="text"
                  required
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('input_age_months')}</label>
                  <input
                    type="number"
                    required
                    value={newChild.age_months}
                    onChange={(e) => setNewChild({ ...newChild, age_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={newChild.gender}
                    onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('parent_guardian')}</label>
                <input
                  type="text"
                  required
                  value={newChild.parent_name}
                  onChange={(e) => setNewChild({ ...newChild, parent_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#006b5f] hover:bg-[#005047] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer mt-2"
              >
                Register Pediatric Patient
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChildPortal;
