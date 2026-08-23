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

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.getCommandCenterSummary();
        setSummary(res.data);
      } catch (e) {
        // Silent fallback
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased relative overflow-x-hidden font-sans">
      
      {/* Ambient Blurred Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#f7f9fb]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d8e3fb] rounded-full blur-[120px] opacity-25 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#9ff2e2] rounded-full blur-[100px] opacity-25 transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Hero Section matching Screenshot */}
      <section className="w-full flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-8 pb-16 z-10 max-w-7xl mx-auto">
        
        {/* Central Content Header */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
          
          {/* Status Badge from Screenshot */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e2e8f0]/60 border border-[#cbd5e1]/60 mb-6 shadow-2xs backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] pulse-node"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#45474c]">
              • NATIONAL COMMAND INFRASTRUCTURE ACTIVE • MAHARASHTRA
            </span>
          </div>

          {/* Main 2-Line Headline matching Screenshot */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl font-['Plus_Jakarta_Sans']">
            <span className="text-[#091426] block">Maternal Healthcare</span>
            <span className="text-[#006b5f] block mt-1">Intelligence Platform</span>
          </h1>

          {/* Subtitle from Screenshot */}
          <p className="text-sm sm:text-base text-[#475569] max-w-2xl mt-5 leading-relaxed font-normal">
            Predict clinical risk. Optimize real-time ICU bed allocation. Seamlessly route mothers to the right tertiary facilities across districts.
          </p>

          {/* Action Buttons matching Screenshot */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto z-20">
            
            {/* Red / Crimson Login Button from Screenshot */}
            <Link
              to="/login"
              className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-sm py-3.5 px-7 rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 group"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>Login Here</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            {/* White / Teal Explore Matrix Button from Screenshot */}
            <Link
              to="/hospital"
              className="bg-white/90 hover:bg-white border border-slate-200 text-slate-800 font-bold text-sm py-3.5 px-6 rounded-xl shadow-xs transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="text-[#006b5f] font-black text-base">✱</span>
              <span>Explore Live Matrix</span>
            </Link>

          </div>

        </div>

        {/* Central Three.js 3D Globe Canvas (Positioned right behind & above card) */}
        <div className="relative w-full max-w-4xl h-36 sm:h-44 -mt-6 z-0 overflow-visible pointer-events-none flex items-center justify-center">
          <div className="w-full h-[400px] absolute -top-24">
            <NetworkThreeGlobe />
          </div>
        </div>

        {/* Floating Glassmorphic Telemetry Card (Exact from Screenshot) */}
        <div className="w-full max-w-4xl -mt-6 relative z-10">
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-stretch">
            
            {/* Left Sub-card: Active Monitoring KPI */}
            <div className="w-full md:w-1/3 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/60 flex flex-col justify-between text-left space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#006b5f] uppercase tracking-wider">
                  ACTIVE MONITORING
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] pulse-node"></span>
              </div>

              <div className="space-y-2.5">
                <div className="h-2 w-full bg-slate-200 rounded-full"></div>
                <div className="h-2 w-4/5 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-3/5 bg-slate-200 rounded-full"></div>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                  98.4%
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                  Network Operational Fidelity
                </div>
              </div>
            </div>

            {/* Right Sub-card: 5-Bar Visualizer & Quote */}
            <div className="w-full md:w-2/3 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/60 flex flex-col items-center justify-center text-center gap-5">
              
              {/* Telemetry Bar Chart matching Screenshot */}
              <div className="w-full h-28 flex items-end justify-around px-4 pb-2 border-b border-slate-200/60">
                <div className="w-9 bg-[#2dd4bf]/25 h-12 rounded-t-lg transition-all hover:h-14"></div>
                <div className="w-9 bg-[#2dd4bf]/45 h-20 rounded-t-lg transition-all hover:h-22"></div>
                <div className="w-9 bg-[#2dd4bf] h-28 rounded-t-lg shadow-sm"></div>
                <div className="w-9 bg-[#2dd4bf]/60 h-16 rounded-t-lg transition-all hover:h-18"></div>
                <div className="w-9 bg-[#2dd4bf]/35 h-24 rounded-t-lg transition-all hover:h-26"></div>
              </div>

              {/* Italic Clinical Quote */}
              <p className="text-xs sm:text-sm font-semibold text-slate-700 italic max-w-md">
                "Advancing maternal outcomes through clinical machine intelligence and regional infrastructure routing."
              </p>

              {/* State Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Network State: Optimal Transit Readiness</span>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* 4 Feature Capability Cards */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 relative z-10">
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
            
            <div className="glass-card p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 flex items-center justify-center text-[#006b5f] mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  health_and_safety
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] group-hover:text-[#006b5f] transition-colors">
                AI Risk Assessment
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] leading-relaxed">
                Predictive modeling identifying high-risk pregnancies before complications arise, ensuring proactive clinical intervention.
              </p>
            </div>

            <div className="glass-card p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 flex items-center justify-center text-[#006b5f] mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_tree
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] group-hover:text-[#006b5f] transition-colors">
                Hospital Network Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] leading-relaxed">
                Real-time mapping of facility capabilities, bed availability, and specialized care units across regions.
              </p>
            </div>

            <div className="glass-card p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 flex items-center justify-center text-[#006b5f] mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  route
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] group-hover:text-[#006b5f] transition-colors">
                Smart Routing
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] leading-relaxed">
                Algorithmic patient transfer protocols optimizing distance, urgency, and specific facility readiness.
              </p>
            </div>

            <div className="glass-card p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-[#2dd4bf]/15 flex items-center justify-center text-[#006b5f] mb-2">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  dashboard_customize
                </span>
              </div>
              <h3 className="font-bold text-base text-[#1e293b] group-hover:text-[#006b5f] transition-colors">
                Real-Time Command Center
              </h3>
              <p className="text-xs sm:text-sm text-[#45474c] leading-relaxed">
                A centralized, high-fidelity overview for administrators to monitor regional maternal health logistics instantly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer from Stitch Screen 1 */}
      <footer className="w-full mt-auto bg-[#ffffff] border-t border-[#e2e8f0]">
        <div className="flex flex-col md:flex-row justify-between items-center py-6 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto gap-4 text-xs text-[#45474c]">
          <div className="font-bold text-[#1e293b]">
            © 2026 MaatriMarg AI. Clinical Precision, Human Care. • Smart India Hackathon PS 26133
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Terms of Service: MaatriMarg Clinical AI & Regional Health Protocol (Ayushman Bharat / DISHA Compliant)"); }} className="hover:text-[#006b5f] transition-colors">
              Terms of Service
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Data Privacy: End-to-End Encrypted Patient Telemetry & Anonymized PHI Storage"); }} className="hover:text-[#006b5f] transition-colors">
              Data Privacy
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("System Admin: Contact District Health Command HQ (DHO Technical Operations)"); }} className="hover:text-[#006b5f] transition-colors">
              Contact System Admin
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
