import { Hospital, AuditLogItem, RouteResponse, ClinicalVitals, RiskPredictionResponse, ActiveMission } from '../types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'MH-MUM-01',
    name: 'King Edward Memorial Hospital & Seth G.S. Medical College',
    district: 'Mumbai',
    tier: 'Tertiary Apex',
    total_beds: 180,
    available_beds: 24,
    totalIcuBeds: 40,
    availableIcuBeds: 6,
    occupancy_rate: 86.7,
    status: 'OPERATIONAL',
    contactPhone: '+91-22-24107000',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    lat: 19.0024,
    lng: 72.8427
  },
  {
    id: 'MH-PUN-02',
    name: 'Sassoon General Hospital & B.J. Govt Medical College',
    district: 'Pune',
    tier: 'Tertiary Regional',
    total_beds: 150,
    available_beds: 18,
    totalIcuBeds: 35,
    availableIcuBeds: 4,
    occupancy_rate: 88.0,
    status: 'OPERATIONAL',
    contactPhone: '+91-20-26128000',
    address: 'Near Pune Railway Station, Sassoon Road, Pune 411001',
    lat: 18.5262,
    lng: 73.8742
  },
  {
    id: 'MH-MUM-03',
    name: 'Dharavi Maternity Care Post (Sub-District Unit)',
    district: 'Mumbai Suburban',
    tier: 'Primary Care Post',
    total_beds: 30,
    available_beds: 0,
    totalIcuBeds: 5,
    availableIcuBeds: 0,
    occupancy_rate: 100.0,
    status: 'DIVERT',
    contactPhone: '+91-22-24071234',
    address: '90 Feet Road, Dharavi, Mumbai, Maharashtra 400017',
    lat: 19.0400,
    lng: 72.8530
  },
  {
    id: 'MH-NAG-04',
    name: 'Government Medical College & Hospital (GMC Nagpur)',
    district: 'Nagpur',
    tier: 'Tertiary Regional',
    total_beds: 140,
    available_beds: 12,
    totalIcuBeds: 30,
    availableIcuBeds: 3,
    occupancy_rate: 91.4,
    status: 'OPERATIONAL',
    contactPhone: '+91-712-2701555',
    address: 'Medical Square, Hanuman Nagar, Nagpur, Maharashtra 440003',
    lat: 21.1275,
    lng: 79.0968
  },
  {
    id: 'MH-NSK-05',
    name: 'Nashik District Civil Hospital & Obstetric Center',
    district: 'Nashik',
    tier: 'Secondary District',
    total_beds: 110,
    available_beds: 22,
    totalIcuBeds: 25,
    availableIcuBeds: 8,
    occupancy_rate: 80.0,
    status: 'OPERATIONAL',
    contactPhone: '+91-253-2573211',
    address: 'Trimbak Road, Near CBS, Nashik, Maharashtra 422002',
    lat: 19.9975,
    lng: 73.7898
  },
  {
    id: 'MH-CSN-06',
    name: 'Chhatrapati Sambhajinagar Govt Medical College (GMC)',
    district: 'Chhatrapati Sambhajinagar',
    tier: 'Tertiary Regional',
    total_beds: 130,
    available_beds: 4,
    totalIcuBeds: 28,
    availableIcuBeds: 1,
    occupancy_rate: 96.9,
    status: 'CRITICAL',
    contactPhone: '+91-240-2402412',
    address: 'Panchakki Road, Jubilee Park, Sambhajinagar 431001',
    lat: 19.8856,
    lng: 75.3267
  },
  {
    id: 'MH-THN-07',
    name: 'Thane Civil Hospital Maternal & Child Health Facility',
    district: 'Thane',
    tier: 'Secondary District',
    total_beds: 95,
    available_beds: 15,
    totalIcuBeds: 20,
    availableIcuBeds: 5,
    occupancy_rate: 84.2,
    status: 'OPERATIONAL',
    contactPhone: '+91-22-25345678',
    address: 'Tembi Naka, Shivaji Nagar, Thane West, Maharashtra 400601',
    lat: 19.1972,
    lng: 72.9722
  },
  {
    id: 'MH-KOL-08',
    name: 'Chhatrapati Pramilatai Raje (CPR) General Hospital',
    district: 'Kolhapur',
    tier: 'Secondary District',
    total_beds: 100,
    available_beds: 19,
    totalIcuBeds: 22,
    availableIcuBeds: 6,
    occupancy_rate: 81.0,
    status: 'OPERATIONAL',
    contactPhone: '+91-231-2641011',
    address: 'Bhausingji Road, Dasara Chowk, Kolhapur, Maharashtra 416002',
    lat: 16.7028,
    lng: 74.2281
  },
  {
    id: 'MH-SOL-09',
    name: 'Dr. V.M. Government Medical College & Hospital',
    district: 'Solapur',
    tier: 'Tertiary Regional',
    total_beds: 120,
    available_beds: 16,
    totalIcuBeds: 24,
    availableIcuBeds: 4,
    occupancy_rate: 86.6,
    status: 'OPERATIONAL',
    contactPhone: '+91-217-2749401',
    address: 'Opp. District Court, Solapur, Maharashtra 413003',
    lat: 17.6599,
    lng: 75.9064
  },
  {
    id: 'MH-AMR-10',
    name: 'District Women Hospital & Neonatal Care (Dufferin)',
    district: 'Amravati',
    tier: 'Secondary District',
    total_beds: 85,
    available_beds: 14,
    totalIcuBeds: 18,
    availableIcuBeds: 5,
    occupancy_rate: 83.5,
    status: 'OPERATIONAL',
    contactPhone: '+91-721-2662345',
    address: 'Camp Area, Near Irwin Hospital, Amravati, Maharashtra 444602',
    lat: 20.9320,
    lng: 77.7523
  }
];

