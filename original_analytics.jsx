import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
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
  Filter
} from 'lucide-react';

const MATERNAL_DIVISIONS = [
  { name: 'Mumbai Apex', tests: 4120, transit: '14m', icu: '85%', normal: 72, prep: 20, emergency: 8 },
  { name: 'Pune Division', tests: 3840, transit: '18m', icu: '78%', normal: 75, prep: 18, emergency: 7 },
  { name: 'Nagpur Division', tests: 2650, transit: '26m', icu: '92%', normal: 68, prep: 22, emergency: 10 },
  { name: 'Nashik Division', tests: 2190, transit: '22m', icu: '68%', normal: 74, prep: 19, emergency: 7 },
  { name: 'Chhatrapati Sambhajinagar', tests: 1980, transit: '28m', icu: '96%', normal: 65, prep: 24, emergency: 11 },
  { name: 'Thane & Konkan', tests: 2340, transit: '19m', icu: '72%', normal: 76, prep: 17, emergency: 7 },
  { name: 'Kolhapur & Solapur', tests: 1300, transit: '24m', icu: '64%', normal: 70, prep: 21, emergency: 9 },
];

const PEDIATRIC_DIVISIONS = [
  { name: 'Mumbai Apex', tests: 3210, transit: '12m', icu: '88%', normal: 78, prep: 16, emergency: 6 },
  { name: 'Pune Division', tests: 2940, transit: '15m', icu: '82%', normal: 80, prep: 14, emergency: 6 },
  { name: 'Nagpur Division', tests: 2150, transit: '22m', icu: '94%', normal: 70, prep: 20, emergency: 10 },
  { name: 'Nashik Division', tests: 1840, transit: '19m', icu: '71%', normal: 76, prep: 17, emergency: 7 },
  { name: 'Chhatrapati Sambhajinagar', tests: 1620, transit: '24m', icu: '98%', normal: 67, prep: 23, emergency: 10 },
  { name: 'Thane & Konkan', tests: 1980, transit: '16m', icu: '76%', normal: 79, prep: 15, emergency: 6 },
  { name: 'Kolhapur & Solapur', tests: 1140, transit: '20m', icu: '68%', normal: 74, prep: 19, emergency: 7 },
];

const MATERNAL_RISK_DRIVERS = [
  { name: 'Gestational Hypertension (SBP ≥ 140 / DBP ≥ 90)', category: 'Cardiovascular', pct: 42, color: 'bg-rose-500' },
  { name: 'Hyperglycemia / Gestational Diabetes (BS ≥ 7.0)', category: 'Endocrine', pct: 28, color: 'bg-amber-500' },
  { name: 'Advanced Maternal Age (> 35 Years)', category: 'Demographic', pct: 18, color: 'bg-sky-500' },
  { name: 'Adolescent Pregnancy (< 18 Years)', category: 'Demographic', pct: 7, color: 'bg-purple-500' },
  { name: 'Maternal Pyrexia / Suspected Sepsis (Temp ≥ 100.4°F)', category: 'Infectious', pct: 5, color: 'bg-rose-400' },
];

const PEDIATRIC_RISK_DRIVERS = [
  { name: 'Acute Respiratory Distress / Pneumonia (SpO2 < 90%)', category: 'Respiratory', pct: 38, color: 'bg-rose-500' },
  { name: 'Neonatal Sepsis & Hypothermia (Temp abnormalities)', category: 'Infectious', pct: 26, color: 'bg-amber-500' },
  { name: 'Severe Acute Malnutrition (SAM) & Growth Stunting', category: 'Nutritional', pct: 16, color: 'bg-sky-500' },
  { name: 'Severe Dehydration & Diarrheal Shock', category: 'Gastrointestinal', pct: 12, color: 'bg-purple-500' },
  { name: 'Congenital & Cardiac Anomalies', category: 'Congenital', pct: 8, color: 'bg-teal-500' },
];

const MATERNAL_RECENT_CASES = [
  { id: 'MH-MAT-8921', district: 'Gadchiroli', score: 88, tier: 'CODE RED', facility: 'District Civil Hospital, Gadchiroli', time: '14.2m', outcome: 'Stable Institutional Delivery' },
  { id: 'MH-MAT-8920', district: 'Pune Rural', score: 74, tier: 'CODE RED', facility: 'Sassoon General Hospital, Pune', time: '18.6m', outcome: 'Successful Emergency C-Section' },
  { id: 'MH-MAT-8919', district: 'Amravati', score: 58, tier: 'PREP STAGE', facility: 'Amravati District Hospital', time: '22.1m', outcome: 'Admitted for High-Risk Observation' },
  { id: 'TN-MAT-4412', district: 'Chennai', score: 82, tier: 'CODE RED', facility: 'Govt Maternity Hospital, Chennai', time: '11.4m', outcome: 'NICU Bed Allocated & Safe Delivery' },
  { id: 'MH-MAT-8918', district: 'Solapur', score: 42, tier: 'NORMAL CARE', facility: 'Solapur Civil Hospital', time: '16.8m', outcome: 'Routine Safe Delivery at PHC' },
];

