import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface SideNavBarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const { logout } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Admin Panel',
      icon: 'admin_panel_settings',
      to: '/admin',
      badge: 'PRO'
    },
    {
      label: t('network'),
      icon: 'hub',
      to: '/command-center',
      isFill: true
    },
    {
      label: t('hospitals'),
      icon: 'domain',
      to: '/hospitals'
    },
    {
      label: t('riskAssessment'),
      icon: 'clinical_notes',
      to: '/risk-assessment'
    },
    {
      label: t('analytics'),
      icon: 'analytics',
      to: '/analytics'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-40 md:hidden animate-fade"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[280px] border-r border-surface-border dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-surface-border dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/command-center" className="flex items-center gap-3 group" onClick={onCloseMobile}>
            <div className="w-9 h-9 rounded-lg bg-primary dark:bg-teal-500 flex items-center justify-center text-on-primary font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px] text-white">vital_signs</span>
            </div>
            <div>
              <h1 className="text-headline-md font-bold text-primary dark:text-slate-100 text-lg leading-tight tracking-tight">
                MaatriMarg
              </h1>
              <p className="text-label-caps text-on-surface-variant dark:text-slate-400 uppercase tracking-widest text-[10px]">
                {t('commandCenter')}
              </p>
            </div>
          </NavLink>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-lg text-on-surface-variant hover:bg-surface-container dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div>
            <span className="px-4 text-label-caps uppercase text-on-surface-variant dark:text-slate-400 font-semibold tracking-wider text-[11px]">
              Platform Modules
            </span>
            <ul className="mt-2 space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-body-md ${
                        isActive
                          ? 'text-secondary dark:text-teal-400 font-semibold bg-secondary/10 dark:bg-teal-500/10 border-l-4 border-secondary dark:border-teal-400 shadow-xs'
                          : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              isActive || item.isFill ? 'fill-1' : ''
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-secondary dark:bg-teal-500 text-white dark:text-slate-950'
                                : 'bg-surface-container-highest dark:bg-slate-700 text-on-surface-variant dark:text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="px-4 text-label-caps uppercase text-on-surface-variant dark:text-slate-400 font-semibold tracking-wider text-[11px]">
              Infrastructure & System
            </span>
            <ul className="mt-2 space-y-1">
              <li>
                <NavLink
                  to="/admin"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-body-md transition-all text-left ${
                      isActive
                        ? 'text-secondary dark:text-teal-400 font-semibold bg-secondary/10 dark:bg-teal-500/10'
                        : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                  <span className="font-medium text-sm">System Governance</span>
                </NavLink>
              </li>
              <li>
                <button
                  onClick={() => alert('Support: Contact Maharashtra Emergency Medical Operations at +91 108 / 102.')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all text-left text-body-md"
                >
                  <span className="material-symbols-outlined text-[20px]">help</span>
                  <span className="font-medium text-sm">{t('support')}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-surface-border dark:border-slate-800 space-y-2">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">public</span>
            <span>Public Portal</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-error hover:bg-error-container/20 dark:hover:bg-error-container/30 transition-colors text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
