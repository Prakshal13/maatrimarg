const fs = require('fs');

const newKeys = {
  en: {
    live_device_gps_input: "Live Device GPS Location",
    coordinates_label: "Coordinates",
    locating_device: "Locating device position...",
    gps_error: "GPS permission denied or timeout. Using central emergency coordinates.",
    icu_label: "ICU",
    beds_label: "Beds",
    state_maharashtra: "Maharashtra",
    default_hospital_campus: "Civil District Hospital Campus",
  },
  hi: {
    live_device_gps_input: "लाइव डिवाइस जीपीएस स्थान",
    coordinates_label: "निर्देशांक",
    locating_device: "डिवाइस का स्थान खोजा जा रहा है...",
    gps_error: "जीपीएस अनुमति अस्वीकृत या टाइमआउट। केंद्रीय आपातकालीन निर्देशांक का उपयोग कर रहे हैं।",
    icu_label: "आईसीयू",
    beds_label: "बेड",
    state_maharashtra: "महाराष्ट्र",
    default_hospital_campus: "सिविल डिस्ट्रिक्ट हॉस्पिटल कैंपस",
  },
  mr: {
    live_device_gps_input: "थेट डिव्हाइस GPS स्थान",
    coordinates_label: "निर्देशांक",
    locating_device: "डिव्हाइसचे स्थान शोधत आहे...",
    gps_error: "GPS परवानगी नाकारली किंवा कालबाह्य. केंद्रीय आपत्कालीन निर्देशांक वापरत आहे.",
    icu_label: "आयसीयू",
    beds_label: "बेड",
    state_maharashtra: "महाराष्ट्र",
    default_hospital_campus: "सिव्हिल डिस्ट्रिक्ट हॉस्पिटल कॅम्पस",
  },
  ta: {
    live_device_gps_input: "நேரடி சாதன ஜிபிஎஸ் இருப்பிடம்",
    coordinates_label: "ஆயத்தொலைவுகள்",
    locating_device: "சாதன இருப்பிடத்தைக் கண்டறிகிறது...",
    gps_error: "ஜிபிஎஸ் அனுமதி மறுக்கப்பட்டது அல்லது காலாவதியானது. மைய அவசர ஆயத்தொலைவுகளைப் பயன்படுத்துகிறது.",
    icu_label: "ஐசியு",
    beds_label: "படுக்கைகள்",
    state_maharashtra: "மகாராஷ்டிரா",
    default_hospital_campus: "சிவில் மாவட்ட மருத்துவமனை வளாகம்",
  }
};

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

['en', 'mr', 'hi', 'ta'].forEach(lang => {
  const keyStr = Object.entries(newKeys[lang]).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
  code = code.replace(`${lang}: {`, `${lang}: {\n${keyStr}`);
});

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log('Round 6 translation keys injected!');