const PEDIATRIC_RECENT_CASES = [
  { id: 'MH-PED-3104', district: 'Gadchiroli Tribal', score: 92, tier: 'VIPER SEVERE', facility: 'SNCU Gadchiroli Civil Hospital', time: '12.4m', outcome: 'Sepsis Protocol Applied • Stable' },
  { id: 'MH-PED-3103', district: 'Melghat Amravati', score: 78, tier: 'VIPER SEVERE', facility: 'Pediatric ICU Amravati GMC', time: '16.2m', outcome: 'Oxygen Therapy Active • SpO2 96%' },
  { id: 'MH-PED-3102', district: 'Pune Cantonment', score: 62, tier: 'MODERATE WATCH', facility: 'Sassoon Pediatric Ward', time: '14.0m', outcome: 'Oral Rehydration & Observation' },
  { id: 'TN-PED-1822', district: 'Coimbatore', score: 86, tier: 'VIPER SEVERE', facility: 'Coimbatore Medical College NICU', time: '13.5m', outcome: 'Phototherapy & Antibiotic IV' },
  { id: 'MH-PED-3101', district: 'Nashik Tribal', score: 35, tier: 'ROUTINE CARE', facility: 'Igatpuri Rural PHC', time: '18.1m', outcome: 'Nutritional SAM Kit Dispatched' },
];

