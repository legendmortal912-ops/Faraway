from typing import List, Tuple, Optional
from datetime import datetime
from models import Donor, Patient, Hospital
from routing_engine import RoutingEngine

class DomesticMatchingEngine:
    """
    Layer 0: Fast intra-national matching for same-country donor-recipient pairs.
    No SMPC needed — hospitals within the same national registry share a lightweight
    priority queue. Optimized for speed: match must complete in under 10 seconds.
    Used for cases like AIIMS Delhi ↔ Fortis Noida.
    """

    def __init__(self, routing_engine: RoutingEngine):
        self.routing_engine = routing_engine

    def compute_compatibility(self, donor: Donor, patient: Patient) -> float:
        """
        Direct (unencrypted) compatibility scoring for domestic nodes.
        Blood type + HLA proximity + urgency.
        """
        # Blood type check
        compatibility_map = {
            "O": ["O", "A", "B", "AB"],
            "A": ["A", "AB"],
            "B": ["B", "AB"],
            "AB": ["AB"]
        }
        if patient.blood_type not in compatibility_map.get(donor.blood_type, []):
            return 0.0

        # HLA proximity score
        hla_score = 1.0 - (
            sum(abs(d - r) for d, r in zip(donor.hla_markers, patient.hla_markers))
            / (100.0 * len(donor.hla_markers))
        )

        # Urgency bonus
        urgency_bonus = patient.urgency_score * 0.1

        return min(1.0, 0.4 + 0.6 * hla_score + urgency_bonus)

    async def find_domestic_match(
        self,
        donor: Donor,
        all_hospitals: List[Hospital]
    ) -> Tuple[Optional[Patient], float, Optional[List], str]:
        """
        Search same-country hospitals only.
        Returns (best_patient, score, route_segments, match_tier).
        match_tier is always "DOMESTIC" here.
        """
        same_country = [h for h in all_hospitals if h.country_code == 
                        next((h2.country_code for h2 in all_hospitals 
                              if h2.id == donor.hospital_id), None)]

        best_patient = None
        best_score = 0.0

        for hospital in same_country:
            for patient in hospital.patients:
                if patient.organ_needed != donor.organ_available:
                    continue
                if patient.hospital_id == donor.hospital_id:
                    continue  # Skip same hospital
                score = self.compute_compatibility(donor, patient)
                if score > best_score:
                    best_score = score
                    best_patient = patient

        if not best_patient or best_score < 0.5:
            return None, 0.0, None, "DOMESTIC_NO_MATCH"

        segments, feasible, total_minutes = self.routing_engine.compute_route(
            donor.location, best_patient.location,
            datetime.now(), donor.viability_hours
        )

        if not feasible:
            return None, 0.0, None, "DOMESTIC_INFEASIBLE"

        return best_patient, best_score, segments, "DOMESTIC"
