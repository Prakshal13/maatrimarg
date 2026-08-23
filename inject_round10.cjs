const fs = require('fs');
const newKeys = {
  en: { "state_Maharashtra": "Maharashtra", "state_Tamil Nadu": "Tamil Nadu" },
  hi: { "state_Maharashtra": "महाराष्ट्र", "state_Tamil Nadu": "तमिलनाडु" },
  mr: { "state_Maharashtra": "महाराष्ट्र", "state_Tamil Nadu": "तमिळनाडू" },
  ta: { "state_Maharashtra": "மகாராஷ்டிரா", "state_Tamil Nadu": "தமிழ்நாடு" }
};

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

['en', 'mr', 'hi', 'ta'].forEach(lang => {
  const keyStr = Object.entries(newKeys[lang]).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
  code = code.replace(`${lang}: {`, `${lang}: {\n${keyStr}`);
});

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log('Round 10 (States) translation keys injected!');
