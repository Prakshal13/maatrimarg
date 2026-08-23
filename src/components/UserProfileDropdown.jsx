import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, 
  LogOut, 
  RefreshCw, 
  ShieldCheck, 
  HeartPulse, 
  Hospital, 
  Activity, 
  ChevronDown,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

const UserProfileDropdown = () => {
  const { user, login, logout } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const handleSelectRole = async (profile) => {
    await login(profile.username, 'demo_key', profile.role, profile.facility_or_district_id);
    setIsOpen(false);
    if (profile.role === 'asha') navigate('/asha/maternal');
    else if (profile.role === 'hospital_staff') navigate('/hospital');
    else navigate('/command-center');
  };

  const getRoleInfo = (role) => {
    if (role === 'dho_command') {
      return {
        icon: 'admin_panel_settings',
        label: lang === 'mr' ? 'DHO कमांड मुख्यालय' : lang === 'hi' ? 'DHO कमान मुख्यालय' : lang === 'ta' ? 'DHO கட்டளை மையம்' : 'DHO Command HQ',
        desc: 'District Health Command Center',
        color: 'text-amber-500 bg-amber-500/10'
      };
    }
    if (role === 'hospital_staff') {
      return {
        icon: 'local_hospital',
        label: lang === 'mr' ? 'रुग्णालय CMO' : lang === 'hi' ? 'अस्पताल सीएमओ' : lang === 'ta' ? 'மருத்துவமனை CMO' : 'Hospital CMO',
        desc: 'Tertiary & Civil Hospital Triage',
        color: 'text-blue-500 bg-blue-500/10'
      };
    }
    return {
      icon: 'medical_services',
      label: lang === 'mr' ? 'आशा कार्यकर्ता' : lang === 'hi' ? 'आशा कार्यकर्ता' : lang === 'ta' ? 'ஆஷா பணியாளர்' : 'ASHA Worker',
      desc: 'Rural Maternal & Child Triage',
      color: 'text-teal-500 bg-teal-500/10'
    };
  };

  const activeRoleInfo = getRoleInfo(user?.role || 'dho_command');

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Sleek Circular Profile Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 flex items-center justify-center shadow-xs transition-all hover:scale-110 active:scale-95 cursor-pointer border border-teal-400/40"
        title={user ? activeRoleInfo.label : 'Select Login Persona'}
      >
        <span className="material-symbols-outlined text-[20px] leading-none">
          {user ? activeRoleInfo.icon : 'account_circle'}
        </span>
      </button>

      {/* Interactive Profile & Persona Selection Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 divide-y divide-slate-100 dark:divide-slate-800 text-left animate-reveal overflow-hidden transition-colors">
          
          {/* Top User Status Header */}
          <div className="px-4 py-3 space-y-1 bg-slate-50/70 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#006b5f] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">
                    {user ? activeRoleInfo.icon : 'badge'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight font-['Plus_Jakarta_Sans']">
                    {user ? (user.name || user.username) : 'Select Official Login'}
                  </span>
                  <span className="text-[10px] font-bold text-[#006b5f] dark:text-teal-400 block">
                    {user ? activeRoleInfo.label : 'Frontline & Command Switcher'}
                  </span>
                </div>
              </div>

              {user && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              )}
            </div>

            {user && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                Facility: {user.facility_or_district_id || 'Maharashtra Command HQ'}
              </p>
            )}
          </div>

          {/* Quick Role Switcher / Personas */}
          <div className="py-2.5 px-2.5 space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pt-1">
              {user ? 'Switch Active Persona' : 'Choose Account to Login'}
            </div>

            {DEMO_PROFILES.map((p) => {
              const pInfo = getRoleInfo(p.role);
              const isSelected = user?.role === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => handleSelectRole(p)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pInfo.color}`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {pInfo.icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#006b5f] dark:group-hover:text-teal-400 transition-colors">
                        {pInfo.label}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {pInfo.desc}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#006b5f] dark:text-teal-400 shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Actions: Full Login Page Link & Logout */}
          <div className="p-2 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#006b5f] dark:text-teal-400" />
                <span>Custom Credentials Login</span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout_session')}</span>
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default UserProfileDropdown;
