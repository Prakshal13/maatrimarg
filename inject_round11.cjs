const fs = require('fs');
const newKeys = {
  en: { "primary_risk_drivers": "Primary Risk Drivers" },
  hi: { "primary_risk_drivers": "प्राथमिक जोखिम चालक" },
  mr: { "primary_risk_drivers": "प्राथमिक धोका घटक" },
  ta: { "primary_risk_drivers": "முதன்மையான ஆபத்து காரணிகள்" }
};

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

['en', 'mr', 'hi', 'ta'].forEach(lang => {
  const keyStr = Object.entries(newKeys[lang]).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
  code = code.replace(`${lang}: {`, `${lang}: {\n${keyStr}`);
});

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log('Round 11 keys injected!');
