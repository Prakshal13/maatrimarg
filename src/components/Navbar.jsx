import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import EmergencyLocationModal from './EmergencyLocationModal';
import UserProfileDropdown from './UserProfileDropdown';
import { 
  Globe, 
  LogOut, 
  Lock, 
  Moon, 
  Sun, 
  ChevronDown, 
  CheckCircle2,
  MapPin
} from 'lucide-react';

const Navbar = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#f7f9fb]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#091426] dark:bg-teal-500 flex items-center justify-center text-[#2dd4bf] dark:text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <span className="font-extrabold text-sm tracking-wider text-[#091426] dark:text-white uppercase font-['Plus_Jakarta_Sans']">
                {t('app_title')}
              </span>
            </Link>

            {/* Right Action Items */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* 1. Home SOS Route (Google Maps) Button */}
              <button
                onClick={() => setSosModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#cb4646] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
                title="Open Live 108 Emergency Route on Google Maps"
              >
                <span className="material-symbols-outlined text-[15px]">location_on</span>
                <span className="hidden sm:inline">{t('home_sos_route')}</span>
                <span className="sm:hidden">SOS Route</span>
              </button>

              {/* 2. Language Selector Dropdown */}
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

              {/* 4. Interactive Clinician Profile & Persona Selection Dropdown */}
              <UserProfileDropdown />

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
