import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Shield, 
  Badge, 
  Key, 
  LogIn, 
  Globe, 
  Moon, 
  Sun, 
  CheckCircle2, 
  UserPlus, 
  Phone, 
  MapPin, 
  Building2, 
  Lock,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

const LoginPage = () => {
  const { login, registerAsha, loading, OFFICIAL_ACCOUNTS } = useAuth();
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Active Tab: 'signin' | 'register_asha'
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In Form State
  const [clinicianId, setClinicianId] = useState('9876543210');
  const [password, setPassword] = useState('AshaSunita@2026');
  const [selectedRole, setSelectedRole] = useState('asha');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // ASHA Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    mobileNumber: '',
    ashaId: '',
    state: 'Maharashtra',
    district: 'Gadchiroli',
    subCentre: '',
    password: '',
    confirmPassword: ''
  });
  const [regError, setRegError] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

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

  // Quick fill pre-configured credentials
  const handleQuickFill = (acc) => {
    setClinicianId(acc.username);
    setPassword(acc.password);
    setSelectedRole(acc.role);
    setAuthError('');
  };

  // Handle Sign In Submit
  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const user = await login(clinicianId, password, selectedRole);
      redirectUser(user.role);
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your Clinician ID and Password.');
    }
  };

  // Handle ASHA Registration Submit
  const handleRegisterAsha = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regForm.fullName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regForm.mobileNumber || regForm.mobileNumber.length < 10) {
      setRegError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regForm.subCentre.trim()) {
      setRegError('Please enter your assigned Sub-Centre or Village area.');
      return;
    }
    if (!regForm.password || regForm.password.length < 4) {
      setRegError('Password / PIN must be at least 4 characters.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      await registerAsha(regForm);
      navigate('/asha/maternal');
    } catch (err) {
      setRegError('Registration failed: ' + (err.message || 'Error creating account.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-8 bg-[#f7f9fb] dark:bg-slate-950 text-[#191c1e] dark:text-slate-100 relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Background Radial Dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <main className="w-full max-w-lg mx-auto relative z-10 py-6">
        
        {/* Main Card Container */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_15px_35px_rgba(15,23,42,0.06)] flex flex-col gap-6 text-left transition-colors">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-[#006b5f] dark:bg-teal-500 text-white dark:text-slate-950 flex items-center justify-center mb-1 shadow-md shadow-teal-900/10">
              <span className="material-symbols-outlined text-[28px]">
                {activeTab === 'signin' ? 'admin_panel_settings' : 'badge'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              MaatriMarg
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[320px] leading-relaxed">
              {activeTab === 'signin' 
                ? t('login_platform_subtitle')
                : t('login_asha_register_subtitle')}
            </p>
          </div>

          {/* Navigation Tabs: Sign In ⇄ Register New ASHA Worker */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('signin'); setAuthError(''); }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-[#006b5f] dark:text-teal-300 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('login_existing_staff')}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('register_asha'); setRegError(''); }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'register_asha'
                  ? 'bg-white dark:bg-slate-700 text-[#006b5f] dark:text-teal-300 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('login_register_asha')}</span>
            </button>
          </div>

          {/* TAB 1: EXISTING STAFF SIGN IN */}
          {activeTab === 'signin' && (
            <div className="space-y-5">
              
              {/* Pre-configured Demo Accounts Helper Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>{t('login_preconfigured_accounts')}</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold lowercase">{t('login_one_click_test')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {OFFICIAL_ACCOUNTS.map((acc) => {
                    const isSelected = clinicianId === acc.username;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleQuickFill(acc)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 dark:border-teal-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-teal-300'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                          {acc.role === 'asha' ? `👩‍⚕️ ${t('login_asha_worker')}` : acc.role === 'hospital_staff' ? `🏥 ${t('login_hospital_cmo')}` : `🏛️ ${t('login_dho_command')}`}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {acc.username}
                        </div>
                        <div className="text-[9px] font-mono text-teal-700 dark:text-teal-300 truncate">
                          🔑 {acc.password}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                
                {/* Clinician ID */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400" htmlFor="clinician_id">
                    {t('login_clinician_id')}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      badge
                    </span>
                    <input
                      id="clinician_id"
                      type="text"
                      value={clinicianId}
                      onChange={(e) => setClinicianId(e.target.value)}
                      placeholder={t('login_clinician_placeholder')}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400" htmlFor="password">
                      {t('login_security_key')}
                    </label>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert("Access PIN Recovery: Use official credentials shown above or register a new ASHA account."); }}
                      className="text-[11px] font-bold text-[#006b5f] dark:text-teal-400 hover:underline"
                    >
                      {t('login_forgot_key')}
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      key
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('login_enter_key_placeholder')}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] transition-all font-mono"
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
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                    {authError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#006b5f] focus:ring-[#006b5f] h-4 w-4"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {t('login_verify_device')}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1e293b] dark:bg-teal-500 hover:bg-[#0f172a] dark:hover:bg-teal-600 text-white dark:text-slate-950 rounded-xl py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? t('login_authenticating') : t('login_authenticate_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            </div>
          )}

          {/* TAB 2: REGISTER NEW ASHA WORKER */}
          {activeTab === 'register_asha' && (
            <form onSubmit={handleRegisterAsha} className="space-y-4">
              
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 font-medium leading-relaxed">
                👩‍⚕️ <strong>Frontline Enrollment:</strong> Registering creates your active ASHA tracking node, links your village sub-centre, and provides access to Maternal ML Triage.
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name (ASHA Worker) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  placeholder="e.g. Sunita Ramesh Patil"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                />
              </div>

              {/* Mobile Number & ASHA Staff ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    10-Digit Mobile No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={regForm.mobileNumber}
                    onChange={(e) => setRegForm({ ...regForm, mobileNumber: e.target.value })}
                    placeholder="e.g. 9823145012"
                    required
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Govt ASHA Staff ID
                  </label>
                  <input
                    type="text"
                    value={regForm.ashaId}
                    onChange={(e) => setRegForm({ ...regForm, ashaId: e.target.value })}
                    placeholder="e.g. MH-GAD-405"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] font-mono"
                  />
                </div>
              </div>

              {/* State & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    State
                  </label>
                  <select
                    value={regForm.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      const firstDist = newState === 'Maharashtra' ? 'Gadchiroli' : 'Coimbatore';
                      setRegForm({ ...regForm, state: newState, district: firstDist });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] cursor-pointer"
                  >
                    <option value="Maharashtra">Maharashtra (36 Districts)</option>
                    <option value="Tamil Nadu">Tamil Nadu (38 Districts)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    District
                  </label>
                  <select
                    value={regForm.district}
                    onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f] cursor-pointer"
                  >
                    {regForm.state === 'Maharashtra' ? (
                      [
                        "Ahmednagar (Ahilyanagar)", "Akola", "Amravati", "Beed", "Bhandara", "Buldhana",
                        "Chandrapur", "Chhatrapati Sambhajinagar", "Dhule", "Gadchiroli",
                        "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City",
                        "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Dharashiv (Osmanabad)",
                        "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
                        "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
                      ].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))
                    ) : (
                      [
                        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
                        "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
                        "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
                        "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
                        "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
                        "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
                        "Viluppuram", "Virudhunagar"
                      ].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Assigned PHC / Sub-Centre Village */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Assigned PHC / Sub-Centre Village <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regForm.subCentre}
                  onChange={(e) => setRegForm({ ...regForm, subCentre: e.target.value })}
                  placeholder="e.g. Bhamragad Sub-Centre, Ward 4"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Create Password / PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Create secure PIN"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Repeat secure PIN"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006b5f]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-[11px] text-[#006b5f] dark:text-teal-400 font-bold hover:underline cursor-pointer"
                >
                  {showRegPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 rounded-xl py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Complete Registration & Open Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* Footer Security Badge */}
          <div className="text-center border-t border-slate-200 dark:border-slate-800 pt-3">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>{t('login_encrypted_session')}</span>
            </p>
          </div>

        </div>

      </main>

    </div>
  );
};

export default LoginPage;
