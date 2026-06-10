from typing import List, Optional, Tuple
from models import Patient, Donor, Hospital
from smpc_engine import SMPCEngine


class GlobalMatchingEngine:
    """
    Layer 1 — Cross-border SMPC matching.
    Invoked only when Layer 0 finds no domestic match.
    Uses Shamir's Secret Sharing: no hospital exposes raw patient data.
    """

    def __init__(self, smpc: SMPCEngine):
        self.smpc = smpc

    async def find_best_match(
        self,
        donor: Donor,
        all_hospitals: List[Hospital],
        viability_hours: int,
    ) -> Tuple[Optional[Patient], float, List[dict]]:
        donor_hla_shares = [self.smpc.split_secret(m) for m in donor.hla_markers]

        best_match, best_score = None, 0.0
        full_log = []

        for hospital in all_hospitals:
            # Skip donor's own hospital
            if hospital.id == donor.hospital_id:
                continue
            for patient in hospital.patients:
                if patient.organ_needed != donor.organ_available:
                    continue
                encrypted = self.smpc.encrypt_patient_for_network(patient)
                score, log = self.smpc.compute_compatibility_score(
                    donor_hla_shares,
                    encrypted["hla_shares"],
                    donor.blood_type,
                    encrypted["blood_type"],
                )
                adjusted = score + patient.urgency_score * 0.1
                full_log.append({
                    "patient_id": patient.id,
                    "hospital_id": hospital.id,
                    "hospital_name": hospital.name,
                    "city": hospital.city,
                    "country": hospital.country,
                    "country_code": hospital.country_code,
                    "score": round(adjusted, 4),
                    "computation_steps": log,
                    "commitment": encrypted["commitment"],
                    "plain_data_exposed": False,
                })
                if adjusted > best_score:
                    best_score, best_match = adjusted, patient

        return best_match, best_score, full_log
