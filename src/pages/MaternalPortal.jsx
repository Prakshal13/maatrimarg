import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppSidebar from '../components/AppSidebar';
import PortalHeader from '../components/PortalHeader';
import { 
  HeartPulse, 
  UserPlus, 
  Activity, 
  Navigation, 
  Languages, 
  PhoneCall, 
  CheckCircle2, 
  RefreshCw,
  Send,
  Download,
  AlertCircle
} from 'lucide-react';

const MaternalPortal = () => {
  const { lang, t } = useLanguage();
  const { user, logout } = useAuth();

  const [vitals, setVitals] = useState({
    age: 28,
    heart_rate: 95,
    systolic_bp: 145,
    diastolic_bp: 95,
    blood_sugar: 6.2,
    body_temp: 99.1,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMotherId, setSelectedMotherId] = useState('');
  const [routingResult, setRoutingResult] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  // ASHA Live Duty & Safety Tracking State
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [ashaGps, setAshaGps] = useState({ lat: 19.3421, lng: 80.3524 });
  const [sosActive, setSosActive] = useState(false);
  const [sosAlertMessage, setSosAlertMessage] = useState('');

  // Auto-capture GPS coordinates on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAshaGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.log('Using default PHC coordinates for ASHA geotag'),
        { timeout: 5000 }
      );
    }
  }, []);

  const handleToggleDuty = async () => {
    const nextState = !isOnDuty;
    setIsOnDuty(nextState);
    try {
      await api.updateAshaLocation(1, {
        lat: ashaGps.lat,
        lng: ashaGps.lng,
        status: nextState ? 'active_in_field' : 'standby',
        battery_level: 85,
      });
    } catch (e) {
      console.warn('Duty status sync:', e);
    }
  };

  const handleTriggerSos = async () => {
    const confirmSos = window.confirm('🚨 TRIGGER EMERGENCY SOS?\n\nThis will instantly broadcast a high-priority distress beacon with your live GPS location to the District Command Center.');
    if (!confirmSos) return;

    try {
      const res = await api.triggerAshaSos(1, {
        lat: ashaGps.lat,
        lng: ashaGps.lng,
        reason: 'ASHA lone-worker field emergency beacon triggered',
      });
      setSosActive(true);
      setSosAlertMessage(res.data.alert);
    } catch (e) {
      alert('SOS broadcast failed: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handlePredictRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.predictMaternalRisk({
        age: Number(vitals.age),
        systolic_bp: Number(vitals.systolic_bp),
        diastolic_bp: Number(vitals.diastolic_bp),
        blood_sugar: Number(vitals.blood_sugar),
        body_temp: Number(vitals.body_temp),
        heart_rate: Number(vitals.heart_rate),
      });
      setPrediction(res.data);
    } catch (err) {
      setErrorMsg('Clinical prediction engine error. Please check values.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setVitals({
      age: 32,
      heart_rate: 110,
      systolic_bp: 165,
      diastolic_bp: 105,
      blood_sugar: 9.8,
      body_temp: 101.4,
    });
  };

  const handleResetForm = () => {
    setVitals({
      age: 24,
      heart_rate: 78,
      systolic_bp: 120,
      diastolic_bp: 80,
      blood_sugar: 5.4,
      body_temp: 98.6,
    });
    setPrediction(null);
    setErrorMsg('');
  };

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f7f9fb] dark:bg-slate-950">
        
        {/* Top Reusable Header */}
        <PortalHeader 
          title={t('maternal_portal')} 
          subtitle={t('maternal_subtitle')} 
          badgeText="ML Inference Engine" 
        />

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto text-left">
          
          {/* Role-Specific Context Banner */}
          {user?.role === 'asha' ? (
            /* Frontline ASHA Duty & Safety SOS Bar */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleDuty}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    isOnDuty 
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{isOnDuty ? '🟢 On Field Duty' : '⚪ Standby Mode'}</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-[#006b5f] dark:text-teal-400" />
                  <span>GPS Geotag:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {ashaGps.lat.toFixed(4)}, {ashaGps.lng.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                    Auto-Geotag Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerSos}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    sosActive 
                      ? 'bg-rose-700 text-white animate-pulse' 
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                  <span>{sosActive ? '🚨 SOS BEACON BROADCASTING' : '🆘 Trigger Emergency SOS'}</span>
                </button>
              </div>
            </div>
          ) : user?.role === 'dho_command' ? (
            /* DHO Command Executive Oversight Banner */
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-400/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm">
                  🏛️
                </span>
                <div>
                  <div className="text-xs font-extrabold flex items-center gap-2">
                    <span>District Command Supervisory & Clinical Protocol Review</span>
                    <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-[9px] font-mono px-2 py-0.5 rounded border border-teal-300 dark:border-teal-400/40 uppercase">
                      Executive Mode
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Logged in as <strong>{user?.name || 'DHO Command Director'}</strong> • Accessing AI inference engine.
                  </div>
                </div>
              </div>

              <Link
                to="/command-center"
                className="px-3 py-1.5 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
              >
                <span>Return to Live GIS Matrix</span>
                <span>➔</span>
              </Link>
            </div>
          ) : (
            /* Hospital CMO Banner */
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-400/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm">
                  🏥
                </span>
                <div>
                  <div className="text-xs font-extrabold flex items-center gap-2">
                    <span>Tertiary Hospital Inpatient & Emergency Triage Evaluation</span>
                    <span className="bg-teal-100 dark:bg-teal-500/30 text-teal-800 dark:text-teal-200 text-[9px] font-mono px-2 py-0.5 rounded uppercase">
                      Clinical Specialist
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Logged in as <strong>{user?.name || 'Hospital CMO'}</strong> • Verifying admission criteria.
                  </div>
                </div>
              </div>

              <Link
                to="/hospital"
                className="px-3 py-1.5 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 text-xs font-bold rounded-xl transition-all shadow-2xs"
              >
                Hospital Directory ➔
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column: Clinical Data Entry Form */}
            <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 sm:p-7 space-y-6 transition-colors">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                    {t('clinical_entry_title')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('clinical_entry_sub')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSample}
                    type="button"
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#006b5f] dark:text-teal-400" />
                    <span>{t('btn_load_sample')}</span>
                  </button>

                  <button
                    onClick={handleResetForm}
                    type="button"
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {t('btn_reset_form')}
                  </button>
                </div>
              </div>

              <form onSubmit={handlePredictRisk} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      {t('input_age')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.age}
                        onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {t('unit_years')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      {t('input_hr')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.heart_rate}
                        onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        bpm
                      </span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      {t('input_sbp')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.systolic_bp}
                        onChange={(e) => setVitals({ ...vitals, systolic_bp: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        mmHg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      {t('input_dbp')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.diastolic_bp}
                        onChange={(e) => setVitals({ ...vitals, diastolic_bp: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        mmHg
                      </span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      {t('input_bs')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={vitals.blood_sugar}
                        onChange={(e) => setVitals({ ...vitals, blood_sugar: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        mmol/L
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      {t('input_temp')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={vitals.body_temp}
                        onChange={(e) => setVitals({ ...vitals, body_temp: e.target.value })}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        °F
                      </span>
                    </div>
                  </div>

                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>{loading ? 'Evaluating Model...' : t('btn_predict_risk')}</span>
                </button>

              </form>

            </div>

            {/* Right Column: Prediction Scorecard & Real-time Referral Routing */}
            <div className="xl:col-span-5 space-y-6">
              
              {prediction ? (
                <div className={`p-6 rounded-3xl border shadow-lg space-y-5 transition-colors ${
                  prediction.risk_level === 'High Risk'
                    ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-100'
                    : prediction.risk_level === 'Mid Risk'
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-100'
                    : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
                }`}>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block">
                        CLINICAL TRIAGE OUTCOME
                      </span>
                      <h4 className="text-2xl font-black font-['Plus_Jakarta_Sans'] mt-0.5">
                        {prediction.risk_level === 'High Risk' ? t('risk_high') : prediction.risk_level === 'Mid Risk' ? t('risk_mid') : t('risk_low')}
                      </h4>
                      <p className="text-xs opacity-80 mt-1">
                        Confidence Score: <strong>{(prediction.confidence * 100).toFixed(1)}%</strong> via Ensemble ML
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      prediction.risk_level === 'High Risk'
                        ? 'bg-rose-600 text-white'
                        : prediction.risk_level === 'Mid Risk'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {prediction.risk_level}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-current/20 space-y-2 text-xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                      <span>{t('recommended_protocol')}</span>
                    </div>
                    <p className="opacity-90 leading-relaxed font-medium">
                      {prediction.recommended_facility_level || 'Immediate transport to Tertiary Obstetric Care Centre with Blood Bank & Neonatal ICU readiness.'}
                    </p>
                  </div>

                  {prediction.risk_level === 'High Risk' && (
                    <div className="p-3 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center justify-between shadow-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">ambulance</span>
                        <span>Auto-Priority: 108 Emergency Route Locked</span>
                      </span>
                      <Link to="/command-center" className="underline hover:opacity-80">
                        View Matrix ➔
                      </Link>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    Awaiting Clinical Input
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Fill the vitals form on the left or click "Load Sample Data" to run real-time inference.
                  </p>
                </div>
              )}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default MaternalPortal;
