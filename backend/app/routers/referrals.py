"""Referral lifecycle APIs powering hospital and command-centre operations."""
import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import Alert, AuditLog, Mother, get_db, log_audit_event
from app.services.referrals import (
    ACTIVE_STATUSES,
    VALID_STATUSES,
    create_referral,
    referral_to_dict,
)

router = APIRouter(prefix="/referrals", tags=["referrals"])

ALLOWED_TRANSITIONS = {
    "watch": {"prep", "dispatch", "closed"},
    "prep": {"dispatch", "acknowledged", "escalated", "closed"},
    "dispatch": {"acknowledged", "en_route", "escalated", "closed"},
    "acknowledged": {"en_route", "arrived", "escalated", "closed"},
    "en_route": {"arrived", "escalated", "closed"},
    "arrived": {"closed", "escalated"},
    "escalated": set(),
    "closed": set(),
}


class ReferralCreateInput(BaseModel):
    mother_id: int
    tier: str = Field(pattern="^(prep|dispatch)$")
    priority: str | None = Field(default=None, pattern="^(routine|urgent|critical)$")
    message: str | None = Field(default=None, max_length=500)


class ReferralStatusInput(BaseModel):
    status: str = Field(pattern="^(watch|prep|dispatch|acknowledged|en_route|arrived|closed|escalated)$")
    note: str | None = Field(default=None, max_length=500)
    ambulance_id: str | None = Field(default=None, max_length=80)
    actor_id: str | None = Field(default="hospital_staff", max_length=80)


def _referral_or_404(db: Session, referral_id: int) -> Alert:
    referral = db.query(Alert).filter(Alert.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    return referral


@router.post("", status_code=status.HTTP_201_CREATED)
def create_referral_endpoint(data: ReferralCreateInput, db: Session = Depends(get_db)):
    mother = db.query(Mother).filter(Mother.id == data.mother_id).first()
    if not mother:
        raise HTTPException(status_code=404, detail="Mother not found")
    if not mother.consent_given:
        raise HTTPException(status_code=400, detail="Documented patient consent is required")
    referral, skipped = create_referral(db, mother, data.tier, data.message, data.priority)
    db.commit()
    db.refresh(referral)

    log_audit_event(
        db,
        actor_type="asha",
        action="referral_created",
        target_type="referral",
        target_id=referral.id,
        details={"mother_id": mother.id, "tier": data.tier, "hospital_id": referral.hospital_id},
    )
    return {"referral": referral_to_dict(referral), "skipped_hospitals": skipped}


@router.get("/active")
def list_active_referrals(state: str | None = None, district: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Alert).filter(Alert.status.in_(ACTIVE_STATUSES))
    referrals = query.order_by(Alert.created_at.desc()).all()
    result = []
    for referral in referrals:
        hospital = referral.hospital
        if state and (not hospital or hospital.state != state):
            continue
        if district and (not hospital or hospital.district != district):
            continue
        result.append(referral_to_dict(referral))
    return result


@router.get("/audit-logs/all")
def get_audit_logs(
    actor_type: str | None = None,
    action: str | None = None,
    target_type: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)
    if actor_type:
        query = query.filter(AuditLog.actor_type == actor_type)
    if action:
        query = query.filter(AuditLog.action == action)
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [{
        "id": l.id,
        "timestamp": l.timestamp.isoformat() if l.timestamp else None,
        "actor_type": l.actor_type,
        "actor_id": l.actor_id,
        "action": l.action,
        "target_type": l.target_type,
        "target_id": l.target_id,
        "details": json.loads(l.details or "{}"),
    } for l in logs]


@router.get("/{referral_id}")
def get_referral(referral_id: int, db: Session = Depends(get_db)):
    return referral_to_dict(_referral_or_404(db, referral_id))


@router.patch("/{referral_id}/acknowledge")
def acknowledge_referral(referral_id: int, actor_id: str | None = None, db: Session = Depends(get_db)):
    referral = _referral_or_404(db, referral_id)
    if not referral.hospital_id:
        raise HTTPException(status_code=409, detail="Cannot acknowledge an unassigned referral")
    if referral.status in {"closed", "escalated"}:
        raise HTTPException(status_code=400, detail=f"Cannot acknowledge a {referral.status} referral")
    referral.acknowledged = True
    referral.acknowledged_at = datetime.now(timezone.utc)
    referral.status = "acknowledged"
    db.commit()
    db.refresh(referral)

    log_audit_event(
        db,
        actor_type="hospital_staff",
        actor_id=actor_id,
        action="referral_acknowledged",
        target_type="referral",
        target_id=referral.id,
        details={"hospital_id": referral.hospital_id},
    )
    return referral_to_dict(referral)


@router.patch("/{referral_id}/status")
def update_referral_status(referral_id: int, data: ReferralStatusInput, db: Session = Depends(get_db)):
    referral = _referral_or_404(db, referral_id)
    current_status = referral.status or "watch"

    # Enforce State Machine Invariants
    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    if data.status != current_status and data.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state transition from '{current_status}' to '{data.status}'. Allowed: {list(allowed)}",
        )

    referral.status = data.status
    referral.last_status_note = data.note
    if data.ambulance_id is not None:
        referral.ambulance_id = data.ambulance_id
    timestamp = datetime.now(timezone.utc)
    if data.status == "en_route" and not referral.dispatched_at:
        referral.dispatched_at = timestamp
    elif data.status == "arrived":
        referral.arrived_at = timestamp
    elif data.status == "closed":
        referral.closed_at = timestamp
    db.commit()
    db.refresh(referral)

    log_audit_event(
        db,
        actor_type="hospital_staff",
        actor_id=data.actor_id,
        action="status_updated",
        target_type="referral",
        target_id=referral.id,
        details={"old_status": current_status, "new_status": data.status, "ambulance_id": data.ambulance_id},
    )
    return referral_to_dict(referral)


