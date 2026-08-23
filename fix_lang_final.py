import re

with open('src/context/LanguageContext.jsx', 'r') as f:
    lines = f.readlines()

# 1. Clean up ALL existing bad FAQ insertions
cleaned_lines = []
for line in lines:
    if any(x in line for x in ["FAQ Section", "faq_title", "faq_q1", "faq_a1", "faq_q2", "faq_a2", "faq_q3", "faq_a3", "faq_q4", "faq_a4", "faq_q5", "faq_a5"]):
        continue
    cleaned_lines.append(line)

# 2. Define the FAQ content (this time without leading/trailing commas because we will handle commas manually on the previous line)
en_faq = [
    '    // FAQ Section\n',
    '    faq_title: "Frequently Asked Questions",\n',
    '    faq_q1: "What is \'Regional Triage Distribution\'?",\n',
    '    faq_a1: "This is our live command center metric. \'Triage\' is the medical process of deciding the order of treatment based on urgency. This map shows District Health Officers exactly which villages have a high concentration of critical cases, allowing them to route ambulances intelligently.",\n',
    '    faq_q2: "How does the \'VIPER Pediatric Engine\' work?",\n',
    '    faq_a2: "VIPER is our infant and child health assessment tool. ASHA workers input simple vitals like SpO2 (oxygen), heart rate, and temperature for children. The engine analyzes these inputs to instantly detect early signs of pediatric shock or sepsis, guiding the worker on what to do next.",\n',
    '    faq_q3: "What are \'Primary Risk Drivers\' in maternal health?",\n',
    '    faq_a3: "These are the top physiological factors—like Gestational Hypertension (high blood pressure) or Gestational Diabetes—that our Machine Learning model has identified as the highest threats to a pregnant mother in a specific region.",\n',
    '    faq_q4: "Who is this platform built for?",\n',
    '    faq_a4: "MaatriMarg operates on three levels: ASHA Workers (for rural field data collection), Hospital CMOs (for preparing beds for incoming critical patients), and District Health Officers (for high-level governance and emergency routing).",\n',
    '    faq_q5: "Are the risk predictions fully automated?",\n',
    '    faq_a5: "Our ML models act as an assistive tool, not a replacement for doctors. We maintain an \'AI Override Rate\' (meaning doctors can overrule the AI), ensuring clinical safety while vastly speeding up rural screenings."\n'
]

mr_faq = [
    '    // FAQ Section\n',
    '    faq_title: "वारंवार विचारले जाणारे प्रश्न (FAQ)",\n',
    '    faq_q1: "प्रादेशिक ट्रायज वितरण (Regional Triage Distribution) म्हणजे काय?",\n',
    '    faq_a1: "हे आमचे थेट कमांड सेंटर मेट्रिक आहे. \'ट्रायज\' म्हणजे वैद्यकीय तातडीच्या आधारावर उपचाराचा क्रम ठरवण्याची प्रक्रिया. हा नकाशा जिल्हा आरोग्य अधिकाऱ्यांना कोणत्या गावात गंभीर रुग्णांचे प्रमाण जास्त आहे हे दाखवतो, ज्यामुळे ते रुग्णवाहिका योग्यरीत्या मार्गस्थ करू शकतात.",\n',
    '    faq_q2: "VIPER पेडियाट्रिक इंजिन कसे काम करते?",\n',
    '    faq_a2: "VIPER हे आमचे बाल आरोग्य मूल्यांकन साधन आहे. आशा कार्यकर्त्या लहान मुलांसाठी SpO2 (ऑक्सिजन), हृदय गती आणि तापमान यासारखी साधी माहिती भरतात. हे इंजिन या माहितीचे विश्लेषण करून बालकांमधील शॉक किंवा सेप्सिसची प्रारंभिक चिन्हे त्वरित शोधते आणि कार्यकर्त्यांना पुढे काय करावे याचे मार्गदर्शन करते.",\n',
    '    faq_q3: "माता आरोग्यामध्ये \'प्राथमिक धोका घटक\' (Primary Risk Drivers) काय आहेत?",\n',
    '    faq_a3: "हे प्रमुख शारीरिक घटक आहेत—जसे की जेस्टेशनल हायपरटेन्शन (उच्च रक्तदाब) किंवा जेस्टेशनल डायबेटिस—ज्यांना आमच्या मशीन लर्निंग मॉडेलने एका विशिष्ट प्रदेशातील गरोदर मातेसाठी सर्वाधिक धोकादायक म्हणून ओळखले आहे.",\n',
    '    faq_q4: "हा प्लॅटफॉर्म कोणासाठी बनवला आहे?",\n',
    '    faq_a4: "मातृमार्ग (MaatriMarg) तीन स्तरांवर काम करते: आशा कार्यकर्त्या (ग्रामीण भागात डेटा गोळा करण्यासाठी), हॉस्पिटल CMOs (येणाऱ्या गंभीर रुग्णांसाठी बेड तयार ठेवण्यासाठी) आणि जिल्हा आरोग्य अधिकारी (उच्च-स्तरीय नियंत्रण आणि आपत्कालीन मार्गदर्शनासाठी).",\n',
    '    faq_q5: "धोका अंदाज पूर्णपणे स्वयंचलित (Automated) आहेत का?",\n',
    '    faq_a5: "आमचे ML मॉडेल एक सहाय्यक साधन म्हणून काम करते, डॉक्टरांना पर्याय म्हणून नाही. आम्ही \'AI ओव्हरराइड रेट\' (म्हणजे डॉक्टर AI चा निर्णय बदलू शकतात) कायम ठेवतो, ज्यामुळे वैद्यकीय सुरक्षितता सुनिश्चित होते आणि ग्रामीण तपासणीला वेग येतो."\n'
]

