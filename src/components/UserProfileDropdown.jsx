import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
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
  Lock
} from 'lucide-react';

const UserProfileDropdown = () => {
  const { user, login, logout } = useAuth();
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
    navigate('/login');
  };

  const handleSwitchRole = async (profile) => {
    await login(profile.username, 'demo_key', profile.role, profile.facility_or_district_id);
    setIsOpen(false);
    if (profile.role === 'asha') navigate('/asha/maternal');
    else if (profile.role === 'hospital_staff') navigate('/hospital');
    else navigate('/command-center');
  };

  const roleLabel = user?.role === 'asha' ? 'ASHA Field Worker' :
                    user?.role === 'hospital_staff' ? 'Hospital CMO' :
                    'DHO Command Director';

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Trigger Button in Top Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 bg-white transition-all shadow-2xs group"
        title="User Profile & Role Switcher"
      >
        <div className="w-8 h-8 rounded-full bg-[#006b5f] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
          {user?.username ? user.username.slice(0, 2).toUpperCase() : 'HQ'}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-extrabold text-slate-900 leading-none">
            {user?.username || 'Command HQ'}
          </span>
          <span className="text-[10px] font-bold text-[#006b5f] mt-0.5 leading-none">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Interactive Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 divide-y divide-slate-100 text-left animate-in fade-in zoom-in-95 duration-150">
          
          {/* User Details Header */}
          <div className="px-4 py-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                {user?.username || 'Clinician User'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Facility: {user?.facility_or_district_id || 'State Command Center'}
            </p>
          </div>

          {/* Quick Role Switcher */}
          <div className="py-2.5 px-3 space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
              Switch Active Role
            </div>

            {DEMO_PROFILES.map((p) => {
              const isCurrent = user?.role === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => handleSwitchRole(p)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                    isCurrent 
                      ? 'bg-teal-50 text-[#006b5f] font-extrabold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isCurrent ? 'bg-[#006b5f] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.role === 'asha' && <HeartPulse className="w-3.5 h-3.5" />}
                      {p.role === 'hospital_staff' && <Hospital className="w-3.5 h-3.5" />}
                      {p.role === 'dho_command' && <Activity className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">{p.label}</div>
                      <div className="text-[9px] text-slate-400 font-normal">{p.facility_or_district_id}</div>
                    </div>
                  </div>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-[#006b5f]" />}
                </button>
              );
            })}
          </div>

          {/* Sign Out Button */}
          <div className="pt-2 px-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-extrabold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out & Exit Session</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default UserProfileDropdown;
