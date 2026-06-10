from datetime import datetime
from typing import List, Optional, Tuple
from models import Patient, Donor, Hospital
from routing_engine import RoutingEngine


class DomesticMatchingEngine:
    """
    Layer 0 — Fast intra-national matching.
    No SMPC, no encryption overhead. Direct compatibility scoring.
    Target: match in < 10 seconds.
    """

    BLOOD_COMPAT = {
        "O": ["O", "A", "B", "AB"],
        "A": ["A", "AB"],
        "B": ["B", "AB"],
        "AB": ["AB"],
    }

    def __init__(self, routing: RoutingEngine):
        self.routing = routing

    def compute_compatibility(self, donor: Donor, patient: Patient) -> float:
        if patient.blood_type not in self.BLOOD_COMPAT.get(donor.blood_type, []):
            return 0.0
        hla_score = 1.0 - (
            sum(abs(d - r) for d, r in zip(donor.hla_markers, patient.hla_markers))
            / (100.0 * len(donor.hla_markers))
        )
        return min(1.0, 0.4 + 0.6 * hla_score + patient.urgency_score * 0.1)

    async def find_domestic_match(
        self, donor: Donor, all_hospitals: List[Hospital]
    ) -> Tuple[Optional[Patient], float, Optional[list], str]:
        # Find donor's country
        donor_country = next(
            (h.country_code for h in all_hospitals if h.id == donor.hospital_id), None
        )
        same_country = [h for h in all_hospitals if h.country_code == donor_country]

        best_patient, best_score = None, 0.0
        for hospital in same_country:
            for patient in hospital.patients:
                if patient.organ_needed != donor.organ_available:
                    continue
                if patient.hospital_id == donor.hospital_id:
                    continue
                score = self.compute_compatibility(donor, patient)
                if score > best_score:
                    best_score, best_patient = score, patient

        if not best_patient or best_score < 0.5:
            return None, 0.0, None, "DOMESTIC_NO_MATCH"

        segments, feasible, total_min = self.routing.compute_route(
            donor.location, best_patient.location, datetime.now(), donor.viability_hours
        )
        if not feasible:
            return None, 0.0, None, "DOMESTIC_INFEASIBLE"

        return best_patient, best_score, segments, "DOMESTIC"
