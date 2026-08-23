const fs = require('fs');

const districts = [
"Ahmednagar", "Akola", "Amravati", "Ariyalur", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dhule", "Dindigul", "Erode", "Hingoli", "Jalna", "Kallakurichi", "Kanyakumari", "Karur", "Kolhapur", "Latur", "Madurai", "Mumbai Suburban", "Nagapattinam", "Nagpur", "Nanded", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pudukkottai", "Pune", "Raigad", "Ramanathapuram", "Ranipet", "Ratnagiri", "Salem", "Sangli", "Satara", "Sindhudurg", "Sivaganga", "Solapur", "Thane", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tiruvallur", "Tiruvarur", "Vellore", "Villupuram", "Virudhunagar", "Wardha", "Yavatmal"
];

// Rough phonetic mappings for 3 languages
const hiMap = { "Ahmednagar": "अहमदनगर", "Akola": "अकोला", "Amravati": "अमरावती", "Ariyalur": "अरियालूर", "Aurangabad": "औरंगाबाद", "Beed": "बीड", "Bhandara": "भंडारा", "Buldhana": "बुलढाणा", "Chandrapur": "चंद्रपुर", "Chengalpattu": "चेंगलपट्टू", "Chennai": "चेन्नई", "Coimbatore": "कोयंबटूर", "Cuddalore": "कुड्डालोर", "Dhule": "धुले", "Dindigul": "डिंडीगुल", "Erode": "इरोड", "Hingoli": "हिंगोली", "Jalna": "जालना", "Kallakurichi": "कल्लाकुरिची", "Kanyakumari": "कन्याकुमारी", "Karur": "करूर", "Kolhapur": "कोल्हापुर", "Latur": "लातूर", "Madurai": "मदुरै", "Mumbai Suburban": "मुंबई उपनगर", "Nagapattinam": "नागपट्टिनम", "Nagpur": "नागपुर", "Nanded": "नांदेड़", "Nashik": "नासिक", "Osmanabad": "उस्मानाबाद", "Palghar": "पालघर", "Parbhani": "परभणी", "Pudukkottai": "पुदुक्कोट्टई", "Pune": "पुणे", "Raigad": "रायगढ़", "Ramanathapuram": "रामनाथपुरम", "Ranipet": "रानीपेट", "Ratnagiri": "रत्नागिरी", "Salem": "सेलम", "Sangli": "सांगली", "Satara": "सतारा", "Sindhudurg": "सिंधुदुर्ग", "Sivaganga": "शिवगंगा", "Solapur": "सोलापुर", "Thane": "ठाणे", "Thanjavur": "तंजावुर", "Theni": "थेनी", "Thoothukudi": "थूथुकुडी", "Tiruchirappalli": "तिरुचिरापल्ली", "Tirunelveli": "तिरुनेलवेली", "Tiruvallur": "तिरुवल्लूर", "Tiruvarur": "तिरुवरूर", "Vellore": "वेल्लोर", "Villupuram": "विल्लुपुरम", "Virudhunagar": "विरुधुनगर", "Wardha": "वर्धा", "Yavatmal": "यवतमाल" };

const mrMap = { "Ahmednagar": "अहमदनगर", "Akola": "अकोला", "Amravati": "अमरावती", "Ariyalur": "अरियालूर", "Aurangabad": "औरंगाबाद", "Beed": "बीड", "Bhandara": "भंडारा", "Buldhana": "बुलढाणा", "Chandrapur": "चंद्रपूर", "Chengalpattu": "चेंगलपट्टू", "Chennai": "चेन्नई", "Coimbatore": "कोयंबटूर", "Cuddalore": "कुड्डालोर", "Dhule": "धुळे", "Dindigul": "दिंडीगुल", "Erode": "इरोड", "Hingoli": "हिंगोली", "Jalna": "जालना", "Kallakurichi": "कल्लाकुरिची", "Kanyakumari": "कन्याकुमारी", "Karur": "करूर", "Kolhapur": "कोल्हापूर", "Latur": "लातूर", "Madurai": "मदुराई", "Mumbai Suburban": "मुंबई उपनगर", "Nagapattinam": "नागपट्टिनम", "Nagpur": "नागपूर", "Nanded": "नांदेड", "Nashik": "नाशिक", "Osmanabad": "उस्मानाबाद", "Palghar": "पालघर", "Parbhani": "परभणी", "Pudukkottai": "पुदुक्कोट्टई", "Pune": "पुणे", "Raigad": "रायगड", "Ramanathapuram": "रामनाथपुरम", "Ranipet": "राणीपेट", "Ratnagiri": "रत्नागिरी", "Salem": "सेलम", "Sangli": "सांगली", "Satara": "सातारा", "Sindhudurg": "सिंधुदुर्ग", "Sivaganga": "शिवगंगा", "Solapur": "सोलापूर", "Thane": "ठाणे", "Thanjavur": "तंजावर", "Theni": "थेनी", "Thoothukudi": "थुथुकुडी", "Tiruchirappalli": "तिरुचिरापल्ली", "Tirunelveli": "तिरुनेलवेली", "Tiruvallur": "तिरुवल्लूर", "Tiruvarur": "तिरुवरूर", "Vellore": "वेल्लोर", "Villupuram": "विल्लुपुरम", "Virudhunagar": "विरुधुनगर", "Wardha": "वर्धा", "Yavatmal": "यवतमाळ" };

