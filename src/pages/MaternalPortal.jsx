import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppSidebar from '../components/AppSidebar';
import UserProfileDropdown from '../components/UserProfileDropdown';
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
  const { logout } = useAuth();

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

  const fetchMothers = async () => {
    try {
      const res = await api.getMothers(true);
      if (res.data && res.data.length > 0) {
        setMothersList(res.data);
        if (!selectedMotherId) {
          setSelectedMotherId(res.data[0].id.toString());
        }
      }
    } catch (e) {
      console.warn('Could not fetch mothers:', e);
    }
  };

  useEffect(() => {
    fetchMothers();
  }, []);

  const handleLoadSample = () => {
    setVitals({
      age: 28,
      heart_rate: 95,
      systolic_bp: 145,
      diastolic_bp: 95,
      blood_sugar: 6.2,
      body_temp: 99.1,
    });
  };

  const handleReset = () => {
    setVitals({
      age: 24,
      heart_rate: 78,
      systolic_bp: 118,
      diastolic_bp: 76,
      blood_sugar: 5.2,
      body_temp: 98.4,
    });
    setPrediction(null);
    setRoutingResult(null);
    setErrorMsg('');
  };

  const handlePredictRisk = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.predictRisk({
        age: Number(vitals.age),
        systolic_bp: Number(vitals.systolic_bp),
        diastolic_bp: Number(vitals.diastolic_bp),
        blood_sugar: vitals.blood_sugar,
        body_temp: Number(vitals.body_temp),
        heart_rate: Number(vitals.heart_rate),
        lang: lang,
      });
      setPrediction(res.data);

      // Also compute Dijkstra route if mother coordinates available
      const routeRes = await api.calculateRoute({
        mother_lat: 19.04,
        mother_lng: 80.18,
        blood_type: 'O-',
        needs_nicu: Number(res.data.risk_score) >= 70,
        requires_surgeon: res.data.risk_tier === 'dispatch',
      });
      setRoutingResult(routeRes.data);

    } catch (err) {
      setErrorMsg('Unable to calculate risk: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate108 = async () => {
    try {
      const res = await api.sendDispatchAlert({
        referral_id: 1,
        recipient_role: 'ambulance_driver',
        phone: '9876543210',
        language: lang,
      });
      setNotificationStatus(res.data);
      setShowDispatchModal(true);
    } catch (e) {
      alert('Simulation error: ' + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-[#171c1f] font-sans antialiased">
      
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
              Maternal Risk Assessment
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
              ML Inference Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <UserProfileDropdown />
          </div>
        </header>

        {/* Content Body (Grid from Stitch Screen 7) */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto text-left">
          
          {/* ASHA Live Duty & Safety SOS Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleDuty}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  isOnDuty 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs' 
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                <span>{isOnDuty ? '🟢 On Field Duty' : '⚪ Standby Mode'}</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Navigation className="w-3.5 h-3.5 text-teal-600" />
                <span>GPS Geotag:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {ashaGps.lat.toFixed(4)}, {ashaGps.lng.toFixed(4)}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Auto-Geotag Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerSos}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm ${
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

          {sosAlertMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center justify-between">
              <span>{sosAlertMessage}</span>
              <span className="text-[10px] uppercase font-extrabold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                DHO Alerted
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column: Clinical Data Entry Form (Exact Stitch Screen 7) */}
            <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Clinical Data Entry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter current maternal measurements collected by ASHA / PHC.
                  </p>
                </div>

                <button
                  onClick={handleLoadSample}
                  type="button"
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#006b5f]" />
                  <span>Load Sample Data</span>
                </button>
              </div>

              <form onSubmit={handlePredictRisk} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.age}
                        onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        Years
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Heart Rate <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.heart_rate}
                        onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        bpm
                      </span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Systolic BP <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.systolic_bp}
                        onChange={(e) => setVitals({ ...vitals, systolic_bp: e.target.value })}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        mmHg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Diastolic BP <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vitals.diastolic_bp}
                        onChange={(e) => setVitals({ ...vitals, diastolic_bp: e.target.value })}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        mmHg
                      </span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Blood Sugar (BS) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={vitals.blood_sugar}
                        onChange={(e) => setVitals({ ...vitals, blood_sugar: e.target.value })}
                        required
                        placeholder="e.g. 6.2 or 140 mg/dL"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        mmol/L or mg/dL
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Body Temp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={vitals.body_temp}
                        onChange={(e) => setVitals({ ...vitals, body_temp: e.target.value })}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#006b5f]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        °F
                      </span>
                    </div>
                  </div>

                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors w-full sm:w-auto"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#006b5f] hover:bg-[#005047] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <span className="material-symbols-outlined text-[18px]">query_stats</span>
                    <span>{loading ? 'Calculating Risk...' : 'Predict Risk'}</span>
                  </button>
                </div>

              </form>

            </div>

            {/* Right Column: Assessment Result (Exact Stitch Screen 7) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 h-full flex flex-col justify-between text-left relative overflow-hidden">
                
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <span className="material-symbols-outlined text-[#006b5f]">psychiatry</span>
                  <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Assessment Result
                  </h3>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
                  {prediction ? (
                    <div className="space-y-4 w-full">
                      <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xs ${
                        prediction.risk_tier === 'dispatch' ? 'bg-rose-100 text-rose-700' : prediction.risk_tier === 'prep' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <span className="material-symbols-outlined text-[32px]">
                          {prediction.risk_tier === 'dispatch' ? 'emergency' : 'vital_signs'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans'] uppercase tracking-tight">
                          {prediction.risk_tier_display || prediction.risk_tier}
                        </h4>
                        <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mt-1">
                          Risk Score: <strong className="text-slate-900">{prediction.risk_score}</strong> / 100
                        </div>
                      </div>

                      {/* Contributing factors */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-1.5">
                        <div className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Languages className="w-3.5 h-3.5 text-[#006b5f]" />
                          <span>Diagnosis Factors ({lang.toUpperCase()}):</span>
                        </div>
                        {prediction.explanation?.map((f, idx) => (
                          <div key={idx} className="text-slate-600 leading-snug">• {f}</div>
                        ))}
                      </div>

                      {/* Dijkstra Nearest Facility Card */}
                      {routingResult?.best_hospital && (
                        <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-left text-xs space-y-1.5">
                          <div className="font-extrabold text-[#006b5f] flex items-center justify-between">
                            <span>Dijkstra Best Facility</span>
                            <span>ETA ~{routingResult.eta_minutes} min</span>
                          </div>
                          <div className="font-bold text-slate-800">{routingResult.best_hospital.name}</div>
                          <div className="text-slate-500 text-[11px]">
                            {routingResult.best_hospital.district} • {routingResult.distance_km} km away
                          </div>
                        </div>
                      )}

                      {prediction.risk_tier === 'dispatch' && (
                        <button
                          onClick={handleSimulate108}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                          <span>Trigger 108 Emergency Dispatch</span>
                        </button>
                      )}

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-4 space-y-3 text-slate-400">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-slate-400">analytics</span>
                      </div>
                      <p className="text-xs text-slate-500 max-w-xs">
                        No assessment yet. Enter the maternal measurements on the left and select Predict Risk to calculate the current clinical risk.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 leading-tight">
                    This assessment is generated by the MaatriMarg ML engine based on current measurements and is for decision support only.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Emergency Alert Modal */}
      {showDispatchModal && notificationStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-rose-600 font-bold text-sm flex items-center gap-2">
                <Send className="w-4 h-4" />
                108 Emergency SMS Dispatched
              </span>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl">
              {notificationStatus.message_body}
            </div>
            <button
              onClick={() => setShowDispatchModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaternalPortal;
