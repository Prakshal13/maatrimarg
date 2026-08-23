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
        // Fallback realistic metrics
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased relative overflow-x-hidden font-sans">
      
      {/* Ambient Blurred Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Hero Section */}
      <section className="w-full flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-6 pb-16 z-10 max-w-7xl mx-auto">
        
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

        {/* Floating Glassmorphic Telemetry Card (Exact from Stitch Screen 1) */}
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

      {/* 4 Feature Capability Cards (Exact from Stitch Screen 1) */}
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
            
            <Link
              to="/asha/maternal"
              className="p-6 rounded-2xl bg-[#f7f9fb] hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
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
              className="p-6 rounded-2xl bg-[#f7f9fb] hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
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
              className="p-6 rounded-2xl bg-[#f7f9fb] hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
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
              className="p-6 rounded-2xl bg-[#f7f9fb] hover:bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 group"
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold text-slate-700">
            © 2026 MaatriMarg AI. Clinical Precision, Human Care. • Smart India Hackathon PS 26133
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-600">
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Terms of Service: MaatriMarg Clinical AI & Regional Health Protocol (Ayushman Bharat / DISHA Compliant)"); }} className="hover:text-teal-700 transition-colors">Terms of Service</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Data Privacy: End-to-End Encrypted Patient Telemetry & Anonymized PHI Storage"); }} className="hover:text-teal-700 transition-colors">Data Privacy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("System Admin: Contact District Health Command HQ (DHO Technical Operations)"); }} className="hover:text-teal-700 transition-colors">Contact System Admin</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
