import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import EmergencyLocationModal from './EmergencyLocationModal';
import { 
  Globe, 
  LogOut, 
  Lock, 
  Moon, 
  Sun, 
  ChevronDown, 
  CheckCircle2,
  MapPin,
  ArrowRight
} from 'lucide-react';

const Navbar = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', state: 'National' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳', state: 'Maharashtra' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', state: 'Tamil Nadu' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', state: 'National' },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  // If inside portal pages with their own unified sidebar, let the sidebar handle navigation
  const isPortalPage = location.pathname.startsWith('/command-center') || 
                       location.pathname.startsWith('/hospital') || 
                       location.pathname.startsWith('/asha');

  if (isPortalPage) {
    return null;
  }

  // Get user-friendly role label and icon
  const getRoleBadge = () => {
    if (!user) {
      return {
        icon: 'account_circle',
        label: t('clinician_login_btn') || 'Clinician Portal',
        link: '/login'
      };
    }
    if (user.role === 'dho_command') {
      return {
        icon: 'admin_panel_settings',
        label: lang === 'mr' ? 'DHO कमांड मुख्यालय' : lang === 'hi' ? 'DHO कमान मुख्यालय' : lang === 'ta' ? 'DHO கட்டளை மையம்' : 'DHO Command HQ',
        link: '/command-center'
      };
    }
    if (user.role === 'hospital_staff') {
      return {
        icon: 'local_hospital',
        label: lang === 'mr' ? 'रुग्णालय CMO' : lang === 'hi' ? 'अस्पताल सीएमओ' : lang === 'ta' ? 'மருத்துவமனை CMO' : 'Hospital CMO',
        link: '/hospital'
      };
    }
    return {
      icon: 'medical_services',
      label: lang === 'mr' ? 'आशा कार्यकर्ता' : lang === 'hi' ? 'आशा कार्यकर्ता' : lang === 'ta' ? 'ஆஷா பணியாளர்' : 'ASHA Worker',
      link: '/asha/maternal'
    };
  };

  const roleInfo = getRoleBadge();

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#f7f9fb]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo matching exact Screenshot */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#091426] dark:bg-teal-500 flex items-center justify-center text-[#2dd4bf] dark:text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <span className="font-extrabold text-sm tracking-wider text-[#091426] dark:text-white uppercase font-['Plus_Jakarta_Sans']">
                {t('app_title')}
              </span>
            </Link>

            {/* Right Action Items matching Screenshot */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* 1. Home SOS Route (Google Maps) Button (Red/Coral Pill from Screenshot) */}
              <button
                onClick={() => setSosModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#cb4646] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
                title="Open Live 108 Emergency Route on Google Maps"
              >
                <span className="material-symbols-outlined text-[15px]">location_on</span>
                <span className="hidden sm:inline">{t('home_sos_route')}</span>
                <span className="sm:hidden">SOS Route</span>
              </button>

              {/* 2. Language Selector Dropdown (Pill from Screenshot) */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">language</span>
                  <span>{currentLang.label}</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-700">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          changeLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors ${
                          lang === l.code ? 'font-bold text-[#006b5f] dark:text-teal-400 bg-teal-50/50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </div>
                        {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-[#006b5f] dark:text-teal-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Dark Mode Toggle Button */}
              <button
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                onClick={toggleTheme}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* 4. Clinician Profile / Login Capsule with Icon Badge */}
              <div className="flex items-center gap-1.5">
                <Link
                  to={roleInfo.link}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 text-xs font-bold shadow-xs transition-all hover:scale-105 group cursor-pointer"
                  title="Open Portal"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-slate-950/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[13px] leading-none">
                      {roleInfo.icon}
                    </span>
                  </div>
                  <span className="truncate max-w-[130px] font-semibold tracking-wide">
                    {roleInfo.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {user && (
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={t('logout_session')}
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Emergency Location Modal */}
      <EmergencyLocationModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
