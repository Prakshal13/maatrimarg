import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
  LogOut, 
  Lock, 
  Moon, 
  ChevronDown, 
  CheckCircle2
} from 'lucide-react';

const Navbar = () => {
  const { lang, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', state: 'National' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳', state: 'Maharashtra' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', state: 'Tamil Nadu' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', state: 'National' },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  // If we are inside portal pages with a sidebar (command-center, hospital, asha), we can let the page header take care of headers or render a minimal header
  const isPortalPage = location.pathname.startsWith('/command-center') || 
                       location.pathname.startsWith('/hospital') || 
                       location.pathname.startsWith('/asha');

  // If inside portal with full sidebar, hide top global navbar to give full screen real estate to the dashboard
  if (isPortalPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#f7f9fb]/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo matching Stitch Screen 1 */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#091426] flex items-center justify-center text-[#2dd4bf] shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-lg font-black leading-none">✱</span>
            </div>
            <span className="font-extrabold text-sm tracking-wider text-[#091426] uppercase font-['Plus_Jakarta_Sans']">
              MAATRIMARG
            </span>
          </Link>

          {/* Right Action: Language Selector, Theme Toggle, Clinician Login */}
          <div className="flex items-center gap-3">
            
            {/* Language Selector Dropdown (Pill from screenshot) */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{currentLang.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 divide-y divide-slate-100">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 transition-colors ${
                        lang === l.code ? 'font-bold text-[#006b5f] bg-teal-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-[#006b5f]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Icon Button (From Screenshot) */}
            <button
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Theme Toggle"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            {/* Clinician Login Button (From Screenshot) */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user.username}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#091426] hover:bg-[#1e293b] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Lock className="w-3 h-3 text-teal-300" />
                <span>Clinician Login</span>
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
