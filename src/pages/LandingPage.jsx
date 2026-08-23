import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/endpoints';

const NetworkThreeGlobe = lazy(() => import('../components/NetworkThreeGlobe'));
import { 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Hospital, 
  Lock, 
  Globe, 
  CheckCircle2, 
  Cpu, 
  Navigation, 
  Sparkles, 
  HeartPulse, 
  Baby, 
  ActivitySquare, 
  Building2, 
  ChevronRight,
  TrendingUp,
  Flame,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.getCommandCenterSummary();
        setSummary(res.data);
      } catch (e) {
        // Silent fallback
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-[#191c1e] dark:text-slate-100 antialiased relative overflow-x-hidden font-sans transition-colors duration-200">
      
      {/* Ambient Blurred Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d8e3fb] dark:bg-blue-900/20 rounded-full blur-[120px] opacity-25 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#9ff2e2] dark:bg-teal-900/20 rounded-full blur-[100px] opacity-25 transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Hero Section matching Screenshot */}
      <section className="w-full flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-8 pb-16 z-10 max-w-7xl mx-auto">
        
        {/* Central Content Header */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
          
          {/* Status Badge from Screenshot */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2e8f0]/60 dark:bg-slate-800/80 border border-[#cbd5e1]/60 dark:border-slate-700 mb-6 shadow-2xs backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] pulse-node"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#45474c] dark:text-slate-300">
              • {t('national_command')}
            </span>
          </div>

          {/* Main 2-Line Headline matching Screenshot */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl font-['Plus_Jakarta_Sans']">
            <span className="text-[#091426] dark:text-white block">{t('hero_headline_1')}</span>
            <span className="text-[#006b5f] dark:text-teal-400 block mt-1">{t('hero_headline_2')}</span>
          </h1>

          {/* Subtitle from Screenshot */}
          <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 max-w-2xl mt-5 leading-relaxed font-normal">
            {t('hero_subtitle')}
          </p>

          {/* Action Buttons matching Screenshot */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto z-20">
            
            {/* Red / Crimson Login Button from Screenshot */}
            <Link
              to="/login"
              className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-sm py-3.5 px-7 rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 group"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>{t('btn_login_here')}</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            {/* White / Teal Explore Matrix Button from Screenshot */}
            <Link
              to="/hospital"
              className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="text-[#006b5f] dark:text-teal-400 font-black text-base">✱</span>
              <span>{t('btn_explore_matrix')}</span>
            </Link>

          </div>

        </div>

        {/* Central Three.js 3D Globe Canvas */}
        <div className="relative w-full max-w-4xl h-36 sm:h-44 -mt-6 z-0 overflow-visible pointer-events-none flex items-center justify-center">
          <div className="w-full h-[400px] absolute -top-24">
            <Suspense fallback={null}>
              <NetworkThreeGlobe />
            </Suspense>
          </div>
        </div>

        {/* Floating Glassmorphic Telemetry Card (Exact from Screenshot) */}
        <div className="w-full max-w-4xl -mt-6 relative z-10">
          <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-stretch">
            
            {/* Left Sub-card: Active Monitoring KPI */}
            <div className="w-full md:w-1/3 bg-slate-50/70 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between text-left space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#006b5f] dark:text-teal-400 uppercase tracking-wider">
                  {t('active_monitoring')}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] pulse-node"></span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium py-1">
                <strong className="text-slate-900 dark:text-slate-100 font-black">{t('landing_maatri_marg')}</strong>{t('landing_description')}
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700">
                <div className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  165+
                </div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wide">
                  {t('mapped_facilities')}
                </div>
              </div>
            </div>

            {/* Right Sub-card: 5-Bar Visualizer & Quote */}
            <div className="w-full md:w-2/3 bg-slate-50/70 dark:bg-slate-800/70 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-5">
              
              {/* Telemetry Bar Chart matching Screenshot */}
              <div className="w-full h-28 flex items-end justify-around px-4 pb-2 border-b border-slate-200/60 dark:border-slate-700">
                <div className="w-9 bg-[#2dd4bf]/25 h-12 rounded-t-lg transition-all hover:h-14"></div>
                <div className="w-9 bg-[#2dd4bf]/45 h-20 rounded-t-lg transition-all hover:h-22"></div>
                <div className="w-9 bg-[#2dd4bf] h-28 rounded-t-lg shadow-sm"></div>
                <div className="w-9 bg-[#2dd4bf]/60 h-16 rounded-t-lg transition-all hover:h-18"></div>
                <div className="w-9 bg-[#2dd4bf]/35 h-24 rounded-t-lg transition-all hover:h-26"></div>
              </div>

              {/* Italic Clinical Quote */}
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 italic max-w-md">
                "{t('clinical_quote')}"
              </p>

              {/* State Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>{t('network_state_optimal')}</span>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* 4 Feature Capability Cards */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              {t('sys_cap_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('sys_cap_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 dark:bg-teal-950/50 flex items-center justify-center text-[#006b5f] dark:text-teal-400 mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  health_and_safety
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] dark:text-white group-hover:text-[#006b5f] dark:group-hover:text-teal-400 transition-colors">
                {t('cap_ai_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] dark:text-slate-300 leading-relaxed">
                {t('cap_ai_desc')}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 dark:bg-teal-950/50 flex items-center justify-center text-[#006b5f] dark:text-teal-400 mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_tree
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] dark:text-white group-hover:text-[#006b5f] dark:group-hover:text-teal-400 transition-colors">
                {t('cap_hosp_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] dark:text-slate-300 leading-relaxed">
                {t('cap_hosp_desc')}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 dark:bg-teal-950/50 flex items-center justify-center text-[#006b5f] dark:text-teal-400 mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  route
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] dark:text-white group-hover:text-[#006b5f] dark:group-hover:text-teal-400 transition-colors">
                {t('cap_route_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] dark:text-slate-300 leading-relaxed">
                {t('cap_route_desc')}
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 dark:bg-teal-950/50 flex items-center justify-center text-[#006b5f] dark:text-teal-400 mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  dashboard_customize
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] dark:text-white group-hover:text-[#006b5f] dark:group-hover:text-teal-400 transition-colors">
                {t('cap_cmd_title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] dark:text-slate-300 leading-relaxed">
                {t('cap_cmd_desc')}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#ffffff] dark:bg-slate-900 border-t border-[#e2e8f0] dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto gap-4 text-xs text-[#45474c] dark:text-slate-400">
          <div className="font-bold text-[#1e293b] dark:text-white">
            {t('footer_tagline')}
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <a href="#" onClick={(e) => { e.preventDefault(); alert(t('terms_alert')); }} className="hover:text-[#006b5f] dark:hover:text-teal-400 transition-colors">
              {t('terms_of_service')}
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert(t('privacy_alert')); }} className="hover:text-[#006b5f] dark:hover:text-teal-400 transition-colors">
              {t('data_privacy')}
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert(t('admin_alert')); }} className="hover:text-[#006b5f] dark:hover:text-teal-400 transition-colors">
              {t('contact_admin')}
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
