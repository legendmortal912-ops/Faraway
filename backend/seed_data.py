import random
from models import Hospital, Patient, VIABILITY_HOURS

def make_patients(prefix: str, hospital_id: str, organ: str, count: int, base_loc: tuple):
    return [
        Patient(
            id=f"P_{prefix}_{i:03d}",
            hospital_id=hospital_id,
            blood_type=random.choice(["A", "B", "O", "AB"]),
            hla_markers=[random.randint(10, 90) for _ in range(6)],
            urgency_score=round(random.uniform(0.3, 0.95), 2),
            location=(
                base_loc[0] + random.uniform(-0.01, 0.01),
                base_loc[1] + random.uniform(-0.01, 0.01),
            ),
            organ_needed=organ,
        )
        for i in range(count)
    ]

HOSPITALS = [
    # ── India — NOTTO domestic tier ──────────────────────────────────────────
    Hospital(
        "H_AIIMS", "AIIMS Delhi", "Delhi", "India", "IN",
        (28.5665, 77.2100),
        patients=make_patients("IN_AI", "H_AIIMS", "kidney", 6, (28.5665, 77.2100)),
        national_registry_id="NOTTO-DL-001",
    ),
    Hospital(
        "H_FORTIS", "Fortis Hospital Noida", "Noida", "India", "IN",
        (28.5355, 77.3910),
        patients=make_patients("IN_FO", "H_FORTIS", "kidney", 6, (28.5355, 77.3910)),
        national_registry_id="NOTTO-UP-002",
    ),
    Hospital(
        "H_SAFDARJUNG", "Safdarjung Hospital", "Delhi", "India", "IN",
        (28.5706, 77.2075),
        patients=make_patients("IN_SJ", "H_SAFDARJUNG", "kidney", 4, (28.5706, 77.2075)),
        national_registry_id="NOTTO-DL-003",
    ),

    # ── International — SMPC tier ─────────────────────────────────────────────
    Hospital(
        "H_PARIS", "Hôpital Lariboisière", "Paris", "France", "FR",
        (48.8827, 2.3572),
        patients=make_patients("FR", "H_PARIS", "kidney", 8, (48.8827, 2.3572)),
    ),
    Hospital(
        "H_MUMBAI", "Kokilaben Dhirubhai Ambani Hospital", "Mumbai", "India", "IN",
        (19.1136, 72.8697),
        patients=make_patients("MU", "H_MUMBAI", "kidney", 8, (19.1136, 72.8697)),
        national_registry_id="NOTTO-MH-001",
    ),
    Hospital(
        "H_SAO_PAULO", "Hospital Albert Einstein", "São Paulo", "Brazil", "BR",
        (-23.5989, -46.6892),
        patients=make_patients("BR", "H_SAO_PAULO", "kidney", 8, (-23.5989, -46.6892)),
    ),
    Hospital(
        "H_LONDON", "King's College Hospital", "London", "UK", "GB",
        (51.4686, -0.0928),
        patients=make_patients("GB", "H_LONDON", "kidney", 6, (51.4686, -0.0928)),
    ),
    Hospital(
        "H_DUBAI", "Cleveland Clinic Abu Dhabi", "Dubai", "UAE", "AE",
        (24.4539, 54.3773),
        patients=make_patients("AE", "H_DUBAI", "kidney", 6, (24.4539, 54.3773)),
    ),
]
