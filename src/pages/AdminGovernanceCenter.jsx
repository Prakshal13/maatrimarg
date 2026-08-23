import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/endpoints';
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

const MOCK_AUDIT_LOGS = [
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
  { id: 'POL-01', nameKey: 'pol01_name', value: '45 km / 35 mins', statusKey: 'pol_active_enforced', descKey: 'pol01_desc' },
  { id: 'POL-02', nameKey: 'pol02_name', value: '92% Occupancy', statusKey: 'pol_active_enforced', descKey: 'pol02_desc' },
  { id: 'POL-03', nameKey: 'pol03_name', value: '1.25x Buffer', statusKey: 'pol_active_enforced', descKey: 'pol03_desc' },
  { id: 'POL-04', nameKey: 'pol04_name', value: 'SpO2 < 90% or RR > 60', statusKey: 'pol_active_enforced', descKey: 'pol04_desc' },
];

const ACCESS_ROLES = [
  { roleKey: 'rbac_role_asha', permissionsKey: 'rbac_perm_asha', usersCountKey: 'rbac_count_asha' },
  { roleKey: 'rbac_role_hospital', permissionsKey: 'rbac_perm_hospital', usersCountKey: 'rbac_count_hospital' },
  { roleKey: 'rbac_role_dho', permissionsKey: 'rbac_perm_dho', usersCountKey: 'rbac_count_dho' },
];

