"""
Database setup for MaatriMarg.
Uses SQLite (file-based, zero setup) via SQLAlchemy ORM.
The DB file will be created automatically at backend/maatrimarg.db
"""
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

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
    current_tier = Column(String, default="normal")  # normal | watch | prep | dispatch
    labor_started = Column(Boolean, default=False)
    needs_nicu = Column(Boolean, default=False)

    vitals_history = relationship("VitalsRecord", back_populates="mother", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="mother", cascade="all, delete-orphan")


class VitalsRecord(Base):
    __tablename__ = "vitals_records"

    id = Column(Integer, primary_key=True, index=True)
    mother_id = Column(Integer, ForeignKey("mothers.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

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
# HOSPITAL
# ---------------------------
class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    village_area = Column(String)
    lat = Column(Float)
    lng = Column(Float)

    beds_available = Column(Integer, default=0)
    nicu_beds_available = Column(Integer, default=0)
    surgeon_on_duty = Column(Boolean, default=False)

    # Blood stock columns (unit counts)
    stock_o_pos = Column(Integer, default=0)
    stock_o_neg = Column(Integer, default=0)
    stock_a_pos = Column(Integer, default=0)
    stock_a_neg = Column(Integer, default=0)
    stock_b_pos = Column(Integer, default=0)
    stock_b_neg = Column(Integer, default=0)
    stock_ab_pos = Column(Integer, default=0)
    stock_ab_neg = Column(Integer, default=0)

    last_updated = Column(DateTime, default=datetime.utcnow)

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
    created_at = Column(DateTime, default=datetime.utcnow)

    mother = relationship("Mother", back_populates="alerts")
    hospital = relationship("Hospital", back_populates="alerts")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
