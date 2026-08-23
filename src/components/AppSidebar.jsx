import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  HeartPulse, 
  Baby, 
  ActivitySquare, 
  Hospital, 
  Activity, 
  BarChart3,
  ShieldCheck,
  Home, 
  LogOut, 
  Building2
} from 'lucide-react';

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userRole = user?.role || 'dho_command';

  // Master definition of all possible navigation items with authorized roles
  const ALL_NAV_ITEMS = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      path: '/command-center',
      icon: Activity,
      symbol: 'hub',
      allowedRoles: ['dho_command']
    },
    {
      id: 'hospitals',
      label: t('hospitals'),
      path: '/hospital',
      icon: Hospital,
      symbol: 'domain',
      allowedRoles: ['hospital_staff', 'dho_command']
    },
    {
      id: 'analytics',
      label: t('analytics'),
      path: '/analytics',
      icon: BarChart3,
      symbol: 'monitoring',
      allowedRoles: ['hospital_staff', 'dho_command']
    },
    {
      id: 'admin',
      label: t('admin_governance'),
      path: '/admin',
      icon: ShieldCheck,
      symbol: 'admin_panel_settings',
      allowedRoles: ['dho_command']
    },
    {
      id: 'maternal',
      label: t('maternal_portal'),
      path: '/asha/maternal',
      icon: HeartPulse,
      symbol: 'clinical_notes',
      allowedRoles: ['asha', 'hospital_staff', 'dho_command']
    },
    {
      id: 'child',
      label: t('child_portal'),
      path: '/asha/child',
      icon: Baby,
      symbol: 'child_care',
      allowedRoles: ['asha', 'dho_command']
    },
    {
      id: 'chronic',
      label: t('chronic_portal'),
      path: '/asha/chronic',
      icon: ActivitySquare,
      symbol: 'ecg_heart',
      allowedRoles: ['asha', 'dho_command']
    }
  ];

  // Filter items specifically based on logged-in user persona
  const navItems = ALL_NAV_ITEMS.filter(item => item.allowedRoles.includes(userRole));

  return (
    <aside className="w-[260px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs hidden md:flex flex-col shrink-0 h-screen sticky top-0 text-left select-none transition-colors">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#006b5f] dark:bg-teal-500 flex items-center justify-center text-white dark:text-slate-950 font-black text-base shadow-sm group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight font-['Plus_Jakarta_Sans']">
              {t('app_title')}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('clinical_platform')}
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Items (Filtered by Role) */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-widest flex items-center justify-between">
          <span>{t('core_system_portals')}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-bold uppercase">
            {userRole === 'asha' ? 'ASHA' : userRole === 'hospital_staff' ? 'CMO' : 'DHO'}
          </span>
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#006b5f]/10 dark:bg-teal-500/20 text-[#006b5f] dark:text-teal-300 font-extrabold border-l-4 border-[#006b5f] dark:border-teal-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span 
                className="material-symbols-outlined text-[19px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.symbol}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-1 text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-widest">
          {t('system_support')}
        </div>

        <button
          onClick={() => alert("Emergency Support: Dial 108 Emergency Dispatch or Contact District CMO Command HQ")}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span>{t('support')}</span>
        </button>
      </nav>

      {/* Bottom Actions: Back to Home & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>{t('back_to_landing')}</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>{t('logout_session')}</span>
        </button>
      </div>

    </aside>
  );
};

export default AppSidebar;
