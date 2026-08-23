const fs = require('fs');
const newKeys = JSON.parse(fs.readFileSync('all_new_keys.json', 'utf8'));

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

const newKeysStr = Object.entries(newKeys).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');

code = code.replace('en: {', 'en: {\n' + newKeysStr);
code = code.replace('mr: {', 'mr: {\n' + newKeysStr);
code = code.replace('hi: {', 'hi: {\n' + newKeysStr);
code = code.replace('ta: {', 'ta: {\n' + newKeysStr);

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log("Translations injected!");
