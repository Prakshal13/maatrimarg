import React, { useState } from 'react';
import { TopNavBar } from '../components/common/TopNavBar';
import { SideNavBar } from '../components/common/SideNavBar';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface DistrictStat {
  district: string;
  districtMr: string;
  districtHi: string;
  totalAssessments: number;
  normalPct: number;
  prepPct: number;
  dispatchPct: number;
  avgTransitMins: number;
  icuUtilization: number;
}

interface RiskFactor {
  name: string;
  nameMr: string;
  nameHi: string;
  percentage: number;
  category: string;
  categoryMr: string;
  categoryHi: string;
  trend: string;
  color: string;
}

interface RecentCaseOutcome {
  id: string;
  timestamp: string;
  district: string;
  initialScore: number;
  tier: 'Dispatch' | 'Prep' | 'Normal';
  receivingFacility: string;
  timeToCare: string;
  outcome: string;
  outcomeMr: string;
  outcomeHi: string;
}

const DISTRICT_DATA: DistrictStat[] = [
  { district: 'Mumbai Apex', districtMr: 'मुंबई मुख्य विभाग', districtHi: 'मुंबई मुख्य संभाग', totalAssessments: 4120, normalPct: 72, prepPct: 20, dispatchPct: 8, avgTransitMins: 14, icuUtilization: 85 },
  { district: 'Pune Division', districtMr: 'पुणे विभाग', districtHi: 'पुणे संभाग', totalAssessments: 3840, normalPct: 75, prepPct: 18, dispatchPct: 7, avgTransitMins: 18, icuUtilization: 78 },
  { district: 'Nagpur Division', districtMr: 'नागपूर विभाग', districtHi: 'नागपुर संभाग', totalAssessments: 2650, normalPct: 68, prepPct: 22, dispatchPct: 10, avgTransitMins: 26, icuUtilization: 92 },
  { district: 'Nashik Division', districtMr: 'नाशिक विभाग', districtHi: 'नासिक संभाग', totalAssessments: 2190, normalPct: 74, prepPct: 19, dispatchPct: 7, avgTransitMins: 22, icuUtilization: 68 },
  { district: 'Chhatrapati Sambhajinagar', districtMr: 'छत्रपती संभाजीनगर', districtHi: 'छत्रपति संभाजीनगर', totalAssessments: 1980, normalPct: 65, prepPct: 24, dispatchPct: 11, avgTransitMins: 28, icuUtilization: 96 },
  { district: 'Thane & Konkan', districtMr: 'ठाणे व कोकण विभाग', districtHi: 'ठाणे एवं कोंकण संभाग', totalAssessments: 2340, normalPct: 78, prepPct: 16, dispatchPct: 6, avgTransitMins: 19, icuUtilization: 72 },
  { district: 'Kolhapur & Solapur', districtMr: 'कोल्हापूर व सोलापूर', districtHi: 'कोल्हापुर एवं सोलापुर', totalAssessments: 1300, normalPct: 70, prepPct: 21, dispatchPct: 9, avgTransitMins: 24, icuUtilization: 64 }
];

const RISK_FACTORS: RiskFactor[] = [
  { name: 'Gestational Hypertension (SBP ≥ 140 / DBP ≥ 90)', nameMr: 'गरोदरपणातील उच्च रक्तदाब (SBP ≥ १४० / DBP ≥ ९०)', nameHi: 'गर्भावस्था में उच्च रक्तचाप (SBP ≥ 140 / DBP ≥ 90)', percentage: 42, category: 'Cardiovascular', categoryMr: 'हृदय व रक्तवाहिन्या', categoryHi: 'हृदय एवं संवहनी', trend: '+3.1%', color: 'bg-error' },
  { name: 'Hyperglycemia / Gestational Diabetes (BS ≥ 7.0)', nameMr: 'गरोदरपणातील मधुमेह / वाढलेली साखर (BS ≥ ७.०)', nameHi: 'गर्भावस्था में मधुमेह / उच्च शर्करा (BS ≥ 7.0)', percentage: 28, category: 'Endocrine', categoryMr: 'अंतःस्रावी प्रणाली', categoryHi: 'अंतःस्रावी प्रणाली', trend: '-1.4%', color: 'bg-amber-500' },
  { name: 'Advanced Maternal Age (> 35 Years)', nameMr: '३५ वर्षांपेक्षा जास्त वय (Advanced Age)', nameHi: '35 वर्ष से अधिक मातृ आयु (Advanced Age)', percentage: 18, category: 'Demographic', categoryMr: 'वयोगट', categoryHi: 'जनसांख्यिकीय', trend: '+0.8%', color: 'bg-sky-500' },
  { name: 'Adolescent Pregnancy (< 18 Years)', nameMr: '१८ वर्षांखालील कमी वयातील गरोदरपण', nameHi: '18 वर्ष से कम आयु में गर्भधारण (किशोरावस्था)', percentage: 7, category: 'Demographic', categoryMr: 'वयोगट', categoryHi: 'जनसांख्यिकीय', trend: '-2.0%', color: 'bg-purple-500' },
  { name: 'Maternal Pyrexia / Suspected Sepsis (Temp ≥ 100.4°F)', nameMr: 'तीव्र ताप / संसर्ग संशय (Pyrexia ≥ १००.४°F)', nameHi: 'तीव्र बुखार / संक्रमण की आशंका (Pyrexia ≥ 100.4°F)', percentage: 5, category: 'Infectious', categoryMr: 'संसर्गजन्य', categoryHi: 'संक्रामक', trend: '-0.5%', color: 'bg-rose-500' }
];

