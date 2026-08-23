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
  ArrowRight,
  Eye,
  EyeOff,
  X,
  KeyRound
} from 'lucide-react';

const UserProfileDropdown = () => {
  const { user, login, logout, loading } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState(null); // When set, opens auth verification modal for that role
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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

  // When clicking on a role persona, open the authentication verification modal
  const handleInitiateAuth = (profile) => {
    setIsOpen(false);
    setAuthModalRole(profile);
    setAuthForm({
      username: profile.username,
      password: ''
    });
    setAuthError('');
    setShowPassword(false);
  };

  // Process the authentication submission with password verification
  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!authForm.password.trim()) {
      setAuthError(lang === 'mr' ? 'कृपया आपला सुरक्षा पासवर्ड / पिन प्रविष्ट करा.' : lang === 'hi' ? 'कृपया अपना सुरक्षा पासवर्ड / पिन दर्ज करें।' : lang === 'ta' ? 'தயவுசெய்து உங்கள் கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter your security key / PIN.');
      return;
    }

    setIsVerifying(true);
    try {
      await login(authForm.username, authForm.password, authModalRole.role, authModalRole.facility_or_district_id);
      const targetRole = authModalRole.role;
      setAuthModalRole(null);
      if (targetRole === 'asha') navigate('/asha/maternal');
      else if (targetRole === 'hospital_staff') navigate('/hospital');
      else navigate('/command-center');
    } catch (err) {
      setAuthError('Authentication failed. Please verify your credentials.');
    } finally {
      setIsVerifying(false);
    }
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
    <>
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
                      {user ? (user.name || user.username) : 'Select Official Persona'}
                    </span>
                    <span className="text-[10px] font-bold text-[#006b5f] dark:text-teal-400 block">
                      {user ? activeRoleInfo.label : t('auth_required_portals')}
                    </span>
                  </div>
                </div>

                {user && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t('status_active')}
                  </span>
                )}
              </div>

              {user && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                  {t('facility_label')}: {user.facility_or_district_id || t('maharashtra_command_hq')}
                </p>
              )}
            </div>

            {/* Role Persona Selector (Triggers Authenticated Verification) */}
            <div className="py-2.5 px-2.5 space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pt-1">
                {user ? t('switch_authenticated_persona') : t('select_portal_authenticate')}
              </div>

              {DEMO_PROFILES.map((p) => {
                const pInfo = getRoleInfo(p.role);
                const isSelected = user?.role === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => handleInitiateAuth(p)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer group ${
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
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#006b5f] dark:group-hover:text-teal-400 transition-colors flex items-center gap-1.5">
                          <span>{pInfo.label}</span>
                          <span className="text-[10px] font-normal text-slate-400">🔒</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {pInfo.desc}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#006b5f] dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="p-2 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#006b5f] dark:text-teal-400" />
                  <span>{t('custom_credentials_login')}</span>
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

      {/* Clinician Security Authentication Modal */}
      {authModalRole && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setAuthModalRole(null)} 
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 z-10 animate-reveal overflow-hidden text-left font-sans transition-colors">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-[#006b5f] dark:text-teal-400 shadow-2xs">
                  <span className="material-symbols-outlined text-[24px]">
                    {getRoleInfo(authModalRole.role).icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                    {getRoleInfo(authModalRole.role).label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('enter_security_key_verify')}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setAuthModalRole(null)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleVerifyAndLogin} className="space-y-4 mt-5">
              
              {/* Clinician ID */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('clinician_staff_id')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    badge
                  </span>
                  <input
                    type="text"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    required
                    placeholder={t('login_clinician_placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] transition-all"
                  />
                </div>
              </div>

              {/* Password / Access Key */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('security_key_access_pin')} <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    key
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                    autoFocus
                    placeholder={t('login_enter_key_placeholder')}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                  {authError}
                </div>
              )}

              {/* Demo Hint Pill for Easy Evaluation */}
              <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-300 flex items-center justify-between">
                <div>
                  <span className="font-bold block">🔑 {t('official_password')}:</span>
                  <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{authModalRole.password || 'AshaSunita@2026'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthForm(prev => ({ ...prev, password: authModalRole.password || 'AshaSunita@2026' }))}
                  className="px-2.5 py-1 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 text-white dark:text-slate-950 rounded-lg font-bold text-[10px] shadow-xs cursor-pointer"
                >
                  {t('autofill_key')}
                </button>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#091426] dark:bg-teal-500 hover:bg-[#1e293b] dark:hover:bg-teal-600 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#2dd4bf] dark:text-slate-950" />
                <span>{isVerifying ? t('verifying_credentials') : t('verify_access_portal')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

            </form>

          </div>

        </div>
      )}
    </>
  );
};

export default UserProfileDropdown;
