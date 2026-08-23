import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UserProfileDropdown from './UserProfileDropdown';
import EmergencyLocationModal from './EmergencyLocationModal';
import { 
  Globe, 
  Moon, 
  Sun, 
  CheckCircle2, 
  MapPin, 
  Search,
  Bell
} from 'lucide-react';

const PortalHeader = ({ title, subtitle, badgeText = 'ML Inference Engine', showSearch = false, onSearch }) => {
  const { lang, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
    { code: 'mr', label: 'मराठी (MR)', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ் (TA)', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी (HI)', flag: '🇮🇳' },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  return (
    <>
      <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
        
        {/* Left Title & Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] truncate">
                {title || t('app_title')}
              </h2>
              {badgeText && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-teal-400 uppercase tracking-wider">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Home SOS Route Button */}
          <button
            onClick={() => setSosModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#cb4646] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
            title="Open Live 108 Emergency Route on Google Maps"
          >
            <span className="material-symbols-outlined text-[15px]">location_on</span>
            <span className="hidden sm:inline">{t('home_sos_route')}</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006b5f] dark:text-teal-400">language</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
              <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-700">
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

          {/* Dark / Light Mode Toggle Button */}
          <button
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Clinician Profile Dropdown */}
          <UserProfileDropdown />

        </div>

      </header>

      {/* Emergency GPS Modal */}
      <EmergencyLocationModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
    </>
  );
};

export default PortalHeader;
