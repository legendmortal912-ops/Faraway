import hashlib
import time
from enum import Enum
from typing import List


class NodeState(Enum):
    HONEST    = "honest"
    BYZANTINE = "byzantine"
    OFFLINE   = "offline"


class BFTStateMachine:
    """
    Simplified PBFT-inspired consensus for organ handoff integrity.
    Tolerates up to f=2 faulty nodes (needs 2f+1 = 5 honest signatures).
    Byzantine nodes submit wrong-location signatures — honest nodes overrule.
    """

    TOTAL_NODES          = 7
    MAX_BYZANTINE        = 2
    REQUIRED_SIGNATURES  = 5

    def __init__(self):
        self.nodes = {
            f"node_{i}": {"id": f"node_{i}", "state": NodeState.HONEST}
            for i in range(self.TOTAL_NODES)
        }
        self.handoff_log: List[dict] = []

    def sign_handoff(self, node_id: str, package_id: str,
                     segment_index: int, location: tuple) -> dict:
        node = self.nodes[node_id]
        if node["state"] == NodeState.BYZANTINE:
            fake_loc = (location[0] + 10.0, location[1] + 10.0)
            data = f"{node_id}{package_id}{segment_index}{fake_loc}"
            return {
                "node_id": node_id,
                "signature": hashlib.sha256(data.encode()).hexdigest(),
                "location": fake_loc,
                "is_valid": False,
                "is_byzantine": True,
            }
        elif node["state"] == NodeState.OFFLINE:
            return {"node_id": node_id, "signature": None, "is_valid": False, "offline": True}
        else:
            data = f"{node_id}{package_id}{segment_index}{location}"
            return {
                "node_id": node_id,
                "signature": hashlib.sha256(data.encode()).hexdigest(),
                "location": location,
                "is_valid": True,
                "is_byzantine": False,
            }

    def reach_consensus(self, package_id: str, segment_index: int, location: tuple) -> dict:
        all_sigs = [
            self.sign_handoff(nid, package_id, segment_index, location)
            for nid in self.nodes
        ]
        valid    = [s for s in all_sigs if s.get("is_valid")]
        byzantine = [s for s in all_sigs if s.get("is_byzantine")]
        offline  = [s for s in all_sigs if s.get("offline")]
        consensus = len(valid) >= self.REQUIRED_SIGNATURES

        result = {
            "consensus": consensus,
            "valid_signatures": len(valid),
            "byzantine_detected": len(byzantine),
            "offline_nodes": len(offline),
            "required": self.REQUIRED_SIGNATURES,
            "signatures": all_sigs,
            "attack_overruled": len(byzantine) > 0 and consensus,
        }
        self.handoff_log.append({
            "package_id": package_id,
            "segment_index": segment_index,
            "timestamp": time.time(),
            "result": result,
        })
        return result

    def trigger_byzantine(self, node_id: str) -> dict:
        self.nodes[node_id]["state"] = NodeState.BYZANTINE
        return {"node_id": node_id, "new_state": "byzantine", "attack_active": True}

    def restore_node(self, node_id: str):
        self.nodes[node_id]["state"] = NodeState.HONEST

    def node_status(self) -> List[dict]:
        return [
            {"node_id": nid, "state": n["state"].value}
            for nid, n in self.nodes.items()
        ]
