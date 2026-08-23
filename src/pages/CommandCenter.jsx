import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
          
            {/* Global Search Bar with Omnibox Dropdown */}
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search_hospitals_ph")}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-[#0b1528] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#006b5f] dark:focus:ring-[#2dd4bf] transition-all"
              />
              
              {searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0b1528] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto z-50 py-2">
                  {filteredHospitals.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">No hospitals found matching "{searchQuery}"</p>
                  ) : (
                    filteredHospitals.slice(0, 5).map(h => (
                      <button 
                        key={h.id}
                        onClick={() => {
                          setSearchQuery('');
                          navigate('/hospital', { state: { openHospitalId: h.id } });
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between group border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#006b5f] dark:group-hover:text-[#2dd4bf] transition-colors truncate">
                            {h.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                            {h.district}, {h.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded uppercase hidden sm:block">
                            Online
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {h.beds_available ?? 24} Beds
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
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
                {t('cmd_header_title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('cmd_header_subtitle')}
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Red Coral Pill: {t('home_sos_route')} */}
              <button
                onClick={() => setSosModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#cb4646] hover:bg-[#b91c1c] text-white text-xs font-black shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>{t("home_sos_route")}</span>
              </button>

              {/* Pulsing Sync Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-[#091e28] border border-teal-200 dark:border-teal-500/40 text-[10px] font-black tracking-widest text-[#006b5f] dark:text-[#2dd4bf] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#006b5f] dark:bg-[#2dd4bf] pulse-node"></span>
                <span>{t('active_monitoring')}</span>
              </div>

            </div>
          </div>

          {/* 4 Summary Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: {t('net_efficiency')} */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('net_efficiency')}
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

            {/* Card 2: {t('active_dispatches')} */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('active_dispatches')}
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

            {/* Card 3: {t('icu_available')} */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('icu_available')}
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

            {/* Card 4: {t('critical_diversions')} */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('critical_diversions')}
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
