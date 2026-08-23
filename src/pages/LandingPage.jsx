import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/endpoints';
import NetworkThreeGlobe from '../components/NetworkThreeGlobe';
import { 
  HeartPulse, 
  Activity, 
  Hospital, 
  ShieldCheck, 
  Navigation, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Clock, 
  Sparkles,
  Baby,
  ActivitySquare
} from 'lucide-react';

const LandingPage = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState({
    hospital_count: 260,
    districts_covered: 14,
    total_available_beds: 1840,
    total_nicu_beds: 420,
    active_dispatches: 8,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.getCommandCenterSummary();
        if (res.data) {
          setSummary(prev => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch (e) {
        // Fallback to initial realistic seed stats
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f6fafe] via-[#f0f4f8] to-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* SIH Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>{t('hero_badge')}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] font-['Plus_Jakarta_Sans']">
              {t('hero_title')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              {t('hero_subtitle')}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/command-center"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
              >
                <Activity className="w-4 h-4" />
                {t('launch_command_center')}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/asha/maternal"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all hover:scale-[1.02]"
              >
                <HeartPulse className="w-4 h-4 text-rose-500" />
                {t('asha_field_app')}
              </Link>

              <Link
                to="/hospital"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all hover:scale-[1.02]"
              >
                <Hospital className="w-4 h-4 text-teal-600" />
                {t('hospital_bed_manager')}
              </Link>
            </div>

            {/* State Tags */}
            <div className="pt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Maharashtra (Gadchiroli, Melghat, Pune)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tamil Nadu (Chennai, Chengalpattu)
              </span>
            </div>

          </div>

          {/* Right Column: 3D Interactive Three.js Network Globe */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full rounded-2xl bg-gradient-to-tr from-slate-900 via-[#131b2e] to-slate-900 border border-slate-800 shadow-2xl p-2 relative overflow-hidden group">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-semibold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active Routing Mesh • Dijkstra Algorithm</span>
              </div>
              <NetworkThreeGlobe />
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-bold text-teal-300">
                <span>{summary.hospital_count}+ Facilities Connected</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-700 font-['Plus_Jakarta_Sans']">
              {summary.hospital_count}+
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">{t('stat_hospitals')}</div>
            <div className="text-[11px] text-slate-400">Tamil Nadu & Maharashtra</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
              {summary.districts_covered || 14}+
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">{t('stat_districts')}</div>
            <div className="text-[11px] text-slate-400">High-priority tribal blocks</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 font-['Plus_Jakarta_Sans']">
              96.3%
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">{t('stat_accuracy')}</div>
            <div className="text-[11px] text-slate-400">{t('stat_accuracy_sub')}</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 font-['Plus_Jakarta_Sans']">
              0-Delay
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">{t('stat_reduction')}</div>
            <div className="text-[11px] text-slate-400">{t('stat_reduction_sub')}</div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Engineered for Ground Realities in Rural India
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Solving the 3 Delays Model (Delay in Decision, Delay in Reaching, Delay in Receiving Care) through unified clinical intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Edge AI */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('feat_1_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('feat_1_desc')}
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">mg/dL Auto-Detect</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">मराठी / தமிழ் / हिन्दी</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">VIPER Triage</span>
            </div>
          </div>

          {/* Card 2: Graph Routing */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('feat_2_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('feat_2_desc')}
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">1.25x Tortuosity Factor</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">ABO/Rh Blood Transfusion Matrix</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">NICU Priority Match</span>
            </div>
          </div>

          {/* Card 3: Auto-Escalation & Compliance */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('feat_3_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('feat_3_desc')}
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Auto-Escalate Watchdog</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">ABDM Audit Log</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">DISHA Privacy Mask</span>
            </div>
          </div>

        </div>
      </section>

      {/* Portals Direct Access */}
      <section className="py-12 bg-slate-900 text-white px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-black font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                {t('app_title')} Role Portals
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select your designated role to launch the operational workflow
              </p>
            </div>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Role Login & Demo Credentials
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left">
            <Link
              to="/asha/maternal"
              className="p-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Field Worker</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">{t('portal_asha')}</h4>
              <p className="text-xs text-slate-400">
                Patient registration, live ML triage, local language explanations & 108 dispatch.
              </p>
            </Link>

            <Link
              to="/hospital"
              className="p-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Facility CMO</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">{t('portal_hospital')}</h4>
              <p className="text-xs text-slate-400">
                Live bed, NICU & blood inventory updates, incoming case acknowledgment.
              </p>
            </Link>

            <Link
              to="/command-center"
              className="p-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">District HQ</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">{t('portal_dho')}</h4>
              <p className="text-xs text-slate-400">
                Live hospital network telemetry, auto-escalation watchdog & ABDM audit trails.
              </p>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
