const fs = require('fs');

const newKeys = {
  en: {
    high_risk: "High Risk",
    moderate_risk: "Moderate Risk",
    low_risk: "Low Risk",
    age_months: "m",
    age_years: "y",
    village_fallback: "Village",
  },
  hi: {
    high_risk: "उच्च जोखिम (High Risk)",
    moderate_risk: "मध्यम जोखिम (Moderate Risk)",
    low_risk: "कम जोखिम (Low Risk)",
    age_months: "महीने",
    age_years: "वर्ष",
    village_fallback: "गाँव",
  },
  mr: {
    high_risk: "उच्च धोका (High Risk)",
    moderate_risk: "मध्यम धोका (Moderate Risk)",
    low_risk: "कमी धोका (Low Risk)",
    age_months: "महिने",
    age_years: "वर्षे",
    village_fallback: "गाव",
  },
  ta: {
    high_risk: "அதிக ஆபத்து (High Risk)",
    moderate_risk: "மிதமான ஆபத்து (Moderate Risk)",
    low_risk: "குறைந்த ஆபத்து (Low Risk)",
    age_months: "மாதங்கள்",
    age_years: "ஆண்டுகள்",
    village_fallback: "கிராமம்",
  }
};

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

['en', 'mr', 'hi', 'ta'].forEach(lang => {
  const keyStr = Object.entries(newKeys[lang]).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
  code = code.replace(`${lang}: {`, `${lang}: {\n${keyStr}`);
});

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log('Round 7 translation keys injected!');