const RECENT_CASES: RecentCaseOutcome[] = [
  { id: 'CASE-8891', timestamp: '14 mins ago', district: 'Mumbai', initialScore: 78, tier: 'Dispatch', receivingFacility: 'KEM Hospital & Research Apex', timeToCare: '12m', outcome: 'Stabilized & Monitoring', outcomeMr: 'स्थिती स्थिर, देखरेख सुरू', outcomeHi: 'स्थिति स्थिर, निगरानी जारी' },
  { id: 'CASE-8890', timestamp: '42 mins ago', district: 'Pune', initialScore: 54, tier: 'Prep', receivingFacility: 'Sassoon General Maternity', timeToCare: '22m', outcome: 'Safe Delivery', outcomeMr: 'सुरक्षित प्रसूती', outcomeHi: 'सुरक्षित प्रसव' },
  { id: 'CASE-8889', timestamp: '1h 15m ago', district: 'Nagpur', initialScore: 82, tier: 'Dispatch', receivingFacility: 'Government Medical College (GMC)', timeToCare: '29m', outcome: 'Transferred to NICU', outcomeMr: 'NICU मध्ये दाखल', outcomeHi: 'एनआईसीयू (NICU) में भर्ती' },
  { id: 'CASE-8888', timestamp: '2h 04m ago', district: 'Nashik', initialScore: 24, tier: 'Normal', receivingFacility: 'Nashik District Civil Hospital', timeToCare: '18m', outcome: 'Discharged', outcomeMr: 'डिस्चार्ज देण्यात आला', outcomeHi: 'अस्पताल से छुट्टी मिली (Discharged)' },
  { id: 'CASE-8887', timestamp: '3h 30m ago', district: 'Thane', initialScore: 68, tier: 'Dispatch', receivingFacility: 'Thane Regional Maternal Center', timeToCare: '16m', outcome: 'Safe Delivery', outcomeMr: 'सुरक्षित प्रसूती', outcomeHi: 'सुरक्षित प्रसव' }
];

