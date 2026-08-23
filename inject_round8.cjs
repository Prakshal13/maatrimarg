const fs = require('fs');

const newKeys = {
  en: {
    factor_elevated_bp: "Elevated blood pressure input",
    factor_elevated_chol: "Elevated cholesterol category",
    factor_elevated_gluc: "Elevated glucose category",
    factor_smoking: "Smoking recorded",
  },
  hi: {
    factor_elevated_bp: "उच्च रक्तचाप (Elevated BP)",
    factor_elevated_chol: "उच्च कोलेस्ट्रॉल (Elevated Cholesterol)",
    factor_elevated_gluc: "उच्च रक्त शर्करा (Elevated Glucose)",
    factor_smoking: "धूम्रपान का इतिहास (Smoking History)",
  },
  mr: {
    factor_elevated_bp: "उच्च रक्तदाब (Elevated BP)",
    factor_elevated_chol: "उच्च कोलेस्ट्रॉल (Elevated Cholesterol)",
    factor_elevated_gluc: "उच्च रक्तातील साखर (Elevated Glucose)",
    factor_smoking: "धूम्रपानाचा इतिहास (Smoking History)",
  },
  ta: {
    factor_elevated_bp: "அதிக இரத்த அழுத்தம் (Elevated BP)",
    factor_elevated_chol: "அதிக கொலஸ்ட்ரால் (Elevated Cholesterol)",
    factor_elevated_gluc: "அதிக குளுக்கோஸ் (Elevated Glucose)",
    factor_smoking: "புகைபிடித்தல் பதிவு (Smoking History)",
  }
};

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

['en', 'mr', 'hi', 'ta'].forEach(lang => {
  const keyStr = Object.entries(newKeys[lang]).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
  code = code.replace(`${lang}: {`, `${lang}: {\n${keyStr}`);
});

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log('Round 8 translation keys injected!');
