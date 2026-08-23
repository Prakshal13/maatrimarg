import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UserProfileDropdown from '../components/UserProfileDropdown';
import AppSidebar from '../components/AppSidebar';
import LiveNetworkMap from '../components/LiveNetworkMap';
import RoutingDispatchPanel from '../components/RoutingDispatchPanel';
import EmergencyLocationModal from '../components/EmergencyLocationModal';
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
  MapPin,
  Moon,
  Sun,
  Lock,
  Compass
} from 'lucide-react';

const CommandCenter = () => {
  const { t, lang, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState({
    hospital_count: 260,
    districts_covered: 14,
    total_available_beds: 1840,
    total_nicu_beds: 420,
    active_dispatches: 12,
    network_efficiency: '89.4%',
    critical_diversion_rate: '1',
    avg_transit_time_mins: 24,
  });
  const [networkHospitals, setNetworkHospitals] = useState([]);
  const [activeReferrals, setActiveReferrals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('network'); // network | audit
  const [selectedHospitalForRoute, setSelectedHospitalForRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchdogRunning, setWatchdogRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
    { code: 'mr', label: 'मराठी (MR)', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ் (TA)', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी (HI)', flag: '🇮🇳' },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

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
    <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-[#070e1c] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <AppSidebar />

      {/* Main Command Center Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f7f9fb] dark:bg-[#070e1c] transition-colors duration-200">
        
        {/* Top Header Bar matching Screenshot */}
        <header className="h-16 bg-white/90 dark:bg-[#091426] backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
          
          {/* Global Search Bar */}
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facilities, routes, districts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-[#0b1528] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#006b5f] dark:focus:ring-[#2dd4bf] transition-all"
            />
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0b1528] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-teal-600 dark:text-[#2dd4bf]">language</span>
                <span>{currentLang.label}</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0b1528] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors ${
                        lang === l.code ? 'font-bold text-[#006b5f] dark:text-[#2dd4bf] bg-teal-50/50 dark:bg-teal-950/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-[#006b5f] dark:text-[#2dd4bf]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Theme Toggle Button */}
            <button
              className="p-2 rounded-lg bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={toggleTheme}
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notification Bell */}
            <button 
              onClick={() => alert("Real-time Triage Alerts: All 14 District Hubs operational without delay.")}
              className="p-2 rounded-lg bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
            </button>

            {/* Clinician Profile Badge Header */}
            <UserProfileDropdown />

          </div>

        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-7 flex-1 overflow-y-auto text-left">
          
          {/* Main Title & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                Real-time Maternal Logistics Command
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                MaatriMarg Active Routing Matrix • Maharashtra Regional Command Hub
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Red Coral Pill: My Location GPS Route */}
              <button
                onClick={() => setSosModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#cb4646] hover:bg-[#b91c1c] text-white text-xs font-black shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>My Location GPS Route</span>
              </button>

              {/* Pulsing Sync Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-[#091e28] border border-teal-200 dark:border-teal-500/40 text-[10px] font-black tracking-widest text-[#006b5f] dark:text-[#2dd4bf] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#006b5f] dark:bg-[#2dd4bf] pulse-node"></span>
                <span>TELEMETRY SYNCHRONIZED</span>
              </div>

            </div>
          </div>

          {/* 4 Summary Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: NETWORK EFFICIENCY */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  NETWORK EFFICIENCY
                </span>
                <span className="material-symbols-outlined text-[#006b5f] dark:text-[#2dd4bf] text-[18px]">
                  trending_up
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  {summary.network_efficiency || '89.4%'}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  +2.1%
                </span>
              </div>
            </div>

            {/* Card 2: ACTIVE DISPATCHES */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  ACTIVE DISPATCHES
                </span>
                <span className="material-symbols-outlined text-rose-500 dark:text-[#2dd4bf] text-[18px]">
                  ambulance
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  {summary.active_dispatches || 12}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  in transit
                </span>
              </div>
            </div>

            {/* Card 3: AVAILABLE ICU */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  AVAILABLE ICU
                </span>
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px]">
                  lock
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  32
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  beds reserved
                </span>
              </div>
            </div>

            {/* Card 4: EMERGENCY DIVERSIONS */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  EMERGENCY DIVERSIONS
                </span>
                <span className="material-symbols-outlined text-rose-500 text-[18px]">
                  error
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-500 font-['Plus_Jakarta_Sans']">
                  1
                </span>
                <span className="text-xs text-rose-600/90 dark:text-rose-400/90 font-medium">
                  divert active
                </span>
              </div>
            </div>

          </div>

          {/* Middle Section: Live Network Map & Complete Right Routing Dispatch Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Real-time Interactive Leaflet Map (Spans 7 columns on LG) */}
            <div className="lg:col-span-7 h-full">
              <LiveNetworkMap 
                hospitals={networkHospitals} 
                onSelectHospital={(h) => setSelectedHospitalForRoute(h)}
              />
            </div>

            {/* COMPLETE RIGHT ROUTING INTELLIGENCE & DISPATCH PANEL (Spans 5 columns on LG) */}
            <div className="lg:col-span-5">
              <RoutingDispatchPanel 
                hospitals={networkHospitals}
                onSelectDestination={(h) => setSelectedHospitalForRoute(h)}
              />
            </div>

          </div>

          {/* Bottom Hospital Facility Grid */}
          <div className="bg-white dark:bg-[#0b1528] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-['Plus_Jakarta_Sans']">
                  Hospital Facility Telemetry Grid ({filteredHospitals.length} Active Nodes)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live bed capacities, NICU units, and blood unit availability across Maharashtra & Tamil Nadu
                </p>
              </div>

              <button
                onClick={handleTriggerWatchdog}
                disabled={watchdogRunning}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer w-fit shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#006b5f] dark:text-[#2dd4bf] ${watchdogRunning ? 'animate-spin' : ''}`} />
                <span>{watchdogRunning ? 'Scanning Grid...' : 'Audit Grid Protocol'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {filteredHospitals.slice(0, 9).map((h) => (
                <div 
                  key={h.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#091426] border border-slate-200 dark:border-slate-800/80 hover:border-teal-500/50 transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#006b5f] dark:group-hover:text-[#2dd4bf] truncate transition-colors">
                        {h.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {h.district}, {h.state}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[9px] font-black uppercase tracking-wider shrink-0">
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center bg-white dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60 text-[10px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Total Beds</span>
                      <strong className="text-slate-800 dark:text-white font-mono">{h.beds_available ?? 24}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">ICU / NICU</span>
                      <strong className="text-[#006b5f] dark:text-[#2dd4bf] font-mono">{h.nicu_beds_available ?? 4}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Blood Units</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-mono">{h.blood_units_available ?? 12}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </main>

      </div>

      {/* Emergency GPS Modal */}
      <EmergencyLocationModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />

    </div>
  );
};

export default CommandCenter;