const MaternalHealthAnalytics = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('maternal'); // 'maternal' | 'pediatric'
  const [timeHorizon, setTimeHorizon] = useState('30d'); // '24h' | '7d' | '30d' | 'ytd'
  const [selectedDivision, setSelectedDivision] = useState('all');

  const divisions = activeTab === 'maternal' ? MATERNAL_DIVISIONS : PEDIATRIC_DIVISIONS;
  const riskDrivers = activeTab === 'maternal' ? MATERNAL_RISK_DRIVERS : PEDIATRIC_RISK_DRIVERS;
  const recentCases = activeTab === 'maternal' ? MATERNAL_RECENT_CASES : PEDIATRIC_RECENT_CASES;

  const filteredDivisions = selectedDivision === 'all' 
    ? divisions 
    : divisions.filter(d => d.name.toLowerCase().includes(selectedDivision.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#070e1c] text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Dynamic Role-Based Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070e1c] overflow-y-auto">
        
        {/* Top Header */}
        <PortalHeader 
          title={t('analytics')} 
          subtitle="Epidemiological metrics, risk distributions, transit velocities, and facility capacity trends across Maharashtra." 
          badgeText={t('live_epidemiology')}
        />

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 text-left">
          
          {/* Dual Tab Switcher & Time Horizon Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b1528] p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-md">
            
            {/* Maternal vs Pediatric Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('maternal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'maternal'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>{t('maternal_analytics_tab')}</span>
              </button>

              <button
                onClick={() => setActiveTab('pediatric')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pediatric'
                    ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>{t('pediatric_analytics_tab')}</span>
              </button>
            </div>

            {/* Multi-Horizon Time Filters */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              {[
                { id: '24h', label: t('time_24h') },
                { id: '7d', label: t('time_7d') },
                { id: '30d', label: t('time_30d') },
                { id: 'ytd', label: t('time_ytd') },
              ].map((time) => (
                <button
                  key={time.id}
                  onClick={() => setTimeHorizon(time.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    timeHorizon === time.id
                      ? 'bg-teal-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
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
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {activeTab === 'maternal' ? t('maternal_screenings') : t('pediatric_screenings')}
                </span>
                <span className="material-symbols-outlined text-teal-400 text-[18px]">
                  {activeTab === 'maternal' ? 'clinical_notes' : 'child_care'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? (timeHorizon === '24h' ? '612' : timeHorizon === '7d' ? '4,280' : '18,420') : (timeHorizon === '24h' ? '480' : timeHorizon === '7d' ? '3,310' : '14,280')}
                </span>
                <span className="text-xs text-teal-400 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" /> +14.2%
                </span>
              </div>
            </div>

            {/* Card 2: Dispatches / Transfers */}
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {activeTab === 'maternal' ? t('active_dispatches') : 'SNCU / NICU TRANSFERS'}
                </span>
                <span className="material-symbols-outlined text-rose-400 text-[18px]">
                  ambulance
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? (timeHorizon === '24h' ? '42' : timeHorizon === '7d' ? '290' : '1,248') : (timeHorizon === '24h' ? '28' : timeHorizon === '7d' ? '194' : '842')}
                </span>
                <span className="text-xs text-teal-400/90 font-medium">
                  {activeTab === 'maternal' ? '100% routed' : '99.2% routed'}
                </span>
              </div>
            </div>

            {/* Card 3: Average Time-to-Care */}
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('avg_time_to_care')}
                </span>
                <span className="material-symbols-outlined text-teal-400 text-[18px]">
                  timer
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-300 font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? '18.4m' : '14.6m'}
                </span>
                <span className="text-xs text-teal-400/90 font-bold">
                  {activeTab === 'maternal' ? '-6.2m faster' : '-4.8m faster'}
                </span>
              </div>
            </div>

            {/* Card 4: Model Accuracy / Sensitivity */}
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('ml_prediction_accuracy')}
                </span>
                <span className="material-symbols-outlined text-purple-400 text-[18px]">
                  verified
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-['Plus_Jakarta_Sans']">
                  {activeTab === 'maternal' ? '96.8%' : '98.2%'}
                </span>
                <span className="text-xs text-purple-300 font-medium">
                  {activeTab === 'maternal' ? 'ICMR Verified' : 'WHO/IMNCI Aligned'}
                </span>
              </div>
            </div>

          </div>

          {/* Middle Section: District Risk Stratification & Primary Risk Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: District Risk Stratification & ICU Stress Index */}
            <div className="lg:col-span-7 bg-[#0b1528] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                    {activeTab === 'maternal' ? t('district_risk_stratification') : t('district_pediatric_stratification')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Regional breakdown of Normal, Prep, and Emergency Dispatch case proportions.
                  </p>
                </div>

                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">{t('all_divisions')}</option>
                  {divisions.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Division Stacked Progress Rows */}
              <div className="space-y-4 pt-1">
                {filteredDivisions.map((div) => (
                  <div key={div.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">
                        {div.name} <span className="text-slate-500 font-normal">({div.tests.toLocaleString()} tests)</span>
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-400">Transit: <strong className="text-slate-200">{div.transit}</strong></span>
                        <span className={`font-black ${
                          parseInt(div.icu) > 90 ? 'text-rose-400' : parseInt(div.icu) > 75 ? 'text-amber-400' : 'text-teal-400'
                        }`}>
                          {activeTab === 'maternal' ? 'ICU:' : 'NICU:'} {div.icu}
                        </span>
                      </div>
                    </div>

                    {/* Stacked Multi-Color Progress Bar */}
                    <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                      <div style={{ width: `${div.normal}%` }} className="bg-teal-500 transition-all duration-500" title={`Normal Care: ${div.normal}%`} />
                      <div style={{ width: `${div.prep}%` }} className="bg-amber-400 transition-all duration-500" title={`Prep Stage: ${div.prep}%`} />
                      <div style={{ width: `${div.emergency}%` }} className="bg-rose-500 transition-all duration-500" title={`Emergency Dispatch: ${div.emergency}%`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend Footer */}
              <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-slate-800 text-[11px] font-bold text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span>{activeTab === 'maternal' ? 'Normal Care (< 35)' : 'Stable Pediatric Care (< 35)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>{activeTab === 'maternal' ? 'Prep Stage (35-64)' : 'Moderate Watch (35-64)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{activeTab === 'maternal' ? 'Emergency Dispatch (≥ 65)' : 'Severe VIPER Alert (≥ 65)'}</span>
                </div>
              </div>

            </div>

            {/* Right Box: Primary Maternal / Pediatric Risk Drivers */}
            <div className="lg:col-span-5 bg-[#0b1528] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  {activeTab === 'maternal' ? t('primary_maternal_risk_drivers') : t('primary_pediatric_risk_drivers')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Leading physiological triggers contributing to tertiary transfer dispatches.
                </p>
              </div>

              {/* Risk Driver Ranked Bars */}
              <div className="space-y-4 pt-1">
                {riskDrivers.map((driver) => (
                  <div key={driver.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-200 block">{driver.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{driver.category}</span>
                      </div>
                      <span className="font-black text-sm text-slate-100">{driver.pct}%</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${driver.pct}%` }} 
                        className={`h-full rounded-full ${driver.color} transition-all duration-500`}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Bottom Box: Recent High-Risk Case Outcomes & Transfer Efficacy Table */}
          <div className="bg-[#0b1528] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  {activeTab === 'maternal' ? t('recent_case_outcomes') : t('recent_peds_outcomes')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Closed loop tracking of patient transfers from initial AI assessment to clinical arrival.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>AUTO-SYNCING</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">{t('case_id')}</th>
                    <th className="py-3 px-3">{t('filter_district')}</th>
                    <th className="py-3 px-3">{t('risk_score')} &amp; TIER</th>
                    <th className="py-3 px-3">{t('receiving_facility')}</th>
                    <th className="py-3 px-3">{t('time_to_care')}</th>
                    <th className="py-3 px-3">{t('clinical_outcome')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {recentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-300">{c.id}</td>
                      <td className="py-3 px-3 text-slate-200">{c.district}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.score >= 65 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : c.score >= 35 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                          {c.tier} ({c.score})
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{c.facility}</td>
                      <td className="py-3 px-3 font-mono font-bold text-teal-400">{c.time}</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{c.outcome}</span>
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
