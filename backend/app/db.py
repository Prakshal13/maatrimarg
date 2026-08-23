"""
Database setup for MaatriMarg.
Uses SQLite (file-based, zero setup) via SQLAlchemy ORM.
The DB file will be created automatically at backend/maatrimarg.db
"""
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, inspect, text
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime, timezone

def utcnow():
    return datetime.now(timezone.utc)

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./maatrimarg.db")

# Supabase / Heroku sometimes provide 'postgres://' URLs which SQLAlchemy 1.4+ requires as 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # Test remote PostgreSQL with a 3-second connection timeout
        engine = create_engine(
            DATABASE_URL,
            connect_args={"connect_timeout": 3},
            pool_pre_ping=True,
        )
        with engine.connect() as test_conn:
            pass
except Exception as e:
    print(f"[DB Warning] Remote database unreachable ({e}). Falling back to local SQLite: sqlite:///./maatrimarg.db")
    DATABASE_URL = "sqlite:///./maatrimarg.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ---------------------------
# MOTHER
# ---------------------------
class Mother(Base):
    __tablename__ = "mothers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    phone = Column(String)
    village = Column(String)
    blood_type = Column(String)  # e.g. "O-", "A+"
    gestational_age_weeks = Column(Integer)
    lat = Column(Float)
    lng = Column(Float)

    current_risk_score = Column(Float, default=0)
    current_tier = Column(String, default="watch")  # watch | prep | dispatch
    labor_started = Column(Boolean, default=False)
    needs_nicu = Column(Boolean, default=False)
    consent_given = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    vitals_history = relationship("VitalsRecord", back_populates="mother", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="mother", cascade="all, delete-orphan")


class VitalsRecord(Base):
    __tablename__ = "vitals_records"

    id = Column(Integer, primary_key=True, index=True)
    mother_id = Column(Integer, ForeignKey("mothers.id"))
    timestamp = Column(DateTime, default=utcnow)

    systolic_bp = Column(Float)
    diastolic_bp = Column(Float)
    blood_sugar = Column(Float)
    body_temp = Column(Float)
    heart_rate = Column(Float)

    risk_score = Column(Float)
    risk_tier = Column(String)
    explanation = Column(Text)  # JSON string list of contributing factors

    mother = relationship("Mother", back_populates="vitals_history")


# ---------------------------
# CHILD
# ---------------------------
class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age_months = Column(Integer, nullable=False)
    gender = Column(String, default="unspecified")
    parent_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    village = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    current_risk_score = Column(Float, default=0)
    current_tier = Column(String, default="low")  # low | medium | high
    consent_given = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    vitals_history = relationship("ChildVitalsRecord", back_populates="child", cascade="all, delete-orphan")


class ChildVitalsRecord(Base):
    __tablename__ = "child_vitals_records"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    timestamp = Column(DateTime, default=utcnow)

    respiratory_rate = Column(Float)
    heart_rate = Column(Float)
    spo2 = Column(Float)
    temperature_c = Column(Float)

    risk_score = Column(Float)
    risk_tier = Column(String)  # low | medium | high
    reasons = Column(Text)  # JSON string
    ml_risk_score = Column(Float, nullable=True)
    ml_probabilities = Column(Text, nullable=True)  # JSON string

    child = relationship("Child", back_populates="vitals_history")


# ---------------------------
# CHRONIC PATIENT
# ---------------------------
class ChronicPatient(Base):
    __tablename__ = "chronic_patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age_years = Column(Float, nullable=False)
    gender = Column(String, default="unspecified")
    phone = Column(String, nullable=True)
    village = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    current_risk_score = Column(Float, default=0)
    current_priority = Column(String, default="routine_screening")  # routine_screening | clinical_review | priority_review
    consent_given = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    assessments = relationship("ChronicAssessment", back_populates="patient", cascade="all, delete-orphan")


class ChronicAssessment(Base):
    __tablename__ = "chronic_assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("chronic_patients.id"))
    timestamp = Column(DateTime, default=utcnow)

    height_cm = Column(Float)
    weight_kg = Column(Float)
    bmi = Column(Float)
    systolic_bp = Column(Float)
    diastolic_bp = Column(Float)
    cholesterol = Column(Integer)  # 1: normal, 2: above normal, 3: well above
    glucose = Column(Integer)  # 1: normal, 2: above normal, 3: well above
    smoke = Column(Boolean, default=False)
    alcohol = Column(Boolean, default=False)
    physically_active = Column(Boolean, default=True)

    risk_score = Column(Float)
    screening_priority = Column(String)
    contributing_factors = Column(Text)  # JSON string

    patient = relationship("ChronicPatient", back_populates="assessments")


