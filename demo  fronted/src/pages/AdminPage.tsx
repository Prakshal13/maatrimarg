import React, { useState } from 'react';
import { TopNavBar } from '../components/common/TopNavBar';
import { SideNavBar } from '../components/common/SideNavBar';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface AuditLog {
  id: string;
  timestamp: string;
  clinicianId: string;
  clinicianName: string;
  action: string;
  facility: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}

interface ClinicianRecord {
  id: string;
  name: string;
  role: string;
  district: string;
  status: 'ACTIVE' | 'STANDBY' | 'OFF_DUTY';
  lastActive: string;
}

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'LOG-9941',
    timestamp: new Date(Date.now() - 4 * 60000).toLocaleTimeString(),
    clinicianId: 'MH-DOC-8492',
    clinicianName: 'Dr. Ananya Deshmukh',
    action: 'ICU Capacity Override',
    facility: 'KEM Hospital & Research Apex (Mumbai)',
    severity: 'WARNING',
    details: 'Allocated 2 emergency obstetrics ICU beds for high-risk transfer'
  },
  {
    id: 'LOG-9940',
    timestamp: new Date(Date.now() - 12 * 60000).toLocaleTimeString(),
    clinicianId: 'MH-DOC-3190',
    clinicianName: 'Dr. Vikram Joshi',
    action: 'Emergency Route Dispatch',
    facility: 'Sassoon General & Maternity Center (Pune)',
    severity: 'CRITICAL',
    details: 'Triggered auto-dispatch for Patient #PT-8812 (Maternal Risk Score: 78)'
  },
  {
    id: 'LOG-9939',
    timestamp: new Date(Date.now() - 25 * 60000).toLocaleTimeString(),
    clinicianId: 'MH-DOC-5512',
    clinicianName: 'Dr. Priya Kulkarni',
    action: 'Facility Status Updated',
    facility: 'Chhatrapati Sambhajinagar District Hospital',
    severity: 'WARNING',
    details: 'Status changed to DIVERT due to temporary zero ICU bed availability'
  },
  {
    id: 'LOG-9938',
    timestamp: new Date(Date.now() - 48 * 60000).toLocaleTimeString(),
    clinicianId: 'MH-SYS-001',
    clinicianName: 'Automated ML Engine',
    action: 'Model Retraining Check',
    facility: 'Central Telemetry Node',
    severity: 'INFO',
    details: 'ICMR clinical algorithm calibration verified with 99.4% confidence index'
  },
  {
    id: 'LOG-9937',
    timestamp: new Date(Date.now() - 75 * 60000).toLocaleTimeString(),
    clinicianId: 'MH-DOC-7721',
    clinicianName: 'Dr. Sameer Patil',
    action: 'Blood Bank Inventory Log',
    facility: 'Nashik District Civil Hospital',
    severity: 'INFO',
    details: 'Replenished 12 units of O-negative maternal emergency plasma'
  }
];

const INITIAL_CLINICIANS: ClinicianRecord[] = [
  {
    id: 'MH-DOC-8492',
    name: 'Dr. Ananya Deshmukh',
    role: 'Chief Medical Officer & Regional Director',
    district: 'Mumbai Apex',
    status: 'ACTIVE',
    lastActive: 'Just now'
  },
  {
    id: 'MH-DOC-3190',
    name: 'Dr. Vikram Joshi',
    role: 'Lead Obstetric Consultant',
    district: 'Pune Division',
    status: 'ACTIVE',
    lastActive: '12m ago'
  },
  {
    id: 'MH-DOC-5512',
    name: 'Dr. Priya Kulkarni',
    role: 'Emergency Maternal Logistics Lead',
    district: 'Chhatrapati Sambhajinagar',
    status: 'ACTIVE',
    lastActive: '25m ago'
  },
  {
    id: 'MH-DOC-7721',
    name: 'Dr. Sameer Patil',
    role: 'District Civil Surgeon',
    district: 'Nashik',
    status: 'STANDBY',
    lastActive: '1h ago'
  },
  {
    id: 'MH-DOC-9043',
    name: 'Dr. Neha Shinde',
    role: 'Obstetric Dispatch Officer',
    district: 'Nagpur',
    status: 'OFF_DUTY',
    lastActive: '4h ago'
  }
];

