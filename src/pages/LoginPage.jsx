import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, HeartPulse, Hospital, Activity, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('asha');
  const [username, setUsername] = useState('9876543210');
  const [password, setPassword] = useState('123456');
  const [facility, setFacility] = useState('PHC-Bhamragad (Gadchiroli)');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    const profile = DEMO_PROFILES.find(p => p.role === role);
    if (profile) {
      setUsername(profile.username);
      setFacility(profile.facility_or_district_id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await login(username, password, selectedRole, facility);
      if (selectedRole === 'asha') navigate('/asha/maternal');
      else if (selectedRole === 'hospital_staff') navigate('/hospital');
      else navigate('/command-center');
    } catch (err) {
      setErrorMessage('Login failed. Please check credentials or use 1-click demo login.');
    }
  };

  const handleQuickLogin = async (profile) => {
    setSelectedRole(profile.role);
    setUsername(profile.username);
    setFacility(profile.facility_or_district_id);
    await login(profile.username, 'demo_pin', profile.role, profile.facility_or_district_id);
    if (profile.role === 'asha') navigate('/asha/maternal');
    else if (profile.role === 'hospital_staff') navigate('/hospital');
    else navigate('/command-center');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-950 text-slate-100 relative overflow-hidden">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Context & 1-Click Demo Profiles */}
        <div className="md:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DISHA / ABDM RBAC Authentication</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Plus_Jakarta_Sans'] leading-tight">
            Role-Based Access Portal
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Select your operational designation. For hackathon evaluation, click any demo profile below for instant authentication.
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              1-Click Demo Quick Logins:
            </div>
            {DEMO_PROFILES.map((profile) => (
              <button
                key={profile.role}
                onClick={() => handleQuickLogin(profile)}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {profile.role === 'asha' && <HeartPulse className="w-4 h-4" />}
                    {profile.role === 'hospital_staff' && <Hospital className="w-4 h-4" />}
                    {profile.role === 'dho_command' && <Activity className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      {profile.label}
                    </div>
                    <div className="text-[10px] text-slate-400">{profile.facility_or_district_id}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Custom Login Form */}
        <div className="md:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleSelectRole('asha')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'asha' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              ASHA
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('hospital_staff')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'hospital_staff' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hospital className="w-3.5 h-3.5 text-teal-600" />
              Hospital
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('dho_command')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'dho_command' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              DHO HQ
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username / Mobile Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. 9876543210 or cmo_chennai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password / Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assigned Facility or District
              </label>
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="e.g. PHC Bhamragad, Gadchiroli or Chennai Govt"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span>Authenticating with JWT...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-500">
                Secured by SHA-256 JWT & DISHA Consent Protocol
              </span>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;
