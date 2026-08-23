export interface Hospital {
  id: string;
  name: string;
  district: string;
  state?: string;
  available_beds: number;
  total_beds: number;
  availableIcuBeds: number;
  totalIcuBeds: number;
  availableVentilators?: number;
  totalVentilators?: number;
  bloodUnitsO_neg?: number;
  occupancy_rate?: number;
  status: 'Operational' | 'Critical Load' | 'Offline' | 'DIVERT' | 'NOMINAL' | 'CRITICAL' | 'OPERATIONAL' | string;
  ui_x?: string;
  ui_y?: string;
  lat?: number;
  lng?: number;
  updatedAt?: string;
  contactPhone?: string;
  address?: string;
  tier?: 'Tertiary Apex' | 'District Headquarters' | 'Sub-District Center' | 'Community Health Center' | 'Tertiary Regional' | 'Primary Care Post' | 'Secondary District' | string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  clinician_id: string;
  action_type: string;
  origin_hospital_id: string;
  destination_hospital_id: string;
  rationale: string;
  patient_risk_tier: string;
  divert_enacted: boolean;
}

export interface RouteRequest {
  origin_hospital_id: string;
  patient_condition?: string;
  urgency?: 'critical' | 'high' | 'moderate';
}

export interface RecommendedHospital {
  id: string;
  name: string;
  eta: string;
  distance: string;
  available_beds?: number;
  available_icu_beds?: number;
}

export interface AlternativeHospital {
  id: string;
  name: string;
  eta_diff: string;
  distance: string;
  available_beds?: number;
}

export interface SkippedHospital {
  id: string;
  name: string;
  reason: string;
}

export interface RouteResponse {
  origin_hospital_id: string;
  recommended_hospital_id: string;
  recommended: RecommendedHospital;
  alternatives: AlternativeHospital[];
  skipped: SkippedHospital[];
}

export interface ClinicalVitals {
  age: number;
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  bodyTemp: number;
}

export interface RiskPredictionResponse {
  score: number;
  tier: 'Normal' | 'Prep' | 'Dispatch';
  explanation: string;
  factors?: string[];
  recommendations?: string[];
}

export interface ActiveMission {
  id: string;
  unit: string;
  destination: string;
  eta: string;
  status: 'CRITICAL' | 'ACTIVE';
  origin: string;
  driver?: string;
}