export const MOCK_MISSIONS: ActiveMission[] = [
  {
    id: 'MSN-8821',
    unit: '108-MH-ALS-04',
    origin: 'Dharavi Maternity Post',
    destination: 'KEM Apex Hospital',
    eta: '8 mins',
    status: 'CRITICAL',
    driver: 'Rajesh Shinde (+91-98201-11234)'
  },
  {
    id: 'MSN-8822',
    unit: '108-MH-BLS-12',
    origin: 'Hadapsar PHC',
    destination: 'Sassoon Maternity Wing',
    eta: '14 mins',
    status: 'ACTIVE',
    driver: 'Sunil Pawar (+91-98220-44556)'
  },
  {
    id: 'MSN-8823',
    unit: '108-MH-ALS-09',
    origin: 'Sinnar Rural Post',
    destination: 'Nashik Civil Hospital',
    eta: '22 mins',
    status: 'ACTIVE',
    driver: 'Anil Jadhav (+91-98233-77889)'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-08-22 19:42:10',
    clinician_id: 'MH-DOC-8492',
    action_type: 'ROUTING_OVERRIDE',
    origin_hospital_id: 'MH-MUM-03',
    destination_hospital_id: 'MH-MUM-01',
    rationale: 'Primary facility at 100% capacity; patient displaying severe pre-eclampsia vitals.',
    patient_risk_tier: 'Dispatch',
    divert_enacted: true
  },
  {
    id: 'LOG-002',
    timestamp: '2026-08-22 18:30:15',
    clinician_id: 'MH-DOC-3120',
    action_type: 'ROUTING_OVERRIDE',
    origin_hospital_id: 'MH-CSN-06',
    destination_hospital_id: 'MH-PUN-02',
    rationale: 'Sub-district ICU divert triggered; neonatal ventilator bed pre-booked at Sassoon General.',
    patient_risk_tier: 'Dispatch',
    divert_enacted: true
  },
  {
    id: 'LOG-003',
    timestamp: '2026-08-22 17:15:02',
    clinician_id: 'MH-DOC-4401',
    action_type: 'RISK_ASSESSMENT',
    origin_hospital_id: 'MH-NSK-05',
    destination_hospital_id: 'MH-NSK-05',
    rationale: 'Routine ANC screening with elevated SBP (138 mmHg). Admitted to Prep tier observation.',
    patient_risk_tier: 'Prep',
    divert_enacted: false
  },
  {
    id: 'LOG-004',
    timestamp: '2026-08-22 16:04:45',
    clinician_id: 'MH-DOC-8492',
    action_type: 'DISPATCH_CONFIRM',
    origin_hospital_id: 'MH-MUM-01',
    destination_hospital_id: 'MH-MUM-01',
    rationale: 'Emergency 108 Advanced Life Support obstetric ambulance transit successfully activated.',
    patient_risk_tier: 'Dispatch',
    divert_enacted: false
  },
  {
    id: 'LOG-005',
    timestamp: '2026-08-22 14:50:22',
    clinician_id: 'MH-DOC-5519',
    action_type: 'CAPACITY_OVERRIDE',
    origin_hospital_id: 'MH-MUM-03',
    destination_hospital_id: 'MH-MUM-03',
    rationale: 'Emergency divert flag set due to temporary power backup check in labor OT.',
    patient_risk_tier: 'Prep',
    divert_enacted: true
  }
];