const AdminGovernanceCenter = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'policies' | 'roles'
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getAuditLogs();
      if (res.data && res.data.length > 0) {
        const mappedLogs = res.data.map(l => ({
          id: `LOG-${l.id.toString().padStart(4, '0')}`,
          time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'N/A',
          clinician: formatClinician(l),
          clinicianId: l.actor_id ? `ID: ${l.actor_id}` : l.actor_type.toUpperCase(),
          action: formatAction(l.action),
          targetFacility: formatFacility(l),
          severity: getSeverity(l.action),
          details: formatDetails(l.action, l.details)
        }));
        setAuditLogs(mappedLogs);
      } else {
        setAuditLogs(MOCK_AUDIT_LOGS);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setAuditLogs(MOCK_AUDIT_LOGS); // fallback
    } finally {
      setLoadingLogs(false);
    }
  };

  const formatClinician = (l) => {
    if (l.actor_id) return l.actor_id;
    if (l.actor_type === 'asha') return t('clinician_asha_frontline');
    if (l.actor_type === 'hospital_staff') return t('clinician_hospital_cmo');
    if (l.actor_type === 'system') return t('clinician_ml_engine');
    return t('clinician_system_user');
  };

  const formatFacility = (l) => {
    if (l.target_type === 'referral') {
       if (l.details?.hospital_id) return `${t('assigned_hospital')} #${l.details.hospital_id}`;
       return `${t('referral_link')} #${l.target_id}`;
    }
    return `${t('target_label')}: ${l.target_type} #${l.target_id}`;
  };

  const formatDetails = (action, details) => {
    if (!details) return t('no_additional_details');
    
    if (action === 'referral_created') {
       return `${t('detail_initiated')} ${details.tier || t('dispatch_label')} ${t('detail_referral_patient')} (#${details.mother_id || t('unknown_label')})`;
    }
    if (action === 'referral_escalated') {
       return `${t('detail_escalated_new_referral')} #${details.new_referral_id}. ${t('detail_excluded_overloaded')}`;
    }
    if (action === 'status_updated') {
       const ambText = details.ambulance_id ? `${t('detail_ambulance')} ${details.ambulance_id} ${t('detail_dispatched')}.` : '';
       return `${t('detail_changed_status')} '${details.old_status}' ${t('detail_to')} '${details.new_status}'. ${ambText}`;
    }
    if (action === 'referral_acknowledged') {
       return t('detail_acknowledged_referral');
    }
    if (action === 'emergency_sos_beacon_triggered') {
       return `${t('detail_sos_beacon')} ${details.lat?.toFixed(4)}, ${details.lng?.toFixed(4)}`;
    }
    if (action === 'location_updated') {
       return `${t('detail_gps_synced')} ${details.lat?.toFixed(4)}, ${details.lng?.toFixed(4)}`;
    }
    if (action === 'sms_dispatch_sent') {
       return `${t('detail_sms_dispatched')} ${details.recipient_role || t('staff_label')} (${details.phone || 'N/A'})`;
    }
    if (action === 'hospital_capacity_updated') {
       return `${t('detail_updated_capacity')}: ${details.beds_available} ${t('detail_general_beds')}, ${details.nicu_beds_available} NICU/ICU, ${details.surgeon_on_duty ? t('detail_surgeon_active') : t('detail_no_surgeon')}`;
    }
    
    // generic fallback
    return JSON.stringify(details).replace(/[{}\"]/g, '').replace(/:/g, ': ').replace(/,/g, ', ');
  };

  const formatAction = (action) => {
    if (action === 'referral_created') return t('action_emergency_dispatch');
    if (action === 'status_updated') return t('action_status_updated');
    if (action === 'referral_acknowledged') return t('action_referral_acknowledged');
    if (action === 'referral_escalated') return t('action_icu_escalate');
    if (action === 'emergency_sos_beacon_triggered') return t('action_sos_beacon');
    if (action === 'location_updated') return t('action_gps_sync');
    if (action === 'sms_dispatch_sent') return t('action_sms_dispatch');
    if (action === 'hospital_capacity_updated') return t('action_capacity_updated');
    return action;
  };

  const getSeverity = (action) => {
    if (action === 'referral_created' || action === 'emergency_sos_beacon_triggered') return 'WARNING';
    if (action === 'referral_escalated') return 'CRITICAL';
    return 'INFO';
  };

  const filteredLogs = severityFilter === 'ALL' 
    ? auditLogs 
    : auditLogs.filter(l => l.severity === severityFilter);

  const handleExportLogs = () => {
    const csvHeader = "LOG ID,TIME,CLINICIAN,CLINICIAN ID,ACTION,FACILITY,SEVERITY,DETAILS\n";
    const csvRows = auditLogs.map(l => 
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
    <div className="flex min-h-screen bg-[#f6fafe] dark:bg-slate-950 text-[#191c1e] dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      
      {/* Dynamic Role-Based Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f6fafe] dark:bg-slate-950 overflow-y-auto">
        
        {/* Top Header */}
        <PortalHeader 
          title={t('admin_governance')} 
          subtitle={t('admin_governance_subtitle', 'System telemetry diagnostics, master audit trail, and regional routing governance.')} 
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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                {t('admin_governance')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('admin_governance_subtitle', 'System telemetry diagnostics, master audit trail, and regional routing governance.')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleExportLogs}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md cursor-pointer"
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
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('gateway_uptime')}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  99.98%
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  24d 14h Online
                </span>
              </div>
            </div>

            {/* Card 2: ML Inference Latency */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('ml_latency')}
                </span>
                <Zap className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-300 font-['Plus_Jakarta_Sans']">
                  118 ms
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Peak: 142ms
                </span>
              </div>
            </div>

            {/* Card 3: Active WebSockets */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('active_websockets')}
                </span>
                <Wifi className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  1,284
                </span>
                <span className="text-xs text-sky-400/90 font-medium">
                  connected
                </span>
              </div>
            </div>

            {/* Card 4: Emergency Routing Queue */}
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('emergency_queue')}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
                  0 pending
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  1.2s avg
                </span>
              </div>
            </div>

          </div>

          {/* Tab Navigation: Master Audit Trail | Regional Routing Governance | Clinicians & Access Roles */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-teal-400 text-teal-300 font-black'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200'
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
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200'
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
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('tab_clinician_roles')} (3)</span>
            </button>
          </div>

          {/* Tab 1: Master Audit Trail */}
          {activeTab === 'audit' && (
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              
              {/* Filter by Severity Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('filter_severity')}:</span>
                  {[
                    { key: 'ALL', label: t('sev_all') },
                    { key: 'CRITICAL', label: t('sev_critical') },
                    { key: 'WARNING', label: t('sev_warning') },
                    { key: 'INFO', label: t('sev_info') },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSeverityFilter(key)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        severityFilter === key
                          ? 'bg-teal-500 text-white dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  
                  {/* Dynamic Severity Explanation */}
                  <span className="hidden md:inline-block ml-3 text-[11px] italic text-slate-500">
                    {severityFilter === 'ALL' && t('severity_all_desc', 'Showing all telemetry and system routing events.')}
                    {severityFilter === 'CRITICAL' && t('severity_critical_desc', 'Showing high-priority urgent events, system escalations, and overrides.')}
                    {severityFilter === 'WARNING' && t('severity_warning_desc', 'Showing important dispatch events and distress beacon activations.')}
                    {severityFilter === 'INFO' && t('severity_info_desc', 'Showing routine background telemetry, GPS syncs, and automated tracking.')}
                  </span>
                </div>

                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t('showing_label')} {filteredLogs.length} {t('audit_event_entries')}
                </span>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">{t('log_id_time', 'LOG ID & TIME')}</th>
                      <th className="py-3 px-3">{t('clinician', 'CLINICIAN')}</th>
                      <th className="py-3 px-3">{t('action_executed', 'ACTION EXECUTED')}</th>
                      <th className="py-3 px-3">{t('target_facility', 'TARGET FACILITY')}</th>
                      <th className="py-3 px-3">{t('severity', 'SEVERITY')}</th>
                      <th className="py-3 px-3">{t('audit_details', 'AUDIT DETAILS')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-teal-300 block">{log.id}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-200 block">{log.clinician}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{log.clinicianId}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">{log.action}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{log.targetFacility}</td>
                        <td className="py-3 px-3">
                          <button 
                            onClick={() => setSelectedLog(log)}
                            title="Click to view full event context and situation details"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer hover:scale-105 transition-transform ${
                              log.severity === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                                : log.severity === 'WARNING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {log.severity}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 min-w-[280px] break-words whitespace-normal leading-relaxed">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Tab 2: Regional Routing Governance Policies */}
          {activeTab === 'policies' && (
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">{t('policies_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('policies_subtitle')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {ROUTING_POLICIES.map((pol) => (
                  <div key={pol.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-teal-600 dark:text-teal-400 font-bold">{pol.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[9px] font-black">
                        {t(pol.statusKey)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t(pol.nameKey)}</h4>
                    <div className="text-base font-black text-slate-900 dark:text-white font-mono">{pol.value}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t(pol.descKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Clinicians & Access Roles */}
          {activeTab === 'roles' && (
            <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">{t('rbac_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('rbac_subtitle')}</p>
              
              <div className="space-y-3 pt-2">
                {ACCESS_ROLES.map((role) => (
                  <div key={role.roleKey} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{t(role.roleKey)}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t('permissions_label')}: <strong className="text-slate-800 dark:text-slate-300">{t(role.permissionsKey)}</strong></p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-bold shrink-0 self-start sm:self-auto">
                      {t(role.usersCountKey)}
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
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0b1528] rounded-3xl p-6 shadow-2xl border border-slate-700 z-10 space-y-4 text-left">
            <div className="flex items-center gap-2 text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Broadcast Emergency Network Alert</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Broadcasts a high-priority push notification and sound alert to all logged-in ASHA workers, 108 drivers, and hospital CMO dashboards across the state.
            </p>
            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <textarea
                required
                rows={3}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="e.g. FLASH FLOOD ALERT in Gadchiroli Bhamragad sector. Divert all emergency maternal dispatches to Wardha Apex."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastSent}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{broadcastSent ? 'Transmitting Alert...' : 'Transmit Alert Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0b1528] rounded-3xl p-6 shadow-2xl border border-slate-700 z-10 space-y-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  selectedLog.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                  selectedLog.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-teal-500/20 text-teal-400'
                }`}>
                  {selectedLog.severity === 'CRITICAL' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">{selectedLog.action}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">{selectedLog.id} • {selectedLog.time}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                selectedLog.severity === 'CRITICAL' ? 'bg-rose-500 text-slate-900 dark:text-white' :
                selectedLog.severity === 'WARNING' ? 'bg-amber-500 text-slate-950' :
                'bg-teal-500 text-slate-950'
              }`}>
                {selectedLog.severity}
              </span>
            </div>
            
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Actor / Clinician</p>
                <p className="text-sm font-semibold text-slate-200">{selectedLog.clinician}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{selectedLog.clinicianId}</p>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Target Facility / Entity</p>
                <p className="text-sm font-semibold text-sky-300">{selectedLog.targetFacility}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Situation / Audit Details</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                  {selectedLog.details}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminGovernanceCenter;
