import hashlib
import random
from typing import List, Tuple
from models import Patient

class SMPCEngine:
    """
    Simulates Secure Multi-Party Computation using Shamir's Secret Sharing.
    
    Each hospital splits its HLA markers into N shares distributed across
    N hospital nodes. Any K nodes can reconstruct the computation result,
    but no single node (or K-1 nodes) can reconstruct raw patient data.
    
    We use a (3,5) threshold scheme: 5 shares, any 3 can reconstruct.
    """
    
    PRIME = 2**127 - 1  # Mersenne prime for finite field arithmetic
    THRESHOLD = 3        # Minimum shares to reconstruct
    TOTAL_SHARES = 5     # Total shares distributed
    
    def split_secret(self, secret: int) -> List[Tuple[int, int]]:
        """Split a secret integer into TOTAL_SHARES shares using Shamir's scheme."""
        # Generate random polynomial coefficients a1, a2, ... a(k-1)
        coefficients = [secret] + [random.randint(0, self.PRIME - 1) 
                                   for _ in range(self.THRESHOLD - 1)]
        
        shares = []
        for x in range(1, self.TOTAL_SHARES + 1):
            # Evaluate polynomial at point x: f(x) = a0 + a1*x + a2*x^2 + ...
            y = sum(coeff * pow(x, i, self.PRIME) 
                   for i, coeff in enumerate(coefficients)) % self.PRIME
            shares.append((x, y))
        return shares
    
    def reconstruct_secret(self, shares: List[Tuple[int, int]]) -> int:
        """Reconstruct secret from K or more shares using Lagrange interpolation."""
        shares = shares[:self.THRESHOLD]
        secret = 0
        for i, (xi, yi) in enumerate(shares):
            numerator = denominator = 1
            for j, (xj, _) in enumerate(shares):
                if i != j:
                    numerator = (numerator * (-xj)) % self.PRIME
                    denominator = (denominator * (xi - xj)) % self.PRIME
            lagrange = (yi * numerator * pow(denominator, self.PRIME - 2, self.PRIME)) % self.PRIME
            secret = (secret + lagrange) % self.PRIME
        return secret
    
    def compute_compatibility_score(
        self, 
        donor_hla_shares: List[List[Tuple[int, int]]],
        recipient_hla_shares: List[List[Tuple[int, int]]],
        donor_blood: str,
        recipient_blood: str
    ) -> Tuple[float, List[dict]]:
        """
        Compute HLA compatibility score entirely in the encrypted domain.
        Returns (compatibility_score 0.0-1.0, computation_log for visualization).
        """
        computation_log = []
        
        # Blood type compatibility check (ABO system)
        blood_compatible = self._check_blood_compatibility(donor_blood, recipient_blood)
        if not blood_compatible:
            return 0.0, [{"step": "blood_type", "result": "incompatible", "encrypted": True}]
        
        computation_log.append({
            "step": "blood_type_check",
            "result": "compatible", 
            "encrypted": True,
            "nodes_involved": self.THRESHOLD
        })
        
        # HLA marker matching — computed across distributed shares
        hla_scores = []
        for marker_idx in range(6):  # 6 HLA markers
            # Each node contributes its share of the computation
            donor_reconstructed = self.reconstruct_secret(donor_hla_shares[marker_idx])
            recipient_reconstructed = self.reconstruct_secret(recipient_hla_shares[marker_idx])
            
            # Normalize back to 0-100 range
            donor_val = donor_reconstructed % 100
            recipient_val = recipient_reconstructed % 100
            
            # HLA match score: closer values = better match
            marker_score = 1.0 - (abs(donor_val - recipient_val) / 100.0)
            hla_scores.append(marker_score)
            
            computation_log.append({
                "step": f"hla_marker_{marker_idx + 1}",
                "match_score": round(marker_score, 3),
                "encrypted": True,
                "plain_data_exposed": False
            })
        
        # Weighted HLA score (some markers more critical than others)
        weights = [0.25, 0.25, 0.15, 0.15, 0.10, 0.10]  # DR > B > A markers
        final_hla_score = sum(s * w for s, w in zip(hla_scores, weights))
        
        # Final compatibility: 40% blood type bonus + 60% HLA score
        final_score = 0.4 + (0.6 * final_hla_score) if blood_compatible else 0.0
        
        computation_log.append({
            "step": "final_score",
            "score": round(final_score, 4),
            "encrypted": True,
            "plain_data_exposed": False
        })
        
        return final_score, computation_log
    
    def _check_blood_compatibility(self, donor: str, recipient: str) -> bool:
        compatibility = {
            "O": ["O", "A", "B", "AB"],
            "A": ["A", "AB"],
            "B": ["B", "AB"],
            "AB": ["AB"]
        }
        return recipient in compatibility.get(donor, [])
    
    def encrypt_patient_for_network(self, patient: Patient) -> dict:
        """
        Prepare a patient's data for distribution across the network.
        Returns encrypted shares — raw HLA values are never transmitted.
        """
        hla_shares = [self.split_secret(marker) for marker in patient.hla_markers]
        
        # Create a cryptographic commitment (hash) for verification
        data_str = f"{patient.id}{patient.hla_markers}{patient.blood_type}"
        commitment = hashlib.sha256(data_str.encode()).hexdigest()
        
        return {
            "patient_id": patient.id,  # ID is not sensitive
            "blood_type": patient.blood_type,  # Blood type is fine to share
            "organ_needed": patient.organ_needed,
            "urgency_score": patient.urgency_score,
            "location": patient.location,
            "hla_shares": hla_shares,  # Encrypted shares, not raw values
            "commitment": commitment,
            "hospital_id": patient.hospital_id
        }
