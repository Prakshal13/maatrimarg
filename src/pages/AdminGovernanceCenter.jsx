import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AppSidebar from '../components/AppSidebar';
import PortalHeader from '../components/PortalHeader';
import { 
  ShieldCheck, 
  Activity, 
  Wifi, 
  Clock, 
  Download, 
  Radio, 
  FileText, 
  Sliders, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Server,
  Zap,
  Lock,
  Send
} from 'lucide-react';

const AUDIT_LOGS = [
  {
    id: 'LOG-9941',
    time: '14:01:35',
    clinician: 'Dr. Ananya Deshmukh',
    clinicianId: 'MH-DOC-8492',
    action: 'ICU Capacity Override',
    targetFacility: 'KEM Hospital & Research Apex (Mumbai)',
    severity: 'WARNING',
    details: 'Allocated 2 emergency obstetrics ICU beds for high-risk referral'
  },
  {
    id: 'LOG-9940',
    time: '13:53:35',
    clinician: 'Dr. Vikram Joshi',
    clinicianId: 'MH-DOC-3190',
    action: 'Emergency Route Dispatch',
    targetFacility: 'Sassoon General & Maternity Center (Pune)',
    severity: 'CRITICAL',
    details: 'Triggered auto-dispatch for Patient #PT-8812 (Maternal Hemorrhage)'
  },
  {
    id: 'LOG-9939',
    time: '13:40:35',
    clinician: 'Dr. Priya Kulkarni',
    clinicianId: 'MH-DOC-5512',
    action: 'Facility Status Updated',
    targetFacility: 'Chhatrapati Sambhajinagar District Hospital',
    severity: 'WARNING',
    details: 'Status changed to DIVERT due to temporary zero ICU capacity'
  },
  {
    id: 'LOG-9938',
    time: '13:17:35',
    clinician: 'Automated ML Engine',
    clinicianId: 'MH-SYS-001',
    action: 'Model Retraining Check',
    targetFacility: 'Central Telemetry Node',
    severity: 'INFO',
    details: 'ICMR clinical algorithm calibration verified with 99.4% stability'
  },
  {
    id: 'LOG-9937',
    time: '12:50:35',
    clinician: 'Dr. Sameer Patil',
    clinicianId: 'MH-DOC-7721',
    action: 'Blood Bank Inventory Log',
    targetFacility: 'Nashik District Civil Hospital',
    severity: 'INFO',
    details: 'Replenished 12 units of O-negative maternal emergency reserve'
  }
];

const ROUTING_POLICIES = [
  { id: 'POL-01', name: 'Golden Hour Max Transit Radius', value: '45 km / 35 mins', status: 'ACTIVE ENFORCED', desc: 'Maximum allowable ground travel time before triggering mandatory air/hub escalation' },
  { id: 'POL-02', name: 'ICU Auto-Divert Threshold', value: '92% Occupancy', status: 'ACTIVE ENFORCED', desc: 'Automatically marks tertiary receiving center as Standby when obstetrics ICU hits capacity' },
  { id: 'POL-03', name: 'Night Emergency Transit Multiplier', value: '1.25x Buffer', status: 'ACTIVE ENFORCED', desc: 'Adjusts Haversine estimated routing velocity between 20:00 and 06:00 IST' },
  { id: 'POL-04', name: 'Pediatric VIPER Auto-Escalate', value: 'SpO2 < 90% or RR > 60', status: 'ACTIVE ENFORCED', desc: 'Auto-locks 108 emergency vehicle with pediatric oxygen & SNCU pre-arrival notification' },
];

const ACCESS_ROLES = [
  { role: 'ASHA / ANM Frontline Worker', permissions: 'Maternal Triage, Child VIPER, Cardio Screening, 108 Beacon', usersCount: '1,842 Active' },
  { role: 'Hospital Staff / CMO', permissions: 'Live Bed/NICU/Blood Capacity Editor, Patient Admissions, Clinical Analytics', usersCount: '165 Facilities' },
  { role: 'DHO Command Director', permissions: 'Full Matrix Command, Audit Export, Policy Override, Emergency Broadcast', usersCount: '36 Districts' },
];

