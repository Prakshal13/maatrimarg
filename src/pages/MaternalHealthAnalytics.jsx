import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from '../components/AppSidebar';
import PortalHeader from '../components/PortalHeader';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Activity, 
  HeartPulse, 
  Baby, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Filter,
  ArrowRight,
  ActivitySquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const MATERNAL_DIVISIONS = [
  { name: 'Mumbai Apex', tests: 4120, transit: '14m', icu: '85%', normal: 72, prep: 20, emergency: 8 },
  { name: 'Pune Division', tests: 3840, transit: '18m', icu: '78%', normal: 75, prep: 18, emergency: 7 },
  { name: 'Nagpur Division', tests: 2650, transit: '26m', icu: '92%', normal: 68, prep: 22, emergency: 10 },
  { name: 'Nashik Division', tests: 2190, transit: '22m', icu: '68%', normal: 74, prep: 19, emergency: 7 },
  { name: 'Chhatrapati Sambhajinagar', tests: 1980, transit: '28m', icu: '96%', normal: 65, prep: 24, emergency: 11 },
];

const PEDIATRIC_DIVISIONS = [
  { name: 'Mumbai Apex', tests: 3210, transit: '12m', icu: '88%', normal: 78, prep: 16, emergency: 6 },
  { name: 'Pune Division', tests: 2940, transit: '15m', icu: '82%', normal: 80, prep: 14, emergency: 6 },
  { name: 'Nagpur Division', tests: 2150, transit: '22m', icu: '94%', normal: 70, prep: 20, emergency: 10 },
  { name: 'Nashik Division', tests: 1840, transit: '19m', icu: '71%', normal: 76, prep: 17, emergency: 7 },
  { name: 'Chhatrapati Sambhajinagar', tests: 1620, transit: '24m', icu: '98%', normal: 67, prep: 23, emergency: 10 },
];

const MATERNAL_RISK_DRIVERS = [
  { name: 'Gestational Hypertension', pct: 42, color: '#f43f5e' },
  { name: 'Gestational Diabetes', pct: 28, color: '#f59e0b' },
  { name: 'Advanced Age', pct: 18, color: '#0ea5e9' },
  { name: 'Adolescent Pregnancy', pct: 7, color: '#a855f7' },
  { name: 'Maternal Pyrexia', pct: 5, color: '#fb7185' },
];

const PEDIATRIC_RISK_DRIVERS = [
  { name: 'Acute Respiratory Distress', pct: 38, color: '#f43f5e' },
  { name: 'Neonatal Sepsis', pct: 26, color: '#f59e0b' },
  { name: 'Severe Acute Malnutrition', pct: 16, color: '#0ea5e9' },
  { name: 'Severe Dehydration', pct: 12, color: '#a855f7' },
  { name: 'Congenital Anomalies', pct: 8, color: '#14b8a6' },
];

const MATERNAL_RECENT_CASES = [
  { id: 'MH-MAT-8921', district: 'Gadchiroli', score: 88, tier: 'CODE RED', facility: 'District Civil Hospital, Gadchiroli', time: '14.2m', outcomeKey: 'outcome_stable_delivery' },
  { id: 'MH-MAT-8920', district: 'Pune Rural', score: 74, tier: 'CODE RED', facility: 'Sassoon General Hospital, Pune', time: '18.6m', outcomeKey: 'outcome_emergency_csection' },
  { id: 'MH-MAT-8919', district: 'Amravati', score: 58, tier: 'PREP STAGE', facility: 'Amravati District Hospital', time: '22.1m', outcomeKey: 'outcome_high_risk_obs' },
  { id: 'TN-MAT-4412', district: 'Chennai', score: 82, tier: 'CODE RED', facility: 'Govt Maternity Hospital, Chennai', time: '11.4m', outcomeKey: 'outcome_nicu_safe_delivery' },
  { id: 'MH-MAT-8918', district: 'Solapur', score: 42, tier: 'NORMAL CARE', facility: 'Solapur Civil Hospital', time: '16.8m', outcomeKey: 'outcome_routine_phc' },
];

