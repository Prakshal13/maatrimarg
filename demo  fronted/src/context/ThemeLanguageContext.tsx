import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'mr' | 'hi';
export type Theme = 'light' | 'dark';

interface Translations {
  [key: string]: {
    en: string;
    mr: string;
    hi: string;
  };
}

export const DICTIONARY: Translations = {
  // Brand & Navigation
  appName: { en: 'MaatriMarg', mr: 'मातृमार्ग', hi: 'मातृमार्ग' },
  tagline: { en: 'Maternal Healthcare Intelligence', mr: 'मातृ आरोग्य बुद्धिमत्ता प्रणाली', hi: 'मातृ स्वास्थ्य बुद्धिमत्ता प्रणाली' },
  commandCenter: { en: 'Command Center', mr: 'कमांड सेंटर', hi: 'कमांड सेंटर' },
  network: { en: 'Network', mr: 'नेटवर्क', hi: 'नेटवर्क' },
  hospitals: { en: 'Hospitals', mr: 'रुग्णालये', hi: 'अस्पताल' },
  riskAssessment: { en: 'Risk Assessment', mr: 'जोखीम मूल्यमापन', hi: 'जोखिम मूल्यांकन' },
  analytics: { en: 'Analytics', mr: 'विश्लेषण', hi: 'विश्लेषण' },
  adminPanel: { en: 'Admin Panel', mr: 'प्रशासन पॅनेल', hi: 'प्रशासन पैनल' },
  systemGovernance: { en: 'System Governance', mr: 'प्रणाली प्रशासन', hi: 'सिस्टम गवर्नेंस' },
  settings: { en: 'Settings', mr: 'सेटिंग्ज', hi: 'सेटिंग्स' },
  support: { en: 'Support', mr: 'मदत व सहाय्य', hi: 'सहायता व समर्थन' },
  logout: { en: 'Log Out', mr: 'लॉग आउट', hi: 'लॉग आउट' },
  login: { en: 'Login to Command Center', mr: 'कमांड सेंटरमध्ये प्रवेश करा', hi: 'कमांड सेंटर में प्रवेश करें' },
  searchPlaceholder: { en: 'Search facilities, routes, districts...', mr: 'रुग्णालये, मार्ग किंवा जिल्हे शोधा...', hi: 'अस्पताल, मार्ग या जिले खोजें...' },
  publicPortal: { en: 'Public Portal', mr: 'सार्वजनिक पोर्टल', hi: 'सार्वजनिक पोर्टल' },
  platformModules: { en: 'Platform Modules', mr: 'प्लॅटफॉर्म विभाग', hi: 'प्लेटफ़ॉर्म मॉड्यूल' },
  infrastructureSystem: { en: 'Infrastructure & System', mr: 'पायाभूत सुविधा व यंत्रणा', hi: 'बुनियादी ढांचा और प्रणाली' },
  clinicianLogin: { en: 'Clinician Login', mr: 'वैद्यकीय अधिकारी प्रवेश', hi: 'चिकित्सा अधिकारी लॉगिन' },
  exploreMatrix: { en: 'Explore Live Matrix', mr: 'थेट मॅट्रिक्स पहा', hi: 'लाइव मैट्रिक्स देखें' },

  // Landing Page
  activeInfrastructure: { en: 'National Command Infrastructure Active • Maharashtra', mr: 'राष्ट्रीय कमांड पायाभूत सुविधा सक्रिय • महाराष्ट्र', hi: 'राष्ट्रीय कमांड इंफ्रास्ट्रक्चर सक्रिय • महाराष्ट्र' },
  landingTitle1: { en: 'Maternal Healthcare', mr: 'मातृ आरोग्य', hi: 'मातृ स्वास्थ्य' },
  landingTitle2: { en: 'Intelligence Platform', mr: 'बुद्धिमत्ता प्रणाली', hi: 'बुद्धिमत्ता प्लेटफ़ॉर्म' },
  landingSubtitle: { 
    en: 'Predict clinical risk. Optimize real-time ICU bed allocation. Seamlessly route mothers to the right tertiary facilities across districts.', 
    mr: 'क्लिनिकल जोखीम अंदाज लावा. अतिदक्षता (ICU) खाटांचे वाटप ऑप्टिमाइझ करा. मातांना योग्य जिल्हा व विशेष रुग्णालयांत तात्काळ संदर्भित करा.', 
    hi: 'क्लिनिकल जोखिम का पूर्वानुमान लगाएं। रियल-टाइम आईसीयू बेड आवंटन को अनुकूलित करें। माताओं को तुरंत सही तृतीयक अस्पतालों में स्थानांतरित करें।' 
  },
  activeMonitoring: { en: 'Active Monitoring', mr: 'सक्रिय देखरेख', hi: 'सक्रिय निगरानी' },
  operationalFidelity: { en: 'Network Operational Fidelity', mr: 'नेटवर्क कार्यक्षमता निर्देशांक', hi: 'नेटवर्क परिचालन दक्षता सूचकांक' },
  landingQuote: { 
    en: '"Advancing maternal outcomes through clinical machine intelligence and regional infrastructure routing."', 
    mr: '"क्लिनिकल मशिन इंटेलिजन्स आणि प्रादेशिक रुग्णालय समन्वयाद्वारे सुरक्षित मातृत्व."', 
    hi: '"क्लिनिकल मशीन इंटेलिजेंस और क्षेत्रीय अस्पताल समन्वय द्वारा सुरक्षित मातृत्व।"' 
  },
  networkStateOptimal: { en: 'Network State: Optimal Transit Readiness', mr: 'नेटवर्क स्थिती: गतिमान रुग्णवाहिका सज्जता', hi: 'नेटवर्क स्थिति: इष्टतम एम्बुलेंस तत्परता' },
  systemCapabilities: { en: 'Comprehensive System Capabilities', mr: 'प्रणालीची सर्वसमावेशक वैशिष्ट्ये', hi: 'प्रणाली की व्यापक क्षमताएं' },
  systemCapabilitiesSub: { 
    en: 'Modular intelligence designed for clinical precision, emergency response, and operational scale.', 
    mr: 'वैद्यकीय अचूकता, आपत्कालीन प्रतिसाद आणि गतिमान व्यवस्थापनासाठी अत्याधुनिक मॉड्युल.', 
    hi: 'क्लिनिकल सटीकता, आपातकालीन प्रतिक्रिया और बड़े पैमाने पर संचालन के लिए निर्मित इंटेलिजेंस।' 
  },
  cardRiskTitle: { en: 'AI Risk Assessment', mr: 'एआय जोखीम मूल्यमापन', hi: 'एआई जोखिम मूल्यांकन' },
  cardRiskDesc: { 
    en: 'Predictive modeling identifying high-risk pregnancies before complications arise, ensuring proactive clinical intervention.', 
    mr: 'गुंतागुंत होण्यापूर्वीच उच्च जोखमीच्या गरोदरपणाची पूर्वओळख, वेळेवर वैद्यकीय उपचार सुनिश्चित.', 
    hi: 'जटिलताएं उत्पन्न होने से पहले ही उच्च जोखिम वाले गर्भधारण की पहचान, समय पर चिकित्सा हस्तक्षेप सुनिश्चित।' 
  },
  cardNetworkTitle: { en: 'Hospital Intelligence', mr: 'रुग्णालय नेटवर्क माहिती', hi: 'अस्पताल नेटवर्क इंटेलिजेंस' },
  cardNetworkDesc: { 
    en: 'Real-time mapping of facility capabilities, ICU bed availability, and specialized neonatal units across Maharashtra.', 
    mr: 'महाराष्ट्रातील सर्व रुग्णालयांची क्षमता, अतिदक्षता खाटा आणि नवजात शिशु (NICU) युनिट्सची थेट माहिती.', 
    hi: 'महाराष्ट्र के सभी अस्पतालों की क्षमता, आईसीयू बेड और विशेष नवजात शिशु (NICU) इकाइयों की लाइव मैपिंग।' 
  },
  cardRoutingTitle: { en: 'Smart Routing Matrix', mr: 'स्मार्ट संदर्भ मार्ग प्रणाली', hi: 'स्मार्ट रूटिंग मैट्रिक्स' },
  cardRoutingDesc: { 
    en: 'Algorithmic patient transfer protocols optimizing distance, urgency, and specific receiving facility readiness.', 
    mr: 'अंतर, आणीबाणी आणि रुग्णालयाची सज्जता लक्षात घेऊन सर्वात वेगवान सुरक्षित मार्ग निश्चिती.', 
    hi: 'दूरी, आपात स्थिति और अस्पताल की तैयारी के आधार पर सबसे सुरक्षित और तेज़ मार्ग का निर्धारण।' 
  },
  cardCommandTitle: { en: 'Command Center', mr: 'कमांड सेंटर', hi: 'कमांड सेंटर' },
  cardCommandDesc: { 
    en: 'A centralized, high-fidelity overview for administrators to monitor regional maternal health logistics instantly.', 
    mr: 'प्रादेशिक मातृ आरोग्य व्यवस्थापन आणि रुग्णवाहिका हालचालींवर नियंत्रण ठेवणारे केंद्र.', 
    hi: 'क्षेत्रीय मातृ स्वास्थ्य लॉजिस्टिक्स और एम्बुलेंस संचालन की निगरानी के लिए एक केंद्रीय नियंत्रण केंद्र।' 
  },
  copyrightText: { en: '© 2026 MaatriMarg AI. Clinical Precision, Human Care.', mr: '© २०२६ मातृमार्ग एआय. वैद्यकीय अचूकता, मानवी काळजी.', hi: '© 2026 मातृमार्ग एआई। क्लिनिकल सटीकता, मानवीय देखभाल।' },
  termsOfService: { en: 'Terms of Service', mr: 'सेवा अटी', hi: 'सेवा की शर्तें' },
  dataPrivacy: { en: 'Data Privacy & HIPAA', mr: 'माहिती गोपनीयता', hi: 'डेटा गोपनीयता और सुरक्षा' },
  contactAdmin: { en: 'Contact Operations Admin', mr: 'प्रशासन संपर्कासाठी', hi: 'संचालन व्यवस्थापक से संपर्क करें' },

  // Login Page
  secureAccessTitle: { 
    en: 'Secure access to Maharashtra Maternal Healthcare Intelligence & Dispatch Platform.', 
    mr: 'महाराष्ट्र मातृ आरोग्य बुद्धिमत्ता व रुग्णवाहिका समन्वय प्रणालीत सुरक्षित प्रवेश.', 
    hi: 'महाराष्ट्र मातृ स्वास्थ्य इंटेलिजेंस और डिस्पैच प्लेटफ़ॉर्म तक सुरक्षित पहुंच।' 
  },
  clinicianId: { en: 'Clinician ID', mr: 'वैद्यकीय अधिकारी आयडी', hi: 'चिकित्सा अधिकारी आईडी' },
  securityKey: { en: 'Security Key', mr: 'सुरक्षा पासवर्ड / की', hi: 'सुरक्षा पासवर्ड / कुंजी' },
  forgotKey: { en: 'Forgot Key?', mr: 'की विसरलात?', hi: 'कुंजी भूल गए?' },
  rememberDevice: { en: 'Verify device for 30 days', mr: 'या डिव्हाइसवर ३० दिवस लॉगिन ठेवा', hi: 'इस डिवाइस पर 30 दिनों के लिए लॉगिन रखें' },
  authButton: { en: 'Authenticate Access', mr: 'प्रवेश प्रमाणित करा', hi: 'पहुंच प्रमाणित करें' },
  authenticating: { en: 'Authenticating Session...', mr: 'प्रमाणीकरण तपासत आहे...', hi: 'सत्र का सत्यापन हो रहा है...' },
  encryptedBadge: { en: 'End-to-End Encrypted Session (AES-256)', mr: 'सुरक्षित एंड-टू-एंड एनक्रिप्टेड सत्र (AES-256)', hi: 'सुरक्षित एंड-टू-एंड एन्क्रिप्टेड सत्र (AES-256)' },

  // Command Center
  commandCenterTitle: { en: 'Real-time Maternal Logistics Command', mr: 'थेट मातृ आरोग्य व रुग्णवाहिका कमांड सेंटर', hi: 'रियल-टाइम मातृ लॉजिस्टिक्स कमांड सेंटर' },
  commandCenterSub: { en: 'MaatriMarg Active Routing Matrix • Maharashtra Regional Command Hub', mr: 'मातृमार्ग सक्रिय संदर्भ प्रणाली • महाराष्ट्र प्रादेशिक नियंत्रण कक्ष', hi: 'मातृमार्ग सक्रिय रूटिंग मैट्रिक्स • महाराष्ट्र क्षेत्रीय नियंत्रण केंद्र' },
  telemetrySync: { en: 'Telemetry Synchronized', mr: 'थेट डेटा समक्रमित', hi: 'टेलीमेट्री सिंक्रोनाइज़्ड' },
  networkEfficiency: { en: 'Network Efficiency', mr: 'नेटवर्क कार्यक्षमता', hi: 'नेटवर्क दक्षता' },
  activeDispatches: { en: 'Active Dispatches', mr: 'सक्रिय रुग्णवाहिका', hi: 'सक्रिय एम्बुलेंस' },
  availableIcuCap: { en: 'Available ICU Capacity', mr: 'उपलब्ध अतिदक्षता खाटा (ICU)', hi: 'उपलब्ध आईसीयू (ICU) बेड' },
  emergencyDiversions: { en: 'Emergency Diversions', mr: 'डायव्हर्ट रुग्णालये', hi: 'डायवर्ट अस्पताल' },
  inTransit: { en: 'in transit', mr: 'प्रवासात', hi: 'पारगमन में' },
  bedsReserved: { en: 'beds reserved', mr: 'खाटा उपलब्ध', hi: 'बेड उपलब्ध' },
  divertActive: { en: 'divert active', mr: 'डायव्हर्ट सक्रिय', hi: 'डायवर्ट सक्रिय' },
  liveNetworkMatrix: { en: 'Live Network Matrix (Maharashtra)', mr: 'थेट रुग्णालय नेटवर्क (महाराष्ट्र)', hi: 'लाइव नेटवर्क मैट्रिक्स (महाराष्ट्र)' },
  topography: { en: 'Topography', mr: 'भूप्रदेश नकाशा', hi: 'टोपोग्राफी दृश्य' },
  satellite: { en: 'Satellite', mr: 'सॅटेलाइट दृश्य', hi: 'सैटेलाइट दृश्य' },
  heatmap: { en: 'Heatmap', mr: 'हीटमॅप दृश्य', hi: 'हीटमैप दृश्य' },
  heatmapOverlay: { en: 'Risk Heatmap Overlay', mr: 'जोखीम घनता हीटमॅप', hi: 'मातृ जोखिम हीटमैप' },
  riskDensity: { en: 'Maternal Risk Density', mr: 'मातृ जोखीम घनता', hi: 'मातृ जोखिम घनत्व' },
  highRisk: { en: 'High Risk Cluster', mr: 'उच्च जोखीम क्षेत्र', hi: 'उच्च जोखिम क्षेत्र' },
  moderateRisk: { en: 'Moderate Load', mr: 'मध्यम भार', hi: 'मध्यम भार' },
  lowRisk: { en: 'Normal Zone', mr: 'सामान्य क्षेत्र', hi: 'सामान्य क्षेत्र' },
  setAsOrigin: { en: 'SET AS ORIGIN', mr: 'सुरुवात बिंदू निवडा', hi: 'आरंभिक बिंदु चुनें' },
  routingTitle: { en: 'Routing Intelligence & Dispatch', mr: 'मार्ग निश्चिती व रुग्णवाहिका', hi: 'रूटिंग इंटेलिजेंस एवं डिस्पैच' },
  noRouteSelected: { en: 'No Route Selected', mr: 'कोणताही मार्ग निवडलेला नाही', hi: 'कोई मार्ग चयनित नहीं है' },
  clickMapPrompt: { 
    en: 'Click any hospital node on the map to calculate the optimal maternal transfer route.', 
    mr: 'सर्वात वेगवान व सुरक्षित मार्ग शोधण्यासाठी नकाशावरील रुग्णालयावर क्लिक करा.', 
    hi: 'इष्टतम मातृ स्थानांतरण मार्ग की गणना के लिए मानचित्र पर किसी भी अस्पताल पर क्लिक करें।' 
  },
  calculatingRoute: { en: 'Calculating optimal route...', mr: 'सर्वोत्तम मार्ग शोधत आहे...', hi: 'इष्टतम मार्ग की गणना हो रही है...' },
  evaluatingRouteSub: { 
    en: 'Evaluating facility bed capacities, traffic matrix & distances', 
    mr: 'उपलब्ध खाटा, रहदारी आणि अंतर तपासले जात आहे', 
    hi: 'अस्पताल बेड क्षमता, ट्रैफ़िक मैट्रिक्स और दूरियों का मूल्यांकन किया जा रहा है' 
  },
  recommendedDest: { en: 'Recommended Destination', mr: 'शिफारस केलेले रुग्णालय', hi: 'अनुशंसित गंतव्य अस्पताल' },
  fastestEta: { en: 'FASTEST ETA', mr: 'सर्वात वेगवान', hi: 'सबसे तेज़ ईटीए' },
  alternativeFacilities: { en: 'Alternative Facilities', mr: 'पर्यायी रुग्णालये', hi: 'वैकल्पिक अस्पताल' },
  skippedFacilities: { en: 'Skipped Facilities', mr: 'वगळलेली रुग्णालये', hi: 'छोड़े गए अस्पताल' },
  activeMissions: { en: 'Active Missions', mr: 'सक्रिय आपत्कालीन मोहिमा', hi: 'सक्रिय आपातकालीन मिशन' },
  criticalCapacityOverview: { en: 'Critical Regional Capacity Overview', mr: 'प्रादेशिक खाटांची उपलब्धता स्थिती', hi: 'क्षेत्रीय आपातकालीन बेड उपलब्धता अवलोकन' },
  criticalCapacitySub: { en: 'Real-time maternal bed occupancy & emergency facility states', mr: 'थेट खाटांची संख्या आणि रुग्णालयाची सद्यस्थिती', hi: 'रियल-टाइम मातृ बेड अधिभोग और अस्पताल की परिचालन स्थिति' },
  autoSyncing: { en: 'AUTO-SYNCING', mr: 'थेट अपडेट चालू', hi: 'ऑटो-सिंक चालू' },
  facilityName: { en: 'Facility Name', mr: 'रुग्णालयाचे नाव', hi: 'अस्पताल का नाम' },
  district: { en: 'District', mr: 'जिल्हा', hi: 'जिला' },
  availableBeds: { en: 'Available Beds', mr: 'उपलब्ध खाटा', hi: 'उपलब्ध बेड' },
  icuUnits: { en: 'ICU Units', mr: 'ICU युनिट्स', hi: 'आईसीयू इकाइयां' },
  status: { en: 'Status', mr: 'स्थिती', hi: 'स्थिति' },
  actions: { en: 'Actions', mr: 'कृती', hi: 'कार्रवाई' },
  viewDetails: { en: 'View Details', mr: 'तपशील पहा', hi: 'विवरण देखें' },

  // Statuses
  operational: { en: 'Operational', mr: 'कार्यरत (Operational)', hi: 'परिचालन में (Operational)' },
  criticalLoad: { en: 'Critical Load', mr: 'गंभीर भार (Critical)', hi: 'गंभीर भार (Critical)' },
  divert: { en: 'DIVERT', mr: 'डायव्हर्ट (पूर्ण भरले)', hi: 'डायवर्ट (पूर्ण भरा)' },
  nominal: { en: 'NOMINAL', mr: 'सामान्य (Nominal)', hi: 'सामान्य (Nominal)' },

  // Hospitals Directory
  hospitalsDirectory: { en: 'Hospitals Directory', mr: 'रुग्णालयांची सूची', hi: 'अस्पताल निर्देशिका' },
  hospitalsDirectorySub: { 
    en: 'Manage and monitor health infrastructure, ICU bed availability, and logistics across districts.', 
    mr: 'जिल्हानिहाय आरोग्य पायाभूत सुविधा, अतिदक्षता खाटा आणि संसाधनांचे व्यवस्थापन करा.', 
    hi: 'जिलों में स्वास्थ्य बुनियादी ढांचे, आईसीयू बेड उपलब्धता और लॉजिस्टिक्स का प्रबंधन और निगरानी करें।' 
  },
  registerFacility: { en: 'Register Facility', mr: 'नवीन रुग्णालय जोडा', hi: 'नया अस्पताल जोड़ें' },
  totalFacilitiesMonitored: { en: 'Total Facilities Monitored', mr: 'एकूण नोंदणीकृत रुग्णालये', hi: 'कुल पंजीकृत अस्पताल' },
  bloodReserves: { en: 'Blood Reserves (O- Negative)', mr: 'रक्तसाठा (O- निगेटिव्ह)', hi: 'रक्त भंडार (O- नेगेटिव)' },
  allStates: { en: 'All States', mr: 'सर्व राज्ये', hi: 'सभी राज्य' },
  allDistricts: { en: 'All Districts', mr: 'सर्व जिल्हे', hi: 'सभी जिले' },
  resetFilters: { en: 'Reset Filters', mr: 'फिल्टर रीसेट करा', hi: 'फ़िल्टर रीसेट करें' },
  facilityDossier: { en: 'FACILITY DOSSIER', mr: 'रुग्णालय तपशील', hi: 'अस्पताल विस्तृत विवरण' },
  ventilatorsStandby: { en: 'Ventilators Standby', mr: 'व्हेंटिलेटर सज्जता', hi: 'वेंटिलेटर स्टैंडबाय' },
  emergencyCapacityUpdate: { en: 'Emergency Capacity Update', mr: 'खाटांची संख्या अपडेट करा', hi: 'आपातकालीन बेड क्षमता अपडेट करें' },
  availableIcuInput: { en: 'Available ICU Beds', mr: 'उपलब्ध ICU खाटा', hi: 'उपलब्ध आईसीयू बेड' },
  operationalStatusInput: { en: 'Operational Status', mr: 'कार्यरत स्थिती', hi: 'परिचालन स्थिति' },
  saveFacilityUpdate: { en: 'Save Facility Update', mr: 'माहिती सेव्ह करा', hi: 'अस्पताल विवरण सहेजें' },
  savingChanges: { en: 'Saving Changes...', mr: 'सेव्ह करत आहे...', hi: 'सहेजा जा रहा है...' },
  close: { en: 'Close', mr: 'बंद करा', hi: 'बंद करें' },

  // Risk Assessment
  maternalRiskAssessment: { en: 'Maternal Risk Assessment', mr: 'मातृ जोखीम मूल्यमापन', hi: 'मातृ जोखिम मूल्यांकन' },
  maternalRiskSub: { 
    en: 'Real-time clinical data entry and ML-driven obstetric risk stratification.', 
    mr: 'क्लिनिकल डेटा नोंदणी आणि एआय-आधारित प्रसूतीपूर्व जोखीम तपासणी.', 
    hi: 'रियल-टाइम क्लिनिकल डेटा प्रविष्टि और एमएल-संचालित प्रसूति जोखिम स्तरीकरण।' 
  },
  icmrEngineActive: { en: 'ICMR Clinical Engine Active', mr: 'ICMR मानकांवर आधारित एआय इंजिन', hi: 'आईसीएमआर (ICMR) क्लिनिकल इंजन सक्रिय' },
  clinicalDataEntry: { en: 'Clinical Data Entry', mr: 'क्लिनिकल डेटा नोंदवा', hi: 'क्लिनिकल डेटा प्रविष्टि' },
  clinicalDataSub: { 
    en: 'Enter current maternal measurements and laboratory biomarkers.', 
    mr: 'मातेचे चालू रक्तदाब, साखर, नाडी आणि तापमान नोंदवा.', 
    hi: 'वर्तमान मातृ माप और प्रयोगशाला बायोमार्कर दर्ज करें।' 
  },
  loadSampleData: { en: 'Load Sample Data', mr: 'नमुना डेटा भरा', hi: 'नमूना डेटा भरें' },
  age: { en: 'Age', mr: 'वय', hi: 'आयु' },
  heartRate: { en: 'Heart Rate', mr: 'हृदयाचे ठोके (नाडी)', hi: 'हृदय गति (नाड़ी)' },
  systolicBp: { en: 'Systolic BP', mr: 'सिस्टॉलिक रक्तदाब', hi: 'सिस्टोलिक रक्तचाप (SBP)' },
  diastolicBp: { en: 'Diastolic BP', mr: 'डायस्टॉलिक रक्तदाब', hi: 'डायस्टोलिक रक्तचाप (DBP)' },
  bloodSugar: { en: 'Blood Sugar (BS)', mr: 'रक्तातील साखर (BS)', hi: 'रक्त शर्करा (BS)' },
  bodyTemp: { en: 'Body Temperature', mr: 'शरीराचे तापमान', hi: 'शरीर का तापमान' },
  resetForm: { en: 'Reset Form', mr: 'फॉर्म रीसेट करा', hi: 'फॉर्म रीसेट करें' },
  predictRisk: { en: 'Predict Risk', mr: 'जोखीम तपासा', hi: 'जोखिम का अनुमान लगाएं' },
  evaluatingBiomarkers: { en: 'Evaluating Biomarkers...', mr: 'तपासणी सुरू आहे...', hi: 'बायोमार्कर का मूल्यांकन हो रहा है...' },
  assessmentResult: { en: 'Assessment Result', mr: 'मूल्यमापन निष्कर्ष', hi: 'मूल्यांकन परिणाम' },
  noAssessmentYet: { en: 'No Assessment Yet', mr: 'अद्याप तपासणी झालेली नाही', hi: 'अभी तक कोई मूल्यांकन नहीं हुआ' },
  noAssessmentPrompt: { 
    en: 'Enter the maternal measurements and select Predict Risk to evaluate clinical severity.', 
    mr: 'मातेची माहिती भरून "जोखीम तपासा" बटणावर क्लिक करा.', 
    hi: 'क्लिनिकल गंभीरता का मूल्यांकन करने के लिए मातृ माप दर्ज करें और "जोखिम का अनुमान लगाएं" चुनें।' 
  },
  riskIndex: { en: 'Risk Index', mr: 'जोखीम निर्देशांक', hi: 'जोखिम सूचकांक' },
  protocolRecommendations: { en: 'Protocol Recommendations', mr: 'शिफारस केलेल्या वैद्यकीय कृती', hi: 'प्रोटोकॉल अनुशंसाएं' },
  clinicalSupportNote: { 
    en: 'Clinical Decision Support Engine • Compliant with Indian Council of Medical Research (ICMR) Obstetric Guidelines', 
    mr: 'क्लिनिकल निर्णय समर्थन प्रणाली • भारतीय वैद्यकीय संशोधन परिषद (ICMR) मार्गदर्शक तत्त्वांनुसार', 
    hi: 'क्लिनिकल निर्णय समर्थन इंजन • भारतीय चिकित्सा अनुसंधान परिषद (ICMR) प्रसूति दिशानिर्देशों के अनुरूप' 
  },

  // Admin & Governance
  adminGovernanceCenter: { en: 'Admin & Governance Center', mr: 'प्रशासन व नियामक नियंत्रण केंद्र', hi: 'प्रशासन एवं नियामक नियंत्रण केंद्र' },
  adminGovernanceSub: { 
    en: 'System telemetry diagnostics, master audit trail, and regional routing governance.', 
    mr: 'प्रणाली डायग्नोस्टिक्स, मास्टर ऑडिट नोंदी आणि प्रादेशिक संदर्भ मार्ग नियमन.', 
    hi: 'सिस्टम टेलीमेट्री डायग्नोस्टिक्स, मास्टर ऑडिट ट्रेल और क्षेत्रीय रूटिंग प्रशासन।' 
  },
  masterControls: { en: 'MASTER CONTROLS', mr: 'मुख्य नियंत्रण', hi: 'मुख्य नियंत्रण' },
  exportAuditLogs: { en: 'Export Audit Logs', mr: 'ऑडिट नोंदी डाऊनलोड (CSV)', hi: 'ऑडिट लॉग डाउनलोड करें (CSV)' },
  broadcastAlert: { en: 'Broadcast Alert', mr: 'आपत्कालीन संदेश पाठवा', hi: 'आपातकालीन अलर्ट प्रसारित करें' },
  gatewayUptime: { en: 'Gateway Uptime', mr: 'सर्व्हर अपटाइम', hi: 'गेटवे अपटाइम' },
  mlLatency: { en: 'ML Inference Latency', mr: 'एआय प्रतिसाद गती', hi: 'एमएल इनफेरेंस विलंबता' },
  activeWebsockets: { en: 'Active WebSockets', mr: 'सक्रिय जोडणी', hi: 'सक्रिय वेबसॉकेट' },
  routingQueue: { en: 'Emergency Routing Queue', mr: 'प्रलंबित संदर्भ विनंत्या', hi: 'आपातकालीन रूटिंग कतार' },
  masterAuditTrailTab: { en: 'Master Audit Trail', mr: 'मास्टर ऑडिट नोंदी', hi: 'मास्टर ऑडिट ट्रेल' },
  regionalGovTab: { en: 'Regional Routing Governance', mr: 'प्रादेशिक मार्ग नियमन', hi: 'क्षेत्रीय रूटिंग प्रशासन' },
  cliniciansTab: { en: 'Clinicians & Access Roles', mr: 'वैद्यकीय अधिकारी व परवानग्या', hi: 'चिकित्सा अधिकारी एवं अनुमतियां' },
  filterBySeverity: { en: 'Filter by Severity:', mr: 'तीव्रतेनुसार फिल्टर:', hi: 'गंभीरता के अनुसार फ़िल्टर:' },
  authorizeClinician: { en: 'Authorize Clinician', mr: 'नवीन वैद्यकीय अधिकारी जोडा', hi: 'नए चिकित्सा अधिकारी को जोड़ें' },
  saveGovernanceConfig: { en: 'Save Governance Configuration', mr: 'नियमन सेटिंग्ज सेव्ह करा', hi: 'प्रशासन कॉन्फ़िगरेशन सहेजें' },

  // Analytics & Heatmap
  analyticsTitle: { en: 'Maternal Health Analytics & Regional Heatmap', mr: 'मातृ आरोग्य विश्लेषण व प्रादेशिक हीटमॅप', hi: 'मातृ स्वास्थ्य विश्लेषण एवं क्षेत्रीय हीटमैप' },
  analyticsSub: { 
    en: 'Epidemiological metrics, risk distributions, transit velocities, and facility capacity trends across Maharashtra.', 
    mr: 'महाराष्ट्रातील मातृ आरोग्य आकडेवारी, जोखीम वितरण, रुग्णवाहिका वेग आणि खाटांचे विश्लेषण.', 
    hi: 'महाराष्ट्र भर में महामारी विज्ञान मेट्रिक्स, जोखिम वितरण, पारगमन गति और सुविधा क्षमता रुझान।' 
  },
  liveEpidemiology: { en: 'LIVE EPIDEMIOLOGY', mr: 'थेट विश्लेषण', hi: 'लाइव महामारी विज्ञान' },
  maternalScreenings: { en: 'Maternal Screenings', mr: 'एकूण तपासण्या', hi: 'कुल मातृ जांच' },
  avgTimeToCare: { en: 'Average Time-to-Care', mr: 'सरासरी उपचार वेळ', hi: 'उपचार का औसत समय' },
  mlAccuracy: { en: 'ML Prediction Accuracy', mr: 'एआय अचूकता दर', hi: 'एमएल भविष्यवाणी सटीकता' },
  districtRiskStratification: { en: 'District Risk Stratification & ICU Stress Index', mr: 'जिल्हानिहाय जोखीम व ICU भार निर्देशांक', hi: 'जिलावार जोखिम स्तरीकरण एवं आईसीयू तनाव सूचकांक' },
  districtRiskSub: { en: 'Regional breakdown of Normal, Prep, and Emergency Dispatch case proportions.', mr: 'सामान्य, मध्यम आणि आपत्कालीन गंभीर रुग्णांचे प्रमाण.', hi: 'सामान्य, मध्यम और आपातकालीन डिस्पैच मामलों का क्षेत्रीय वितरण।' },
  primaryRiskDrivers: { en: 'Primary Maternal Risk Drivers', mr: 'प्रमुख मातृ आरोग्य जोखीम घटक', hi: 'प्रमुख मातृ जोखिम कारक' },
  primaryRiskDriversSub: { en: 'Leading physiological triggers contributing to tertiary transfer dispatches.', mr: 'तातडीने संदर्भास कारणीभूत ठरलेली प्रमुख वैद्यकीय लक्षणे.', hi: 'तृतीयक स्थानांतरण को प्रेरित करने वाले प्रमुख शारीरिक कारण।' },
  recentCaseOutcomes: { en: 'Recent High-Risk Case Outcomes & Transfer Efficacy', mr: 'नुकत्याच झालेल्या गंभीर केसेस व त्यांचे निष्कर्ष', hi: 'हाल के उच्च-जोखिम मामलों के परिणाम एवं स्थानांतरण प्रभावशीलता' },
  recentCaseSub: { en: 'Closed loop tracking of maternal transfers from initial AI assessment to clinical arrival.', mr: 'एआय तपासणीपासून रुग्णालयातील उपचारापर्यंतचा संपूर्ण प्रवास.', hi: 'प्रारंभिक एआई मूल्यांकन से लेकर अस्पताल में भर्ती होने तक का पूरा विवरण।' }
};

interface ThemeLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('maatrimarg_lang') as Language) || 'en';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('maatrimarg_theme') as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('maatrimarg_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('maatrimarg_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (key: string): string => {
    if (DICTIONARY[key]) {
      return DICTIONARY[key][language] || DICTIONARY[key].en;
    }
    return key;
  };

  return (
    <ThemeLanguageContext.Provider value={{ language, setLanguage, theme, toggleTheme, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
