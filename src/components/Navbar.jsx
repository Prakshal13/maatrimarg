import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/endpoints';
import { Activity, ShieldAlert, HeartPulse, Hospital, Users, Baby, ActivitySquare, Globe, LogOut, LogIn, CheckCircle2, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isHealthy, setIsHealthy] = useState(true);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        setIsHealthy(res.data?.status === 'ok');
      } catch (e) {
        setIsHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', state: 'National' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳', state: 'Maharashtra' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', state: 'Tamil Nadu' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', state: 'National' },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  const navLinks = [
    { path: '/asha/maternal', label: t('maternal_portal'), icon: HeartPulse, role: ['asha', 'admin'] },
    { path: '/asha/child', label: t('child_portal'), icon: Baby, role: ['asha', 'admin'] },
    { path: '/asha/chronic', label: t('chronic_portal'), icon: ActivitySquare, role: ['asha', 'admin'] },
    { path: '/hospital', label: t('hospitals'), icon: Hospital, role: ['hospital_staff', 'admin'] },
    { path: '/command-center', label: t('dashboard'), icon: Activity, role: ['dho_command', 'admin'] },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Health Pulse */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 animate-pulse text-rose-300" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                  {t('app_title')}
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    AI 2.0
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block leading-none">
                  {t('tagline')}
                </p>
              </div>
            </Link>

            {/* Health Pulse Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-xs font-semibold text-slate-600">
                {isHealthy ? t('system_status') : 'Offline'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Language Selector & Auth */}
          <div className="flex items-center gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentLang.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 divide-y divide-slate-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('language')} / மாநில மொழி
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        lang === l.code ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <div>
                          <div>{l.label}</div>
                          <span className="text-[10px] text-slate-400">{l.state}</span>
                        </div>
                      </div>
                      {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Button or User Badge */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user.username}
                  </span>
                  <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title={t('logout')}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('login')}
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
