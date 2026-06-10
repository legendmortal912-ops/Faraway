from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class Patient:
    id: str
    hospital_id: str
    blood_type: str          # ABO type: A, B, AB, O
    hla_markers: List[int]   # 6 HLA markers as integers [0-100]
    urgency_score: float     # 0.0 to 1.0
    location: tuple          # (lat, lng)
    organ_needed: str        # "kidney", "liver", "heart", "lung"

@dataclass
class Donor:
    id: str
    hospital_id: str
    blood_type: str
    hla_markers: List[int]
    organ_available: str
    viability_hours: int     # cold ischemia time: heart=4h, lung=6h, liver=12h, kidney=24h
    location: tuple

@dataclass
class Hospital:
    id: str
    name: str
    city: str
    country: str
    country_code: str        # ISO 3166-1 alpha-2: "IN", "FR", "BR" etc.
    location: tuple          # (lat, lng)
    patients: List[Patient]  # encrypted, never shared raw
    national_registry_id: str = ""  # e.g. NOTTO ID for Indian hospitals

@dataclass
class RouteSegment:
    mode: str                # "ground", "air"
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
    signature: str           # SHA256 hash
    status: str              # "pending", "completed", "failed"

@dataclass
class OrganPackage:
    id: str
    donor_id: str
    recipient_id: str
    organ_type: str
    departure_time: datetime
    viability_deadline: datetime
    current_location: tuple
    route: List[RouteSegment]
    state: str               # "computing", "routing", "in_transit", "delivered", "failed"
    handoffs: List[Handoff]
