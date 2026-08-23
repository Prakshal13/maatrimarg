import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ThreeHeroScene } from '../components/three/ThreeHeroScene';
import { EmergencyLocationModal } from '../components/common/EmergencyLocationModal';
import { HospitalService } from '../services/api';
import { Hospital } from '../types';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, theme, toggleTheme, t } = useThemeLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    HospitalService.getAll().then(setHospitals).catch(console.error);
  }, []);

  const getLanguageLabel = () => {
    if (language === 'mr') return 'मराठी';
    if (language === 'hi') return 'हिंदी';
    return 'English';
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col antialiased relative overflow-x-hidden transition-colors">
      {/* Ambient background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-surface-bright dark:bg-slate-950 transition-colors">
        <div className="absolute top-0 right-0 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary-fixed dark:bg-teal-900/20 rounded-full blur-[140px] opacity-25 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-secondary-fixed dark:bg-sky-900/20 rounded-full blur-[120px] opacity-25 transform -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow relative z-10 flex flex-col items-center w-full max-w-max-width mx-auto">
        {/* Navigation */}
        <nav className="w-full px-margin-mobile md:px-margin-page py-4 flex justify-between items-center relative z-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary dark:bg-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <span className="font-label-caps text-medical-blue-muted dark:text-slate-100 font-black tracking-widest text-sm">
              {t('appName').toUpperCase()}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Direct Home-to-Hospital SOS Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-white font-bold text-xs rounded-lg shadow-sm hover:bg-error/90 transition-all animate-pulse"
              title="Find Nearest Emergency Hospital from Home"
            >
              <span className="material-symbols-outlined text-[16px]">home_pin</span>
              <span className="hidden sm:inline">
                {language === 'mr' ? 'घरून रुग्णालय मार्ग (Google Maps)' : language === 'hi' ? 'घर से अस्पताल मार्ग (Google Maps)' : 'Home SOS Route (Google Maps)'}
              </span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-body-md text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low text-xs shadow-xs transition-colors">
                <span className="material-symbols-outlined text-[16px] text-teal-accent">language</span>
                <span>{getLanguageLabel()}</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 py-1 text-xs">
                <button
                  onClick={() => setLanguage('en')}
                  className="w-full text-left px-3 py-2 text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 hover:text-teal-accent"
                >
                  English (EN)
                </button>
                <button
                  onClick={() => setLanguage('mr')}
                  className="w-full text-left px-3 py-2 text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 hover:text-teal-accent"
                >
                  मराठी (Marathi)
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className="w-full text-left px-3 py-2 text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 hover:text-teal-accent"
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-xs"
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Direct Login Button */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary dark:bg-teal-500 text-white dark:text-slate-950 font-bold text-xs rounded-lg hover:opacity-90 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              {t('clinicianLogin')}
            </Link>
          </div>
        </nav>

        {/* Hero Section with 3D Canvas */}
        <section className="w-full min-h-[680px] md:min-h-[780px] flex flex-col items-center justify-center px-margin-mobile md:px-margin-page relative py-12">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-3xl opacity-70 dark:opacity-40">
            <ThreeHeroScene />
          </div>

          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center gap-4 mt-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest/80 dark:bg-slate-800/90 border border-surface-border dark:border-slate-700 backdrop-blur-md animate-reveal shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-accent pulse-node" />
              <span className="text-[11px] font-mono font-bold text-on-surface-variant dark:text-slate-300 tracking-wider uppercase">
                {t('activeInfrastructure')}
              </span>
            </div>

            <h1 className="font-display-lg text-3xl sm:text-5xl md:text-6xl font-black text-medical-blue-muted dark:text-slate-100 animate-reveal animate-reveal-delay-1 leading-tight tracking-tight mt-2">
              {t('landingTitle1')} <br className="hidden sm:block" />
              <span className="text-secondary dark:text-teal-400">{t('landingTitle2')}</span>
            </h1>

            <p className="text-body-lg text-sm sm:text-lg text-on-surface-variant dark:text-slate-300 max-w-2xl animate-reveal animate-reveal-delay-2 leading-relaxed">
              {t('landingSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 mt-6 w-full sm:w-auto animate-reveal animate-reveal-delay-3">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="bg-error hover:bg-error/90 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">home_pin</span>
                <span>
                  {language === 'mr' ? 'माझ्या घरावरून थेट मार्ग (Google Maps)' : language === 'hi' ? 'घर से अस्पताल मार्ग (Google Maps)' : 'Route from My Home (Google Maps)'}
                </span>
              </button>

              <button
                onClick={() => navigate('/command-center')}
                className="bg-surface-container-lowest dark:bg-slate-900/80 border border-surface-border dark:border-slate-700 text-medical-blue-muted dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 font-bold py-3.5 px-7 rounded-xl transition-all duration-300 flex items-center justify-center text-sm shadow-xs"
              >
                {t('exploreMatrix')}
              </button>
            </div>
          </div>

          <div className="w-full max-w-4xl mt-16 mb-6 relative z-10 animate-reveal animate-reveal-delay-3">
            <div className="glass-card w-full h-72 md:h-96 relative overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center border border-white/60 dark:border-slate-700 p-4">
              <div className="w-full h-full rounded-xl border border-surface-border/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md flex flex-col md:flex-row p-6 gap-6 shadow-inner">
                <div className="w-full md:w-1/3 bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-xs border border-surface-border dark:border-slate-700 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-accent">
                      {t('activeMonitoring')}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-accent pulse-node" />
                  </div>
                  <div className="space-y-2 my-4">
                    <div className="h-2 w-full bg-surface-container dark:bg-slate-700 rounded-full" />
                    <div className="h-2 w-5/6 bg-surface-container dark:bg-slate-700 rounded-full" />
                    <div className="h-2 w-4/6 bg-surface-container dark:bg-slate-700 rounded-full" />
                  </div>
                  <div className="pt-3 border-t border-surface-border dark:border-slate-700">
                    <span className="text-2xl font-bold font-mono text-medical-blue-muted dark:text-slate-100">
                      98.4%
                    </span>
                    <p className="text-[10px] text-on-surface-variant dark:text-slate-400">{t('operationalFidelity')}</p>
                  </div>
                </div>

                <div className="w-full md:w-2/3 bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-xs border border-surface-border dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-full h-28 flex items-end justify-around px-6 border-b border-surface-border dark:border-slate-700 pb-3">
                    <div className="w-10 bg-teal-accent/20 h-12 rounded-t-md" />
                    <div className="w-10 bg-teal-accent/40 h-20 rounded-t-md" />
                    <div className="w-10 bg-teal-accent h-28 rounded-t-md animate-pulse" />
                    <div className="w-10 bg-teal-accent/60 h-16 rounded-t-md" />
                    <div className="w-10 bg-teal-accent/30 h-24 rounded-t-md" />
                  </div>
                  <p className="text-xs font-semibold text-medical-blue-muted dark:text-slate-200 italic max-w-md">
                    {t('landingQuote')}
                  </p>
                  <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary dark:text-teal-400 text-[11px] font-bold">
                    {t('networkStateOptimal')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Capabilities Grid */}
        <section className="w-full px-margin-mobile md:px-margin-page py-16 bg-surface-bright dark:bg-slate-950/60 relative z-10 border-t border-surface-border/60 dark:border-slate-800">
          <div className="max-w-max-width mx-auto flex flex-col gap-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-medical-blue-muted dark:text-slate-100 mb-2">
                {t('systemCapabilities')}
              </h2>
              <p className="text-body-md text-on-surface-variant dark:text-slate-400 text-sm">
                {t('systemCapabilitiesSub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:shadow-xl transition-all group border border-surface-border dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-teal-accent/15 flex items-center justify-center text-teal-accent mb-1 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined fill-1 text-[28px]">health_and_safety</span>
                </div>
                <h3 className="font-bold text-base text-medical-blue-muted dark:text-slate-100 group-hover:text-teal-accent transition-colors">
                  {t('cardRiskTitle')}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  {t('cardRiskDesc')}
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:shadow-xl transition-all group border border-surface-border dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-teal-accent/15 flex items-center justify-center text-teal-accent mb-1 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined fill-1 text-[28px]">account_tree</span>
                </div>
                <h3 className="font-bold text-base text-medical-blue-muted dark:text-slate-100 group-hover:text-teal-accent transition-colors">
                  {t('cardNetworkTitle')}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  {t('cardNetworkDesc')}
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:shadow-xl transition-all group border border-surface-border dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-teal-accent/15 flex items-center justify-center text-teal-accent mb-1 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined fill-1 text-[28px]">route</span>
                </div>
                <h3 className="font-bold text-base text-medical-blue-muted dark:text-slate-100 group-hover:text-teal-accent transition-colors">
                  {t('cardRoutingTitle')}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  {t('cardRoutingDesc')}
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 hover:shadow-xl transition-all group border border-surface-border dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-teal-accent/15 flex items-center justify-center text-teal-accent mb-1 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined fill-1 text-[28px]">dashboard_customize</span>
                </div>
                <h3 className="font-bold text-base text-medical-blue-muted dark:text-slate-100 group-hover:text-teal-accent transition-colors">
                  {t('cardCommandTitle')}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  {t('cardCommandDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full mt-auto bg-surface-container-lowest dark:bg-slate-900 border-t border-surface-border dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-margin-page w-full max-w-max-width mx-auto gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-medical-blue-muted dark:text-slate-200">
              {t('copyrightText')}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-on-surface-variant dark:text-slate-400 hover:text-teal-accent transition-colors">
              {t('termsOfService')}
            </a>
            <a href="#" className="text-on-surface-variant dark:text-slate-400 hover:text-teal-accent transition-colors">
              {t('dataPrivacy')}
            </a>
            <a href="#" className="text-on-surface-variant dark:text-slate-400 hover:text-teal-accent transition-colors">
              {t('contactAdmin')}
            </a>
          </div>
        </div>
      </footer>

      {/* Emergency Home to Hospital Location Navigator Modal */}
      <EmergencyLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        hospitals={hospitals}
      />
    </div>
  );
};
