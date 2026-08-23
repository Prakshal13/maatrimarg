import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage, Language } from '../context/ThemeLanguageContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, setLanguage, theme, toggleTheme, t } = useThemeLanguage();

  const [clinicianId, setClinicianId] = useState('MH-DOC-8492');
  const [securityKey, setSecurityKey] = useState('••••••••••••');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clinicianId.trim()) {
      setErrorMsg(
        language === 'mr'
          ? 'कृपया वैद्यकीय अधिकारी आयडी प्रविष्ट करा'
          : language === 'hi'
          ? 'कृपया वैध चिकित्सा अधिकारी आईडी दर्ज करें'
          : 'Please enter a valid Clinician ID'
      );
      return;
    }

    setIsAuthenticating(true);
    try {
      await login(clinicianId, securityKey);
      navigate('/command-center');
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          (language === 'mr'
            ? 'प्रवेश प्रमाणीकरण अयशस्वी.'
            : language === 'hi'
            ? 'प्रमाणीकरण विफल। कृपया क्रेडेंशियल जांचें।'
            : 'Authentication failed. Please verify credentials.')
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="bg-surface-bright dark:bg-slate-950 min-h-screen flex flex-col justify-between relative overflow-hidden transition-colors">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-fixed dark:bg-teal-900/20 rounded-full blur-[120px] opacity-40" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary-fixed dark:bg-sky-900/20 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Header Bar */}
      <header className="w-full px-6 py-4 flex justify-between items-center relative z-10 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary dark:bg-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">hub</span>
          </div>
          <span className="font-label-caps text-medical-blue-muted dark:text-slate-100 font-bold tracking-widest text-xs">
            {t('appName').toUpperCase()}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-on-surface dark:text-slate-300">
            <span className="material-symbols-outlined text-[15px] text-teal-accent">language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent border-none text-xs font-semibold text-on-surface dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="en" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">English (EN)</option>
              <option value="mr" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">मराठी (MR)</option>
              <option value="hi" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">हिंदी (HI)</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low transition-colors"
            aria-label="Toggle Theme"
          >
            <span className="material-symbols-outlined text-[16px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl shadow-xl p-8 backdrop-blur-md animate-reveal">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary dark:bg-teal-500 flex items-center justify-center text-white mb-3 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">medical_services</span>
            </div>
            <h2 className="text-xl font-bold text-primary dark:text-slate-100 tracking-tight">
              {t('clinicianLogin')}
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 max-w-xs">
              {t('secureAccessTitle')}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('clinicianId')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-[18px]">
                  badge
                </span>
                <input
                  type="text"
                  required
                  value={clinicianId}
                  onChange={(e) => setClinicianId(e.target.value)}
                  placeholder="e.g. MH-DOC-8492"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg text-sm font-mono text-on-surface dark:text-white focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('securityKey')}
                </label>
                <a href="#" className="text-[11px] text-secondary dark:text-teal-400 hover:underline">
                  {t('forgotKey')}
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg text-sm text-on-surface dark:text-white focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary focus:ring-teal-400"
                />
                <span className="text-on-surface-variant dark:text-slate-400">
                  {t('rememberDevice')}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 font-bold rounded-lg shadow-sm text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('authenticating')}</span>
                </>
              ) : (
                <>
                  <span>{t('authButton')}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-border dark:border-slate-800 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-on-surface-variant dark:text-slate-400">
              <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[14px]">
                verified_user
              </span>
              {t('encryptedBadge')}
            </span>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-on-surface-variant dark:text-slate-500 relative z-10">
        <p>{t('copyrightText')}</p>
      </footer>
    </div>
  );
};
