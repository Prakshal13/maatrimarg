const fs = require('fs');

const newKeys = {
  en: {
    // Audit trail action labels
    action_emergency_dispatch: "Emergency Route Dispatch",
    action_status_updated: "Referral Status Updated",
    action_referral_acknowledged: "Referral Acknowledged",
    action_icu_escalate: "ICU Capacity Override / Escalate",
    action_sos_beacon: "SOS Beacon Triggered",
    action_gps_sync: "Live GPS Location Sync",
    action_sms_dispatch: "Automated SMS Dispatch",
    action_capacity_updated: "Hospital Capacity Updated",
    showing_label: "Showing",
    audit_event_entries: "audit event entries",
    // Clinical outcomes - maternal
    outcome_stable_delivery: "Stable Institutional Delivery",
    outcome_emergency_csection: "Successful Emergency C-Section",
    outcome_high_risk_obs: "Admitted for High-Risk Observation",
    outcome_nicu_safe_delivery: "NICU Bed Allocated & Safe Delivery",
    outcome_routine_phc: "Routine Safe Delivery at PHC",
    // Clinical outcomes - pediatric
    outcome_sepsis_stable: "Sepsis Protocol Applied • Stable",
    outcome_oxygen_therapy: "Oxygen Therapy Active • SpO2 96%",
    outcome_oral_rehydration: "Oral Rehydration & Observation",
    outcome_phototherapy: "Phototherapy & Antibiotic IV",
    outcome_sam_kit: "Nutritional SAM Kit Dispatched",
  },
  hi: {
    action_emergency_dispatch: "आपातकालीन मार्ग प्रेषण",
    action_status_updated: "रेफरल स्थिति अपडेट",
    action_referral_acknowledged: "रेफरल स्वीकृत",
    action_icu_escalate: "आईसीयू क्षमता ओवरराइड / एस्केलेट",
    action_sos_beacon: "एसओएस बीकन ट्रिगर",
    action_gps_sync: "लाइव जीपीएस स्थान सिंक",
    action_sms_dispatch: "स्वचालित एसएमएस प्रेषण",
    action_capacity_updated: "अस्पताल क्षमता अपडेट",
    showing_label: "दिखाया जा रहा है",
    audit_event_entries: "ऑडिट इवेंट प्रविष्टियाँ",
    outcome_stable_delivery: "स्थिर संस्थागत प्रसव",
    outcome_emergency_csection: "सफल आपातकालीन सिजेरियन",
    outcome_high_risk_obs: "उच्च-जोखिम अवलोकन के लिए भर्ती",
    outcome_nicu_safe_delivery: "NICU बेड आवंटित और सुरक्षित प्रसव",
    outcome_routine_phc: "PHC पर नियमित सुरक्षित प्रसव",
    outcome_sepsis_stable: "सेप्सिस प्रोटोकॉल लागू • स्थिर",
    outcome_oxygen_therapy: "ऑक्सीजन थेरेपी सक्रिय • SpO2 96%",
    outcome_oral_rehydration: "मौखिक पुनर्जलीकरण और अवलोकन",
    outcome_phototherapy: "फोटोथेरेपी और एंटीबायोटिक IV",
    outcome_sam_kit: "पोषण SAM किट भेजी गई",
  },
  mr: {
    action_emergency_dispatch: "आपत्कालीन मार्ग प्रेषण",
    action_status_updated: "रेफरल स्थिती अपडेट",
    action_referral_acknowledged: "रेफरल मान्य केले",
    action_icu_escalate: "आयसीयू क्षमता ओव्हरराइड / एस्केलेट",
    action_sos_beacon: "एसओएस बीकन सक्रिय",
    action_gps_sync: "थेट जीपीएस स्थान सिंक",
    action_sms_dispatch: "स्वयंचलित एसएमएस प्रेषण",
    action_capacity_updated: "रुग्णालय क्षमता अपडेट",
    showing_label: "दर्शवित आहे",
    audit_event_entries: "ऑडिट इव्हेंट नोंदी",
    outcome_stable_delivery: "स्थिर संस्थात्मक प्रसव",
    outcome_emergency_csection: "यशस्वी आपत्कालीन सिझेरियन",
    outcome_high_risk_obs: "उच्च-जोखीम निरीक्षणासाठी दाखल",
    outcome_nicu_safe_delivery: "NICU बेड वाटप आणि सुरक्षित प्रसव",
    outcome_routine_phc: "PHC वर नियमित सुरक्षित प्रसव",
    outcome_sepsis_stable: "सेप्सिस प्रोटोकॉल लागू • स्थिर",
    outcome_oxygen_therapy: "ऑक्सिजन थेरपी सक्रिय • SpO2 96%",
    outcome_oral_rehydration: "तोंडावाटे पुनर्जलीकरण आणि निरीक्षण",
    outcome_phototherapy: "फोटोथेरपी आणि अँटीबायोटिक IV",
    outcome_sam_kit: "पोषण SAM किट पाठवली",
  },
  ta: {
    action_emergency_dispatch: "அவசர வழி அனுப்புதல்",
    action_status_updated: "பரிந்துரை நிலை புதுப்பிக்கப்பட்டது",
    action_referral_acknowledged: "பரிந்துரை ஏற்கப்பட்டது",
    action_icu_escalate: "ICU திறன் மேலெழுதல் / தீவிரமாக்கல்",
    action_sos_beacon: "SOS பிரகாசம் தூண்டப்பட்டது",
    action_gps_sync: "நேரடி GPS இருப்பிட ஒத்திசைவு",
    action_sms_dispatch: "தானியங்கி SMS அனுப்புதல்",
    action_capacity_updated: "மருத்துவமனை திறன் புதுப்பிக்கப்பட்டது",
    showing_label: "காட்டப்படுகிறது",
    audit_event_entries: "தணிக்கை நிகழ்வு உள்ளீடுகள்",
    outcome_stable_delivery: "நிலையான நிறுவன பிரசவம்",
    outcome_emergency_csection: "வெற்றிகரமான அவசர சிசேரியன்",
    outcome_high_risk_obs: "அதிக ஆபத்து கண்காணிப்புக்காக அனுமதிக்கப்பட்டது",
    outcome_nicu_safe_delivery: "NICU படுக்கை ஒதுக்கப்பட்டது & பாதுகாப்பான பிரசவம்",
    outcome_routine_phc: "PHC இல் வழக்கமான பாதுகாப்பான பிரசவம்",
    outcome_sepsis_stable: "செப்சிஸ் நெறிமுறை பயன்படுத்தப்பட்டது • நிலையான",
    outcome_oxygen_therapy: "ஆக்சிஜன் சிகிச்சை செயலில் • SpO2 96%",
    outcome_oral_rehydration: "வாய்வழி நீர்ச்சத்து & கண்காணிப்பு",
    outcome_phototherapy: "ஒளிக்கதிர் சிகிச்சை & நுண்ணுயிர் IV",
    outcome_sam_kit: "ஊட்டச்சத்து SAM கிட் அனுப்பப்பட்டது",
  }
};

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

['en', 'mr', 'hi', 'ta'].forEach(lang => {
  const keyStr = Object.entries(newKeys[lang]).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
  code = code.replace(`${lang}: {`, `${lang}: {\n${keyStr}`);
});

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log('Round 3 translation keys injected!');
