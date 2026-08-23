import React, { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { 
  HeartPulse, 
  UserPlus, 
  Send, 
  Activity, 
  Hospital, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  Languages, 
  PhoneCall, 
  Clock, 
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';

const MaternalPortal = () => {
  const { lang, t } = useLanguage();

  // State: Patient Selection & Registration
  const [mothersList, setMothersList] = useState([]);
  const [selectedMotherId, setSelectedMotherId] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  
  // Registration Form State
  const [newMother, setNewMother] = useState({
    name: '',
    age: 26,
    phone: '9876543210',
    village: 'Bhamragad (Gadchiroli)',
    blood_type: 'O-',
    gestational_age_weeks: 36,
    lat: 19.04,
    lng: 80.18,
    consent_given: true,
  });

  // Vitals State
  const [vitals, setVitals] = useState({
    age: 26,
    systolic_bp: 145,
    diastolic_bp: 95,
    blood_sugar: '140 mg/dL',
    body_temp: 98.6,
    heart_rate: 88,
    labor_started: false,
  });

  // Results State
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [routingResult, setRoutingResult] = useState(null);
  const [activeReferral, setActiveReferral] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Load mothers list on mount
  const fetchMothers = async () => {
    try {
      const res = await api.getMothers(true);
      if (res.data && res.data.length > 0) {
        setMothersList(res.data);
        if (!selectedMotherId) {
          setSelectedMotherId(res.data[0].id.toString());
          setVitals(prev => ({ ...prev, age: res.data[0].age || 26 }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch mothers list:', e);
    }
  };

  useEffect(() => {
    fetchMothers();
  }, []);

  // When mother selection changes, update age & coordinates
  const handleSelectMother = (idStr) => {
    setSelectedMotherId(idStr);
    const m = mothersList.find(item => item.id.toString() === idStr);
    if (m) {
      setVitals(prev => ({ ...prev, age: m.age || 26 }));
    }
  };

  // Register a new mother
  const handleRegisterMother = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createMother(newMother);
      await fetchMothers();
      setSelectedMotherId(res.data.id.toString());
      setShowRegModal(false);
      alert('Mother registered successfully with DISHA consent.');
    } catch (err) {
      alert('Failed to register mother: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Evaluate Risk & Route
  const handleEvaluate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setPrediction(null);
    setRoutingResult(null);

    try {
      // 1. Run live ML prediction with language parameter
      const predRes = await api.predictRisk({
        age: Number(vitals.age),
        systolic_bp: Number(vitals.systolic_bp),
        diastolic_bp: Number(vitals.diastolic_bp),
        blood_sugar: vitals.blood_sugar,
        body_temp: Number(vitals.body_temp),
        heart_rate: Number(vitals.heart_rate),
        labor_started: Boolean(vitals.labor_started),
        lang: lang,
      });
      setPrediction(predRes.data);

      // 2. If a registered mother is selected, log vitals to DB and calculate Dijkstra route
      if (selectedMotherId) {
        const m = mothersList.find(item => item.id.toString() === selectedMotherId);
        const vitalsRes = await api.recordMotherVitals(selectedMotherId, {
          systolic_bp: Number(vitals.systolic_bp),
          diastolic_bp: Number(vitals.diastolic_bp),
          blood_sugar: vitals.blood_sugar,
          body_temp: Number(vitals.body_temp),
          heart_rate: Number(vitals.heart_rate),
          labor_started: Boolean(vitals.labor_started),
        });

        if (vitalsRes.data?.referral) {
          setActiveReferral(vitalsRes.data.referral);
        }

        // Calculate Dijkstra Route
        const routeRes = await api.calculateRoute({
          mother_lat: m?.lat || 19.04,
          mother_lng: m?.lng || 80.18,
          blood_type: m?.blood_type || 'O-',
          needs_nicu: Number(predRes.data.risk_score) >= 70,
          requires_surgeon: predRes.data.risk_tier === 'dispatch',
        });
        setRoutingResult(routeRes.data);
      }
    } catch (err) {
      alert('Evaluation error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Send Emergency SMS Alert Simulation
  const handleSendNotification = async (recipientRole = 'ambulance_driver') => {
    if (!activeReferral) {
      alert('Please evaluate a high-risk mother to generate an active referral first.');
      return;
    }
    try {
      const res = await api.sendDispatchAlert({
        referral_id: activeReferral.id,
        recipient_role: recipientRole,
        phone: '9876543210',
        language: lang,
      });
      setNotificationStatus(res.data);
      setShowDispatchModal(true);
    } catch (e) {
      alert('Notification failed: ' + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <HeartPulse className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>{t('maternal_portal')} • ASHA / ANM Frontline Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
            {t('vitals_entry')} & AI Risk Stratification
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Frontline decision support with Random Forest ML, blood sugar auto-normalization, multilingual explanations, and capacity-aware Dijkstra hospital dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold backdrop-blur-md transition-all"
          >
            <UserPlus className="w-4 h-4 text-teal-300" />
            <span>+ {t('register_patient')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form & Live Triage Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vitals Entry Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {t('vitals_entry')}
              </h2>
              <p className="text-xs text-slate-500">Enter maternal vitals collected during field visit</p>
            </div>

            {/* Mother Selector Dropdown */}
            {mothersList.length > 0 && (
              <select
                value={selectedMotherId}
                onChange={(e) => handleSelectMother(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mothersList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.village || 'Village'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('age')} (Years)
                </label>
                <input
                  type="number"
                  value={vitals.age}
                  onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                  required
                  min="14"
                  max="60"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('blood_sugar')} (mg/dL or mmol/L)
                </label>
                <input
                  type="text"
                  value={vitals.blood_sugar}
                  onChange={(e) => setVitals({ ...vitals, blood_sugar: e.target.value })}
                  required
                  placeholder="e.g. 140 mg/dL"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">Auto-detects mg/dL (Indian Standard)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={vitals.systolic_bp}
                  onChange={(e) => setVitals({ ...vitals, systolic_bp: e.target.value })}
                  required
                  min="60"
                  max="240"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={vitals.diastolic_bp}
                  onChange={(e) => setVitals({ ...vitals, diastolic_bp: e.target.value })}
                  required
                  min="40"
                  max="160"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('heart_rate')} (BPM)
                </label>
                <input
                  type="number"
                  value={vitals.heart_rate}
                  onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                  required
                  min="40"
                  max="200"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('body_temp')} (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.body_temp}
                  onChange={(e) => setVitals({ ...vitals, body_temp: e.target.value })}
                  required
                  min="94"
                  max="108"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Active Labor Switch */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">{t('labor_started')}</div>
                <div className="text-[11px] text-slate-500">Overrides score to automatic emergency dispatch</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={vitals.labor_started}
                  onChange={(e) => setVitals({ ...vitals, labor_started: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Running ML Inferences & Dijkstra Graph...</span>
              ) : (
                <>
                  <HeartPulse className="w-4 h-4 text-rose-300" />
                  <span>{t('evaluate_risk')}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right Column: AI Triage & Optimal Hospital Destination */}
        <div className="lg:col-span-6 space-y-6">
          
          {prediction ? (
            <div className="space-y-6">
              
              {/* Triage Tier & Score Banner */}
              <div className={`p-6 rounded-3xl border shadow-sm text-left ${
                prediction.risk_tier === 'dispatch' 
                  ? 'bg-rose-50 border-rose-200 text-rose-950' 
                  : prediction.risk_tier === 'prep' 
                  ? 'bg-amber-50 border-amber-200 text-amber-950' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{t('triage_tier')}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    prediction.risk_tier === 'dispatch' 
                      ? 'bg-rose-600 text-white' 
                      : prediction.risk_tier === 'prep' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {prediction.risk_tier_display || prediction.risk_tier}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 my-2">
                  <span className="text-4xl sm:text-5xl font-black font-['Plus_Jakarta_Sans']">
                    {prediction.risk_score}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ 100 Risk Score</span>
                </div>

                {/* Multilingual Diagnostic Contributing Factors */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t('contributing_factors')} ({lang.toUpperCase()}):</span>
                  </div>
                  {prediction.explanation && prediction.explanation.length > 0 ? (
                    <ul className="space-y-1 text-xs font-medium pl-4 list-disc">
                      {prediction.explanation.map((factor, idx) => (
                        <li key={idx} className="leading-snug">{factor}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">All recorded vitals within normal physiologic parameters.</p>
                  )}
                </div>

                {/* Action Trigger */}
                {prediction.risk_tier === 'dispatch' && (
                  <div className="mt-5 pt-3">
                    <button
                      onClick={() => handleSendNotification('ambulance_driver')}
                      className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                      <span>{t('send_dispatch_alert')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dijkstra Routing Recommendation Card */}
              {routingResult?.best_hospital && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-teal-600" />
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {t('nearest_hospital')}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                      ETA: ~{routingResult.eta_minutes} min (Dijkstra)
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {routingResult.best_hospital.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {routingResult.best_hospital.district}, {routingResult.best_hospital.state} • {routingResult.distance_km} km away
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Available Beds</div>
                      <div className="text-base font-black text-slate-800">
                        {routingResult.best_hospital.beds_available}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">NICU Beds</div>
                      <div className="text-base font-black text-blue-600">
                        {routingResult.best_hospital.nicu_beds_available}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Surgeon on Duty</div>
                      <div className="text-base font-black text-teal-600">
                        {routingResult.best_hospital.surgeon_on_duty ? 'YES' : 'NO'}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[350px] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
              <HeartPulse className="w-12 h-12 text-slate-300" />
              <div className="text-sm font-bold text-slate-600">No Assessment Run Yet</div>
              <p className="text-xs max-w-xs text-slate-400">
                Enter maternal vitals on the left and click "Evaluate AI Risk" to see Random Forest ML triage, multilingual factors, and capacity-aware Dijkstra hospital routing.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Register Patient Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {t('register_patient')} (DISHA Protocol)
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <form onSubmit={handleRegisterMother} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('patient_name')}</label>
                <input
                  type="text"
                  value={newMother.name}
                  onChange={(e) => setNewMother({ ...newMother, name: e.target.value })}
                  required
                  placeholder="e.g. Kavita Raut"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('age')}</label>
                  <input
                    type="number"
                    value={newMother.age}
                    onChange={(e) => setNewMother({ ...newMother, age: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('blood_group')}</label>
                  <select
                    value={newMother.blood_type}
                    onChange={(e) => setNewMother({ ...newMother, blood_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('village')}</label>
                <input
                  type="text"
                  value={newMother.village}
                  onChange={(e) => setNewMother({ ...newMother, village: e.target.value })}
                  placeholder="e.g. Melghat Sub-Centre"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <label className="flex items-center gap-2 text-[11px] text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMother.consent_given}
                    onChange={(e) => setNewMother({ ...newMother, consent_given: e.target.checked })}
                    required
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Patient verbal consent recorded for DISHA / ABDM clinical routing.</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Confirm Patient Registration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Dispatch SMS Simulation Modal */}
      {showDispatchModal && notificationStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <Send className="w-5 h-5" />
                <span>108 Emergency Dispatch Alert Sent</span>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed">
              {notificationStatus.message_body}
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div><strong>Gateway:</strong> {notificationStatus.channel}</div>
              <div><strong>Recipient:</strong> {notificationStatus.recipient_role} ({notificationStatus.phone})</div>
              <div><strong>Language:</strong> {notificationStatus.language.toUpperCase()}</div>
            </div>

            <button
              onClick={() => setShowDispatchModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Close Simulator
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaternalPortal;
