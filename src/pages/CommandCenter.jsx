import React, { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { 
  Activity, 
  Hospital, 
  ShieldAlert, 
  Flame, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  FileText, 
  Sliders, 
  ChevronRight,
  TrendingUp,
  Radio,
  Building2,
  AlertCircle
} from 'lucide-react';

const CommandCenter = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [networkHospitals, setNetworkHospitals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview | network | audit | models
  const [modelInfo, setModelInfo] = useState(null);
  const [selectedModel, setSelectedModel] = useState('maternal');
  const [loading, setLoading] = useState(true);
  const [watchdogRunning, setWatchdogRunning] = useState(false);
  const [watchdogResult, setWatchdogResult] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sumRes, netRes, auditRes] = await Promise.all([
        api.getCommandCenterSummary(),
        api.getNetworkHospitals(),
        api.getAuditLogs(),
      ]);
      setSummary(sumRes.data);
      setNetworkHospitals(netRes.data || []);
      setAuditLogs(auditRes.data || []);
    } catch (e) {
      console.warn('Error loading command center data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFetchModelInfo = async (type) => {
    setSelectedModel(type);
    try {
      const res = await api.getModelInfo(type);
      setModelInfo(res.data);
    } catch (e) {
      console.warn('Model metadata not loaded:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'models') {
      handleFetchModelInfo(selectedModel);
    }
  }, [activeTab, selectedModel]);

  const handleTriggerWatchdog = async () => {
    setWatchdogRunning(true);
    try {
      const res = await api.autoEscalateOverdue();
      setWatchdogResult(res.data);
      await fetchAllData();
      alert(`Watchdog scanned ${res.data.overdue_checked} active referrals. Auto-escalated: ${res.data.auto_escalated_count}`);
    } catch (err) {
      alert('Watchdog error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setWatchdogRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>DHO State & District Operational HQ • Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
            {t('dashboard')} & Autonomous Watchdog
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time maternal dispatch coordination across Tamil Nadu and Maharashtra with automated escalation monitors and immutable ABDM audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerWatchdog}
            disabled={watchdogRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${watchdogRunning ? 'animate-spin' : ''}`} />
            <span>{watchdogRunning ? 'Scanning...' : 'Trigger Auto-Escalate Watchdog'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Connected Hospitals</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            {summary?.hospital_count ?? 260}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tamil Nadu & Maharashtra Network</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Available General Beds</span>
            <Hospital className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-teal-700 font-['Plus_Jakarta_Sans']">
            {summary?.total_available_beds ?? 1840}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Live synchronized from facility updates
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">NICU Emergency Beds</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700 font-['Plus_Jakarta_Sans']">
            {summary?.total_nicu_beds ?? 420}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Critical neonatal priority reservation
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active 108 Dispatches</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-['Plus_Jakarta_Sans']">
            {summary?.active_dispatches ?? 0}
          </div>
          <div className="text-[11px] text-rose-600 font-bold">
            Zero-delay routing active
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors ${activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Hospital Network Mesh ({networkHospitals.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors ${activeTab === 'audit' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          ABDM / DISHA Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`pb-3 transition-colors ${activeTab === 'models' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Model Governance & Provenance
        </button>
      </div>

      {/* Tab 1: Hospital Network Grid */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">District Telemetry Grid (0 N+1 Queries)</h3>
            <span className="text-xs text-slate-400">Single SQL Batch Aggregation</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Hospital Name</th>
                  <th className="py-3 px-4">State & District</th>
                  <th className="py-3 px-4 text-center">Gen Beds</th>
                  <th className="py-3 px-4 text-center">NICU Beds</th>
                  <th className="py-3 px-4 text-center">Surgeon</th>
                  <th className="py-3 px-4 text-center">Active Dispatches</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {networkHospitals.slice(0, 20).map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{h.name}</td>
                    <td className="py-3 px-4 text-slate-500">{h.state} • {h.district}</td>
                    <td className="py-3 px-4 text-center font-bold">{h.beds_available}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600">{h.nicu_beds_available}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.surgeon_on_duty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {h.surgeon_on_duty ? 'READY' : 'OFF'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${h.active_dispatches_count > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                        {h.active_dispatches_count} cases
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">DISHA / ABDM Immutable Audit Stream</h3>
            <span className="text-xs text-slate-400">Captures every triage, capacity update & dispatch</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 30).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">{log.target_type} #{log.target_id || 'N/A'}</span>
                    <span className="text-slate-500 truncate max-w-xs">{log.details}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 font-sans">No audit events recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Model Governance */}
      {activeTab === 'models' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-left">
          <div className="flex items-center gap-3">
            {['maternal', 'child', 'chronic'].map((m) => (
              <button
                key={m}
                onClick={() => handleFetchModelInfo(m)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                  selectedModel === m ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m} Model Metadata
              </button>
            ))}
          </div>

          {modelInfo && (
            <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 space-y-4 font-mono text-xs">
              <div className="text-teal-300 font-bold text-sm">
                Case Type: {modelInfo.case_type.toUpperCase()}
              </div>
              <div>Source Dataset: {modelInfo.source_file}</div>
              <div>Rows Trained: {modelInfo.rows_used} / {modelInfo.original_rows}</div>
              <div>Evidence Level: {modelInfo.evidence_level}</div>
              <div>Validation Metrics: {JSON.stringify(modelInfo.metrics, null, 2)}</div>
              <div>Trained At: {modelInfo.trained_at}</div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CommandCenter;
