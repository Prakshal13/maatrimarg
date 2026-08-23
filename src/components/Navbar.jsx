import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
  LogOut, 
  Lock, 
  Moon, 
  ChevronDown, 
  CheckCircle2,
  MapPin,
  ArrowRight
} from 'lucide-react';

const Navbar = () => {
  const { lang, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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

  const handleSosRoute = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=Government+Hospital&travelmode=driving`;
          window.open(url, '_blank');
        },
        () => {
          window.open('https://www.google.com/maps/search/Government+Hospital+near+me', '_blank');
        }
      );
    } else {
      window.open('https://www.google.com/maps/search/Government+Hospital+near+me', '_blank');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f7f9fb]/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo matching exact Screenshot */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#091426] flex items-center justify-center text-[#2dd4bf] shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <span className="font-extrabold text-sm tracking-wider text-[#091426] uppercase font-['Plus_Jakarta_Sans']">
              MAATRIMARG
            </span>
          </Link>

          {/* Right Action Items matching Screenshot */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            
            {/* 1. Home SOS Route (Google Maps) Button (Red/Coral Pill from Screenshot) */}
            <button
              onClick={handleSosRoute}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#cb4646] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs transition-all hover:scale-105"
              title="Open Live 108 Emergency Route on Google Maps"
            >
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              <span className="hidden sm:inline">Home SOS Route (Google Maps)</span>
              <span className="sm:hidden">SOS Route</span>
            </button>

            {/* 2. Language Selector Dropdown (Pill from Screenshot) */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-teal-600">language</span>
                <span>{currentLang.label}</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
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

            {/* 3. Dark Mode Toggle Button (From Screenshot) */}
            <button
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
              title="Toggle Dark Mode"
              onClick={() => alert("Dark Mode: Active Theme Protocol Loaded")}
            >
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
            </button>

            {/* 4. Clinician Login / Profile Capsule (From Screenshot: Dr. Ananya Deshm... ➔) */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'dho_command' ? '/command-center' : user.role === 'hospital_staff' ? '/hospital' : '/asha/maternal'}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#091426] hover:bg-[#1e293b] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span className="truncate max-w-[130px]">{user.name || user.username}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#091426] hover:bg-[#1e293b] text-white text-xs font-bold shadow-xs transition-colors group"
              >
                <span>Dr. Ananya Deshm...</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
