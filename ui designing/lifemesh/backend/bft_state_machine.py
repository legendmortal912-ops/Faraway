import hashlib
import time
from enum import Enum

class NodeState(Enum):
    HONEST = "honest"
    BYZANTINE = "byzantine"   # Malicious node
    OFFLINE = "offline"

class BFTStateMachine:
    """
    Byzantine Fault Tolerant coordination for organ handoffs.
    Uses a simplified PBFT-inspired consensus:
    - Requires 2f+1 honest signatures to confirm a handoff (f = max faulty nodes)
    - If a Byzantine node submits a bad signature, honest nodes overrule it
    - If a node goes offline, the system reroutes automatically
    """
    
    TOTAL_NODES = 7
    MAX_BYZANTINE = 2   # Can tolerate up to 2 faulty nodes (f=2, need 2f+1=5 honest)
    REQUIRED_SIGNATURES = 5
    
    def __init__(self):
        self.nodes = {
            f"node_{i}": {"state": NodeState.HONEST, "id": f"node_{i}"}
            for i in range(self.TOTAL_NODES)
        }
        self.handoff_log = []
    
    def sign_handoff(self, node_id: str, package_id: str, 
                     segment_index: int, location: tuple) -> dict:
        """A node signs a handoff. Byzantine nodes submit bad signatures."""
        node = self.nodes[node_id]
        
        if node["state"] == NodeState.BYZANTINE:
            # Byzantine node tries to sign with wrong location (attack)
            fake_location = (location[0] + 10.0, location[1] + 10.0)  # Wrong coords
            data = f"{node_id}{package_id}{segment_index}{fake_location}"
            return {
                "node_id": node_id,
                "signature": hashlib.sha256(data.encode()).hexdigest(),
                "location": fake_location,
                "is_valid": False,
                "is_byzantine": True
            }
        elif node["state"] == NodeState.OFFLINE:
            return {"node_id": node_id, "signature": None, "is_valid": False, "offline": True}
        else:
            # Honest node signs correctly
            data = f"{node_id}{package_id}{segment_index}{location}"
            return {
                "node_id": node_id,
                "signature": hashlib.sha256(data.encode()).hexdigest(),
                "location": location,
                "is_valid": True,
                "is_byzantine": False
            }
    
    def reach_consensus(self, package_id: str, segment_index: int, 
                        location: tuple) -> dict:
        """
        Collect signatures from all nodes.
        Reach consensus if REQUIRED_SIGNATURES honest signatures received.
        Detect and reject Byzantine signatures.
        """
        all_signatures = []
        for node_id in self.nodes:
            sig = self.sign_handoff(node_id, package_id, segment_index, location)
            all_signatures.append(sig)
        
        # Count valid signatures
        valid_sigs = [s for s in all_signatures if s.get("is_valid")]
        byzantine_sigs = [s for s in all_signatures if s.get("is_byzantine")]
        offline_nodes = [s for s in all_signatures if s.get("offline")]
        
        consensus_reached = len(valid_sigs) >= self.REQUIRED_SIGNATURES
        
        result = {
            "consensus": consensus_reached,
            "valid_signatures": len(valid_sigs),
            "byzantine_detected": len(byzantine_sigs),
            "offline_nodes": len(offline_nodes),
            "required": self.REQUIRED_SIGNATURES,
            "signatures": all_signatures,
            "attack_overruled": len(byzantine_sigs) > 0 and consensus_reached
        }
        
        self.handoff_log.append({
            "package_id": package_id,
            "segment_index": segment_index,
            "timestamp": time.time(),
            "result": result
        })
        
        return result
    
    def trigger_byzantine_attack(self, node_id: str):
        """Simulate a node going Byzantine (for demo purposes)."""
        self.nodes[node_id]["state"] = NodeState.BYZANTINE
        return {"node_id": node_id, "new_state": "byzantine", "attack_active": True}
    
    def restore_node(self, node_id: str):
        self.nodes[node_id]["state"] = NodeState.HONEST
