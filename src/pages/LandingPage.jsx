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
      
      {/* Stitch Design DNA: Ambient Blurred Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#f7f9fb]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d8e3fb] rounded-full blur-[120px] opacity-25 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#9ff2e2] rounded-full blur-[100px] opacity-25 transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Hero Section with Three.js Background */}
      <section className="w-full flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-6 pb-20 z-10 max-w-7xl mx-auto">
        
        {/* Three.js Background Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60 mix-blend-multiply rounded-3xl min-h-[520px]">
          <NetworkThreeGlobe />
        </div>

        {/* Central Content Header */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center mt-6">
          
          {/* Status Badge with Stitch pulse-node animation */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e0e3e5]/80 border border-[#e2e8f0] animate-reveal mb-5 backdrop-blur-md shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-[#2dd4bf] pulse-node"></div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#45474c]">
              National Command Infrastructure Active
            </span>
          </div>

          {/* Main Display Headline with Stitch negative letter spacing */}
          <h1 className="text-4xl sm:text-6xl font-bold text-[#1e293b] tracking-[-0.02em] leading-[1.15] max-w-3xl animate-reveal animate-reveal-delay-1 font-['Plus_Jakarta_Sans']">
            Maternal Healthcare Intelligence
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#45474c] max-w-2xl mt-5 leading-relaxed font-normal animate-reveal animate-reveal-delay-2">
            Predict risk. Optimize healthcare access. Connect mothers with the right care at the right time. The definitive command center for clinical logistics.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto animate-reveal animate-reveal-delay-3">
            <Link
              to="/command-center"
              className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-sm sm:text-base py-4 px-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <span>Login to Command Center</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            <Link
              to="/hospital"
              className="bg-white/80 border border-[#e2e8f0] text-[#1e293b] hover:bg-slate-50 font-semibold text-sm sm:text-base py-4 px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center shadow-2xs backdrop-blur-sm"
            >
              Explore Platform
            </Link>
          </div>

        </div>

        {/* Conceptual Dashboard Preview (Glassmorphic Card matching Stitch Screen 1) */}
        <div className="w-full max-w-5xl mt-20 mb-12 relative z-10 animate-reveal animate-reveal-delay-3">
          <div className="glass-card w-full relative overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.07)] p-6 sm:p-8 flex items-center justify-center border-t border-white/70">
            
            {/* Abstract visualization network overlay */}
            <div className="absolute inset-0 bg-cover bg-center w-full h-full opacity-20 mix-blend-darken pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#006b5f 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
            />

            {/* UI Overlay Mock Inside Glass Container */}
            <div className="relative w-full rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md flex p-6 gap-6 flex-col md:flex-row items-stretch">
              
              {/* Left Sub-Card: Active Monitoring */}
              <div className="w-full md:w-1/3 bg-white/85 rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between text-left gap-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-[#e0e3e5] rounded"></div>
                  <div className="w-2 h-2 rounded-full bg-[#2dd4bf] pulse-node"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full bg-[#eceef0] rounded-full"></div>
                  <div className="h-2 w-5/6 bg-[#eceef0] rounded-full"></div>
                  <div className="h-2 w-4/6 bg-[#eceef0] rounded-full"></div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200/80">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#006b5f]">
                    Active Monitoring
                  </div>
                  <div className="text-3xl font-bold text-[#1e293b] font-['Plus_Jakarta_Sans']">
                    98.2%
                  </div>
                </div>
              </div>

              {/* Right Sub-Card: Telemetry Bar Visualizer & Quote */}
              <div className="w-full md:w-2/3 bg-white/85 rounded-xl shadow-sm border border-slate-200/80 p-6 flex flex-col items-center justify-center text-center gap-6">
                
                {/* 5-Bar Chart Visualizer from Stitch Screen 1 */}
                <div className="relative w-full h-28 flex items-end justify-around px-4 pb-2 border-b border-slate-200/60">
                  <div className="w-8 bg-[#2dd4bf]/20 h-12 rounded-t hover:h-14 transition-all"></div>
                  <div className="w-8 bg-[#2dd4bf]/40 h-20 rounded-t hover:h-22 transition-all"></div>
                  <div className="w-8 bg-[#2dd4bf] h-28 rounded-t shadow-xs"></div>
                  <div className="w-8 bg-[#2dd4bf]/60 h-16 rounded-t hover:h-18 transition-all"></div>
                  <div className="w-8 bg-[#2dd4bf]/30 h-24 rounded-t hover:h-26 transition-all"></div>
                </div>

                {/* Italic Clinical Quote */}
                <p className="text-sm font-semibold text-[#1e293b] italic max-w-md">
                  "Advancing Maternal Health through Clinical Intelligence and Network Excellence"
                </p>

                {/* Network Status Pill */}
                <div className="flex gap-2">
                  <div className="px-3.5 py-1 rounded-full bg-[#eceef0] border border-slate-200/80 text-[11px] font-bold text-[#45474c] uppercase tracking-wider">
                    Network Status: Optimal
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </section>

      {/* Feature Preview Section (4 Glass Cards matching Stitch Screen 1) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-white/60 relative z-10 border-t border-[#e2e8f0]/80">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1e293b] font-['Plus_Jakarta_Sans'] tracking-tight">
              Comprehensive System Capabilities
            </h2>
            <p className="text-sm text-[#45474c]">
              Modular intelligence designed for clinical precision and operational scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Card 1: AI Risk Assessment */}
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

            {/* Card 2: Hospital Network Intelligence */}
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

            {/* Card 3: Smart Routing */}
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

            {/* Card 4: Real-Time Command Center */}
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
