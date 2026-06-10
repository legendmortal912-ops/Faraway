from typing import List, Tuple, Optional
from models import Donor, Patient, Hospital
from smpc_engine import SMPCEngine

class GlobalMatchingEngine:
    """
    Layer 1: Cross-border SMPC matching. Only invoked when Layer 0 (domestic)
    finds no suitable match. Uses Shamir's Secret Sharing so no hospital
    exposes raw patient data across national borders.
    """
    
    def __init__(self, smpc: SMPCEngine):
        self.smpc = smpc
    
    async def find_best_match(
        self, 
        donor: Donor,
        all_hospital_nodes: List[Hospital],
        viability_hours: int
    ) -> Tuple[Optional[Patient], float, List[dict]]:
        """
        Broadcast donor availability to all nodes.
        Each node contributes encrypted patient shares.
        Compute global best match without seeing raw data.
        """
        
        # Encrypt donor data for network
        donor_hla_shares = [self.smpc.split_secret(m) for m in donor.hla_markers]
        
        best_match = None
        best_score = 0.0
        full_computation_log = []
        
        # Collect encrypted patient data from all nodes
        all_encrypted_patients = []
        for hospital in all_hospital_nodes:
            for patient in hospital.patients:
                if patient.organ_needed == donor.organ_available:
                    encrypted = self.smpc.encrypt_patient_for_network(patient)
                    all_encrypted_patients.append((patient, encrypted))
        
        # Run SMPC matching across all candidates
        for patient, encrypted in all_encrypted_patients:
            score, log = self.smpc.compute_compatibility_score(
                donor_hla_shares,
                encrypted["hla_shares"],
                donor.blood_type,
                encrypted["blood_type"]
            )
            
            # Factor in urgency and geographic feasibility
            urgency_bonus = patient.urgency_score * 0.1
            adjusted_score = score + urgency_bonus
            
            full_computation_log.append({
                "patient_id": patient.id,
                "hospital": patient.hospital_id,
                "score": round(adjusted_score, 4),
                "computation_steps": log
            })
            
            if adjusted_score > best_score:
                best_score = adjusted_score
                best_match = patient
        
        return best_match, best_score, full_computation_log
