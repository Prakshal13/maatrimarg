const fs = require('fs');
const newKeys = JSON.parse(fs.readFileSync('translations.json', 'utf8'));

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

const enKeys = Object.entries(newKeys).map(([k, v]) => `    ${k}: ${JSON.stringify(v.en)},`).join('\n');
const mrKeys = Object.entries(newKeys).map(([k, v]) => `    ${k}: ${JSON.stringify(v.mr)},`).join('\n');
const hiKeys = Object.entries(newKeys).map(([k, v]) => `    ${k}: ${JSON.stringify(v.hi)},`).join('\n');
const taKeys = Object.entries(newKeys).map(([k, v]) => `    ${k}: ${JSON.stringify(v.ta)},`).join('\n');

code = code.replace('en: {', 'en: {\n' + enKeys);
code = code.replace('mr: {', 'mr: {\n' + mrKeys);
code = code.replace('hi: {', 'hi: {\n' + hiKeys);
code = code.replace('ta: {', 'ta: {\n' + taKeys);

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log("Localized Translations injected!");