const PEDIATRIC_RECENT_CASES = [
  { id: 'MH-PED-3104', district: 'Gadchiroli Tribal', score: 92, tier: 'VIPER SEVERE', facility: 'SNCU Gadchiroli Civil Hospital', time: '12.4m', outcomeKey: 'outcome_sepsis_stable' },
  { id: 'MH-PED-3103', district: 'Melghat Amravati', score: 78, tier: 'VIPER SEVERE', facility: 'Pediatric ICU Amravati GMC', time: '16.2m', outcomeKey: 'outcome_oxygen_therapy' },
  { id: 'MH-PED-3102', district: 'Pune Cantonment', score: 62, tier: 'MODERATE WATCH', facility: 'Sassoon Pediatric Ward', time: '14.0m', outcomeKey: 'outcome_oral_rehydration' },
  { id: 'TN-PED-1822', district: 'Coimbatore', score: 86, tier: 'VIPER SEVERE', facility: 'Coimbatore Medical College NICU', time: '13.5m', outcomeKey: 'outcome_phototherapy' },
  { id: 'MH-PED-3101', district: 'Nashik Tribal', score: 35, tier: 'ROUTINE CARE', facility: 'Igatpuri Rural PHC', time: '18.1m', outcomeKey: 'outcome_sam_kit' },
];

const PREDICTIVE_DEMAND_MATERNAL = [
  { time: '00:00', expected: 32, actual: 30 },
  { time: '04:00', expected: 45, actual: 45 },
  { time: '08:00', expected: 135, actual: 120 },
  { time: '12:00', expected: 90, actual: 85 },
  { time: '16:00', expected: 140, actual: 140 },
  { time: '20:00', expected: 90, actual: 90 },
  { time: '24:00', expected: 40, actual: 40 },
];

const PREDICTIVE_DEMAND_PEDIATRIC = [
  { time: '00:00', expected: 20, actual: 18 },
  { time: '04:00', expected: 25, actual: 26 },
  { time: '08:00', expected: 90, actual: 80 },
  { time: '12:00', expected: 60, actual: 55 },
  { time: '16:00', expected: 95, actual: 100 },
  { time: '20:00', expected: 65, actual: 60 },
  { time: '24:00', expected: 25, actual: 22 },
];