export const AnalyticsPage: React.FC = () => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'ytd'>('30d');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const { t, language } = useThemeLanguage();

  const filteredDistricts = selectedDistrict === 'ALL'
    ? DISTRICT_DATA
    : DISTRICT_DATA.filter(d => d.district === selectedDistrict);

  const getDistrictName = (d: DistrictStat) => {
    if (language === 'mr') return d.districtMr;
    if (language === 'hi') return d.districtHi;
    return d.district;
  };

  const getRiskFactorName = (rf: RiskFactor) => {
    if (language === 'mr') return rf.nameMr;
    if (language === 'hi') return rf.nameHi;
    return rf.name;
  };

  const getRiskFactorCategory = (rf: RiskFactor) => {
    if (language === 'mr') return rf.categoryMr;
    if (language === 'hi') return rf.categoryHi;
    return rf.category;
  };

  const getCaseOutcome = (c: RecentCaseOutcome) => {
    if (language === 'mr') return c.outcomeMr;
    if (language === 'hi') return c.outcomeHi;
    return c.outcome;
  };

  return (
    <div className="bg-background dark:bg-slate-950 text-on-surface min-h-screen flex flex-col md:flex-row transition-colors">
      <SideNavBar
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-[280px] w-full min-h-screen">
        <TopNavBar onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)} />

        <main className="p-4 md:p-margin-page flex-1 flex flex-col w-full max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[24px]">
                  analytics
                </span>
                <h2 className="text-2xl font-bold text-primary dark:text-slate-100 tracking-tight">
                  {t('analyticsTitle')}
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary dark:text-teal-400 border border-secondary/30">
                  {t('liveEpidemiology')}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">
                {t('analyticsSub')}
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 p-1 rounded-xl shadow-xs">
              {(['24h', '7d', '30d', 'ytd'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                    timeRange === range
                      ? 'bg-primary dark:bg-teal-500 text-white dark:text-slate-950 shadow-xs'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-primary'
                  }`}
                >
                  {range === '24h'
                    ? language === 'mr'
                      ? '२४ तास'
                      : language === 'hi'
                      ? '24 घंटे'
                      : '24 Hours'
                    : range === '7d'
                    ? language === 'mr'
                      ? '७ दिवस'
                      : language === 'hi'
                      ? '7 दिन'
                      : '7 Days'
                    : range === '30d'
                    ? language === 'mr'
                      ? '३० दिवस'
                      : language === 'hi'
                      ? '30 दिन'
                      : '30 Days'
                    : language === 'mr'
                    ? 'वर्षभरात'
                    : language === 'hi'
                    ? 'इस वर्ष (YTD)'
                    : 'YTD'}
                </button>
              ))}
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('maternalScreenings')}
                </span>
                <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-sm">clinical_notes</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">18,420</span>
                <span className="text-xs text-status-success font-bold font-mono">+14.2%</span>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('activeDispatches')}
                </span>
                <span className="material-symbols-outlined text-teal-accent text-sm">ambulance</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">1,248</span>
                <span className="text-xs text-on-surface-variant dark:text-slate-400">
                  {language === 'mr' ? '१००% संदर्भित' : language === 'hi' ? '100% स्थानांतरित' : '100% routed'}
                </span>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('avgTimeToCare')}
                </span>
                <span className="material-symbols-outlined text-status-success text-sm">timer</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400">18.4m</span>
                <span className="text-xs text-status-success font-bold font-mono">
                  {language === 'mr' ? '-६.२ मिनिटे वेगवान' : language === 'hi' ? '-6.2 मिनट तेज़' : '-6.2m faster'}
                </span>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('mlAccuracy')}
                </span>
                <span className="material-symbols-outlined text-teal-accent text-sm">psychiatry</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">96.8%</span>
                <span className="text-xs text-status-success font-bold font-mono">
                  {language === 'mr' ? 'ICMR प्रमाणित' : language === 'hi' ? 'ICMR सत्यापित' : 'ICMR Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Regional Risk Distribution Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-surface-border dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-primary dark:text-slate-100">
                    {t('districtRiskStratification')}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                    {t('districtRiskSub')}
                  </p>
                </div>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-on-surface dark:text-slate-200 outline-none"
                >
                  <option value="ALL">
                    {language === 'mr' ? 'सर्व विभाग' : language === 'hi' ? 'सभी संभाग' : 'All Divisions'}
                  </option>
                  {DISTRICT_DATA.map(d => (
                    <option key={d.district} value={d.district}>{getDistrictName(d)}</option>
                  ))}
                </select>
              </div>

              {/* District Bars */}
              <div className="space-y-3.5">
                {filteredDistricts.map((dist) => (
                  <div key={dist.district} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary dark:text-slate-200">{getDistrictName(dist)}</span>
                        <span className="text-[10px] text-on-surface-variant dark:text-slate-400 font-mono">
                          ({dist.totalAssessments.toLocaleString()} {language === 'mr' ? 'तपासण्या' : language === 'hi' ? 'परीक्षण' : 'tests'})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-on-surface-variant dark:text-slate-400">
                          {language === 'mr' ? 'प्रवास:' : language === 'hi' ? 'समय:' : 'Transit:'} <strong>{dist.avgTransitMins}m</strong>
                        </span>
                        <span className={`${dist.icuUtilization > 90 ? 'text-error font-bold' : 'text-teal-600 dark:text-teal-400'}`}>
                          ICU: {dist.icuUtilization}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-3.5 rounded-full bg-surface-container dark:bg-slate-800 flex overflow-hidden shadow-inner">
                      <div
                        style={{ width: `${dist.normalPct}%` }}
                        className="bg-teal-500 hover:opacity-90 transition-all relative group"
                        title={`Normal: ${dist.normalPct}%`}
                      />
                      <div
                        style={{ width: `${dist.prepPct}%` }}
                        className="bg-amber-400 hover:opacity-90 transition-all relative group"
                        title={`Prep: ${dist.prepPct}%`}
                      />
                      <div
                        style={{ width: `${dist.dispatchPct}%` }}
                        className="bg-error hover:opacity-90 transition-all relative group"
                        title={`Dispatch: ${dist.dispatchPct}%`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-4 pt-2 border-t border-surface-border dark:border-slate-800 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span className="text-on-surface-variant dark:text-slate-400">
                    {language === 'mr' ? 'सामान्य (< ३५)' : language === 'hi' ? 'सामान्य (< 35)' : 'Normal Care (< 35)'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-on-surface-variant dark:text-slate-400">
                    {language === 'mr' ? 'मध्यम (३५-६४)' : language === 'hi' ? 'मध्यम (35-64)' : 'Prep Stage (35-64)'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-error" />
                  <span className="text-on-surface-variant dark:text-slate-400">
                    {language === 'mr' ? 'आपत्कालीन (≥ ६५)' : language === 'hi' ? 'आपातकालीन (≥ 65)' : 'Emergency Dispatch (≥ 65)'}
                  </span>
                </span>
              </div>
            </div>

            {/* Right: Key Clinical Risk Drivers */}
            <div className="lg:col-span-5 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div className="pb-3 border-b border-surface-border dark:border-slate-800">
                <h3 className="text-sm font-bold text-primary dark:text-slate-100">
                  {t('primaryRiskDrivers')}
                </h3>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                  {t('primaryRiskDriversSub')}
                </p>
              </div>

              <div className="space-y-3">
                {RISK_FACTORS.map((rf) => (
                  <div key={rf.name} className="p-2.5 rounded-lg bg-surface-container-low dark:bg-slate-800/70 border border-surface-border dark:border-slate-700 space-y-1.5">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-semibold text-primary dark:text-slate-200 block">
                          {getRiskFactorName(rf)}
                        </span>
                        <span className="text-[10px] text-on-surface-variant dark:text-slate-400">
                          {getRiskFactorCategory(rf)}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-primary dark:text-slate-100">{rf.percentage}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-surface-container dark:bg-slate-700 overflow-hidden">
                      <div style={{ width: `${rf.percentage * 2}%` }} className={`h-full rounded-full ${rf.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Table: Recent Case Outcomes */}
          <div className="border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-border dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-primary dark:text-slate-100">
                  {t('recentCaseOutcomes')}
                </h3>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                  {t('recentCaseSub')}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-surface-container-low dark:bg-slate-800 px-2.5 py-1 rounded-md text-on-surface-variant dark:text-slate-400">
                {t('autoSyncing')}
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                <thead className="bg-surface-container-low dark:bg-slate-800/90 border-b border-surface-border dark:border-slate-800 text-on-surface-variant dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">{language === 'mr' ? 'केस आयडी' : language === 'hi' ? 'केस आईडी' : 'Case ID'}</th>
                    <th className="p-3.5">{t('district')}</th>
                    <th className="p-3.5">{language === 'mr' ? 'जोखीम गुण व श्रेणी' : language === 'hi' ? 'जोखिम स्कोर एवं श्रेणी' : 'Risk Score & Tier'}</th>
                    <th className="p-3.5">{language === 'mr' ? 'रुग्णालय' : language === 'hi' ? 'अस्पताल' : 'Receiving Facility'}</th>
                    <th className="p-3.5">{language === 'mr' ? 'उपचार वेळ' : language === 'hi' ? 'उपचार समय' : 'Time to Care'}</th>
                    <th className="p-3.5">{language === 'mr' ? 'निष्कर्ष / स्थिती' : language === 'hi' ? 'परिणाम / स्थिति' : 'Clinical Outcome'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-slate-800 text-on-surface dark:text-slate-200">
                  {RECENT_CASES.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-primary dark:text-slate-100">{c.id}</span>
                        <span className="text-on-surface-variant dark:text-slate-400 block text-[10px]">{c.timestamp}</span>
                      </td>
                      <td className="p-3.5 font-medium">{c.district}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.tier === 'Dispatch'
                              ? 'bg-error/15 text-error border border-error/30'
                              : c.tier === 'Prep'
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                              : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                          }`}
                        >
                          {c.tier} ({c.initialScore}/100)
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{c.receivingFacility}</td>
                      <td className="p-3.5 font-mono text-teal-600 dark:text-teal-400 font-bold">{c.timeToCare}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-primary dark:text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                          {getCaseOutcome(c)}
                        </span>
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