hi_faq = [
    '    // FAQ Section\n',
    '    faq_title: "अक्सर पूछे जाने वाले प्रश्न (FAQ)",\n',
    '    faq_q1: "क्षेत्रीय ट्राइएज वितरण (Regional Triage Distribution) क्या है?",\n',
    '    faq_a1: "यह हमारा लाइव कमांड सेंटर मेट्रिक है। \'ट्राइएज\' चिकित्सा की वह प्रक्रिया है जिसमें तात्कालिकता के आधार पर उपचार का क्रम तय किया जाता है। यह नक्शा जिला स्वास्थ्य अधिकारियों (DHO) को दिखाता है कि किन गांवों में गंभीर मामलों की संख्या अधिक है, जिससे वे एम्बुलेंस को सही तरीके से रूट कर सकते हैं।",\n',
    '    faq_q2: "VIPER बाल रोग इंजन (Pediatric Engine) कैसे काम करता है?",\n',
    '    faq_a2: "VIPER शिशु और बाल स्वास्थ्य मूल्यांकन उपकरण है। आशा कार्यकर्ता बच्चों के लिए SpO2 (ऑक्सीजन), हृदय गति और तापमान जैसी सामान्य जानकारी दर्ज करती हैं। इंजन इन जानकारियों का विश्लेषण करके बाल चिकित्सा शॉक या सेप्सिस के शुरुआती लक्षणों का तुरंत पता लगाता है और कार्यकर्ता का मार्गदर्शन करता है।",\n',
    '    faq_q3: "मातृ स्वास्थ्य में \'प्राथमिक जोखिम कारक\' (Primary Risk Drivers) क्या हैं?",\n',
    '    faq_a3: "ये वे प्रमुख शारीरिक कारक हैं—जैसे कि जेस्टेशनल हाइपरटेंशन (उच्च रक्तचाप) या जेस्टेशनल डायबिटीज—जिन्हें हमारे मशीन लर्निंग मॉडल ने किसी विशिष्ट क्षेत्र में गर्भवती माँ के लिए सबसे बड़े खतरे के रूप में पहचाना है।",\n',
    '    faq_q4: "यह प्लेटफॉर्म किसके लिए बनाया गया है?",\n',
    '    faq_a4: "मातृमार्ग (MaatriMarg) तीन स्तरों पर काम करता है: आशा कार्यकर्ता (ग्रामीण क्षेत्रों में डेटा एकत्र करने के लिए), अस्पताल CMO (आने वाले गंभीर रोगियों के लिए बिस्तर तैयार करने के लिए), और जिला स्वास्थ्य अधिकारी (उच्च-स्तरीय निगरानी और आपातकालीन रूटिंग के लिए)।",\n',
    '    faq_q5: "क्या जोखिम भविष्यवाणियां पूरी तरह से स्वचालित (Automated) हैं?",\n',
    '    faq_a5: "हमारे ML मॉडल एक सहायक उपकरण के रूप में कार्य करते हैं, न कि डॉक्टरों के विकल्प के रूप में। हम \'AI ओवरराइड रेट\' (अर्थात डॉक्टर AI के फैसले को बदल सकते हैं) बनाए रखते हैं, जिससे नैदानिक सुरक्षा सुनिश्चित होती है और ग्रामीण जांच की गति काफी तेज होती है."\n'
]