const MaternalHealthAnalytics = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState('maternal'); // 'maternal' | 'pediatric'
  const [timeHorizon, setTimeHorizon] = useState('30d'); // '24h' | '7d' | '30d' | 'ytd'
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [timeframe, setTimeframe] = useState('24H');

  const divisions = activeTab === 'maternal' ? MATERNAL_DIVISIONS : PEDIATRIC_DIVISIONS;
  const riskDrivers = activeTab === 'maternal' ? MATERNAL_RISK_DRIVERS : PEDIATRIC_RISK_DRIVERS;
  const recentCases = activeTab === 'maternal' ? MATERNAL_RECENT_CASES : PEDIATRIC_RECENT_CASES;
  
  const getPredictiveData = () => {
    let base = activeTab === 'maternal' ? PREDICTIVE_DEMAND_MATERNAL : PREDICTIVE_DEMAND_PEDIATRIC;
    if (timeframe === '7D') return base.map((d, i) => ({ ...d, time: `Day ${i+1}`, actual: d.actual ? d.actual * 4 : null, expected: d.expected * 4 }));
    if (timeframe === '1M') return base.map((d, i) => ({ ...d, time: `Wk ${i+1}`, actual: d.actual ? d.actual * 12 : null, expected: d.expected * 12 }));
    return base;
  };
  const predictiveData = getPredictiveData();

  const tooltipStyle = {
    backgroundColor: '#0b1528',
    borderColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="flex min-h-screen bg-[#f6fafe] dark:bg-slate-950 text-[#191c1e] dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      
      {/* Dynamic Role-Based Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f6fafe] dark:bg-slate-950 overflow-y-auto">
        
        {/* Top Header */}
        <PortalHeader 
          title={t('analytics')} 
          subtitle={t('maternal_analytics_subtitle')} 
          badgeText={t('live_epidemiology')}
        />

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 text-left">
          
          {/* Dual Tab Switcher & Time Horizon Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0b1528] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
            
            {/* Maternal vs Pediatric Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('maternal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'maternal'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>{t('maternal_analytics_tab') || 'Maternal Triage'}</span>
              </button>

              <button
                onClick={() => setActiveTab('pediatric')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pediatric'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>{t('pediatric_analytics_tab') || 'Pediatric VIPER'}</span>
              </button>
            </div>

            {/* Multi-Horizon Time Filters */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto transition-colors">
              {[
                { id: '24h', label: t('time_24h') || '24H' },
                { id: '7d', label: t('time_7d') || '7D' },
                { id: '30d', label: t('time_30d') || '30D' },
                { id: 'ytd', label: t('time_ytd') || 'YTD' },
              ].map((time) => (
                <button
                  key={time.id}
                  onClick={() => setTimeHorizon(time.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    timeHorizon === time.id
                      ? 'bg-teal-500 text-slate-950 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>

          </div>

          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Screenings */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {activeTab === 'maternal' ? (t('maternal_screenings') || 'MATERNAL SCREENINGS') : (t('pediatric_screenings') || 'PEDIATRIC SCREENINGS')}
                </span>
                <span className="material-symbols-outlined text-teal-500 text-[18px]">
                  {activeTab === 'maternal' ? 'clinical_notes' : 'child_care'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? (timeHorizon === '24h' ? '612' : timeHorizon === '7d' ? '4,280' : '18,420') : (timeHorizon === '24h' ? '480' : timeHorizon === '7d' ? '3,310' : '14,280')}
                </span>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" /> +14.2%
                </span>
              </div>
            </div>

            {/* Card 2: Dispatches / Transfers */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {activeTab === 'maternal' ? (t('active_dispatches') || 'ACTIVE DISPATCHES') : 'SNCU / NICU TRANSFERS'}
                </span>
                <Activity className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? (timeHorizon === '24h' ? '42' : timeHorizon === '7d' ? '290' : '1,248') : (timeHorizon === '24h' ? '28' : timeHorizon === '7d' ? '194' : '842')}
                </span>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  {activeTab === 'maternal' ? '100% routed' : '99.2% routed'}
                </span>
              </div>
            </div>

            {/* Card 3: Average Time-to-Care */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('avg_time_to_care') || 'AVG TIME-TO-CARE'}
                </span>
                <Clock className="w-5 h-5 text-teal-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-600 dark:text-teal-300 font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? '18.4m' : '14.6m'}
                </span>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                  {activeTab === 'maternal' ? '-6.2m faster' : '-4.8m faster'}
                </span>
              </div>
            </div>

            {/* Card 4: Model Accuracy / Sensitivity */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden transition-colors">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('ml_prediction_accuracy') || 'ML PREDICTION ACCURACY'}
                </span>
                <ShieldCheck className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? '96.8%' : '98.2%'}
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                  {activeTab === 'maternal' ? 'ICMR Verified' : 'WHO/IMNCI Aligned'}
                </span>
              </div>
            </div>

          </div>

          {/* New Patient Routing Funnel (Sankey-style blocks) */}
          <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md transition-colors overflow-x-auto">
            <h3 className="text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-6 tracking-tight">{t('patient_routing_funnel')}</h3>
            
            <div className="flex items-center min-w-[700px] justify-between text-center gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('rural_screenings')}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">10,240</p>
              </div>
              
              <div className="flex flex-col items-center justify-center w-16">
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full mb-1">14%</span>
                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-700" />
              </div>

              <div className="flex-1 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200 dark:border-rose-900/30">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">{t('high_risk_detected')}</p>
                <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">1,433</p>
              </div>

              <div className="flex flex-col items-center justify-center w-16">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full mb-1">98%</span>
                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-700" />
              </div>

              <div className="flex-1 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900/30">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">{t('ambulances_dispatched')}</p>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">1,404</p>
              </div>

              <div className="flex flex-col items-center justify-center w-16">
                <span className="text-[10px] font-bold text-teal-500 bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-full mb-1">100%</span>
                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-700" />
              </div>

              <div className="flex-1 bg-teal-50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-200 dark:border-teal-900/30">
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">{t('safe_admissions')}</p>
                <p className="text-2xl font-black text-teal-700 dark:text-teal-300 mt-1">1,404</p>
              </div>
            </div>
          </div>

          {/* Middle Row: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Predictive Demand */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">{t('predictive_demand_matrix')}</h3>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  {['24H', '7D', '1M'].map(time => (
                    <button 
                      key={time} 
                      onClick={() => setTimeframe(time)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${timeframe === time ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictiveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActualDark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f8fafc" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="bottom" height={60} iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                    
                    {/* Expected (Dashed) */}
                    <Area type="monotone" dataKey="expected" name={t('expected_demand', 'Expected Demand')} stroke="#0d9488" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    {/* Actual (Solid + Filled) */}
                    <Area 
                      type="monotone" 
                      dataKey="actual" 
                      name={t('actual_recorded', 'Actual Recorded')} 
                      stroke={isDark ? "#ffffff" : "#0f172a"} 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill={isDark ? "url(#colorActualDark)" : "url(#colorActual)"} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regional Triage Distribution & Pie */}
            <div className="flex flex-col gap-6">
              
              {/* Regional Triage Stacked Bar Chart */}
              <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">{t('regional_triage_distribution')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('interactive_drill_down_region')}</p>
                  </div>
                  {/* AI Override Metric inserted neatly here */}
                  <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 px-3 py-1.5 rounded-lg flex flex-col items-end">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">{t('ai_override_rate')}</span>
                    <span className="text-sm font-black text-purple-700 dark:text-purple-300">1.2%</span>
                  </div>
                </div>
                
                <div className="flex-1 w-full min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={divisions} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} tickMargin={5} interval={0} angle={-25} textAnchor="end" height={60} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} />
                      <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                      <Bar 
                        dataKey="emergency" 
                        name={t('critical_cases', 'Critical Cases')} 
                        stackId="a" 
                        fill="#f43f5e" 
                        className="cursor-pointer" 
                        onClick={(data) => setSelectedDivision(data.name)} 
                      />
                      <Bar 
                        dataKey="normal" 
                        name={t('stable_cases', 'Stable Cases')} 
                        stackId="a" 
                        fill="#14b8a6" 
                        className="cursor-pointer" 
                        onClick={(data) => setSelectedDivision(data.name)} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Drivers Pie Chart */}
              <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">{t('primary_risk_drivers')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('physiological_triggers')}</p>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-between min-h-[160px] gap-6">
                  
                  {/* Left: Pie Chart */}
                  <div className="w-[120px] h-[120px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={riskDrivers} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="pct" stroke="none">
                          {riskDrivers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={tooltipStyle} wrapperStyle={{ zIndex: 100 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Right: Legend */}
                  <div className="space-y-3 flex-1">
                    {riskDrivers.map((driver, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: driver.color }}></span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{t(driver.key) || driver.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{driver.pct}%</span>
                      </div>
                    ))}
                  </div>
                  
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Box: Recent High-Risk Case Outcomes & Transfer Efficacy Table */}
          <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 transition-colors">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  {activeTab === 'maternal' ? (t('recent_case_outcomes') || 'Recent Case Outcomes') : (t('recent_peds_outcomes') || 'Pediatric VIPER Outcomes')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('closed_loop_tracking_subtitle')}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
                <span>{t('auto_syncing')}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">{t('case_id') || 'CASE ID'}</th>
                    <th className="py-3 px-3">{t('filter_district') || 'DISTRICT'}</th>
                    <th className="py-3 px-3">{t('risk_score') || 'RISK SCORE'} &amp; TIER</th>
                    <th className="py-3 px-3">{t('receiving_facility') || 'RECEIVING FACILITY'}</th>
                    <th className="py-3 px-3">{t('time_to_care') || 'TIME-TO-CARE'}</th>
                    <th className="py-3 px-3">{t('clinical_outcome') || 'CLINICAL OUTCOME'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                  {recentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-300">{c.id}</td>
                      <td className="py-3 px-3 text-slate-900 dark:text-slate-200">{c.district}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.score >= 65 ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' : c.score >= 35 ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' : 'bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30'
                        }`}>
                          {c.tier} ({c.score})
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-200">{c.facility}</td>
                      <td className="py-3 px-3 font-mono font-bold text-teal-500 dark:text-teal-400">{c.time}</td>
                      <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t(c.outcomeKey)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default MaternalHealthAnalytics;
