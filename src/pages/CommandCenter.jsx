import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { 
  Activity, 
  Hospital, 
  Search, 
  Bell, 
  Settings, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  FileText,
  UserCheck,
  Navigation,
  Layers,
  PhoneCall,
  MapPin
} from 'lucide-react';

const CommandCenter = () => {
  const { t, lang, changeLanguage } = useLanguage();
  const [summary, setSummary] = useState({
    hospital_count: 260,
    districts_covered: 14,
    total_available_beds: 1840,
    total_nicu_beds: 420,
    active_dispatches: 2,
    critical_diversion_rate: '0.0%',
    avg_transit_time_mins: 24,
  });
  const [networkHospitals, setNetworkHospitals] = useState([]);
  const [activeReferrals, setActiveReferrals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('network'); // network | dispatches | audit
  const [mapMode, setMapMode] = useState('topography'); // topography | satellite
  const [selectedHospitalForRoute, setSelectedHospitalForRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchdogRunning, setWatchdogRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, netRes, refRes, auditRes] = await Promise.all([
        api.getCommandCenterSummary(),
        api.getNetworkHospitals(),
        api.getActiveReferrals(),
        api.getAuditLogs(),
      ]);
      if (sumRes.data) setSummary(prev => ({ ...prev, ...sumRes.data }));
      setNetworkHospitals(netRes.data || []);
      setActiveReferrals(refRes.data || []);
      setAuditLogs(auditRes.data || []);
    } catch (e) {
      console.warn('Error fetching command center telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerWatchdog = async () => {
    setWatchdogRunning(true);
    try {
      const res = await api.autoEscalateOverdue();
      await fetchData();
      alert(`Watchdog scanned ${res.data.overdue_checked} active referrals. Auto-escalated: ${res.data.auto_escalated_count}`);
    } catch (err) {
      alert('Watchdog error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setWatchdogRunning(false);
    }
  };

  const filteredHospitals = networkHospitals.filter(h => 
    !searchQuery.trim() ||
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.district && h.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-[#f6fafe] text-[#171c1f] font-sans antialiased">
      
      {/* Sidebar Navigation matching Stitch Screen 5 */}
      <aside className="w-[260px] bg-white border-r border-slate-200 shadow-xs hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#006b5f] flex items-center justify-center text-white font-black text-base shadow-sm">
              M
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
          <button
            onClick={() => setActiveTab('network')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'network' ? 'bg-[#006b5f]/10 text-[#006b5f] font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">hub</span>
            <span>Network Hospitals</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatches')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'dispatches' ? 'bg-[#006b5f]/10 text-[#006b5f] font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">ambulance</span>
            <span>Live 108 Dispatches</span>
            {activeReferrals.length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                {activeReferrals.length}
              </span>
            )}
          </button>

          <Link
            to="/hospital"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">domain</span>
            <span>Hospital Directory</span>
          </Link>

          <Link
            to="/asha/maternal"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
            <span>Maternal Risk Triage</span>
          </Link>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeTab === 'audit' ? 'bg-[#006b5f]/10 text-[#006b5f] font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">policy</span>
            <span>ABDM / DISHA Audit</span>
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
          <Link
            to="/login"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Command Center Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals, districts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#006b5f]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerWatchdog}
              disabled={watchdogRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${watchdogRunning ? 'animate-spin' : ''}`} />
              <span>{watchdogRunning ? 'Scanning...' : 'Auto-Escalate Watchdog'}</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              HQ
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto text-left">
          
          {/* Headline */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Real-time Maternal Logistics Command
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              MaatriMarg System Overview • Active Routing Matrix across Maharashtra & Tamil Nadu
            </p>
          </div>

          {/* 4 Summary Cards (Exact Stitch Screen 5 Tokens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Active Dispatches
                </span>
                <span className="material-symbols-outlined text-rose-600 text-[20px]">
                  ambulance
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                {activeReferrals.length || summary.active_dispatches}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Zero-delay auto-dispatch active</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Total Available Beds
                </span>
                <span className="material-symbols-outlined text-teal-600 text-[20px]">
                  bed
                </span>
              </div>
              <div className="text-3xl font-black text-teal-700 font-['Plus_Jakarta_Sans']">
                {summary.total_available_beds}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Live across {summary.hospital_count}+ facilities
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Critical Diversion Rate
                </span>
                <span className="material-symbols-outlined text-[#006b5f] text-[20px]">
                  alt_route
                </span>
              </div>
              <div className="text-3xl font-black text-[#006b5f] font-['Plus_Jakarta_Sans']">
                0.0%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Zero patient rejected at gate
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Avg Transit Time
                </span>
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  timer
                </span>
              </div>
              <div className="text-3xl font-black text-blue-700 font-['Plus_Jakarta_Sans']">
                24 min
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                1.25x tortuosity adjusted
              </div>
            </div>

          </div>

          {/* Middle Section from Stitch Screen 5: Live Network Map & Active Missions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Network Map (Spans 2 columns) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col relative min-h-[380px]">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/90 backdrop-blur-xs z-10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006b5f]">map</span>
                  <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    Live Regional Network Routing Map
                  </h3>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setMapMode('topography')}
                    className={`px-3 py-1 rounded-md transition-colors ${mapMode === 'topography' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Topography
                  </button>
                  <button
                    onClick={() => setMapMode('satellite')}
                    className={`px-3 py-1 rounded-md transition-colors ${mapMode === 'satellite' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              {/* Map Canvas with Interactive Nodes & Glowing Network Pathways */}
              <div className="flex-1 bg-gradient-to-tr from-slate-900 via-[#131b2e] to-slate-950 relative p-6 flex items-center justify-center overflow-hidden min-h-[300px]">
                
                {/* Visual Grid Background */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* SVG Connecting Pathways */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" opacity="0.6" />
                  <line x1="80%" y1="25%" x2="50%" y2="50%" stroke="#2dd4bf" strokeWidth="2" opacity="0.5" />
                  <line x1="30%" y1="75%" x2="50%" y2="50%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" opacity="0.7" />
                  <line x1="75%" y1="70%" x2="50%" y2="50%" stroke="#f43f5e" strokeWidth="2.5" className="animate-pulse" />
                </svg>

                {/* Central District Tertiary Facility */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#006b5f] border-2 border-teal-300 shadow-lg shadow-teal-500/50 flex items-center justify-center text-white animate-pulse">
                    <Hospital className="w-6 h-6" />
                  </div>
                  <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-teal-500/40 text-[10px] font-bold text-teal-300 backdrop-blur-sm">
                    Tertiary Referral Center (Gadchiroli / Chennai)
                  </span>
                </div>

                {/* Surrounding Rural PHC Sub-Centre Nodes */}
                <div className="absolute top-[28%] left-[20%] z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-teal-500 border border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white">
                    P1
                  </div>
                  <span className="text-[9px] text-slate-300 mt-1 font-mono">PHC Bhamragad</span>
                </div>

                <div className="absolute top-[22%] right-[20%] z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-teal-500 border border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white">
                    P2
                  </div>
                  <span className="text-[9px] text-slate-300 mt-1 font-mono">PHC Aheri</span>
                </div>

                <div className="absolute bottom-[22%] left-[28%] z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white">
                    P3
                  </div>
                  <span className="text-[9px] text-slate-300 mt-1 font-mono">PHC Melghat</span>
                </div>

                {/* Critical Emergency 108 Ambulance Unit */}
                <div className="absolute bottom-[26%] right-[24%] z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg shadow-rose-600/60 flex items-center justify-center text-white animate-bounce">
                    <span className="material-symbols-outlined text-[16px]">ambulance</span>
                  </div>
                  <span className="text-[9px] text-rose-300 font-bold mt-1 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-600/40">
                    108 Unit MH-34 (ETA 4m)
                  </span>
                </div>

              </div>
            </div>

            {/* Active Missions Sidebar (Stitch Screen 5) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Active 108 Missions</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  LIVE
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px]">
                
                {/* Mission 1 */}
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1.5 relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-rose-700 uppercase tracking-wider text-[10px]">
                      CRITICAL DISPATCH
                    </span>
                    <span className="font-mono font-bold text-slate-700 text-xs">ETA: 4 min</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">To: District Civil Hospital</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-rose-600">ambulance</span>
                    <span>Unit MH-34-108 • En Route (Severe Pre-Eclampsia)</span>
                  </div>
                </div>

                {/* Mission 2 */}
                <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 space-y-1.5 relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-teal-700 uppercase tracking-wider text-[10px]">
                      ROUTINE PREP
                    </span>
                    <span className="font-mono font-bold text-slate-700 text-xs">ETA: 18 min</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">To: Melghat Sub-District Hospital</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-teal-600">ambulance</span>
                    <span>Unit MH-27-108 • Facility Alert Sent</span>
                  </div>
                </div>

              </div>

              <button
                onClick={handleTriggerWatchdog}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>Verify All Referral Timelines</span>
              </button>
            </div>

          </div>

          {/* Tab Content: Network Hospitals */}
          {activeTab === 'network' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Hospital Facility Telemetry Grid ({filteredHospitals.length} Active Nodes)
                </h3>
                <span className="text-xs text-slate-400 font-medium">Auto-Refreshed via Dijkstra Core</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Hospital Name</th>
                      <th className="py-3 px-4">State & District</th>
                      <th className="py-3 px-4 text-center">Available Beds</th>
                      <th className="py-3 px-4 text-center">NICU Beds</th>
                      <th className="py-3 px-4 text-center">Surgeon</th>
                      <th className="py-3 px-4 text-center">Active Dispatches</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredHospitals.slice(0, 25).map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{h.name}</td>
                        <td className="py-3 px-4 text-slate-500">{h.state} • {h.district}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">{h.beds_available}</td>
                        <td className="py-3 px-4 text-center font-bold text-teal-700">{h.nicu_beds_available}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.surgeon_on_duty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {h.surgeon_on_duty ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            (h.active_dispatches_count || 0) > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {h.active_dispatches_count || 0} cases
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content: Live 108 Dispatches */}
          {activeTab === 'dispatches' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">
                Active 108 Ambulance Referrals ({activeReferrals.length})
              </h3>
              {activeReferrals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeReferrals.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{r.mother?.name || 'Mother'}</div>
                          <div className="text-xs text-slate-500">Village: {r.mother?.village} • Blood: {r.mother?.blood_type}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase">
                          {r.tier} • {r.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 flex justify-between">
                        <span>Assigned: <strong>{r.hospital?.name}</strong></span>
                        <span>ETA: ~<strong>{r.eta_minutes || 18}m</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No active emergency dispatches currently en-route.</p>
              )}
            </div>
          )}

          {/* Tab Content: ABDM Audit Trail */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">
                ABDM / DISHA Clinical Audit Log Stream
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {auditLogs.slice(0, 30).map((l) => (
                  <div key={l.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                        {l.action}
                      </span>
                      <span className="font-bold text-slate-900">{l.target_type} #{l.target_id || ''}</span>
                      <span className="text-slate-500 font-sans text-xs truncate max-w-sm">{l.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">{new Date(l.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

export default CommandCenter;
