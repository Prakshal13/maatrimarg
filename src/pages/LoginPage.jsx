import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Badge, Key, LogIn, Globe, Moon, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { lang, changeLanguage } = useLanguage();
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

  const handleQuickDemo = async (role) => {
    const profile = DEMO_PROFILES.find(p => p.role === role);
    if (!profile) return;
    setClinicianId(profile.username);
    setSelectedRole(role);
    await login(profile.username, 'demo_key', role, profile.facility_or_district_id);
    redirectUser(role);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 sm:p-8 bg-[#f7f9fb] text-[#191c1e] relative overflow-hidden font-sans">
      
      {/* Background Radial Dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className="w-full max-w-md mx-auto relative z-10">
        
        {/* Glass Card Container matching Stitch Screen 2 */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col gap-6 text-left">
          
          {/* Header / Brand */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-2 shadow-2xs">
              <span className="material-symbols-outlined text-[32px] text-[#1e293b]">
                admin_panel_settings
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#1e293b] font-['Plus_Jakarta_Sans']">
              MaatriMarg
            </h1>
            <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
              Secure access to Maharashtra & Tamil Nadu Maternal Healthcare Intelligence Platform.
            </p>
          </div>

          {/* Quick Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setSelectedRole('asha'); setClinicianId('9876543210'); }}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                selectedRole === 'asha' ? 'bg-white text-[#006b5f] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ASHA / ANM
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('hospital_staff'); setClinicianId('cmo_chennai'); }}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                selectedRole === 'hospital_staff' ? 'bg-white text-[#006b5f] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hospital CMO
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('dho_command'); setClinicianId('MH-DOC-8492'); }}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                selectedRole === 'dho_command' ? 'bg-white text-[#006b5f] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              DHO Command
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600" htmlFor="clinician_id">
                Clinician / Employee ID
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
                  placeholder="e.g. MH-DOC-8492 or 9876543210"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600" htmlFor="password">
                  Security Key
                </label>
                <button
                  type="button"
                  onClick={() => handleQuickDemo(selectedRole)}
                  className="text-[11px] font-bold text-[#006b5f] hover:underline"
                >
                  Auto-Fill Demo Key
                </button>
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
                  placeholder="Enter security key"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-slate-300 text-[#006b5f] focus:ring-[#2dd4bf] h-4 w-4"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                Verify device for 30 days
              </label>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#091426] hover:bg-[#1e293b] text-white rounded-xl py-3 text-xs sm:text-sm font-bold shadow-md shadow-slate-900/15 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>{loading ? 'Authenticating Access...' : 'Authenticate Access'}</span>
            </button>

          </form>

          {/* Footer Encrypted Session */}
          <div className="text-center border-t border-slate-200 pt-4">
            <p className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>End-to-End Encrypted Session • DISHA Compliance</span>
            </p>
          </div>

        </div>

      </main>

    </div>
  );
};

export default LoginPage;