ta_faq = [
    '    // FAQ Section\n',
    '    faq_title: "அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQ)",\n',
    '    faq_q1: "பிராந்திய ட்ரையாஜ் விநியோகம் (Regional Triage Distribution) என்றால் என்ன?",\n',
    '    faq_a1: "இது எங்களின் நேரடி கட்டுப்பாட்டு மைய அளவீடு ஆகும். \'ட்ரேயாஜ்\' (Triage) என்பது அவசரத்தின் அடிப்படையில் சிகிச்சையின் வரிசையைத் தீர்மானிக்கும் மருத்துவ செயல்முறை ஆகும். எந்தெந்த கிராமங்களில் ஆபத்தான நோயாளிகள் அதிகம் உள்ளனர் என்பதை இந்த வரைபடம் மாவட்ட சுகாதார அதிகாரிகளுக்கு காட்டுகிறது.",\n',
    '    faq_q2: "VIPER குழந்தை மருத்துவ இயந்திரம் எவ்வாறு செயல்படுகிறது?",\n',
    '    faq_a2: "VIPER என்பது குழந்தை சுகாதார மதிப்பீட்டுக் கருவியாகும். ASHA பணியாளர்கள் குழந்தைகளுக்கான SpO2 (ஆக்ஸிஜன்), இதயத் துடிப்பு மற்றும் வெப்பநிலை போன்ற எளிய விவரங்களை பதிவு செய்கிறார்கள். இந்த இயந்திரம் அந்த விவரங்களை பகுப்பாய்வு செய்து, குழந்தைகளின் ஷாக் அல்லது செப்சிஸ் போன்ற ஆரம்ப அறிகுறிகளை உடனடியாக கண்டறிந்து வழிகாட்டுகிறது.",\n',
    '    faq_q3: "தாய்மை நலத்தில் \'முதன்மை ஆபத்து காரணிகள்\' (Primary Risk Drivers) எவை?",\n',
    '    faq_a3: "கர்ப்பகால உயர் இரத்த அழுத்தம் அல்லது கர்ப்பகால நீரிழிவு போன்ற முக்கிய உடலியல் காரணிகளையே \'முதன்மை ஆபத்து காரணிகள்\' என்கிறோம். இதை எங்களின் மெஷின் லேர்னிங் மாடல் ஒரு குறிப்பிட்ட பகுதியில் கர்ப்பிணிப் பெண்ணுக்கு ஏற்படும் மிகப்பெரிய அச்சுறுத்தலாக கண்டறிந்துள்ளது.",\n',
    '    faq_q4: "இந்த தளம் யாருக்காக உருவாக்கப்பட்டுள்ளது?",\n',
    '    faq_a4: "மாத்ரிமார்க் (MaatriMarg) மூன்று நிலைகளில் செயல்படுகிறது: ஆஷா பணியாளர்கள் (கிராமப்புற தரவு சேகரிப்புக்காக), மருத்துவமனை CMO-கள் (வரும் ஆபத்தான நோயாளிகளுக்கு படுக்கைகளைத் தயார் செய்ய) மற்றும் மாவட்ட சுகாதார அதிகாரிகள் (உயர்மட்ட நிர்வாகம் மற்றும் அவசரகால வழிகாட்டுதலுக்கு).",\n',
    '    faq_q5: "ஆபத்து கணிப்புகள் முழுமையாக தானியங்கி முறையிலா (Automated) செயல்படுகின்றன?",\n',
    '    faq_a5: "எங்கள் ML மாடல்கள் ஒரு உதவி கருவியாக செயல்படுகின்றன, மருத்துவர்களுக்கு மாற்றாக அல்ல. மருத்துவர்கள் AI-இன் முடிவுகளை மாற்றுவதற்கான வசதியை (AI Override Rate) நாங்கள் பராமரிக்கிறோம். இது மருத்துவ பாதுகாப்பை உறுதி செய்கிறது."\n'
]

def insert_faq(lines, target_str, faq_block):
    new_lines = []
    for line in lines:
        if target_str in line:
            # We found the target (logout_session). Add a comma to it if missing.
            if not line.strip().endswith(','):
                new_lines.append(line.rstrip('\n') + ',\n')
            else:
                new_lines.append(line)
            # Then add the FAQ block
            new_lines.extend(faq_block)
        else:
            new_lines.append(line)
    return new_lines

# There are 4 logout_session occurrences in order: en, mr, hi, ta.
# We will just do them one by one.
# Wait, they have different text!
# EN: logout_session: "Log Out Session"
cleaned_lines = insert_faq(cleaned_lines, 'logout_session: "Log Out Session"', en_faq)
# MR: logout_session: "सत्र समाप्त करा (लॉगआउट)"
cleaned_lines = insert_faq(cleaned_lines, 'logout_session: "सत्र समाप्त करा (लॉगआउट)"', mr_faq)
# HI: logout_session: "लॉग आउट करें"
cleaned_lines = insert_faq(cleaned_lines, 'logout_session: "लॉग आउट करें"', hi_faq)
# TA: logout_session: "வெளியேறுக"
cleaned_lines = insert_faq(cleaned_lines, 'logout_session: "வெளியேறுக"', ta_faq)

with open('src/context/LanguageContext.jsx', 'w') as f:
    f.writelines(cleaned_lines)

