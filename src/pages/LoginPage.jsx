import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Badge, Key, LogIn, Globe, Moon, Sun, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [clinicianId, setClinicianId] = useState('MH-DOC-8492');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState('dho_command');
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectUser = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from);
    } else {
      if (role === 'asha') navigate('/asha/maternal');
      else if (role === 'hospital_staff') navigate('/hospital');
      else navigate('/command-center');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(clinicianId, password, selectedRole, 'Maharashtra HQ');
      redirectUser(selectedRole);
    } catch (err) {
      setErrorMsg('Login failed. Please verify credentials or use demo presets.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 sm:p-8 bg-[#f7f9fb] dark:bg-slate-950 text-[#191c1e] dark:text-slate-100 relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Background Radial Dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className="w-full max-w-md mx-auto relative z-10">
        
        {/* Glass Card Container matching Stitch Screen 2 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-6 text-left">
          
          {/* Header / Brand */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-2 shadow-2xs">
              <span className="material-symbols-outlined text-[32px] text-[#1e293b] dark:text-teal-400">
                admin_panel_settings
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#1e293b] dark:text-white font-['Plus_Jakarta_Sans']">
              {t('login_title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] leading-relaxed">
              {t('login_subtitle')}
            </p>
          </div>

          {/* Quick Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setSelectedRole('asha'); setClinicianId('9876543210'); }}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                selectedRole === 'asha' 
                  ? 'bg-white dark:bg-slate-700 text-[#006b5f] dark:text-teal-300 shadow-2xs font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('tab_asha')}
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('hospital_staff'); setClinicianId('cmo_chennai'); }}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                selectedRole === 'hospital_staff' 
                  ? 'bg-white dark:bg-slate-700 text-[#006b5f] dark:text-teal-300 shadow-2xs font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('tab_cmo')}
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('dho_command'); setClinicianId('MH-DOC-8492'); }}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                selectedRole === 'dho_command' 
                  ? 'bg-white dark:bg-slate-700 text-[#006b5f] dark:text-teal-300 shadow-2xs font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('tab_dho')}
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400" htmlFor="clinician_id">
                {t('clinician_id_label')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  badge
                </span>
                <input
                  id="clinician_id"
                  type="text"
                  value={clinicianId}
                  onChange={(e) => setClinicianId(e.target.value)}
                  placeholder={t('clinician_id_placeholder')}
                  required
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400" htmlFor="password">
                  {t('security_key_label')}
                </label>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert("Access Key Recovery: Contact District DHO IT Command Cell or use pre-configured Demo presets."); }}
                  className="text-[11px] font-bold text-[#006b5f] dark:text-teal-400 hover:underline"
                >
                  {t('forgot_key')}
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  key
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('security_key_placeholder')}
                  required
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition-all font-medium"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-[#006b5f] focus:ring-[#006b5f] h-4 w-4"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {t('verify_device')}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#1e293b] dark:bg-teal-500 hover:bg-[#0f172a] dark:hover:bg-teal-600 text-white dark:text-slate-950 rounded-xl py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>{loading ? 'Authenticating...' : t('btn_authenticate')}</span>
            </button>

          </form>

          <div className="text-center border-t border-slate-200 dark:border-slate-800 pt-4">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>{t('encrypted_session')}</span>
            </p>
          </div>

        </div>

      </main>

    </div>
  );
};

export default LoginPage;
