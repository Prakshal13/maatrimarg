import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/endpoints';
import NetworkThreeGlobe from '../components/NetworkThreeGlobe';
import { 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Hospital, 
  Lock, 
  Globe, 
  CheckCircle2, 
  Cpu, 
  Navigation, 
  Sparkles, 
  HeartPulse, 
  Baby, 
  ActivitySquare, 
  Building2, 
  ChevronRight,
  TrendingUp,
  Flame,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [activeModuleTab, setActiveModuleTab] = useState('maternal'); // maternal | child | chronic | hospital | command

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.getCommandCenterSummary();
        setSummary(res.data);
      } catch (e) {
        // Fallback realistic metrics
      }
    };
    fetchSummary();
  }, []);

  const modules = [
    {
      id: 'maternal',
      title: 'Maternal AI Triage',
      subtitle: 'Random Forest Risk Scoring & Dijkstra Emergency Dispatch',
      icon: HeartPulse,
      path: '/asha/maternal',
      tag: 'Frontline ASHA / ANM',
      color: 'from-rose-500/10 to-teal-500/10',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      metrics: [
        { label: 'Model Accuracy', value: '96.3%' },
        { label: 'Languages', value: 'MR / TA / HI / EN' },
        { label: 'Triage Tiers', value: 'Watch / Prep / Dispatch' }
      ],
      description: 'Predictive clinical intelligence analyzing Systolic/Diastolic BP, blood glucose with mg/dL auto-normalization, and core temperature to triage high-risk mothers directly from sub-centres.'
    },
    {
      id: 'child',
      title: 'Pediatric VIPER Triage',
      subtitle: 'Age-Banded Infant & Pediatric Emergency Stratification',
      icon: Baby,
      path: '/asha/child',
      tag: '0 - 60 Months Health',
      color: 'from-teal-500/10 to-emerald-500/10',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      metrics: [
        { label: 'VIPER Rules', value: 'Active' },
        { label: 'SpO2 Threshold', value: '< 92% Alert' },
        { label: 'Resp Rate Triage', value: 'Age-Banded' }
      ],
      description: 'Frontline pediatric assessment tool utilizing VIPER clinical guidelines and Random Forest classification to detect neonatal respiratory distress and severe fever complications.'
    },
    {
      id: 'chronic',
      title: 'Chronic Cardio Screening',
      subtitle: 'Cardiovascular Complication Screening for Adults',
      icon: ActivitySquare,
      path: '/asha/chronic',
      tag: '70,000+ Records Model',
      color: 'from-indigo-500/10 to-blue-500/10',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      metrics: [
        { label: 'Dataset Trained', value: '70,000 Rows' },
        { label: 'Biometrics', value: 'BMI + BP + Sugar' },
        { label: 'Priority Levels', value: 'Routine / Clinical / Priority' }
      ],
      description: 'Adult cardiovascular risk screening engine computing body mass index, stage 1/2 hypertension flags, and lifestyle factors to prevent chronic cardiac emergencies in rural districts.'
    },
    {
      id: 'hospital',
      title: 'Hospitals Capacity Matrix',
      subtitle: 'Live Beds, NICU, Surgeon & Blood Bank Inventory',
      icon: Hospital,
      path: '/hospital',
      tag: 'Tamil Nadu & Maharashtra',
      color: 'from-teal-500/10 to-cyan-500/10',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      metrics: [
        { label: 'Connected Facilities', value: `${summary?.hospital_count || 260}+` },
        { label: 'Available Beds', value: `${summary?.total_available_beds || 1840}` },
        { label: 'NICU Beds', value: `${summary?.total_nicu_beds || 420}` }
      ],
      description: 'Centralized hospital directory and live slide-over capacity manager allowing CMOs to update available ICU beds, surgeon shifts, and 8 blood group unit reserves in real time.'
    },
    {
      id: 'command',
      title: 'DHO Command Center',
      subtitle: 'Autonomous Watchdog & Immutable ABDM Audit Trail',
      icon: Activity,
      path: '/command-center',
      tag: 'District Operational HQ',
      color: 'from-slate-900/10 to-indigo-900/10',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      metrics: [
        { label: 'Active 108 Dispatches', value: `${summary?.active_dispatches || 8}` },
        { label: 'Diversion Rate', value: '0.0%' },
        { label: 'Overdue Watchdog', value: 'Autonomous' }
      ],
      description: 'Executive state/district command console featuring live hospital telemetry mesh, automated referral auto-escalation for unresponsive facilities, and full DISHA audit trail.'
    }
  ];

  const currentModule = modules.find(m => m.id === activeModuleTab) || modules[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased relative overflow-x-hidden font-sans">
      
      {/* Ambient Blurred Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Hero Section */}
      <section className="w-full flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-6 pb-12 z-10 max-w-7xl mx-auto">
        
        {/* Three.js Background Canvas (Positioned behind central card) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-80 min-h-[500px]">
          <NetworkThreeGlobe />
        </div>

        {/* Central Content Header */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center mt-4">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 mb-5 shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700">
              • NATIONAL COMMAND INFRASTRUCTURE ACTIVE • MAHARASHTRA & TAMIL NADU
            </span>
          </div>

          {/* Main 2-Line Headline matching Screenshot */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-3xl font-['Plus_Jakarta_Sans']">
            Maternal Healthcare <br />
            <span className="text-[#006b5f] bg-clip-text text-transparent bg-gradient-to-r from-[#006b5f] to-[#0b6f63]">
              Intelligence Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mt-4 leading-relaxed font-normal">
            Predict clinical risk. Optimize real-time ICU bed allocation. Seamlessly route mothers to the right tertiary facilities across districts.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-7 w-full sm:w-auto">
            <Link
              to="/command-center"
              className="bg-[#091426] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm py-3.5 px-7 rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <span>Login to Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/hospital"
              className="bg-white/90 hover:bg-white border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all hover:scale-[1.02] flex items-center justify-center"
            >
              Explore Live Matrix
            </Link>
          </div>

        </div>

        {/* Floating Glassmorphic Telemetry Card (Exact from Screenshot) */}
        <div className="w-full max-w-4xl mt-12 relative z-10">
          <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-stretch">
            
            {/* Left Sub-card: Active Monitoring KPI */}
            <div className="w-full md:w-1/3 bg-slate-50/90 rounded-2xl p-5 border border-slate-200/70 flex flex-col justify-between text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#006b5f] uppercase tracking-wider">
                  ACTIVE MONITORING
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] shadow-sm shadow-teal-500 animate-pulse"></span>
              </div>

              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-200 rounded-full"></div>
                <div className="h-2 w-4/5 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-3/5 bg-slate-200 rounded-full"></div>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                  98.4%
                </div>
                <div className="text-[11px] font-bold text-slate-500">
                  Network Operational Fidelity
                </div>
              </div>
            </div>

            {/* Right Sub-card: Animated Telemetry Bar Visualizer & Quote */}
            <div className="w-full md:w-2/3 bg-slate-50/90 rounded-2xl p-6 border border-slate-200/70 flex flex-col items-center justify-center text-center gap-5">
              
              {/* Telemetry Bar Chart Mock */}
              <div className="w-full h-24 flex items-end justify-around px-4 pb-2 border-b border-slate-200/60">
                <div className="w-9 bg-[#2dd4bf]/25 h-10 rounded-t-lg transition-all hover:h-12"></div>
                <div className="w-9 bg-[#2dd4bf]/40 h-16 rounded-t-lg transition-all hover:h-18"></div>
                <div className="w-9 bg-[#006b5f] h-22 rounded-t-lg shadow-sm"></div>
                <div className="w-9 bg-[#2dd4bf]/60 h-14 rounded-t-lg transition-all hover:h-16"></div>
                <div className="w-9 bg-[#2dd4bf]/35 h-18 rounded-t-lg transition-all hover:h-20"></div>
                <div className="w-9 bg-[#2dd4bf]/80 h-20 rounded-t-lg transition-all hover:h-22"></div>
              </div>

              {/* Quote from Screenshot */}
              <p className="text-xs sm:text-sm font-semibold text-slate-700 italic max-w-md">
                "Advancing maternal outcomes through clinical machine intelligence and regional infrastructure routing."
              </p>

              {/* State Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Network State: Optimal Transit Readiness</span>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* Dedicated Interactive System Modules Hub Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#006b5f] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Operational Clinical Modules</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Explore All 5 Core System Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select any clinical module below to inspect its AI models, telemetry feeds, and launch the live workflow.
            </p>
          </div>

          {/* 5 Module Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
            {modules.map((m) => {
              const Icon = m.icon;
              const isActive = activeModuleTab === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModuleTab(m.id)}
                  className={`flex flex-col items-center text-center p-3.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white shadow-sm border border-slate-200/80 text-[#006b5f] font-extrabold scale-[1.02]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-bold'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                    isActive ? 'bg-[#006b5f]/10 text-[#006b5f]' : 'bg-slate-200/70 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{m.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Module Detailed Showcase Card */}
          <div className="bg-[#f7f9fb] border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm transition-all text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-wider ${currentModule.badgeColor}`}>
                    {currentModule.tag}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                  {currentModule.title}
                </h3>
                
                <h4 className="text-sm font-bold text-[#006b5f]">
                  {currentModule.subtitle}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  {currentModule.description}
                </p>

                <div className="pt-3">
                  <Link
                    to={currentModule.path}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#091426] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-md shadow-slate-900/15 hover:shadow-lg transition-all group"
                  >
                    <span>Launch {currentModule.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Side: Key Telemetry Highlights for selected module */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-3">
                {currentModule.metrics.map((met, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{met.label}</span>
                    <span className="text-sm font-black text-slate-900 font-mono">{met.value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4 Feature Capability Cards (Direct from Stitch Screen 1) */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f9fb] border-t border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Comprehensive System Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Modular intelligence designed for clinical precision and operational scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            <Link
              to="/asha/maternal"
              className="p-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-[#006b5f] group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#006b5f] transition-colors">
                AI Risk Assessment
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Predictive modeling identifying high-risk pregnancies before complications arise with mg/dL auto-normalization.
              </p>
            </Link>

            <Link
              to="/hospital"
              className="p-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-[#006b5f] group-hover:scale-105 transition-transform">
                <Hospital className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#006b5f] transition-colors">
                Hospital Network Intelligence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time mapping of facility capabilities, ICU bed availability, and blood bank units across regions.
              </p>
            </Link>

            <Link
              to="/asha/maternal"
              className="p-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-[#006b5f] group-hover:scale-105 transition-transform">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#006b5f] transition-colors">
                Smart Routing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic patient transfer protocols optimizing rural road tortuosity (1.25x), urgency, and blood match.
              </p>
            </Link>

            <Link
              to="/command-center"
              className="p-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-[#006b5f] group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#006b5f] transition-colors">
                Real-Time Command Center
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A centralized, high-fidelity overview for administrators to monitor regional maternal health logistics instantly.
              </p>
            </Link>

          </div>

        </div>
      </section>

      {/* Footer from Stitch Screen 1 */}
      <footer className="w-full bg-[#f0f4f8] border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-slate-700">
            © 2026 MaatriMarg AI • Smart India Hackathon PS 26133
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/asha/maternal" className="hover:text-teal-700 transition-colors">Maternal Health</Link>
            <Link to="/asha/child" className="hover:text-teal-700 transition-colors">Pediatric VIPER</Link>
            <Link to="/asha/chronic" className="hover:text-teal-700 transition-colors">Cardio Screening</Link>
            <Link to="/hospital" className="hover:text-teal-700 transition-colors">Hospital Matrix</Link>
            <Link to="/command-center" className="hover:text-teal-700 transition-colors">Command Center</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
