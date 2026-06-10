from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime

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

@dataclass
class Patient:
    id: str
    hospital_id: str
    blood_type: str           # A, B, AB, O
    hla_markers: List[int]    # 6 integers [0-100]
    urgency_score: float      # 0.0 to 1.0
    location: tuple           # (lat, lng)
    organ_needed: str         # kidney | liver | heart | lung

@dataclass
class Donor:
    id: str
    hospital_id: str
    blood_type: str
    hla_markers: List[int]
    organ_available: str
    viability_hours: int
    location: tuple

@dataclass
class Hospital:
    id: str
    name: str
    city: str
    country: str
    country_code: str         # ISO 3166-1 alpha-2
    location: tuple
    patients: List[Patient] = field(default_factory=list)
    national_registry_id: str = ""

@dataclass
class RouteSegment:
    mode: str                 # ground | air
    from_location: tuple
    to_location: tuple
    from_name: str
    to_name: str
    duration_minutes: int
    departure_time: datetime
    arrival_time: datetime

@dataclass
class Handoff:
    segment_index: int
    location: tuple
    timestamp: datetime
    signed_by: str
    signature: str            # SHA256 hash
    status: str               # pending | completed | failed

@dataclass
class OrganPackage:
    id: str
    donor_id: str
    recipient_id: str
    organ_type: str
    departure_time: datetime
    viability_deadline: datetime
    current_location: tuple
    route: List[RouteSegment] = field(default_factory=list)
    state: str = "computing"  # computing | routing | in_transit | delivered | failed
    handoffs: List[Handoff] = field(default_factory=list)

@dataclass
class TelemetryReading:
    package_id: str
    timestamp: datetime
    temperature_c: float
    humidity_pct: float
    shock_g: float
    pressure_hpa: float
    gps_lat: float
    gps_lng: float
    battery_pct: float
    alarm_active: bool = False

@dataclass
class ColdChainAlert:
    package_id: str
    timestamp: datetime
    alert_type: str           # temperature | humidity | shock | pressure | seal
    value: float
    threshold: float
    message: str
    severity: str             # warning | critical
