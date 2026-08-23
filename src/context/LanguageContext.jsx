import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Nav & Brand
    app_title: "MaatriMarg",
    tagline: "National Maternal & Emergency Care AI Network",
    national_command: "National Command Infrastructure Active • Maharashtra & Tamil Nadu",
    home_sos_route: "Home SOS Route (Google Maps)",
    clinician_login_btn: "Clinician Login",
    dho_hq: "DHO Command HQ",

    // Landing Page
    hero_headline_1: "Maternal Healthcare",
    hero_headline_2: "Intelligence Platform",
    hero_subtitle: "Predict clinical risk. Optimize real-time ICU bed allocation. Seamlessly route mothers to the right tertiary facilities across districts.",
    btn_login_here: "Login Here",
    btn_explore_matrix: "Explore Live Matrix",
    btn_explore_platform: "Explore Platform",
    active_monitoring: "Active Monitoring",
    operational_fidelity: "Network Operational Fidelity",
    clinical_quote: "Advancing maternal outcomes through clinical machine intelligence and regional infrastructure routing.",
    network_state_optimal: "Network State: Optimal Transit Readiness",

    // System Capabilities
    sys_cap_title: "Comprehensive System Capabilities",
    sys_cap_subtitle: "Modular intelligence designed for clinical precision and operational scale.",
    cap_ai_title: "AI Risk Assessment",
    cap_ai_desc: "Predictive modeling identifying high-risk pregnancies before complications arise, ensuring proactive clinical intervention.",
    cap_hosp_title: "Hospital Network Intelligence",
    cap_hosp_desc: "Real-time mapping of facility capabilities, bed availability, and specialized care units across regions.",
    cap_route_title: "Smart Routing",
    cap_route_desc: "Algorithmic patient transfer protocols optimizing distance, urgency, and specific facility readiness.",
    cap_cmd_title: "Real-Time Command Center",
    cap_cmd_desc: "A centralized, high-fidelity overview for administrators to monitor regional maternal health logistics instantly.",

    // Login Page
    login_title: "MaatriMarg",
    login_subtitle: "Secure access to Maharashtra & Tamil Nadu Maternal Healthcare Intelligence Platform.",
    clinician_id_label: "Clinician / Employee ID",
    clinician_id_placeholder: "e.g. MH-DOC-8492 or Mobile Number",
    security_key_label: "Security Key / Password",
    security_key_placeholder: "Enter secure access key",
    forgot_key: "Forgot Key?",
    verify_device: "Verify device for 30 days",
    btn_authenticate: "Authenticate Access",
    encrypted_session: "End-to-End Encrypted Session",
    tab_asha: "ASHA / ANM",
    tab_cmo: "Hospital CMO",
    tab_dho: "DHO Command",

    // Command Center
    cmd_header_title: "Real-time Maternal Logistics Command",
    cmd_header_subtitle: "MaatriMarg System Overview • Active Routing Matrix across Maharashtra & Tamil Nadu",
    net_efficiency: "Network Efficiency",
    active_dispatches: "Active Dispatches",
    icu_available: "Available ICU Beds",
    critical_diversions: "Critical Diversions",
    btn_topography: "Topography",
    btn_satellite: "Satellite",
    search_hospitals_ph: "Search hospitals, districts...",
    btn_watchdog: "Auto-Escalate Watchdog",
    active_missions_title: "Active Missions",
    telemetry_table_title: "Hospital Telemetry & Capacity Grid",

    // Hospitals Directory
    hosp_title: "Hospitals & Facilities Directory",
    hosp_subtitle: "Real-time bed availability, specialized neonatal ICU, and blood bank reserves across 165 government hospitals.",
    filter_state: "State",
    filter_district: "District",
    total_facilities: "Total Facilities",
    icu_nicu_beds: "ICU & NICU Beds Available",
    blood_units_o_neg: "Blood Units (O- Negative Reserve)",
    btn_update_capacity: "+ Update Facility Capacity",
    col_facility: "FACILITY NAME",
    col_district: "DISTRICT & STATE",
    col_status: "STATUS",
    col_gen_beds: "GEN BEDS",
    col_nicu_beds: "NICU BEDS",
    col_surgeon: "SURGEON ON DUTY",
    col_actions: "ACTIONS",
    btn_edit_capacity: "Edit Live Capacity",

    // Maternal Risk Assessment Form
    maternal_title: "Maternal Risk Assessment",
    maternal_subtitle: "Real-time clinical data entry and ML-driven risk evaluation.",
    clinical_entry_title: "Clinical Data Entry",
    clinical_entry_sub: "Enter current maternal measurements.",
    btn_load_sample: "Load Sample Data",
    btn_reset_form: "Reset Form",
    btn_predict_risk: "Predict Risk",
    input_age: "Age",
    input_hr: "Heart Rate",
    input_sbp: "Systolic BP",
    input_dbp: "Diastolic BP",
    input_bs: "Blood Sugar (BS)",
    input_temp: "Body Temp",
    unit_years: "Years",
    unit_bpm: "bpm",
    unit_mmhg: "mmHg",
    unit_mmol: "mmol/L",
    unit_deg_f: "°F",
    assessment_result_title: "Assessment Result",
    no_assessment_yet: "No assessment yet. Enter the maternal measurements and select Predict Risk to calculate the current risk.",
    triage_tier: "Triage Tier",
    risk_score: "Risk Score",
    contributing_factors: "Contributing Factors",
    optimal_hospital: "Optimal Hospital Destination",

    // Footer
    footer_tagline: "© 2026 MaatriMarg AI. Clinical Precision, Human Care. • Smart India Hackathon PS 26133",
    terms_of_service: "Terms of Service",
    data_privacy: "Data Privacy",
    contact_admin: "Contact System Admin",
    support: "Help & Protocol Support",
    back_to_landing: "Back to Landing",
    logout_session: "Log Out Session"
  },

  mr: {
    // Nav & Brand
    app_title: "मात्रीमार्ग",
    tagline: "राष्ट्रीय माता व बालक आपत्कालीन आरोग्य नेटवर्क",
    national_command: "राष्ट्रीय कमांड नेटवर्क सक्रिय • महाराष्ट्र व तामिळनाडू",
    home_sos_route: "घरून थेट रुग्णालय मार्ग (गुगल मॅप्स)",
    clinician_login_btn: "वैद्यकीय लॉगिन",
    dho_hq: "जिल्हा आरोग्य मुख्यालय (DHO)",

    // Landing Page
    hero_headline_1: "माता आरोग्य",
    hero_headline_2: "अल्गोरिदम व बुद्धिमत्ता प्रणाली",
    hero_subtitle: "वैद्यकीय जोखीम आधीच ओळखा. थेट आयसीयू बेड वाटप आणि ग्रामीण भागातील मातांसाठी सुवर्ण तासाचे (Golden Hour) तत्काळ संरक्षण.",
    btn_login_here: "येथे लॉगिन करा",
    btn_explore_matrix: "थेट नेटवर्क पहा",
    btn_explore_platform: "प्लॅटफॉर्म पहा",
    active_monitoring: "थेट देखरेख",
    operational_fidelity: "नेटवर्क कार्यक्षमता",
    clinical_quote: "अचूक मशीन लर्निंग आणि प्रादेशिक रुग्णालय समन्वयातून माता व बालकांचे प्राण वाचवणे.",
    network_state_optimal: "नेटवर्क स्थिती: पूर्णतः सज्ज",

    // System Capabilities
    sys_cap_title: "प्रणालीची सर्वंकष वैशिष्ट्ये",
    sys_cap_subtitle: "वैद्यकीय अचूकता आणि आपत्कालीन सेवेसाठी अत्याधुनिक मॉड्यूलर तंत्रज्ञान.",
    cap_ai_title: "AI जोखीम मूल्यांकन",
    cap_ai_desc: "गुंतागुंत निर्माण होण्यापूर्वीच उच्च-जोखीम गर्भधारणा ओळखणारे अचूक प्रेडिक्टिव मॉडेल.",
    cap_hosp_title: "रुग्णालय नेटवर्क माहिती",
    cap_hosp_desc: "जिल्ह्यातील सर्व रुग्णालयांची क्षमता, उपलब्ध बेड्स, NICU आणि रक्तसाठ्याची थेट माहिती.",
    cap_route_title: "स्मार्ट मार्गनिर्देशन",
    cap_route_desc: "अंतर, रुग्णाची निकड आणि उपलब्ध शस्त्रक्रिया तज्ज्ञांनुसार सर्वात जलद रुग्णालयाची निवड.",
    cap_cmd_title: "थेट कमांड सेंटर",
    cap_cmd_desc: "जिल्हाधिकाऱ्यांना आणि आरोग्य प्रमुखांना संपूर्ण जिल्ह्याची आरोग्य परिस्थिती एकाच पडद्यावर दाखवणारे कमांड सेंटर.",

    // Login Page
    login_title: "मात्रीमार्ग",
    login_subtitle: "महाराष्ट्र व तामिळनाडू माता आरोग्य कमांड प्रणालीत सुरक्षित प्रवेश.",
    clinician_id_label: "आरोग्य सेवक / डॉक्टर आयडी",
    clinician_id_placeholder: "उदा. MH-DOC-8492 किंवा मोबाईल नंबर",
    security_key_label: "सुरक्षा पासवर्ड / पिन",
    security_key_placeholder: "सुरक्षित पासवर्ड टाका",
    forgot_key: "पासवर्ड विसरलात?",
    verify_device: "हे उपकरण ३० दिवसांसाठी सत्यापित ठेवा",
    btn_authenticate: "प्रणालीत प्रवेश करा",
    encrypted_session: "संपूर्ण सुरक्षित व एनक्रिप्टेड सत्र",
    tab_asha: "आशा / एएनएम",
    tab_cmo: "रुग्णालय CMO",
    tab_dho: "जिल्हा कमांड (DHO)",

    // Command Center
    cmd_header_title: "थेट माता आरोग्य व रुग्णवाहिका कमांड सेंटर",
    cmd_header_subtitle: "मात्रीमार्ग प्रणाली आढावा • महाराष्ट्र व तामिळनाडू सक्रिय मार्गनिर्देशन",
    net_efficiency: "नेटवर्क कार्यक्षमता",
    active_dispatches: "सक्रिय रुग्णवाहिका",
    icu_available: "उपलब्ध आयसीयू खाटा",
    critical_diversions: "अति-तातडीचे अलर्ट",
    btn_topography: "भूप्रदेश नकाशा",
    btn_satellite: "उपग्रह नकाशा",
    search_hospitals_ph: "रुग्णालये किंवा जिल्हे शोधा...",
    btn_watchdog: "स्वयंचलित पाठपुरावा वॉचडॉग",
    active_missions_title: "सक्रिय मोहिमा",
    telemetry_table_title: "रुग्णालय क्षमता व थेट माहिती तक्ता",

    // Hospitals Directory
    hosp_title: "शासकीय रुग्णालये व आरोग्य केंद्र निर्देशिका",
    hosp_subtitle: "१६५ सरकारी रुग्णालयातील उपलब्ध बेड्स, नवजात शिशु NICU आणि रक्तपेढी साठ्याची थेट माहिती.",
    filter_state: "राज्य",
    filter_district: "जिल्हा",
    total_facilities: "एकूण रुग्णालये",
    icu_nicu_beds: "उपलब्ध ICU व NICU खाटा",
    blood_units_o_neg: "रक्त साठा (O- निगेटिव्ह राखीव)",
    btn_update_capacity: "+ क्षमता अद्ययावत करा",
    col_facility: "रुग्णालयाचे नाव",
    col_district: "जिल्हा व राज्य",
    col_status: "स्थिती",
    col_gen_beds: "सामान्य खाटा",
    col_nicu_beds: "NICU खाटा",
    col_surgeon: "उपलब्ध सर्जन",
    col_actions: "क्रिया",
    btn_edit_capacity: "माहिती बदला",

    // Maternal Risk Assessment Form
    maternal_title: "माता आरोग्य जोखीम तपासणी",
    maternal_subtitle: "थेट वैद्यकीय नोंदी आणि AI आधारित जोखीम मूल्यांकन.",
    clinical_entry_title: "वैद्यकीय नोंदी प्रविष्ट करा",
    clinical_entry_sub: "मातेचे सध्याचे आरोग्य मोजमाप नोंदवा.",
    btn_load_sample: "नमुना माहिती भरा",
    btn_reset_form: "फॉर्म रीसेट करा",
    btn_predict_risk: "जोखीम तपासा",
    input_age: "वय",
    input_hr: "हृदयाचे ठोके",
    input_sbp: "सिस्टोलिक रक्तदाब",
    input_dbp: "डायस्टोलिक रक्तदाब",
    input_bs: "रक्तातील साखर (BS)",
    input_temp: "शरीराचे तापमान",
    unit_years: "वर्षे",
    unit_bpm: "ठोके/मि",
    unit_mmhg: "mmHg",
    unit_mmol: "mmol/L",
    unit_deg_f: "°F",
    assessment_result_title: "तपासणी निकाल",
    no_assessment_yet: "अद्याप तपासणी झालेली नाही. मातेचे आरोग्य मोजमाप भरून 'जोखीम तपासा' वर क्लिक करा.",
    triage_tier: "ट्रायज स्तर",
    risk_score: "जोखीम गुण",
    contributing_factors: "कारणीभूत घटक",
    optimal_hospital: "योग्य रुग्णालय गंतव्य",

    // Footer
    footer_tagline: "© २०२६ मात्रीमार्ग AI. अचूक वैद्यकीय सेवा, मानवी काळजी. • स्मार्ट इंडिया हॅकाथॉन",
    terms_of_service: "सेवा अटी",
    data_privacy: "माहिती गोपनीयता",
    contact_admin: "प्रणाली व्यवस्थापकाशी संपर्क",
    support: "मदत व आपत्कालीन सहाय्य",
    back_to_landing: "मुख्य पृष्ठावर जा",
    logout_session: "सत्र समाप्त करा (लॉगआउट)"
  },

  hi: {
    // Nav & Brand
    app_title: "मातृमार्ग",
    tagline: "राष्ट्रीय मातृ एवं आपातकालीन स्वास्थ्य नेटवर्क",
    national_command: "राष्ट्रीय कमान नेटवर्क सक्रिय • महाराष्ट्र एवं तमिलनाडु",
    home_sos_route: "घर से अस्पताल सीधा मार्ग (गूगल मैप्स)",
    clinician_login_btn: "चिकित्सकीय लॉगिन",
    dho_hq: "जिला स्वास्थ्य मुख्यालय (DHO)",

    // Landing Page
    hero_headline_1: "मातृ स्वास्थ्य",
    hero_headline_2: "कृत्रिम बुद्धिमत्ता मंच",
    hero_subtitle: "सटीक जोखिम जांच, वास्तविक समय आईसीयू बेड आवंटन, एवं ग्रामीण भारत में माताओं के लिए गोल्डन आवर की संपूर्ण सुरक्षा।",
    btn_login_here: "यहाँ लॉगिन करें",
    btn_explore_matrix: "लाइव नेटवर्क देखें",
    btn_explore_platform: "मंच देखें",
    active_monitoring: "सक्रिय निगरानी",
    operational_fidelity: "नेटवर्क विश्वसनीयता",
    clinical_quote: "मशीन इंटेलिजेंस और क्षेत्रीय अस्पताल समन्वय द्वारा मातृ एवं शिशु मृत्यु दर में रोकथाम।",
    network_state_optimal: "नेटवर्क स्थिति: पूर्णतः तत्पर",

    // System Capabilities
    sys_cap_title: "प्रणाली की संपूर्ण क्षमताएं",
    sys_cap_subtitle: "चिकित्सकीय सटीकता और आपातकालीन प्रतिक्रिया के लिए आधुनिक मॉड्यूलर तकनीक।",
    cap_ai_title: "AI जोखिम मूल्यांकन",
    cap_ai_desc: "जटिलताओं के उभरने से पहले ही उच्च जोखिम वाली गर्भावस्था की पहचान करने वाला पूर्वानुमान मॉडल।",
    cap_hosp_title: "अस्पताल नेटवर्क इंटेलिजेंस",
    cap_hosp_desc: "क्षेत्र भर में उपलब्ध सामान्य बेड, एनआईसीयू बेड और ब्लड बैंक स्टॉक का वास्तविक समय मानचित्रण।",
    cap_route_title: "स्मार्ट अस्पताल रूटिंग",
    cap_route_desc: "दूरी, मरीज की स्थिति और सर्जन उपलब्धता के आधार पर सबसे उपयुक्त निकटतम अस्पताल का चयन।",
    cap_cmd_title: "रियल-टाइम कमांड सेंटर",
    cap_cmd_desc: "प्रशासकों और मुख्य चिकित्सा अधिकारियों के लिए संपूर्ण जिले की स्वास्थ्य स्थिति का केंद्रीय अवलोकन।",

    // Login Page
    login_title: "मातृमार्ग",
    login_subtitle: "महाराष्ट्र एवं तमिलनाडु मातृ स्वास्थ्य कमान मंच में सुरक्षित प्रवेश।",
    clinician_id_label: "स्वास्थ्य कार्यकर्ता / डॉक्टर आईडी",
    clinician_id_placeholder: "उदा. MH-DOC-8492 या मोबाइल नंबर",
    security_key_label: "सुरक्षा पासवर्ड / पिन",
    security_key_placeholder: "सुरक्षित पासवर्ड दर्ज करें",
    forgot_key: "पासवर्ड भूल गए?",
    verify_device: "इस उपकरण को 30 दिनों के लिए सत्यापित रखें",
    btn_authenticate: "प्रणाली में प्रवेश करें",
    encrypted_session: "एंड-टू-एंड एन्क्रिप्टेड सत्र",
    tab_asha: "आशा / एएनएम",
    tab_cmo: "अस्पताल सीएमओ",
    tab_dho: "जिला कमान (DHO)",

    // Command Center
    cmd_header_title: "रियल-टाइम मातृ लॉजिस्टिक्स कमांड सेंटर",
    cmd_header_subtitle: "मातृमार्ग प्रणाली अवलोकन • सक्रिय अस्पताल एवं एम्बुलेंस मार्गनिर्देशन",
    net_efficiency: "नेटवर्क दक्षता",
    active_dispatches: "सक्रिय एम्बुलेंस",
    icu_available: "उपलब्ध आईसीयू बेड",
    critical_diversions: "आपातकालीन अलर्ट",
    btn_topography: "भौगोलिक नक्शा",
    btn_satellite: "सैटेलाइट नक्शा",
    search_hospitals_ph: "अस्पताल या जिला खोजें...",
    btn_watchdog: "स्वतः एस्केलेशन वॉचडॉग",
    active_missions_title: "सक्रिय मिशन",
    telemetry_table_title: "अस्पताल क्षमता एवं लाइव डेटा तालिका",

    // Hospitals Directory
    hosp_title: "शासकीय अस्पताल एवं स्वास्थ्य केंद्र निर्देशिका",
    hosp_subtitle: "165 सरकारी अस्पतालों में उपलब्ध सामान्य बेड, नवजात शिशु NICU और ब्लड बैंक स्टॉक की लाइव जानकारी।",
    filter_state: "राज्य",
    filter_district: "जिला",
    total_facilities: "कुल अस्पताल",
    icu_nicu_beds: "उपलब्ध ICU एवं NICU बेड",
    blood_units_o_neg: "रक्त स्टॉक (O- नेगेटिव आरक्षित)",
    btn_update_capacity: "+ क्षमता अपडेट करें",
    col_facility: "अस्पताल का नाम",
    col_district: "जिला एवं राज्य",
    col_status: "स्थिति",
    col_gen_beds: "सामान्य बेड",
    col_nicu_beds: "NICU बेड",
    col_surgeon: "उपलब्ध सर्जन",
    col_actions: "क्रियाएं",
    btn_edit_capacity: "विवरण संपादित करें",

    // Maternal Risk Assessment Form
    maternal_title: "मातृ स्वास्थ्य जोखिम मूल्यांकन",
    maternal_subtitle: "वास्तविक समय डेटा प्रविष्टि और AI आधारित जोखिम विश्लेषण।",
    clinical_entry_title: "स्वास्थ्य डेटा प्रविष्टि",
    clinical_entry_sub: "माता के वर्तमान स्वास्थ्य माप दर्ज करें।",
    btn_load_sample: "नमूना डेटा लोड करें",
    btn_reset_form: "फॉर्म रीसेट करें",
    btn_predict_risk: "जोखिम जांचें",
    input_age: "आयु",
    input_hr: "हृदय गति",
    input_sbp: "सिस्टोलिक रक्तचाप",
    input_dbp: "डायस्टोलिक रक्तचाप",
    input_bs: "रक्त शर्करा (BS)",
    input_temp: "शरीर का तापमान",
    unit_years: "वर्ष",
    unit_bpm: "धड़कन/मिनट",
    unit_mmhg: "mmHg",
    unit_mmol: "mmol/L",
    unit_deg_f: "°F",
    assessment_result_title: "मूल्यांकन परिणाम",
    no_assessment_yet: "अभी तक कोई परीक्षण नहीं हुआ है। स्वास्थ्य माप दर्ज करें और 'जोखिम जांचें' चुनें।",
    triage_tier: "ट्राइएज श्रेणी",
    risk_score: "जोखिम स्कोर",
    contributing_factors: "प्रमुख कारक",
    optimal_hospital: "अनुशंसित अस्पताल गंतव्य",

    // Footer
    footer_tagline: "© 2026 मातृमार्ग AI. चिकित्सकीय सटीकता, मानवीय देखभाल। • स्मार्ट इंडिया हैकथॉन",
    terms_of_service: "सेवा की शर्तें",
    data_privacy: "डेटा गोपनीयता",
    contact_admin: "प्रणाली व्यवस्थापक से संपर्क",
    support: "सहायता एवं आपातकालीन सपोर्ट",
    back_to_landing: "मुख्य पृष्ठ पर लौटें",
    logout_session: "लॉग आउट करें"
  },

  ta: {
    // Nav & Brand
    app_title: "மாத்ரிமார்க்",
    tagline: "தேசிய தாய் மற்றும் அவசர சிகிச்சை AI நெட்வொர்க்",
    national_command: "தேசிய கட்டளை நெட்வொர்க் செயலில் உள்ளது • மகாராஷ்டிரா & தமிழ்நாடு",
    home_sos_route: "வீட்டிலிருந்து நேரடி அவசர பாதை (Google Maps)",
    clinician_login_btn: "மருத்துவர் உள்நுழைவு",
    dho_hq: "மாவட்ட சுகாதார தலைமையகம் (DHO)",

    // Landing Page
    hero_headline_1: "தாய்வழி நலம்",
    hero_headline_2: "நுண்ணறிவு தளம்",
    hero_subtitle: "மருத்துவ ஆபத்தை முன்கூட்டியே கணிக்கவும். நிகழ்நேர ஐசியூ படுக்கை ஒதுக்கீடு மற்றும் அவசர காலங்களில் தாய்மார்களுக்கான நேரடி ஆம்புலன்ஸ் வழிகாட்டல்.",
    btn_login_here: "இங்கே உள்நுழைக",
    btn_explore_matrix: "நேரடி நெட்வொர்க் காண்க",
    btn_explore_platform: "தளத்தை ஆராய்க",
    active_monitoring: "நேரடி கண்காணிப்பு",
    operational_fidelity: "நெட்வொர்க் செயல்திறன்",
    clinical_quote: "மருத்துவ நுண்ணறிவு மற்றும் பிராந்திய மருத்துவமனை ஒருங்கிணைப்பு மூலம் தாய் மற்றும் சிசு மரணங்களைத் தடுத்தல்.",
    network_state_optimal: "நெட்வொர்க் நிலை: முழு தயார்நிலை",

    // System Capabilities
    sys_cap_title: "கட்டமைப்பின் முழுமையான திறன்கள்",
    sys_cap_subtitle: "மருத்துவ துல்லியம் மற்றும் அவசர கால விரைவுச் செயல்பாட்டிற்கான நவீன தொழில்நுட்பம்.",
    cap_ai_title: "AI ஆபத்து மதிப்பீடு",
    cap_ai_desc: "சிக்கல்கள் தோன்றுவதற்கு முன்பே அதிக ஆபத்துள்ள கர்ப்பங்களை முன்கூட்டியே கண்டறியும் முன்கணிப்பு மாதிரி.",
    cap_hosp_title: "மருத்துவமனை நெட்வொர்க் நுண்ணறிவு",
    cap_hosp_desc: "படுக்கை இருப்பு, பிரசவ தீவிர சிகிச்சைப் பிரிவு (NICU) மற்றும் இரத்த வங்கி இருப்பின் நிகழ்நேர வரைபடம்.",
    cap_route_title: "ஸ்மார்ட் மருத்துவமனை ரூட்டிங்",
    cap_route_desc: "தூரம், நோயாளியின் நிலை மற்றும் அறுவை சிகிச்சை நிபுணர் தயார்நிலையின் அடிப்படையில் சிறந்த மருத்துவமனை தேர்வு.",
    cap_cmd_title: "நிகழ்நேர கட்டளை மையம்",
    cap_cmd_desc: "நிர்வாகிகள் மற்றும் மாவட்ட சுகாதார அதிகாரிகளுக்கு பிராந்திய சுகாதார தளவாடங்களை உடனுக்குடன் கண்காணிக்கும் மேடை.",

    // Login Page
    login_title: "மாத்ரிமார்க்",
    login_subtitle: "மகாராஷ்டிரா மற்றும் தமிழ்நாடு தாய்வழி நலம் கட்டளை அமைப்பில் பாதுகாப்பான நுழைவு.",
    clinician_id_label: "சுகாதார பணியாளர் / மருத்துவர் ஐடி",
    clinician_id_placeholder: "எ.கா. MH-DOC-8492 அல்லது மொபைல் எண்",
    security_key_label: "பாதுகாப்பு கடவுச்சொல் / பின்",
    security_key_placeholder: "பாதுகாப்பான கடவுச்சொல்லை உள்ளிடவும்",
    forgot_key: "கடவுச்சொல் மறந்துவிட்டதா?",
    verify_device: "இந்த சாதனத்தை 30 நாட்களுக்கு நினைவில் கொள்க",
    btn_authenticate: "அமைப்பில் உள்நுழைக",
    encrypted_session: "முழுமையான மறைகுறியாக்கப்பட்ட அமர்வு",
    tab_asha: "ஆஷா / கிராம செவிலியர்",
    tab_cmo: "மருத்துவமனை CMO",
    tab_dho: "மாவட்ட கட்டளை (DHO)",

    // Command Center
    cmd_header_title: "நிகழ்நேர தாய்வழி சுகாதார கட்டளை மையம்",
    cmd_header_subtitle: "மாத்ரிமார்க் அமைப்பு கண்ணோட்டம் • நேரடி மருத்துவமனை மற்றும் ஆம்புலன்ஸ் வழிகாட்டல்",
    net_efficiency: "நெட்வொர்க் திறன்",
    active_dispatches: "செயலில் உள்ள ஆம்புலன்ஸ்கள்",
    icu_available: "கிடைக்கும் ICU படுக்கைகள்",
    critical_diversions: "அவசர கால எச்சரிக்கைகள்",
    btn_topography: "நிலப்பரப்பு வரைபடம்",
    btn_satellite: "செயற்கைக்கோள் வரைபடம்",
    search_hospitals_ph: "மருத்துவமனை அல்லது மாவட்டத்தைத் தேடுக...",
    btn_watchdog: "தானியங்கி மேலனுப்பீடு வாட்ச்டாக்",
    active_missions_title: "செயலில் உள்ள பணிகள்",
    telemetry_table_title: "மருத்துவமனை திறன் மற்றும் நேரடி தரவு அட்டவணை",

    // Hospitals Directory
    hosp_title: "அரசு மருத்துவமனைகள் அடைவு",
    hosp_subtitle: "165 அரசு மருத்துவமனைகளில் படுக்கை இருப்பு, பச்சிளங்குழந்தை NICU மற்றும் இரத்த வங்கி இருப்பு நேரடி தகவல்.",
    filter_state: "மாநிலம்",
    filter_district: "மாவட்டம்",
    total_facilities: "மொத்த மருத்துவமனைகள்",
    icu_nicu_beds: "கிடைக்கும் ICU மற்றும் NICU படுக்கைகள்",
    blood_units_o_neg: "இரத்த இருப்பு (O- நெகட்டிவ் இருப்பு)",
    btn_update_capacity: "+ படுக்கை விவரம் புதுப்பிக்க",
    col_facility: "மருத்துவமனை பெயர்",
    col_district: "மாவட்டம் மற்றும் மாநிலம்",
    col_status: "நிலை",
    col_gen_beds: "பொது படுக்கைகள்",
    col_nicu_beds: "NICU படுக்கைகள்",
    col_surgeon: "அறுவை சிகிச்சை நிபுணர்",
    col_actions: "செயல்கள்",
    btn_edit_capacity: "திறனை மாற்று",

    // Maternal Risk Assessment Form
    maternal_title: "தாய்வழி நலம் ஆபத்து மதிப்பீடு",
    maternal_subtitle: "நிகழ்நேர மருத்துவத் தரவு உள்ளீடு மற்றும் AI ஆபத்து பகுப்பாய்வு.",
    clinical_entry_title: "மருத்துவத் தரவு உள்ளீடு",
    clinical_entry_sub: "தாயின் தற்போதைய மருத்துவ அளவீடுகளை உள்ளிடவும்.",
    btn_load_sample: "மாதிரித் தரவை நிரப்புக",
    btn_reset_form: "படிவத்தை மீட்டமை",
    btn_predict_risk: "ஆபத்தை மதிப்பிடுக",
    input_age: "வயது",
    input_hr: "இதயத் துடிப்பு",
    input_sbp: "சிஸ்டாலிக் இரத்த அழுத்தம்",
    input_dbp: "டயஸ்டாலிக் இரத்த அழுத்தம்",
    input_bs: "இரத்த சர்க்கரை (BS)",
    input_temp: "உடல் வெப்பநிலை",
    unit_years: "வருடம்",
    unit_bpm: "துடிப்பு/நிமி",
    unit_mmhg: "mmHg",
    unit_mmol: "mmol/L",
    unit_deg_f: "°F",
    assessment_result_title: "பகுப்பாய்வு முடிவு",
    no_assessment_yet: "இதுவரை பரிசோதனை செய்யப்படவில்லை. அளவீடுகளை உள்ளிட்டு 'ஆபத்தை மதிப்பிடுக' பொத்தானை அழுத்தவும்.",
    triage_tier: "அவசர நிலை வகை",
    risk_score: "ஆபத்து மதிப்பீடு",
    contributing_factors: "முக்கிய காரணிகள்",
    optimal_hospital: "பரிந்துரைக்கப்பட்ட மருத்துவமனை",

    // Footer
    footer_tagline: "© 2026 மாத்ரிமார்க் AI. மருத்துவ துல்லியம், மனிதப் பாதுகாப்பு. • ஸ்மார்ட் இந்தியா ஹேக்கத்தான்",
    terms_of_service: "சேவை விதிமுறைகள்",
    data_privacy: "தரவு தனியுரிமை",
    contact_admin: "அமைப்பு நிர்வாகியைத் தொடர்பு கொள்க",
    support: "உதவி மற்றும் அவசர ஆதரவு",
    back_to_landing: "முகப்புப் பக்கத்திற்குச் செல்",
    logout_session: "வெளியேறுக"
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