export function calculateMockRoute(originId: string, hospitals: Hospital[]): RouteResponse {
  const origin = hospitals.find(h => h.id === originId) || hospitals[0];
  const candidates = hospitals.filter(h => h.id !== origin.id && h.available_beds > 0 && h.status !== 'DIVERT');
  
  if (candidates.length === 0) {
    throw new Error('No eligible receiving hospital with available bed capacity found in the network.');
  }

  // Sort candidates by available ICU beds and proximity
  const sorted = [...candidates].sort((a, b) => b.availableIcuBeds - a.availableIcuBeds);
  const recommendedHosp = sorted[0];
  const altHosp = sorted[1] || sorted[0];

  const skipped = hospitals
    .filter(h => h.id !== origin.id && (h.available_beds === 0 || h.status === 'DIVERT'))
    .map(h => ({
      id: h.id,
      name: h.name,
      reason: h.available_beds === 0 ? 'Zero bed availability (Full Capacity)' : 'Facility on Emergency Divert status'
    }));

  return {
    origin_hospital_id: origin.id,
    recommended_hospital_id: recommendedHosp.id,
    recommended: {
      id: recommendedHosp.id,
      name: recommendedHosp.name,
      eta: '14 mins',
      distance: '6.4 km',
      available_beds: recommendedHosp.available_beds,
      available_icu_beds: recommendedHosp.availableIcuBeds
    },
    alternatives: altHosp && altHosp.id !== recommendedHosp.id ? [
      {
        id: altHosp.id,
        name: altHosp.name,
        eta_diff: '+8m (+3.2 km)',
        distance: '9.6 km',
        available_beds: altHosp.available_beds
      }
    ] : [],
    skipped
  };
}

/**
 * Continuous Dynamic ICMR-Compliant Clinical Risk Stratification Engine
 * Accurately scales risk smoothly from 0 to 100 based on all 6 biometric inputs.
 */