const taMap = { "Ahmednagar": "அகமதுநகர்", "Akola": "அகோலா", "Amravati": "அமராவதி", "Ariyalur": "அரியலூர்", "Aurangabad": "அவுரங்காபாத்", "Beed": "பீடு", "Bhandara": "பண்டாரா", "Buldhana": "புல்தானா", "Chandrapur": "சந்திரபூர்", "Chengalpattu": "செங்கல்பட்டு", "Chennai": "சென்னை", "Coimbatore": "கோயம்புத்தூர்", "Cuddalore": "கடலூர்", "Dhule": "துலே", "Dindigul": "திண்டுக்கல்", "Erode": "ஈரோடு", "Hingoli": "ஹிங்கோலி", "Jalna": "ஜால்னா", "Kallakurichi": "கள்ளக்குறிச்சி", "Kanyakumari": "கன்னியாகுமரி", "Karur": "கரூர்", "Kolhapur": "கோலாப்பூர்", "Latur": "லாத்தூர்", "Madurai": "மதுரை", "Mumbai Suburban": "மும்பை புறநகர்", "Nagapattinam": "நாகப்பட்டினம்", "Nagpur": "நாக்பூர்", "Nanded": "நாந்தேட்", "Nashik": "நாசிக்", "Osmanabad": "உஸ்மானாபாத்", "Palghar": "பால்கர்", "Parbhani": "பர்பானி", "Pudukkottai": "புதுக்கோட்டை", "Pune": "புனே", "Raigad": "ராய்காட்", "Ramanathapuram": "ராமநாதபுரம்", "Ranipet": "ராணிப்பேட்டை", "Ratnagiri": "ரத்னகிரி", "Salem": "சேலம்", "Sangli": "சாங்லி", "Satara": "சதாரா", "Sindhudurg": "சிந்துதுர்க்", "Sivaganga": "சிவகங்கை", "Solapur": "சோலாபூர்", "Thane": "தானே", "Thanjavur": "தஞ்சாவூர்", "Theni": "தேனி", "Thoothukudi": "தூத்துக்குடி", "Tiruchirappalli": "திருச்சிராப்பள்ளி", "Tirunelveli": "திருநெல்வேலி", "Tiruvallur": "திருவள்ளூர்", "Tiruvarur": "திருவாரூர்", "Vellore": "வேலூர்", "Villupuram": "விழுப்புரம்", "Virudhunagar": "விருதுநகர்", "Wardha": "வார்தா", "Yavatmal": "யவத்மால்" };

const newKeys = { en: {}, hi: {}, mr: {}, ta: {} };

districts.forEach(d => {
  newKeys.en[`district_${d}`] = d;
  newKeys.hi[`district_${d}`] = hiMap[d];
  newKeys.mr[`district_${d}`] = mrMap[d];
  newKeys.ta[`district_${d}`] = taMap[d];
});

let code = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

['en', 'mr', 'hi', 'ta'].forEach(lang => {
  const keyStr = Object.entries(newKeys[lang]).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
  code = code.replace(`${lang}: {`, `${lang}: {\n${keyStr}`);
});

fs.writeFileSync('src/context/LanguageContext.jsx', code);
console.log('Round 9 (Districts) translation keys injected!');
