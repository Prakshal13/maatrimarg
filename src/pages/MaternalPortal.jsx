import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
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
  const [mothersList, setMothersList] = useState([]);
  const [selectedMotherId, setSelectedMotherId] = useState('');
  const [routingResult, setRoutingResult] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

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
      
      {/* Sidebar matching Stitch Screen 7 */}
      <aside className="w-[260px] bg-white border-r border-slate-200 shadow-xs hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#006b5f] flex items-center justify-center text-white font-black text-base shadow-sm">
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight font-['Plus_Jakarta_Sans']">
                MaatriMarg
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Command Center
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-xs font-bold text-left">
          <Link
            to="/command-center"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">hub</span>
            <span>Network</span>
          </Link>

          <Link
            to="/hospital"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">domain</span>
            <span>Hospitals</span>
          </Link>

          <button
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#006b5f]/10 text-[#006b5f] font-extrabold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
            <span>Risk Assessment</span>
          </button>

          <div className="pt-6 pb-2 px-3">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">
              System Modules
            </span>
          </div>

          <Link
            to="/asha/child"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">child_care</span>
            <span>Pediatric VIPER</span>
          </Link>

          <Link
            to="/asha/chronic"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
            <span>Cardiovascular Risk</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all mb-1"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Back to Home</span>
          </Link>
          <button
            onClick={() => { logout(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

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