@router.post("/{referral_id}/escalate", status_code=status.HTTP_201_CREATED)
def escalate_referral(referral_id: int, db: Session = Depends(get_db)):
    referral = _referral_or_404(db, referral_id)
    mother = referral.mother
    if not mother:
        raise HTTPException(status_code=409, detail="Referral has no associated mother")
    referral.escalated = True
    referral.status = "escalated"
    referral.last_status_note = "Escalated because the assigned facility did not accept the referral"
    
    # Collect all ancestor hospital IDs across the escalation chain
    excluded_hospital_ids = set()
    current_ref = referral
    while current_ref:
        if current_ref.hospital_id:
            excluded_hospital_ids.add(current_ref.hospital_id)
        if current_ref.parent_referral_id:
            current_ref = db.query(Alert).filter(Alert.id == current_ref.parent_referral_id).first()
        else:
            break

    new_referral, skipped = create_referral(
        db,
        mother,
        referral.tier or "dispatch",
        message=f"Escalated maternal referral for {mother.name}",
        priority=referral.priority,
        parent_referral_id=referral.id,
        excluded_hospital_ids=excluded_hospital_ids,
    )
    db.commit()
    db.refresh(new_referral)

    log_audit_event(
        db,
        actor_type="system",
        action="referral_escalated",
        target_type="referral",
        target_id=referral.id,
        details={"new_referral_id": new_referral.id, "excluded_hospitals": list(excluded_hospital_ids)},
    )
    return {"escalated_referral": referral_to_dict(referral), "new_referral": referral_to_dict(new_referral), "skipped_hospitals": skipped}


@router.post("/auto-escalate-overdue")
def auto_escalate_overdue(db: Session = Depends(get_db)):
    """
    Automated Watchdog: Scans unacknowledged referrals.
    If 'dispatch' unacknowledged > 15m or 'prep' > 30m, auto-escalates.
    """
    now = datetime.now(timezone.utc)
    cutoff_dispatch = now - timedelta(minutes=15)
    cutoff_prep = now - timedelta(minutes=30)

    overdue_alerts = db.query(Alert).filter(
        Alert.status.in_(["dispatch", "prep"]),
        Alert.acknowledged == False,  # noqa: E712
    ).all()

    escalated_count = 0
    results = []
    for alert in overdue_alerts:
        created = alert.created_at or now
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if (alert.status == "dispatch" and created <= cutoff_dispatch) or (alert.status == "prep" and created <= cutoff_prep):
            alert.escalated = True
            alert.status = "escalated"
            alert.last_status_note = "Auto-escalated by system: exceeded response timeout window"

            excluded_hospital_ids = set()
            current_ref = alert
            while current_ref:
                if current_ref.hospital_id:
                    excluded_hospital_ids.add(current_ref.hospital_id)
                if current_ref.parent_referral_id:
                    current_ref = db.query(Alert).filter(Alert.id == current_ref.parent_referral_id).first()
                else:
                    break

            new_ref, _ = create_referral(
                db,
                alert.mother,
                alert.tier or "dispatch",
                message=f"Auto-escalated emergency referral for {alert.mother.name}",
                priority="critical",
                parent_referral_id=alert.id,
                excluded_hospital_ids=excluded_hospital_ids,
            )
            escalated_count += 1
            results.append({"old_referral_id": alert.id, "new_referral_id": new_ref.id})

    db.commit()
    return {"overdue_checked": len(overdue_alerts), "auto_escalated_count": escalated_count, "results": results}
