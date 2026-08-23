import apiClient from './client';

export const api = {
  // System Health
  getHealth: () => apiClient.get('/health'),

  // Authentication & RBAC
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),

  // Maternal Health & AI Triage
  predictRisk: (vitals) => apiClient.post('/predict-risk', vitals),
  createMother: (motherData) => apiClient.post('/mothers', motherData),
  getMothers: (maskPhi = true) => apiClient.get(`/mothers?mask_phi=${maskPhi}`),
  getMother: (id) => apiClient.get(`/mothers/${id}`),
  recordMotherVitals: (motherId, vitals) => apiClient.post(`/mothers/${motherId}/vitals`, vitals),
  calculateRoute: (routeParams) => apiClient.post('/route', routeParams),

  // Child Health & Pediatric VIPER Triage
  triageChild: (childVitals) => apiClient.post('/assessments/child-triage', childVitals),
  createChild: (childData) => apiClient.post('/assessments/children', childData),
  getChildren: () => apiClient.get('/assessments/children'),
  getChild: (id) => apiClient.get(`/assessments/children/${id}`),
  recordChildVitals: (childId, vitals) => apiClient.post(`/assessments/children/${childId}/vitals`, vitals),

  // Chronic Health & Cardiovascular Screening
  screenChronicCardio: (cardioVitals) => apiClient.post('/assessments/chronic-cardio', cardioVitals),
  createChronicPatient: (patientData) => apiClient.post('/assessments/chronic-patients', patientData),
  getChronicPatients: () => apiClient.get('/assessments/chronic-patients'),
  getChronicPatient: (id) => apiClient.get(`/assessments/chronic-patients/${id}`),
  recordChronicAssessment: (patientId, assessment) => apiClient.post(`/assessments/chronic-patients/${patientId}/assessments`, assessment),

  // Hospital Inventory & Capacity Management
  getHospitals: () => apiClient.get('/hospitals'),
  updateHospitalCapacity: (hospitalId, updates) => apiClient.post(`/hospitals/${hospitalId}/update`, updates),

  // Referrals & Emergency State Machine
  getActiveReferrals: () => apiClient.get('/referrals/active'),
  getReferral: (id) => apiClient.get(`/referrals/${id}`),
  acknowledgeReferral: (id) => apiClient.patch(`/referrals/${id}/acknowledge`),
  updateReferralStatus: (id, payload) => apiClient.patch(`/referrals/${id}/status`, payload),
  escalateReferral: (id, payload = {}) => apiClient.post(`/referrals/${id}/escalate`, payload),
  autoEscalateOverdue: () => apiClient.post('/referrals/auto-escalate-overdue'),
  getAuditLogs: () => apiClient.get('/referrals/audit-logs/all'),

  // Notifications Simulator
  sendDispatchAlert: (alertData) => apiClient.post('/notifications/send-dispatch-alert', alertData),

  // Command Center Analytics
  getCommandCenterSummary: () => apiClient.get('/command-center/summary'),
  getNetworkHospitals: () => apiClient.get('/network/hospitals'),
  getModelInfo: (type) => apiClient.get(`/assessments/model-info/${type}`),

  // ASHA Workers Live Tracking & Safety Gateway
  getAshaWorkers: (params) => apiClient.get('/asha-workers', { params }),
  updateAshaLocation: (id, data) => apiClient.post(`/asha-workers/${id}/location`, data),
  triggerAshaSos: (id, data) => apiClient.post(`/asha-workers/${id}/sos`, data),
};