export const AdminPage: React.FC = () => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'config' | 'staff'>('audit');
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  const [clinicians, setClinicians] = useState<ClinicianRecord[]>(INITIAL_CLINICIANS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Regional Config Form State
  const [maxRadius, setMaxRadius] = useState('75');
  const [divertThreshold, setDivertThreshold] = useState('5');
  const [riskThreshold, setRiskThreshold] = useState('65');
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // New Clinician Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClinician, setNewClinician] = useState({
    id: `MH-DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    role: 'Lead Obstetric Consultant',
    district: 'Mumbai Apex'
  });

  const { user } = useAuth();
  const { t, language } = useThemeLanguage();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      language === 'mr'
        ? 'प्रादेशिक संदर्भ मार्ग व जोखीम नियमन यशस्वीरित्या सेव्ह झाले!'
        : language === 'hi'
        ? 'क्षेत्रीय रूटिंग एवं जोखिम प्रशासन कॉन्फ़िगरेशन सफलतापूर्वक सहेजा गया!'
        : 'Regional Routing & Risk Threshold Configuration Saved Successfully!'
    );
  };

  const handleAddClinician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinician.name) return;

    const record: ClinicianRecord = {
      id: newClinician.id,
      name: newClinician.name,
      role: newClinician.role,
      district: newClinician.district,
      status: 'ACTIVE',
      lastActive: language === 'mr' ? 'आत्ताच' : language === 'hi' ? 'अभी-अभी' : 'Just now'
    };

    setClinicians([record, ...clinicians]);
    setShowAddModal(false);
    setNewClinician({
      id: `MH-DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      role: 'Lead Obstetric Consultant',
      district: 'Mumbai Apex'
    });

    const newLog: AuditLog = {
      id: `LOG-${Math.floor(9900 + Math.random() * 100)}`,
      timestamp: new Date().toLocaleTimeString(),
      clinicianId: user?.id || 'MH-DOC-8492',
      clinicianName: user?.name || 'Dr. Ananya Deshmukh',
      action: language === 'mr' ? 'वैद्यकीय अधिकारी अधिकृत केले' : language === 'hi' ? 'चिकित्सा अधिकारी अधिकृत' : 'Clinician Authorized',
      facility: newClinician.district,
      severity: 'INFO',
      details: `${newClinician.name} (${newClinician.id}) registered.`
    };
    setLogs([newLog, ...logs]);
    showToast(
      language === 'mr'
        ? `डॉ. ${newClinician.name} यशस्वीरित्या नोंदणीकृत झाले!`
        : language === 'hi'
        ? `डॉ. ${newClinician.name} सफलतापूर्वक पंजीकृत हुए!`
        : `Clinician ${newClinician.name} successfully registered!`
    );
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.severity === logFilter;
  });

  const handleExportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Log ID,Timestamp,Clinician ID,Clinician Name,Action,Facility,Severity,Details\n"
      + logs.map(l => `"${l.id}","${l.timestamp}","${l.clinicianId}","${l.clinicianName}","${l.action}","${l.facility}","${l.severity}","${l.details}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maatrimarg_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      language === 'mr'
        ? 'ऑडिट लॉग CSV स्वरूपात डाऊनलोड झाले.'
        : language === 'hi'
        ? 'ऑडिट लॉग CSV प्रारूप में सफलतापूर्वक डाउनलोड हुआ।'
        : 'Audit Log exported successfully as CSV.'
    );
  };

  return (
    <div className="bg-background dark:bg-slate-950 text-on-surface min-h-screen flex flex-col md:flex-row transition-colors">
      <SideNavBar
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-[280px] w-full min-h-screen">
        <TopNavBar onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)} />

        <main className="p-4 md:p-margin-page flex-1 flex flex-col w-full max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[24px]">
                  admin_panel_settings
                </span>
                <h2 className="text-2xl font-bold text-primary dark:text-slate-100 tracking-tight">
                  {t('adminGovernanceCenter')}
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary dark:text-teal-400 border border-secondary/30">
                  {t('masterControls')}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">
                {t('adminGovernanceSub')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportLogs}
                className="px-3.5 py-2 rounded-lg border border-surface-border dark:border-slate-700 bg-surface-container-lowest dark:bg-slate-900 hover:bg-surface-container-low text-xs font-semibold text-primary dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                {t('exportAuditLogs')}
              </button>

              <button
                onClick={() =>
                  showToast(
                    language === 'mr'
                      ? 'सर्व ३६ जिल्ह्यांमध्ये आपत्कालीन अलर्ट संदेश पाठवण्यात आला.'
                      : language === 'hi'
                      ? 'सभी 36 जिलों में आपातकालीन अलर्ट संदेश प्रसारित किया गया।'
                      : 'Regional broadcast emergency test ping dispatched across 36 district hubs.'
                  )
                }
                className="px-3.5 py-2 rounded-lg bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                {t('broadcastAlert')}
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="p-3 bg-secondary/10 dark:bg-teal-500/20 border border-secondary/30 dark:border-teal-500/40 rounded-xl text-xs font-semibold text-secondary dark:text-teal-300 flex items-center gap-2 animate-reveal">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{toastMsg}</span>
            </div>
          )}

          {/* System Health Diagnostics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('gatewayUptime')}
                </span>
                <span className="w-2 h-2 rounded-full bg-status-success animate-ping" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-primary dark:text-slate-100">99.98%</span>
                <span className="text-xs text-status-success font-bold font-mono">
                  24d 14h {language === 'mr' ? 'सक्रिय' : language === 'hi' ? 'सक्रिय' : 'Online'}
                </span>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('mlLatency')}
                </span>
                <span className="material-symbols-outlined text-teal-accent text-sm">speed</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-primary dark:text-slate-100">118 ms</span>
                <span className="text-xs text-on-surface-variant dark:text-slate-400">
                  {language === 'mr' ? 'कमाल: १४२ms' : language === 'hi' ? 'शीर्ष: 142ms' : 'Peak: 142ms'}
                </span>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('activeWebsockets')}
                </span>
                <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-sm">sensors</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">1,284</span>
                <span className="text-xs text-on-surface-variant dark:text-slate-400">
                  {language === 'mr' ? 'थेट कनेक्ट' : language === 'hi' ? 'लाइव कनेक्टेड' : 'connected'}
                </span>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('routingQueue')}
                </span>
                <span className="material-symbols-outlined text-status-success text-sm">task_alt</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-primary dark:text-slate-100">
                  {language === 'mr' ? '० प्रलंबित' : language === 'hi' ? '0 लंबित' : '0 pending'}
                </span>
                <span className="text-xs text-status-success font-bold font-mono">
                  {language === 'mr' ? '१.२ सेकंद' : language === 'hi' ? '1.2s औसत' : '1.2s avg'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-surface-border dark:border-slate-800 gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'border-secondary dark:border-teal-400 text-secondary dark:text-teal-400'
                  : 'border-transparent text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              {t('masterAuditTrailTab')} ({logs.length})
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'border-secondary dark:border-teal-400 text-secondary dark:text-teal-400'
                  : 'border-transparent text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              {t('regionalGovTab')}
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'border-secondary dark:border-teal-400 text-secondary dark:text-teal-400'
                  : 'border-transparent text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              {t('cliniciansTab')} ({clinicians.length})
            </button>
          </div>

          {/* TAB 1: MASTER AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col animate-reveal">
              <div className="p-4 border-b border-surface-border dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant dark:text-slate-400">
                    {t('filterBySeverity')}
                  </span>
                  {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setLogFilter(sev)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        logFilter === sev
                          ? 'bg-primary dark:bg-teal-500 text-white dark:text-slate-950 shadow-xs'
                          : 'bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-400 hover:text-primary'
                      }`}
                    >
                      {sev === 'ALL'
                        ? language === 'mr'
                          ? 'सर्व'
                          : language === 'hi'
                          ? 'सभी'
                          : 'ALL'
                        : sev}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-on-surface-variant dark:text-slate-400 font-mono">
                  {language === 'mr'
                    ? `${filteredLogs.length} नोंदी दाखवत आहे`
                    : language === 'hi'
                    ? `${filteredLogs.length} प्रविष्टियां प्रदर्शित`
                    : `Showing ${filteredLogs.length} audit event entries`}
                </span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead className="bg-surface-container-low dark:bg-slate-800/90 border-b border-surface-border dark:border-slate-800 text-on-surface-variant dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">
                        {language === 'mr' ? 'लॉग आयडी व वेळ' : language === 'hi' ? 'लॉग आईडी व समय' : 'Log ID & Time'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'वैद्यकीय अधिकारी' : language === 'hi' ? 'चिकित्सा अधिकारी' : 'Clinician'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'कृती' : language === 'hi' ? 'कार्रवाई' : 'Action Executed'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'रुग्णालय' : language === 'hi' ? 'अस्पताल' : 'Target Facility'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'तीव्रता' : language === 'hi' ? 'गंभीरता' : 'Severity'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'तपशील' : language === 'hi' ? 'विवरण' : 'Audit Details'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border dark:divide-slate-800 text-on-surface dark:text-slate-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-low dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-primary dark:text-slate-100">{log.id}</span>
                          <span className="text-on-surface-variant dark:text-slate-400 block text-[10px]">
                            {log.timestamp}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold">{log.clinicianName}</div>
                          <div className="text-[10px] font-mono text-on-surface-variant dark:text-slate-400">{log.clinicianId}</div>
                        </td>
                        <td className="p-3.5 font-medium">{log.action}</td>
                        <td className="p-3.5 text-on-surface-variant dark:text-slate-400">{log.facility}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.severity === 'CRITICAL'
                                ? 'bg-error/15 text-error border border-error/30'
                                : log.severity === 'WARNING'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-teal-500/15 text-secondary dark:text-teal-400 border border-teal-500/30'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-3.5 text-on-surface-variant dark:text-slate-300 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: REGIONAL CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm p-6 animate-reveal">
              <form onSubmit={handleSaveConfig} className="max-w-2xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-primary dark:text-slate-100">
                    {t('regionalGovTab')}
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                    {language === 'mr'
                      ? 'स्वयंचलित रुग्णालय संदर्भ आणि अतिदक्षता व्यवस्थापनासाठी नियमन मर्यादा निश्चित करा.'
                      : language === 'hi'
                      ? 'स्वचालित अस्पताल स्थानांतरण और आईसीयू प्रबंधन के लिए नियमन सीमाएं निर्धारित करें।'
                      : 'Define algorithmic constraints and clinical trigger points for automated hospital transfers.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant dark:text-slate-300 uppercase tracking-wider mb-1">
                      {language === 'mr'
                        ? 'कमाल आपत्कालीन संदर्भ त्रिज्या (किलोमीटर)'
                        : language === 'hi'
                        ? 'अधिकतम आपातकालीन स्थानांतरण दायरा (किलोमीटर)'
                        : 'Maximum Emergency Transit Radius (Kilometers)'}
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        value={maxRadius}
                        onChange={(e) => setMaxRadius(e.target.value)}
                        className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-on-surface dark:text-white font-mono outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant dark:text-slate-400">
                        km
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant dark:text-slate-300 uppercase tracking-wider mb-1">
                      {language === 'mr'
                        ? 'स्वयंचलित रुग्णालय डायव्हर्ट मर्यादा (% खाटा शिल्लक)'
                        : language === 'hi'
                        ? 'स्वचालित अस्पताल डायवर्ट सीमा (% बेड उपलब्ध)'
                        : 'Automatic Facility Divert Threshold (% Bed Occupancy)'}
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        value={divertThreshold}
                        onChange={(e) => setDivertThreshold(e.target.value)}
                        className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-on-surface dark:text-white font-mono outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant dark:text-slate-400">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant dark:text-slate-300 uppercase tracking-wider mb-1">
                      {language === 'mr'
                        ? 'एआय उच्च-जोखीम आपत्कालीन ट्रिगर गुण'
                        : language === 'hi'
                        ? 'एमएल उच्च-जोखिम डिस्पैच स्कोर ट्रिगर'
                        : 'ML High-Risk Dispatch Score Trigger'}
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        value={riskThreshold}
                        onChange={(e) => setRiskThreshold(e.target.value)}
                        className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-on-surface dark:text-white font-mono outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant dark:text-slate-400">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoDispatch}
                        onChange={(e) => setAutoDispatch(e.target.checked)}
                        className="w-4 h-4 rounded text-secondary focus:ring-teal-400"
                      />
                      <div>
                        <span className="text-xs font-semibold text-on-surface dark:text-slate-200 block">
                          {language === 'mr'
                            ? 'एआय-आधारित आपत्कालीन रुग्णालय शिफारस'
                            : language === 'hi'
                            ? 'एआई-सहायता प्राप्त आपातकालीन अस्पताल अनुशंसाएं'
                            : 'AI-Assisted Emergency Route Recommendations'}
                        </span>
                        <span className="text-[11px] text-on-surface-variant dark:text-slate-400">
                          {language === 'mr'
                            ? 'प्राथमिक रुग्णालयात जागा नसल्यास तात्काळ पर्यायी रुग्णालय सुचवणे.'
                            : language === 'hi'
                            ? 'प्राथमिक अस्पताल में क्षमता समाप्त होने पर तुरंत वैकल्पिक अस्पताल सुझाना।'
                            : 'Automatically suggest tertiary alternatives when primary facility is at capacity.'}
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                        className="w-4 h-4 rounded text-secondary focus:ring-teal-400"
                      />
                      <div>
                        <span className="text-xs font-semibold text-on-surface dark:text-slate-200 block">
                          {language === 'mr'
                            ? 'कर्तव्यावर असलेल्या डॉक्टरांना एसएमएस व ॲप अलर्ट'
                            : language === 'hi'
                            ? 'ड्यूटी पर तैनात डॉक्टरों को एसएमएस एवं ऐप अलर्ट'
                            : 'SMS & Push Alerts to On-Duty Obstetricians'}
                        </span>
                        <span className="text-[11px] text-on-surface-variant dark:text-slate-400">
                          {language === 'mr'
                            ? 'रुग्ण पोहोचण्यापूर्वी १५ मिनिटे आधी संबंधित प्रसूती तज्ज्ञांना पूर्वसूचना देणे.'
                            : language === 'hi'
                            ? 'मरीज़ के पहुंचने से 15 मिनट पहले संबंधित प्रसूति विशेषज्ञों को सूचित करना।'
                            : 'Notify designated hospital leads 15 minutes prior to patient transit arrival.'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-border dark:border-slate-800">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    {t('saveGovernanceConfig')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CLINICIANS & ROLES */}
          {activeTab === 'staff' && (
            <div className="border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col animate-reveal">
              <div className="p-4 border-b border-surface-border dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-primary dark:text-slate-100">
                    {t('cliniciansTab')}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                    {language === 'mr'
                      ? 'महाराष्ट्रातील जिल्हा रुग्णालयांसाठी वैद्यकीय अधिकारी अधिकार नोंदणी.'
                      : language === 'hi'
                      ? 'महाराष्ट्र के जिला अस्पतालों के लिए चिकित्सा अधिकारी भूमिका और अनुमति रजिस्ट्री।'
                      : 'Role-based access control (RBAC) registry for Maharashtra district hospital commands.'}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  {t('authorizeClinician')}
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                  <thead className="bg-surface-container-low dark:bg-slate-800/90 border-b border-surface-border dark:border-slate-800 text-on-surface-variant dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">
                        {language === 'mr' ? 'वैद्यकीय आयडी' : language === 'hi' ? 'चिकित्सा अधिकारी आईडी' : 'Clinician ID'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'नाव' : language === 'hi' ? 'नाम' : 'Name'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'पद / जबाबदारी' : language === 'hi' ? 'पद / भूमिका' : 'Designated Role'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'जिल्हा कार्यक्षेत्र' : language === 'hi' ? 'जिला क्षेत्राधिकार' : 'Jurisdiction District'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'स्थिती' : language === 'hi' ? 'स्थिति' : 'Status'}
                      </th>
                      <th className="p-3.5">
                        {language === 'mr' ? 'शेवटचे सक्रिय' : language === 'hi' ? 'अंतिम सक्रिय' : 'Last Active'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border dark:divide-slate-800 text-on-surface dark:text-slate-200">
                    {clinicians.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary dark:text-slate-100">{c.id}</td>
                        <td className="p-3.5 font-semibold">{c.name}</td>
                        <td className="p-3.5 text-on-surface-variant dark:text-slate-300">{c.role}</td>
                        <td className="p-3.5">{c.district}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'ACTIVE'
                                ? 'bg-status-success/15 text-status-success'
                                : c.status === 'STANDBY'
                                ? 'bg-amber-500/15 text-amber-500'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {c.status === 'ACTIVE'
                              ? language === 'mr'
                                ? 'सक्रिय'
                                : language === 'hi'
                                ? 'सक्रिय'
                                : 'ACTIVE'
                              : c.status === 'STANDBY'
                              ? language === 'mr'
                                ? 'स्टँडबाय'
                                : language === 'hi'
                                ? 'स्टैंडबाय'
                                : 'STANDBY'
                              : language === 'mr'
                              ? 'ड्यूटी बंद'
                              : language === 'hi'
                              ? 'ड्यूटी समाप्त'
                              : 'OFF DUTY'}
                          </span>
                        </td>
                        <td className="p-3.5 text-on-surface-variant dark:text-slate-400 font-mono text-[11px]">
                          {c.lastActive}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Clinician Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
                onClick={() => setShowAddModal(false)}
              />
              <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl shadow-2xl p-6 z-10 animate-reveal">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-surface-border dark:border-slate-800">
                  <h3 className="text-base font-bold text-primary dark:text-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary dark:text-teal-400">person_add</span>
                    {t('authorizeClinician')}
                  </h3>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddClinician} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-on-surface-variant dark:text-slate-400 mb-1">
                      {language === 'mr' ? 'वैद्यकीय अधिकारी आयडी' : language === 'hi' ? 'चिकित्सा अधिकारी आईडी' : 'Clinician ID'}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={newClinician.id}
                      className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-on-surface dark:text-slate-300 opacity-80"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant dark:text-slate-400 mb-1">
                      {language === 'mr' ? 'पूर्ण नाव व पदवी' : language === 'hi' ? 'पूरा नाम और पदवी' : 'Full Name & Title'} <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajeshwari Shinde"
                      value={newClinician.name}
                      onChange={(e) => setNewClinician({ ...newClinician, name: e.target.value })}
                      className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant dark:text-slate-400 mb-1">
                      {language === 'mr' ? 'पद / जबाबदारी' : language === 'hi' ? 'पद / भूमिका' : 'Designated Role'}
                    </label>
                    <select
                      value={newClinician.role}
                      onChange={(e) => setNewClinician({ ...newClinician, role: e.target.value })}
                      className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
                    >
                      <option value="Lead Obstetric Consultant">
                        {language === 'mr'
                          ? 'प्रमुख प्रसूती तज्ज्ञ (Lead Obstetric Consultant)'
                          : language === 'hi'
                          ? 'मुख्य प्रसूति रोग विशेषज्ञ'
                          : 'Lead Obstetric Consultant'}
                      </option>
                      <option value="District Civil Surgeon">
                        {language === 'mr'
                          ? 'जिल्हा शल्यचिकित्सक (District Civil Surgeon)'
                          : language === 'hi'
                          ? 'जिला सिविल सर्जन'
                          : 'District Civil Surgeon'}
                      </option>
                      <option value="Emergency Maternal Logistics Lead">
                        {language === 'mr'
                          ? 'आपत्कालीन संदर्भ प्रमुख (Logistics Lead)'
                          : language === 'hi'
                          ? 'आपातकालीन मातृ लॉजिस्टिक्स प्रमुख'
                          : 'Emergency Maternal Logistics Lead'}
                      </option>
                      <option value="Obstetric Dispatch Officer">
                        {language === 'mr'
                          ? 'रुग्णवाहिका नियंत्रण अधिकारी'
                          : language === 'hi'
                          ? 'एम्बुलेंस डिस्पैच अधिकारी'
                          : 'Obstetric Dispatch Officer'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface-variant dark:text-slate-400 mb-1">
                      {language === 'mr' ? 'जिल्हा कार्यक्षेत्र' : language === 'hi' ? 'जिला क्षेत्राधिकार' : 'District Jurisdiction'}
                    </label>
                    <select
                      value={newClinician.district}
                      onChange={(e) => setNewClinician({ ...newClinician, district: e.target.value })}
                      className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
                    >
                      <option value="Mumbai Apex">Mumbai Apex</option>
                      <option value="Pune Division">Pune Division</option>
                      <option value="Nagpur Division">Nagpur Division</option>
                      <option value="Nashik Division">Nashik Division</option>
                      <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                      <option value="Thane Division">Thane Division</option>
                      <option value="Kolhapur Division">Kolhapur Division</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-surface-border dark:border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-surface-border dark:border-slate-700 rounded-lg font-semibold hover:bg-surface-container-low text-on-surface dark:text-slate-300"
                    >
                      {t('close')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 font-bold rounded-lg shadow-sm"
                    >
                      {language === 'mr' ? 'परवानगी द्या' : language === 'hi' ? 'अनुमति दें' : 'Grant Access'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