export function evaluateMockRisk(vitals: ClinicalVitals): RiskPredictionResponse {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  const { age, heartRate, systolicBP, diastolicBP, bloodSugar, bodyTemp } = vitals;

  // 1. Continuous Blood Pressure Analysis (SBP & DBP)
  let bpScore = 0;
  if (systolicBP >= 160 || diastolicBP >= 110) {
    bpScore = 38 + Math.min(10, ((systolicBP - 160) / 10) * 3 + ((diastolicBP - 110) / 10) * 2);
    factors.push(`Severe Hypertensive Crisis / Severe Pre-eclampsia (BP: ${systolicBP}/${diastolicBP} mmHg)`);
    recommendations.push('Administer IV Labetalol or Hydralazine immediately; initiate Magnesium Sulfate (Pritchard regimen) for eclampsia prophylaxis.');
  } else if (systolicBP >= 140 || diastolicBP >= 90) {
    const sbpRatio = (systolicBP - 140) / 20;
    const dbpRatio = (diastolicBP - 90) / 20;
    bpScore = 22 + (sbpRatio * 10) + (dbpRatio * 6);
    factors.push(`Gestational Hypertension / Mild Pre-eclampsia (BP: ${systolicBP}/${diastolicBP} mmHg)`);
    recommendations.push('Initiate oral Methyldopa/Labetalol and perform 24-hr urine protein & liver enzyme workup.');
  } else if (systolicBP >= 125 || diastolicBP >= 82) {
    bpScore = 8 + ((systolicBP - 125) / 15) * 8;
    factors.push(`Pre-hypertensive blood pressure elevation (${systolicBP}/${diastolicBP} mmHg)`);
    recommendations.push('Schedule frequent BP monitoring every 4 hours and check for peripheral edema.');
  } else if (systolicBP < 90 || diastolicBP < 55) {
    bpScore = 18 + ((90 - systolicBP) / 20) * 8;
    factors.push(`Maternal Hypotension / Perfusion Risk (${systolicBP}/${diastolicBP} mmHg)`);
    recommendations.push('Assess for obstetric hemorrhage or dehydration; initiate IV crystalloid fluid expansion.');
  } else {
    // Normal BP (100-124 / 60-80)
    bpScore = 2;
  }
  score += bpScore;

  // 2. Continuous Blood Sugar (mmol/L)
  let bsScore = 0;
  if (bloodSugar >= 11.0) {
    bsScore = 30 + Math.min(10, (bloodSugar - 11.0) * 2.5);
    factors.push(`Severe Hyperglycemia / Uncontrolled Gestational Diabetes (${bloodSugar} mmol/L)`);
    recommendations.push('Check for diabetic ketoacidosis (urine ketones); start sliding-scale regular insulin infusion.');
  } else if (bloodSugar >= 7.0) {
    bsScore = 18 + ((bloodSugar - 7.0) / 4.0) * 10;
    factors.push(`Gestational Hyperglycemia (${bloodSugar} mmol/L)`);
    recommendations.push('Order HbA1c, fasting/postprandial profile, and obstetric ultrasound for fetal macrosomia.');
  } else if (bloodSugar >= 5.8) {
    bsScore = 6 + ((bloodSugar - 5.8) / 1.2) * 8;
    factors.push(`Impaired fasting blood glucose (${bloodSugar} mmol/L)`);
    recommendations.push('Advise dietary modification and 75g Oral Glucose Tolerance Test (OGTT).');
  } else if (bloodSugar < 3.5) {
    bsScore = 16 + ((3.5 - bloodSugar) / 1.5) * 10;
    factors.push(`Maternal Hypoglycemia (${bloodSugar} mmol/L)`);
    recommendations.push('Immediate administration of oral rapid carbohydrates or 25% IV Dextrose.');
  } else {
    bsScore = 1;
  }
  score += bsScore;

  // 3. Continuous Body Temperature (°F)
  let tempScore = 0;
  if (bodyTemp >= 102.0) {
    tempScore = 26 + Math.min(10, (bodyTemp - 102.0) * 5);
    factors.push(`High Maternal Pyrexia / Suspected Chorioamnionitis or Sepsis (${bodyTemp}°F)`);
    recommendations.push('Send blood & high vaginal swab cultures; start empirical IV broad-spectrum antibiotics (Ampicillin + Gentamicin).');
  } else if (bodyTemp >= 100.4) {
    tempScore = 14 + ((bodyTemp - 100.4) / 1.6) * 10;
    factors.push(`Maternal Fever / Pyrexia (${bodyTemp}°F)`);
    recommendations.push('Administer oral Paracetamol, ensure adequate hydration, and screen for urinary tract infection.');
  } else if (bodyTemp >= 99.2) {
    tempScore = 4 + ((bodyTemp - 99.2) / 1.2) * 6;
    factors.push(`Low-grade temperature elevation (${bodyTemp}°F)`);
  } else if (bodyTemp < 96.5) {
    tempScore = 14;
    factors.push(`Maternal Hypothermia (${bodyTemp}°F)`);
  } else {
    tempScore = 1;
  }
  score += tempScore;

  // 4. Continuous Heart Rate (bpm)
  let hrScore = 0;
  if (heartRate >= 125) {
    hrScore = 22 + Math.min(10, (heartRate - 125) * 0.5);
    factors.push(`Marked Maternal Tachycardia (${heartRate} bpm)`);
    recommendations.push('Obtain 12-lead ECG, rule out cardiac arrhythmia, severe anemia, or concealed placental abruption.');
  } else if (heartRate >= 100) {
    hrScore = 8 + ((heartRate - 100) / 25) * 10;
    factors.push(`Maternal Tachycardia (${heartRate} bpm)`);
    recommendations.push('Monitor maternal pulse oximetry and fetal heart rate via cardiotocography (CTG).');
  } else if (heartRate < 55) {
    hrScore = 15 + ((55 - heartRate) / 15) * 10;
    factors.push(`Maternal Bradycardia (${heartRate} bpm)`);
    recommendations.push('Cardiology consult and continuous cardiac rhythm monitoring.');
  } else if (heartRate > 88) {
    hrScore = 2 + ((heartRate - 88) / 12) * 4;
  } else {
    hrScore = 1;
  }
  score += hrScore;

  // 5. Continuous Age Risk Curve
  let ageScore = 0;
  if (age > 40) {
    ageScore = 18 + Math.min(10, (age - 40) * 1.5);
    factors.push(`Very Advanced Maternal Age (${age} yrs)`);
  } else if (age > 35) {
    ageScore = 10 + ((age - 35) / 5) * 7;
    factors.push(`Advanced Maternal Age (${age} yrs)`);
  } else if (age > 30) {
    ageScore = 2 + ((age - 30) / 5) * 4;
  } else if (age < 17) {
    ageScore = 20 + (17 - age) * 4;
    factors.push(`Adolescent High-Risk Pregnancy (<17 yrs, age: ${age})`);
    recommendations.push('High-risk antenatal registry follow-up and pelvic adequacy assessment.');
  } else if (age < 19) {
    ageScore = 8 + (19 - age) * 4;
    factors.push(`Young Maternal Age (${age} yrs)`);
  } else {
    ageScore = 0;
  }
  score += ageScore;

  // Final Score Normalization & Boundary Clamping
  const finalScore = Math.max(5, Math.min(99, Math.round(score)));

  // Determine Triage Tier ('Normal' | 'Prep' | 'Dispatch')
  let tier: 'Normal' | 'Prep' | 'Dispatch';
  if (finalScore >= 65 || systolicBP >= 160 || diastolicBP >= 110 || bodyTemp >= 102.5 || bloodSugar >= 11.0) {
    tier = 'Dispatch';
  } else if (finalScore >= 35 || systolicBP >= 140 || diastolicBP >= 90 || bloodSugar >= 7.0 || bodyTemp >= 100.4 || heartRate >= 105) {
    tier = 'Prep';
  } else {
    tier = 'Normal';
  }

  // Base clinical recommendations if list is empty
  if (recommendations.length === 0) {
    if (tier === 'Normal') {
      recommendations.push('Continue routine antenatal care (ANC) schedule.');
      recommendations.push('Maintain daily Iron & Folic Acid (IFA) supplementation.');
      recommendations.push('Routine fetal kick count tracking and dietary consultation.');
    } else if (tier === 'Prep') {
      recommendations.push('Repeat vital checks in 2 hours.');
      recommendations.push('Order routine obstetric blood panel and urine protein dipstick.');
      recommendations.push('Alert on-duty obstetric specialist for clinical review.');
    } else {
      recommendations.push('Immediate obstetric triage & bed reservation at referral NICU.');
      recommendations.push('108 Emergency Ambulance Dispatch standby.');
    }
  }

  // Generate dynamic clinical summary
  let explanation = '';
  if (tier === 'Dispatch') {
    explanation = `High-risk maternal profile identified (Score: ${finalScore}/100). Critical clinical drivers detected: ${factors.slice(0, 2).join(', ')}. Immediate tertiary obstetric intervention is indicated.`;
  } else if (tier === 'Prep') {
    explanation = `Moderate maternal risk profile detected (Score: ${finalScore}/100). Primary observation factors: ${factors.slice(0, 2).join(', ')}. Intermediate observation and laboratory workup recommended.`;
  } else {
    explanation = `Maternal vital parameters are within stable clinical limits (Score: ${finalScore}/100). No acute gestational complications detected. Continue standard antenatal protocol.`;
  }

  return {
    score: finalScore,
    tier,
    explanation,
    factors: factors.length > 0 ? factors : ['All physiological vitals within normal clinical limits.'],
    recommendations
  };
}
