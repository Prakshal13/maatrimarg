"""
Frontline field communications & SMS/WhatsApp dispatch notification simulator.
Enables real-time multilingual emergency messaging for 108 drivers, ASHA workers, and CMOs.
"""
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import Alert, get_db, log_audit_event

router = APIRouter(prefix="/notifications", tags=["notifications"])


class DispatchNotificationInput(BaseModel):
    referral_id: int
    recipient_role: Literal["ambulance_driver", "hospital_cmo", "asha_worker", "family"] = "ambulance_driver"
    phone: str = Field(min_length=10, max_length=20)
    language: Literal["en", "mr", "hi", "ta"] = "mr"


TEMPLATES = {
    "mr": {
        "dispatch": (
            "🚨 मात्रीमार्ग आपत्कालीन अलर्ट: गरोदर माता {mother_name} ({age} वर्षे), गाव: {village}, रक्तगट: {blood_type}."
            " तात्काळ रुग्णवाहिका पाठवण्यात आली आहे. गंतव्य रुग्णालय: {hospital_name}. अंदाजे पोहोच वेळ: {eta} मिनिटे."
            " आपत्कालीन मदत: 108."
        ),
        "prep": (
            "⚠️ मात्रीमार्ग पूर्वसूचना: गरोदर माता {mother_name} यांचे प्रसूतीपूर्व जोखीम प्रमाण {risk_score}% आहे."
            " कृपया बेड आणि रक्तसाठा सज्ज ठेवा. रुग्णालय: {hospital_name}."
        ),
    },
    "hi": {
        "dispatch": (
            "🚨 मातृमार्ग आपातकालीन अलर्ट: गर्भवती महिला {mother_name} ({age} वर्ष), गांव: {village}, ब्लड ग्रुप: {blood_type}."
            " तत्काल एम्बुलेंस रवाना की गई है। अस्पताल: {hospital_name}. अनुमानित समय: {eta} मिनट।"
            " आपातकालीन संपर्क: 108."
        ),
        "prep": (
            "⚠️ मातृमार्ग पूर्व-सूचना: गर्भवती महिला {mother_name} का जोखिम स्कोर {risk_score}% है।"
            " कृपया बेड एवं ब्लड स्टॉक तैयार रखें। अस्पताल: {hospital_name}."
        ),
    },
    "ta": {
        "dispatch": (
            "🚨 மாத்ரிமார்க் அவசர எச்சரிக்கை: கர்ப்பிணி தாய் {mother_name} ({age} வயது), கிராமம்: {village}, இரத்த வகை: {blood_type}."
            " அவசர ஊர்தி அனுப்பப்பட்டுள்ளது. சேருமிடம்: {hospital_name}. வருகை நேரம்: {eta} நிமிடங்கள்."
            " அவசர உதவி: 108."
        ),
        "prep": (
            "⚠️ மாத்ரிமார்க் முன்கூட்டிய எச்சரிக்கை: தாய் {mother_name} ஆபத்து மதிப்பீடு {risk_score}%."
            " படுக்கை மற்றும் இரத்த இருப்பை தயார் நிலையில் வைக்கவும். மருத்துவமனை: {hospital_name}."
        ),
    },
    "en": {
        "dispatch": (
            "🚨 MaatriMarg Emergency Alert: Mother {mother_name} ({age}y), Village: {village}, Blood Type: {blood_type}."
            " Emergency ambulance dispatched to {hospital_name}. ETA: {eta} minutes."
            " Helpline: 108."
        ),
        "prep": (
            "⚠️ MaatriMarg Pre-Alert: Mother {mother_name} risk score is {risk_score}%."
            " Please hold bed and blood stock. Facility: {hospital_name}."
        ),
    },
}


@router.post("/send-dispatch-alert", status_code=status.HTTP_200_OK)
def send_dispatch_alert(data: DispatchNotificationInput, db: Session = Depends(get_db)):
    referral = db.query(Alert).filter(Alert.id == data.referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    mother = referral.mother
    hospital = referral.hospital
    tier = referral.tier or "dispatch"
    template_type = "dispatch" if tier == "dispatch" else "prep"
    lang_templates = TEMPLATES.get(data.language, TEMPLATES["en"])
    template = lang_templates.get(template_type, lang_templates["dispatch"])

    message = template.format(
        mother_name=mother.name if mother else "Patient",
        age=mother.age if mother else "N/A",
        village=mother.village if mother else "Rural Sub-Centre",
        blood_type=mother.blood_type if mother else "O+",
        hospital_name=hospital.name if hospital else "Designated Hospital",
        eta=round(referral.eta_minutes or 15, 1),
        risk_score=round(mother.current_risk_score or 85, 1) if mother else 85,
    )

    log_audit_event(
        db,
        actor_type="system",
        action="sms_dispatch_sent",
        target_type="referral",
        target_id=referral.id,
        details={
            "recipient_role": data.recipient_role,
            "phone": data.phone,
            "language": data.language,
            "message_preview": message[:120] + "...",
        },
    )

    return {
        "status": "delivered",
        "channel": "SMS / WhatsApp Gateway",
        "recipient_role": data.recipient_role,
        "phone": data.phone,
        "language": data.language,
        "message_body": message,
        "referral_id": referral.id,
    }