# ---------------------------
# HOSPITAL
# ---------------------------
class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    village_area = Column(String)
    district = Column(String)
    state = Column(String)
    lat = Column(Float)
    lng = Column(Float)

    beds_available = Column(Integer, default=0)
    nicu_beds_available = Column(Integer, default=0)
    surgeon_on_duty = Column(Boolean, default=False)
    obstetric_emergency_ready = Column(Boolean, default=True)
    anaesthesia_on_duty = Column(Boolean, default=False)
    ambulance_available = Column(Boolean, default=False)

    # Blood stock columns (unit counts)
    stock_o_pos = Column(Integer, default=0)
    stock_o_neg = Column(Integer, default=0)
    stock_a_pos = Column(Integer, default=0)
    stock_a_neg = Column(Integer, default=0)
    stock_b_pos = Column(Integer, default=0)
    stock_b_neg = Column(Integer, default=0)
    stock_ab_pos = Column(Integer, default=0)
    stock_ab_neg = Column(Integer, default=0)

    last_updated = Column(DateTime, default=utcnow)

    alerts = relationship("Alert", back_populates="hospital", cascade="all, delete-orphan")

    def blood_stock_dict(self):
        return {
            "O+": self.stock_o_pos, "O-": self.stock_o_neg,
            "A+": self.stock_a_pos, "A-": self.stock_a_neg,
            "B+": self.stock_b_pos, "B-": self.stock_b_neg,
            "AB+": self.stock_ab_pos, "AB-": self.stock_ab_neg,
        }


# ---------------------------
# ALERT
# ---------------------------
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    mother_id = Column(Integer, ForeignKey("mothers.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))

    tier = Column(String)  # watch | prep | dispatch
    message = Column(String)
    eta_minutes = Column(Float, nullable=True)
    acknowledged = Column(Boolean, default=False)
    escalated = Column(Boolean, default=False)
    status = Column(String, default="watch")
    priority = Column(String, default="routine")
    ambulance_id = Column(String, nullable=True)
    parent_referral_id = Column(Integer, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    dispatched_at = Column(DateTime, nullable=True)
    arrived_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    last_status_note = Column(String, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    created_at = Column(DateTime, default=utcnow)

    mother = relationship("Mother", back_populates="alerts")
    hospital = relationship("Hospital", back_populates="alerts")


# ---------------------------
# AUDIT LOG (ABDM / DISHA Compliance)
# ---------------------------
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=utcnow, index=True)
    actor_type = Column(String, default="system")  # asha | hospital_staff | dho_command | system
    actor_id = Column(String, nullable=True)
    action = Column(String, nullable=False, index=True)  # triage | referral_created | referral_escalated | status_updated | capacity_updated
    target_type = Column(String, nullable=False, index=True)  # mother | child | chronic_patient | hospital | referral
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)  # JSON string


def log_audit_event(
    db,
    actor_type: str,
    action: str,
    target_type: str,
    target_id: int | None = None,
    details: dict | None = None,
    actor_id: str | None = None,
):
    """Utility to record immutable clinical and operational audit log entries."""
    import json
    entry = AuditLog(
        actor_type=actor_type,
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=json.dumps(details or {}),
    )
    db.add(entry)
    db.commit()
    return entry


def init_db():
    """Create all tables and evolve columns safely across SQLite and PostgreSQL (Supabase)."""
    Base.metadata.create_all(bind=engine)
    additions = {
        "mothers": {
            "consent_given": "BOOLEAN DEFAULT FALSE",
            "created_at": "TIMESTAMP",
            "updated_at": "TIMESTAMP",
        },
        "hospitals": {
            "obstetric_emergency_ready": "BOOLEAN DEFAULT TRUE",
            "anaesthesia_on_duty": "BOOLEAN DEFAULT FALSE",
            "ambulance_available": "BOOLEAN DEFAULT FALSE",
        },
        "alerts": {
            "status": "VARCHAR DEFAULT 'watch'",
            "priority": "VARCHAR DEFAULT 'routine'",
            "ambulance_id": "VARCHAR",
            "parent_referral_id": "INTEGER",
            "acknowledged_at": "TIMESTAMP",
            "dispatched_at": "TIMESTAMP",
            "arrived_at": "TIMESTAMP",
            "closed_at": "TIMESTAMP",
            "last_status_note": "VARCHAR",
            "updated_at": "TIMESTAMP",
        },
    }
    with engine.begin() as connection:
        inspector = inspect(connection)
        table_names = set(inspector.get_table_names())
        for table_name, columns in additions.items():
            if table_name in table_names:
                existing = {column["name"] for column in inspector.get_columns(table_name)}
                for column_name, definition in columns.items():
                    if column_name not in existing:
                        connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
