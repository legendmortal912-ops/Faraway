import random
import hashlib
from sqlalchemy.orm import Session
from models import Hospital, Patient, User

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_patients(prefix: str, hospital_id: str, organ: str, count: int, base_loc: tuple):
    return [
        Patient(
            id=f"P_{prefix}_{i:03d}",
            hospital_id=hospital_id,
            blood_type=random.choice(["A", "B", "O", "AB"]),
            hla_markers=[random.randint(10, 90) for _ in range(6)],
            urgency_score=round(random.uniform(0.3, 0.95), 2),
            location_lat=base_loc[0] + random.uniform(-0.01, 0.01),
            location_lng=base_loc[1] + random.uniform(-0.01, 0.01),
            organ_needed=organ,
        )
        for i in range(count)
    ]

def seed_db(db: Session):
    if db.query(Hospital).first():
        return  # Database already seeded
        
    # Seed Hospitals
    hospitals_data = [
        Hospital(id="H_AIIMS", name="AIIMS Delhi", city="Delhi", country="India", country_code="IN", location_lat=28.5665, location_lng=77.2100, national_registry_id="NOTTO-DL-001"),
        Hospital(id="H_FORTIS", name="Fortis Hospital Noida", city="Noida", country="India", country_code="IN", location_lat=28.5355, location_lng=77.3910, national_registry_id="NOTTO-UP-002"),
        Hospital(id="H_SAFDARJUNG", name="Safdarjung Hospital", city="Delhi", country="India", country_code="IN", location_lat=28.5706, location_lng=77.2075, national_registry_id="NOTTO-DL-003"),
        Hospital(id="H_PARIS", name="Hôpital Lariboisière", city="Paris", country="France", country_code="FR", location_lat=48.8827, location_lng=2.3572),
        Hospital(id="H_MUMBAI", name="Kokilaben Dhirubhai Ambani Hospital", city="Mumbai", country="India", country_code="IN", location_lat=19.1136, location_lng=72.8697, national_registry_id="NOTTO-MH-001"),
        Hospital(id="H_SAO_PAULO", name="Hospital Albert Einstein", city="São Paulo", country="Brazil", country_code="BR", location_lat=-23.5989, location_lng=-46.6892),
        Hospital(id="H_LONDON", name="King's College Hospital", city="London", country="UK", country_code="GB", location_lat=51.4686, location_lng=-0.0928),
        Hospital(id="H_DUBAI", name="Cleveland Clinic Abu Dhabi", city="Dubai", country="UAE", country_code="AE", location_lat=24.4539, location_lng=54.3773),
    ]
    db.add_all(hospitals_data)
    db.commit()
    
    # Seed Patients
    patients_data = []
    patients_data.extend(make_patients("IN_AI", "H_AIIMS", "kidney", 6, (28.5665, 77.2100)))
    patients_data.extend(make_patients("IN_FO", "H_FORTIS", "kidney", 6, (28.5355, 77.3910)))
    patients_data.extend(make_patients("IN_SJ", "H_SAFDARJUNG", "kidney", 4, (28.5706, 77.2075)))
    patients_data.extend(make_patients("FR", "H_PARIS", "kidney", 8, (48.8827, 2.3572)))
    patients_data.extend(make_patients("MU", "H_MUMBAI", "kidney", 8, (19.1136, 72.8697)))
    patients_data.extend(make_patients("BR", "H_SAO_PAULO", "kidney", 8, (-23.5989, -46.6892)))
    patients_data.extend(make_patients("GB", "H_LONDON", "kidney", 6, (51.4686, -0.0928)))
    patients_data.extend(make_patients("AE", "H_DUBAI", "kidney", 6, (24.4539, 54.3773)))
    db.add_all(patients_data)
    db.commit()

    # Seed Users (Hospital Accounts)
    users_data = [
        User(id="U_AIIMS", email="admin@aiims.edu", password_hash=hash_password("aiims123"), role="hospital", entity_id="H_AIIMS", name="AIIMS Delhi", meta_data={"has_internal_fleet": "yes", "is_coordinator": False, "city": "Delhi", "tier": "DOMESTIC"}),
        User(id="U_APOLLO", email="admin@apollo.com", password_hash=hash_password("apollo123"), role="hospital", entity_id="H_MUMBAI", name="Apollo Mumbai", meta_data={"has_internal_fleet": "yes", "is_coordinator": False, "city": "Mumbai", "tier": "DOMESTIC"}),
        User(id="U_MANIPAL", email="admin@manipal.edu", password_hash=hash_password("manipal123"), role="hospital", entity_id="H_MANIPAL", name="Manipal Bangalore", meta_data={"has_internal_fleet": "no", "is_coordinator": False, "city": "Bangalore", "tier": "DOMESTIC"}),
        User(id="U_PGI", email="admin@pgi.edu.in", password_hash=hash_password("pgi123"), role="hospital", entity_id="H_PGI", name="PGI Chandigarh", meta_data={"has_internal_fleet": "no", "is_coordinator": False, "city": "Chandigarh", "tier": "DOMESTIC"}),
        User(id="U_PARIS", email="admin@larib.fr", password_hash=hash_password("paris123"), role="hospital", entity_id="H_PARIS", name="Lariboisière Paris", meta_data={"has_internal_fleet": "no", "is_coordinator": False, "city": "Paris", "tier": "CROSS_BORDER"}),
        User(id="U_KINGS", email="admin@kch.nhs.uk", password_hash=hash_password("kings123"), role="hospital", entity_id="H_LONDON", name="King's London", meta_data={"has_internal_fleet": "yes", "is_coordinator": False, "city": "London", "tier": "CROSS_BORDER"}),
        User(id="U_NOTTO", email="coord@notto.gov.in", password_hash=hash_password("notto123"), role="hospital", entity_id="H_NOTTO", name="NOTTO Coordinator", meta_data={"has_internal_fleet": "no", "is_coordinator": True, "city": "Delhi", "tier": "DOMESTIC"}),
        
        # Logistics Accounts
        User(id="U_DHL", email="ops@dhl-medical.com", password_hash=hash_password("dhl123"), role="logistics", entity_id="C_DHL", name="DHL Medical Express", meta_data={"carrier_type": "INDEPENDENT"}),
        User(id="U_WORLD", email="ops@worldcourier.com", password_hash=hash_password("world123"), role="logistics", entity_id="C_WORLD", name="World Courier Medical", meta_data={"carrier_type": "INDEPENDENT"}),
        User(id="U_BLUE", email="ops@bluedart-med.com", password_hash=hash_password("blue123"), role="logistics", entity_id="C_BLUE", name="BlueDart MedLife", meta_data={"carrier_type": "INDEPENDENT"}),
        User(id="U_FLEET_AIIMS", email="fleet@aiims.edu", password_hash=hash_password("aiims-fleet123"), role="logistics", entity_id="H_AIIMS", name="AIIMS Delhi Internal Fleet", meta_data={"carrier_type": "HOSPITAL"}),
        User(id="U_FLEET_APOLLO", email="fleet@apollo.com", password_hash=hash_password("apollo-fleet123"), role="logistics", entity_id="H_MUMBAI", name="Apollo MedShift", meta_data={"carrier_type": "HOSPITAL"}),
        User(id="U_FLEET_KINGS", email="fleet@kch.nhs.uk", password_hash=hash_password("kings-fleet123"), role="logistics", entity_id="H_LONDON", name="King's MedTransport", meta_data={"carrier_type": "HOSPITAL"}),
    ]
    db.add_all(users_data)
    db.commit()
