import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Nav & General
    app_title: "MaatriMarg",
    tagline: "National Maternal & Emergency Care AI Network",
    language: "Language",
    login: "Login",
    logout: "Logout",
    dashboard: "Command Center",
    hospitals: "Hospitals Directory",
    maternal_portal: "Maternal Health",
    child_portal: "Child Triage",
    chronic_portal: "Chronic Cardio",
    system_status: "System Active",
    live_bed_network: "Live Bed & Resource Network",
    
    // Landing Page
    hero_badge: "Smart India Hackathon 2026 • Problem Statement 26133",
    hero_title: "Intelligent Triage & Zero-Delay Rural Emergency Routing",
    hero_subtitle: "Bridging the critical golden hour for mothers and infants across rural Maharashtra and Tamil Nadu with real-time ML risk stratification, capacity-aware Dijkstra routing, and unified hospital dispatches.",
    launch_command_center: "Launch Command Center",
    asha_field_app: "ASHA Field App",
    hospital_bed_manager: "Hospital Facility Manager",
    explore_network: "Explore Hospital Network",
    
    // Stats
    stat_hospitals: "Connected Govt Hospitals",
    stat_districts: "Rural & Tribal Districts",
    stat_reduction: "Triage Decision Speed",
    stat_reduction_sub: "< 15 ms latency",
    stat_accuracy: "Validated ML Accuracy",
    stat_accuracy_sub: "Maternal & Child models",

    // Features Section
    feat_1_title: "Explainable Edge AI Triage",
    feat_1_desc: "Triage mothers and infants with Random Forest algorithms adapted for frontline rural healthcare vitals (mg/dL blood sugar auto-conversion, blood group matching, and local dialect diagnostics).",
    feat_2_title: "Capacity-Aware Dijkstra Routing",
    feat_2_desc: "Dynamic graph routing with rural tortuosity factor (1.25x), blood bank unit reservation (O+, O-, A+, B+, AB+), and zero-delay surgeon pre-alerting.",
    feat_3_title: "Auto-Escalation & ABDM Audit",
    feat_3_desc: "Strict state machines with auto-escalation watchdogs for unacknowledged referrals, alongside immutable clinical audit trails compliant with DISHA/ABDM.",

    // Portals
    portal_asha: "ASHA / ANM Frontline Portal",
    portal_hospital: "Hospital CMO Emergency Portal",
    portal_dho: "DHO District Command Portal",
    
    // Triage & Clinical
    vitals_entry: "Clinical Vitals Entry",
    register_patient: "Register Patient",
    patient_name: "Patient Full Name",
    age: "Age",
    village: "Village / Sub-Centre",
    blood_group: "Blood Group",
    gestational_age: "Gestational Age (Weeks)",
    blood_pressure: "Blood Pressure (Systolic / Diastolic)",
    blood_sugar: "Blood Sugar",
    heart_rate: "Heart Rate (BPM)",
    body_temp: "Body Temp (°F)",
    labor_started: "Active Labor Started",
    evaluate_risk: "Evaluate AI Risk & Route",
    triage_tier: "Triage Tier",
    risk_score: "Risk Score",
    contributing_factors: "Contributing Factors",
    nearest_hospital: "Optimal Hospital Destination",
    eta_minutes: "Estimated Travel Time",
    send_dispatch_alert: "Simulate 108 Emergency Alert",
    
    // Tiers
    tier_watch: "Watch (Routine Care)",
    tier_prep: "Prep (Pre-Alert Facility)",
    tier_dispatch: "Dispatch (Emergency 108 Ambulance)",
  },

  mr: {
    // Nav & General
    app_title: "मात्रीमार्ग",
    tagline: "राष्ट्रीय माता व बालक आपत्कालीन आरोग्य नेटवर्क",
    language: "भाषा",
    login: "लॉगिन",
    logout: "लॉगआउट",
    dashboard: "कमांड सेंटर",
    hospitals: "रुग्णालय निर्देशिका",
    maternal_portal: "माता आरोग्य",
    child_portal: "बालक ट्रायज",
    chronic_portal: "हृदयरोग तपासणी",
    system_status: "प्रणाली सक्रिय",
    live_bed_network: "थेट बेड व रक्तसाठा नेटवर्क",

    // Landing Page
    hero_badge: "स्मार्ट इंडिया हॅकाथॉन २०२६ • समस्या विधान २६१३३",
    hero_title: "अचूक ट्रायज आणि ग्रामीण भागासाठी तत्काळ रुग्णवाहिका मार्गनिर्देशन",
    hero_subtitle: "महाराष्ट्रातील आणि तामिळनाडूतील ग्रामीण भागातील माता व बालकांसाठी सुवर्ण तासाचे (Golden Hour) रक्षण — अचूक ML जोखीम मूल्यमापन आणि क्षमता-आधारित रुग्णालय मार्गनिर्देशन.",
    launch_command_center: "कमांड सेंटर सुरू करा",
    asha_field_app: "आशा वर्कर ॲप",
    hospital_bed_manager: "रुग्णालय व्यवस्थापन",
    explore_network: "रुग्णालय नेटवर्क पहा",

    // Stats
    stat_hospitals: "जोडलेली सरकारी रुग्णालये",
    stat_districts: "ग्रामीण व आदिवासी जिल्हे",
    stat_reduction: "ट्रायज निर्णय वेग",
    stat_reduction_sub: "< १५ मिलीसेकंद",
    stat_accuracy: "तपासलेली ML अचूकता",
    stat_accuracy_sub: "माता व बालक मॉडेल्स",

    // Features Section
    feat_1_title: "पारदर्शक AI ट्रायज",
    feat_1_desc: "स्थानिक भाषेत (मराठी/हिंदी/तमिळ) अचूक निदान, रक्तातील साखरेचे स्वयंचलित रूपांतर आणि स्थानिक आरोग्य सेविकांसाठी सुलभ रचना.",
    feat_2_title: "क्षमता-आधारित डिक्सट्रा राउटिंग",
    feat_2_desc: "ग्रामीण रस्त्यांची रचना, रक्तसाठा (O+, O-, A+, B+, AB+) आणि शस्त्रक्रिया तज्ज्ञांची उपलब्धता तपासून सर्वात जलद रुग्णालयाची निवड.",
    feat_3_title: "स्वयंचलित पाठपुरावा व ऑडीट",
    feat_3_desc: "रुग्णालय प्रतिसाद न मिळाल्यास स्वयंचलित उच्च रुग्णालयाकडे वर्ग, आणि संपूर्ण डिजिटल ऑडीट नोंदी.",

    // Portals
    portal_asha: "आशा / एएनएम आरोग्य सेवक",
    portal_hospital: "रुग्णालय आपत्कालीन विभाग",
    portal_dho: "जिल्हा आरोग्य अधिकारी कमांड",

    // Triage & Clinical
    vitals_entry: "आरोग्य नोंदी प्रविष्ट करा",
    register_patient: "रुग्ण नोंदणी",
    patient_name: "रुग्णाचे पूर्ण नाव",
    age: "वय",
    village: "गाव / उपकेंद्र",
    blood_group: "रक्तगट",
    gestational_age: "गर्भावस्थेचे आठवडे",
    blood_pressure: "रक्तदाब (सिस्टोलिक / डायस्टोलिक)",
    blood_sugar: "रक्तातील साखर",
    heart_rate: "हृदयाचे ठोके (BPM)",
    body_temp: "शरीराचे तापमान (°F)",
    labor_started: "प्रसूती कळा सुरू झाल्या आहेत",
    evaluate_risk: "AI जोखीम तपासा आणि मार्ग शोधा",
    triage_tier: "ट्रायज स्तर",
    risk_score: "जोखीम गुण",
    contributing_factors: "कारणीभूत घटक",
    nearest_hospital: "योग्य रुग्णालय",
    eta_minutes: "अंदाजे पोहोच वेळ",
    send_dispatch_alert: "१०८ आपत्कालीन अलर्ट पाठवा",

    // Tiers
    tier_watch: "निरीक्षण (नियमित तपासणी)",
    tier_prep: "तयारी (रुग्णालय पूर्व-सूचना)",
    tier_dispatch: "तातडीने पाठवा (१०८ आपत्कालीन रुग्णवाहिका)",
  },

  hi: {
    // Nav & General
    app_title: "मातृमार्ग",
    tagline: "राष्ट्रीय मातृ एवं आपातकालीन स्वास्थ्य नेटवर्क",
    language: "भाषा",
    login: "लॉगिन",
    logout: "लॉगआउट",
    dashboard: "कमांड सेंटर",
    hospitals: "अस्पताल निर्देशिका",
    maternal_portal: "मातृ स्वास्थ्य",
    child_portal: "बाल स्वास्थ्य जांच",
    chronic_portal: "हृदयरोग जांच",
    system_status: "प्रणाली सक्रिय",
    live_bed_network: "लाइव बेड और रक्त नेटवर्क",

    // Landing Page
    hero_badge: "स्मार्ट इंडिया हैकथॉन 2026 • समस्या विवरण 26133",
    hero_title: "सटीक जोखिम जांच एवं शून्य-विलंब आपातकालीन अस्पताल मार्गदर्शन",
    hero_subtitle: "ग्रामीण भारत में माताओं और शिशुओं के लिए गोल्डन आवर की सुरक्षा — वास्तविक समय ML जोखिम विश्लेषण और क्षमता-आधारित अस्पताल प्रेषण।",
    launch_command_center: "कमांड सेंटर खोलें",
    asha_field_app: "आशा फील्ड ऐप",
    hospital_bed_manager: "अस्पताल प्रबंधन",
    explore_network: "अस्पताल नेटवर्क देखें",

    // Stats
    stat_hospitals: "संबद्ध सरकारी अस्पताल",
    stat_districts: "ग्रामीण एवं जनजातीय जिले",
    stat_reduction: "निर्णय गति",
    stat_reduction_sub: "< 15 मिलीसेकंड",
    stat_accuracy: "सत्यापित ML सटीकता",
    stat_accuracy_sub: "मातृ एवं बाल मॉडल",

    // Features Section
    feat_1_title: "पारदर्शी AI ट्राइएज",
    feat_1_desc: "स्थानीय भाषाओं में सटीक विश्लेषण, ब्लड शुगर स्वतः रूपांतरण और जमीनी स्वास्थ्य कार्यकर्ताओं के लिए सुगम इंटरफेस।",
    feat_2_title: "क्षमता-आधारित डिजक्स्ट्रा रूटिंग",
    feat_2_desc: "सड़क की स्थिति, रक्त स्टॉक और सर्जन उपलब्धता के आधार पर सबसे उपयुक्त निकटतम अस्पताल का चयन।",
    feat_3_title: "ऑटो-एस्केलेशन एवं ऑडिट ट्रेल",
    feat_3_desc: "प्रतिक्रिया में देरी होने पर स्वतः उच्च अस्पताल को रेफरल, तथा पूर्ण पारदर्शी डिजिटल ऑडिट रिकॉर्ड।",

    // Portals
    portal_asha: "आशा / एएनएम कार्यकर्ता",
    portal_hospital: "अस्पताल आपातकालीन वार्ड",
    portal_dho: "जिला स्वास्थ्य अधिकारी कमांड",

    // Triage & Clinical
    vitals_entry: "स्वास्थ्य डेटा दर्ज करें",
    register_patient: "मरीज पंजीकरण",
    patient_name: "मरीज का पूरा नाम",
    age: "आयु",
    village: "गांव / उपकेंद्र",
    blood_group: "रक्त समूह",
    gestational_age: "गर्भधारण के सप्ताह",
    blood_pressure: "रक्तचाप (सिस्टोलिक / डायस्टोलिक)",
    blood_sugar: "रक्त शर्करा",
    heart_rate: "हृदय गति (BPM)",
    body_temp: "शरीर का तापमान (°F)",
    labor_started: "प्रसव पीड़ा शुरू हो चुकी है",
    evaluate_risk: "AI जोखिम जांचें और मार्ग खोजें",
    triage_tier: "ट्राइएज श्रेणी",
    risk_score: "जोखिम स्कोर",
    contributing_factors: "प्रमुख कारक",
    nearest_hospital: "उपयुक्त अस्पताल गंतव्य",
    eta_minutes: "पहुंचने का अनुमानित समय",
    send_dispatch_alert: "108 आपातकालीन अलर्ट भेजें",

    // Tiers
    tier_watch: "निगरानी (नियमित देखभाल)",
    tier_prep: "तैयारी (अस्पताल पूर्व-सूचना)",
    tier_dispatch: "आपातकालीन प्रेषण (108 एम्बुलेंस)",
  },

  ta: {
    // Nav & General
    app_title: "மாத்ரிமார்க்",
    tagline: "தேசிய தாய் மற்றும் அவசர சிகிச்சை AI நெட்வொர்க்",
    language: "மொழி",
    login: "உள்நுழைவு",
    logout: "வெளியேறு",
    dashboard: "கட்டளை மையம்",
    hospitals: "மருத்துவமனை அடைவு",
    maternal_portal: "தாய்வழி நலம்",
    child_portal: "குழந்தை அவசர சிகிச்சை",
    chronic_portal: "இதய நோய் பரிசோதனை",
    system_status: "அமைப்பு செயலில் உள்ளது",
    live_bed_network: "நேரடி படுக்கை மற்றும் இரத்த இருப்பு",

    // Landing Page
    hero_badge: "ஸ்மார்ட் இந்தியா ஹேக்கத்தான் 2026 • சிக்கல் எண் 26133",
    hero_title: "துல்லியமான அவசர சிகிச்சை மற்றும் தாமதமில்லா கிராமப்புற மருத்துவமனை வழிகாட்டல்",
    hero_subtitle: "தமிழ்நாடு மற்றும் மகாராஷ்டிரா கிராமப்புற தாய்மார்கள் மற்றும் பச்சிளங்குழந்தைகளுக்கான கோல்டன் ஹவர் பாதுகாப்பு — உடனடி ML ஆபத்து மதிப்பீடு மற்றும் திறன் அடிப்படையிலான ஆம்புலன்ஸ் வழிகாட்டல்.",
    launch_command_center: "கட்டளை மையத்தைத் தொடங்கு",
    asha_field_app: "ஆஷா கள செயலி",
    hospital_bed_manager: "மருத்துவமனை வசதி மேலாளர்",
    explore_network: "மருத்துவமனை நெட்வொர்க் காண்க",

    // Stats
    stat_hospitals: "இணைக்கப்பட்ட அரசு மருத்துவமனைகள்",
    stat_districts: "கிராமப்புற மாவட்டங்கள்",
    stat_reduction: "முடிவு வேகம்",
    stat_reduction_sub: "< 15 மில்லி வினாடிகள்",
    stat_accuracy: "சரிபார்க்கப்பட்ட ML துல்லியம்",
    stat_accuracy_sub: "தாய் & குழந்தை மாதிரிகள்",

    // Features Section
    feat_1_title: "விளக்கமளிக்கக்கூடிய AI அவசர பகுப்பாய்வு",
    feat_1_desc: "தமிழ் மொழியில் நேரடி மருத்துவ விளக்கங்கள், இரத்த சர்க்கரை தானியங்கி மாற்றம் மற்றும் களப் பணியாளர்களுக்கான எளிதான இடைமுகம்.",
    feat_2_title: "திறன் அடிப்படையிலான டைக்ஸ்ட்ரா ரூட்டிங்",
    feat_2_desc: "கிராமப்புற சாலைக் காரணிகள், இரத்த வங்கி இருப்பு (O+, O-, A+, B+, AB+) மற்றும் அறுவை சிகிச்சை நிபுணர் தயார்நிலையைக் கணக்கிட்டு சிறந்த மருத்துவமனையைத் தேர்ந்தெடுத்தல்.",
    feat_3_title: "தானியங்கி மேலனுப்பீடு & தணிக்கை பதிவு",
    feat_3_desc: "மருத்துவமனை ஒப்புதல் தாமதமானால் தானாகவே உயர் மருத்துவமனைக்கு மாற்றம் மற்றும் DISHA/ABDM சட்டதிட்டங்களுக்கு உட்பட்ட டிஜிட்டல் தணிக்கை.",

    // Portals
    portal_asha: "ஆஷா / கிராம சுகாதார செவிலியர்",
    portal_hospital: "மருத்துவமனை அவசர பிரிவு",
    portal_dho: "மாவட்ட சுகாதார அலுவலர் கட்டளை மையம்",

    // Triage & Clinical
    vitals_entry: "உடல் நலத் தரவு உள்ளீடு",
    register_patient: "நோயாளி பதிவு",
    patient_name: "நோயாளியின் முழுப் பெயர்",
    age: "வயது",
    village: "கிராமம் / துணை மையம்",
    blood_group: "இரத்த வகை",
    gestational_age: "கர்ப்ப காலம் (வாரங்கள்)",
    blood_pressure: "இரத்த அழுத்தம் (சிஸ்டாலிக் / டயஸ்டாலிக்)",
    blood_sugar: "இரத்த சர்க்கரை",
    heart_rate: "இதயத் துடிப்பு (BPM)",
    body_temp: "உடல் வெப்பநிலை (°F)",
    labor_started: "பிரசவ வலி தொடங்கியுள்ளது",
    evaluate_risk: "AI ஆபத்தை மதிப்பிட்டு வழியைக் காண்க",
    triage_tier: "அவசர நிலை வகை",
    risk_score: "ஆபத்து மதிப்பீடு",
    contributing_factors: "காரணிகள்",
    nearest_hospital: "பரிந்துரைக்கப்பட்ட மருத்துவமனை",
    eta_minutes: "சென்றடையும் நேரம்",
    send_dispatch_alert: "108 அவசர எச்சரிக்கை அனுப்பு",

    // Tiers
    tier_watch: "கண்காணிப்பு (வழக்கமான பராமரிப்பு)",
    tier_prep: "தயார்நிலை (முன்கூட்டிய எச்சரிக்கை)",
    tier_dispatch: "அவசர அனுப்புதல் (108 அவசர ஊர்தி)",
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('maatrimarg_lang') || 'en';
  });

  const changeLanguage = (newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLang(newLang);
      localStorage.setItem('maatrimarg_lang', newLang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
