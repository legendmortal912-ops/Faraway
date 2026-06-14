from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

# ─── Organ-specific cold chain thresholds ───────────────────────────────────────
ORGAN_TEMP_THRESHOLDS = {
    "heart":  {"min": 2.0, "max": 6.0,  "ideal": 4.0},
    "lung":   {"min": 2.0, "max": 8.0,  "ideal": 4.0},
    "liver":  {"min": 0.0, "max": 6.0,  "ideal": 2.0},
    "kidney": {"min": 0.0, "max": 6.0,  "ideal": 2.0},
}
MAX_SHOCK_G = 2.5
VIABILITY_HOURS = {
    "heart": 4, "lung": 6, "liver": 12, "kidney": 24
}

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)           # 'hospital' | 'logistics'
    entity_id = Column(String)      # ID of the hospital or carrier
    name = Column(String)
    meta_data = Column(JSON)        # e.g. {"has_internal_fleet": "yes", "is_coordinator": false}

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    city = Column(String)
    country = Column(String)
    country_code = Column(String)
    location_lat = Column(Float)
    location_lng = Column(Float)
    national_registry_id = Column(String, default="")

    patients = relationship("Patient", back_populates="hospital")

    @property
    def location(self):
        return (self.location_lat, self.location_lng)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    hospital_id = Column(String, ForeignKey("hospitals.id"))
    blood_type = Column(String)
    hla_markers = Column(JSON)      # Stored as JSON list [0-100]
    urgency_score = Column(Float)
    location_lat = Column(Float)
    location_lng = Column(Float)
    organ_needed = Column(String)

    hospital = relationship("Hospital", back_populates="patients")

    @property
    def location(self):
        return (self.location_lat, self.location_lng)

class Donor(Base):
    __tablename__ = "donors"

    id = Column(String, primary_key=True, index=True)
    hospital_id = Column(String)
    blood_type = Column(String)
    hla_markers = Column(JSON)
    organ_available = Column(String)
    viability_hours = Column(Integer)
    location_lat = Column(Float)
    location_lng = Column(Float)

    @property
    def location(self):
        return (self.location_lat, self.location_lng)

class OrganPackage(Base):
    __tablename__ = "organ_packages"

    id = Column(String, primary_key=True, index=True)
    donor_id = Column(String)
    recipient_id = Column(String)
    organ_type = Column(String)
    departure_time = Column(DateTime)
    viability_deadline = Column(DateTime)
    current_lat = Column(Float)
    current_lng = Column(Float)
    state = Column(String, default="computing")

    routes = relationship("RouteSegment", back_populates="package", order_by="RouteSegment.segment_order")
    handoffs = relationship("Handoff", back_populates="package")
    telemetry = relationship("TelemetryReading", back_populates="package")
    alerts = relationship("ColdChainAlert", back_populates="package")

    @property
    def current_location(self):
        return (self.current_lat, self.current_lng)
        
    @current_location.setter
    def current_location(self, value):
        self.current_lat, self.current_lng = value

class RouteSegment(Base):
    __tablename__ = "route_segments"

    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(String, ForeignKey("organ_packages.id"))
    segment_order = Column(Integer)
    mode = Column(String)
    from_lat = Column(Float)
    from_lng = Column(Float)
    to_lat = Column(Float)
    to_lng = Column(Float)
    from_name = Column(String)
    to_name = Column(String)
    duration_minutes = Column(Integer)
    departure_time = Column(DateTime, nullable=True)
    arrival_time = Column(DateTime, nullable=True)

    package = relationship("OrganPackage", back_populates="routes")

    @property
    def from_location(self): return (self.from_lat, self.from_lng)
    
    @property
    def to_location(self): return (self.to_lat, self.to_lng)

class Handoff(Base):
    __tablename__ = "handoffs"

    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(String, ForeignKey("organ_packages.id"))
    segment_index = Column(Integer)
    location_lat = Column(Float)
    location_lng = Column(Float)
    timestamp = Column(DateTime)
    signed_by = Column(String)
    signature = Column(String)
    status = Column(String)

    package = relationship("OrganPackage", back_populates="handoffs")

class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(String, ForeignKey("organ_packages.id"))
    timestamp = Column(DateTime)
    temperature_c = Column(Float)
    humidity_pct = Column(Float)
    shock_g = Column(Float)
    pressure_hpa = Column(Float)
    gps_lat = Column(Float)
    gps_lng = Column(Float)
    battery_pct = Column(Float)
    alarm_active = Column(Boolean, default=False)

    package = relationship("OrganPackage", back_populates="telemetry")

class ColdChainAlert(Base):
    __tablename__ = "cold_chain_alerts"

    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(String, ForeignKey("organ_packages.id"))
    timestamp = Column(DateTime)
    alert_type = Column(String)
    value = Column(Float)
    threshold = Column(Float)
    message = Column(String)
    severity = Column(String)

    package = relationship("OrganPackage", back_populates="alerts")