const AdminGovernanceCenter = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'policies' | 'roles'
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const filteredLogs = severityFilter === 'ALL' 
    ? AUDIT_LOGS 
    : AUDIT_LOGS.filter(l => l.severity === severityFilter);

  const handleExportLogs = () => {
    const csvHeader = "LOG ID,TIME,CLINICIAN,CLINICIAN ID,ACTION,FACILITY,SEVERITY,DETAILS\n";
    const csvRows = AUDIT_LOGS.map(l => 
      `"${l.id}","${l.time}","${l.clinician}","${l.clinicianId}","${l.action}","${l.targetFacility}","${l.severity}","${l.details}"`
    ).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MaatriMarg_AuditLogs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastModalOpen(false);
      setBroadcastMsg('');
      alert("Emergency Broadcast Transmitted to all 36 District Hubs & 165 Hospitals.");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen bg-[#070e1c] text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Dynamic Role-Based Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070e1c] overflow-y-auto">
        
        {/* Top Header */}
        <PortalHeader 
          title={t('admin_governance')} 
          subtitle="System telemetry diagnostics, master audit trail, and regional routing governance." 
          badgeText={t('master_controls')}
        />

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 text-left">
          
          {/* Top Title & Master Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('master_controls')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                {t('admin_governance')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                System telemetry diagnostics, master audit trail, and regional routing governance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleExportLogs}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>{t('btn_export_audit')}</span>
              </button>

              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>{t('btn_broadcast_alert')}</span>
              </button>
            </div>
          </div>

          {/* Top 4 System Diagnostics Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Gateway Uptime */}
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('gateway_uptime')}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-['Plus_Jakarta_Sans']">
                  99.98%
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  24d 14h Online
                </span>
              </div>
            </div>

            {/* Card 2: ML Inference Latency */}
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('ml_latency')}
                </span>
                <Zap className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-300 font-['Plus_Jakarta_Sans']">
                  118 ms
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Peak: 142ms
                </span>
              </div>
            </div>

            {/* Card 3: Active WebSockets */}
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('active_websockets')}
                </span>
                <Wifi className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-['Plus_Jakarta_Sans']">
                  1,284
                </span>
                <span className="text-xs text-sky-400/90 font-medium">
                  connected
                </span>
              </div>
            </div>

            {/* Card 4: Emergency Routing Queue */}
            <div className="bg-[#0b1528] border border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('emergency_queue')}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
                  0 pending
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  1.2s avg
                </span>
              </div>
            </div>

          </div>

          {/* Tab Navigation: Master Audit Trail | Regional Routing Governance | Clinicians & Access Roles */}
          <div className="border-b border-slate-800 flex items-center gap-6">
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-teal-400 text-teal-300 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('tab_audit_trail')} (5)</span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'policies'
                  ? 'border-teal-400 text-teal-300 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{t('tab_regional_governance')}</span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'border-teal-400 text-teal-300 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('tab_clinician_roles')} (3)</span>
            </button>
          </div>

          {/* Tab 1: Master Audit Trail */}
          {activeTab === 'audit' && (
            <div className="bg-[#0b1528] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              
              {/* Filter by Severity Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{t('filter_severity')}:</span>
                  {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        severityFilter === sev
                          ? 'bg-teal-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-400">
                  Showing {filteredLogs.length} audit event entries
                </span>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">LOG ID &amp; TIME</th>
                      <th className="py-3 px-3">CLINICIAN</th>
                      <th className="py-3 px-3">ACTION EXECUTED</th>
                      <th className="py-3 px-3">TARGET FACILITY</th>
                      <th className="py-3 px-3">SEVERITY</th>
                      <th className="py-3 px-3">AUDIT DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-teal-300 block">{log.id}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-200 block">{log.clinician}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.clinicianId}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{log.action}</td>
                        <td className="py-3 px-3 text-slate-300">{log.targetFacility}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            log.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Tab 2: Regional Routing Governance Policies */}
          {activeTab === 'policies' && (
            <div className="bg-[#0b1528] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white font-['Plus_Jakarta_Sans']">Regional Routing Governance Policies</h3>
              <p className="text-xs text-slate-400">Algorithmic rules enforcing transit corridors and hospital referral thresholds.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {ROUTING_POLICIES.map((pol) => (
                  <div key={pol.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-teal-400 font-bold">{pol.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] font-black">
                        {pol.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">{pol.name}</h4>
                    <div className="text-base font-black text-white font-mono">{pol.value}</div>
                    <p className="text-xs text-slate-400">{pol.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Clinicians & Access Roles */}
          {activeTab === 'roles' && (
            <div className="bg-[#0b1528] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white font-['Plus_Jakarta_Sans']">Clinicians &amp; Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-400">System authorization boundaries across ASHA, Hospital CMO, and DHO Command tiers.</p>
              
              <div className="space-y-3 pt-2">
                {ACCESS_ROLES.map((role) => (
                  <div key={role.role} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white">{role.role}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Permissions: <strong className="text-slate-300">{role.permissions}</strong></p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold shrink-0 self-start sm:self-auto">
                      {role.usersCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Broadcast Emergency Alert Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setBroadcastModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0b1528] rounded-3xl p-6 shadow-2xl border border-slate-700 z-10 space-y-4 text-left">
            <div className="flex items-center gap-2 text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
              <h3 className="text-base font-black text-white">Broadcast Emergency Network Alert</h3>
            </div>
            <p className="text-xs text-slate-400">
              Broadcasts a high-priority push notification and sound alert to all logged-in ASHA workers, 108 drivers, and hospital CMO dashboards across the state.
            </p>
            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <textarea
                required
                rows={3}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="e.g. FLASH FLOOD ALERT in Gadchiroli Bhamragad sector. Divert all emergency maternal dispatches to Wardha Apex."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastSent}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{broadcastSent ? 'Transmitting Alert...' : 'Transmit Alert Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminGovernanceCenter;
