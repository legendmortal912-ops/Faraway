from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime
import random
from typing import List

from models import Hospital, Patient, Donor
from smpc_engine import SMPCEngine
from routing_engine import RoutingEngine
from domestic_matching_engine import DomesticMatchingEngine
from matching_engine import GlobalMatchingEngine
from bft_state_machine import BFTStateMachine

app = FastAPI(title="LifeMesh Protocol API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], 
                   allow_methods=["*"], allow_headers=["*"])

# Initialize engines
smpc = SMPCEngine()
routing_engine = RoutingEngine()
domestic_engine = DomesticMatchingEngine(routing_engine)
matching_engine = GlobalMatchingEngine(smpc)
bft = BFTStateMachine()

# Seed hospital data
HOSPITALS = [
    # --- INDIA (domestic tier) ---
    Hospital("H_AIIMS", "AIIMS Delhi", "Delhi", "India", "IN",
             (28.5665, 77.2100),
             patients=[Patient(f"P_IN_{i}", "H_AIIMS", random.choice(["A","B","O","AB"]),
                              [random.randint(10,90) for _ in range(6)],
                              random.uniform(0.3,0.9), (28.5665, 77.2100), "kidney")
                       for i in range(6)],
             national_registry_id="NOTTO-DL-001"),
    Hospital("H_FORTIS_NOIDA", "Fortis Hospital Noida", "Noida", "India", "IN",
             (28.5355, 77.3910),
             patients=[Patient(f"P_IN_{i+6}", "H_FORTIS_NOIDA", random.choice(["A","B","O","AB"]),
                              [random.randint(10,90) for _ in range(6)],
                              random.uniform(0.5,0.95), (28.5355, 77.3910), "kidney")
                       for i in range(6)],
             national_registry_id="NOTTO-UP-002"),
    Hospital("H_SAFDARJUNG", "Safdarjung Hospital", "Delhi", "India", "IN",
             (28.5706, 77.2075),
             patients=[Patient(f"P_IN_{i+12}", "H_SAFDARJUNG", random.choice(["A","B","O","AB"]),
                              [random.randint(10,90) for _ in range(6)],
                              random.uniform(0.3,0.9), (28.5706, 77.2075), "kidney")
                       for i in range(4)],
             national_registry_id="NOTTO-DL-003"),

    # --- INTERNATIONAL (cross-border SMPC tier) ---
    Hospital("H_PARIS", "Hôpital Lariboisière", "Paris", "France", "FR",
             (48.8827, 2.3572),
             patients=[Patient(f"P_FR_{i}", "H_PARIS", random.choice(["A","B","O","AB"]),
                              [random.randint(10,90) for _ in range(6)],
                              random.uniform(0.3,0.9), (48.8827, 2.3572), "kidney")
                       for i in range(8)]),
    Hospital("H_MUMBAI", "Kokilaben Dhirubhai Ambani Hospital", "Mumbai", "India", "IN",
             (19.1136, 72.8697),
             patients=[Patient(f"P_MU_{i}", "H_MUMBAI", random.choice(["A","B","O","AB"]),
                              [random.randint(10,90) for _ in range(6)],
                              random.uniform(0.3,0.9), (19.1136, 72.8697), "kidney")
                       for i in range(8)],
             national_registry_id="NOTTO-MH-001"),
    Hospital("H_SAO_PAULO", "Hospital Albert Einstein", "São Paulo", "Brazil", "BR",
             (-23.5989, -46.6892),
             patients=[Patient(f"P_BR_{i}", "H_SAO_PAULO", random.choice(["A","B","O","AB"]),
                              [random.randint(10,90) for _ in range(6)],
                              random.uniform(0.3,0.9), (-23.5989, -46.6892), "kidney")
                       for i in range(8)]),
]

active_connections: List[WebSocket] = []

async def broadcast(event_type: str, data: dict):
    """Broadcast a real-time event to all connected frontend clients."""
    message = json.dumps({"type": event_type, "data": data, 
                          "timestamp": datetime.now().isoformat()})
    for connection in active_connections:
        try:
            await connection.send_text(message)
        except:
            pass

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

@app.post("/api/simulate/full-demo")
async def run_full_demo():
    """
    Triggers the complete LifeMesh demo sequence:
    1. Donor appears
    2. SMPC matching runs (streamed step by step)
    3. Routing computed
    4. Transit begins
    5. Byzantine attack triggered
    6. Attack overruled
    7. Organ delivered
    """
    asyncio.create_task(run_demo_sequence())
    return {"status": "demo_started"}

@app.post("/api/simulate/domestic-demo")
async def run_domestic_demo():
    """
    Triggers the domestic (Layer 0) demo:
    Donor at Safdarjung Hospital Delhi → recipient at Fortis Noida.
    No SMPC — fast direct match, ambulance routing only.
    """
    asyncio.create_task(run_domestic_demo_sequence())
    return {"status": "domestic_demo_started"}

async def run_domestic_demo_sequence():
    # Donor at Safdarjung, Delhi
    donor = Donor("D_DOM_001", "H_SAFDARJUNG", "B",
                  [55, 72, 30, 85, 40, 60], "kidney", 24, (28.5706, 77.2075))

    await broadcast("DONOR_REGISTERED", {
        "donor_id": donor.id,
        "hospital": "Safdarjung Hospital, Delhi",
        "organ": "Kidney",
        "viability_hours": donor.viability_hours,
        "location": donor.location,
        "tier": "DOMESTIC",
        "message": "Donor registered. Running Layer 0 — Domestic Fast Match..."
    })
    await asyncio.sleep(1.5)

    await broadcast("DOMESTIC_SEARCH_STARTED", {
        "message": "Searching national registry (NOTTO) for same-country matches...",
        "searching_hospitals": ["AIIMS Delhi", "Fortis Noida"],
        "smpc_required": False,
        "plain_data_exposed": "within national registry only"
    })
    await asyncio.sleep(1)

    # Run Layer 0 domestic match
    best_patient, score, segments, tier = await domestic_engine.find_domestic_match(
        donor, HOSPITALS
    )

    if tier == "DOMESTIC_NO_MATCH" or tier == "DOMESTIC_INFEASIBLE":
        await broadcast("DOMESTIC_NO_MATCH", {
            "message": "No domestic match found. Escalating to Layer 1 — Global SMPC network...",
            "escalating": True
        })
        # Escalate to cross-border SMPC demo
        asyncio.create_task(run_demo_sequence())
        return

    await broadcast("DOMESTIC_MATCH_FOUND", {
        "recipient_id": best_patient.id,
        "recipient_hospital": "Fortis Hospital, Noida",
        "compatibility_score": round(score * 100, 1),
        "tier": "DOMESTIC",
        "message": f"Layer 0 match found! Fortis Noida — {round(score*100,1)}% compatibility. No cross-border encryption needed.",
        "smpc_used": False
    })
    await asyncio.sleep(1.5)

    await broadcast("ROUTING_STARTED", {
        "message": "Computing ambulance route: Safdarjung Delhi → Fortis Noida...",
        "from": "Safdarjung Hospital, Delhi",
        "to": "Fortis Hospital, Noida",
        "mode": "ground_only",
        "viability_remaining_hours": donor.viability_hours
    })
    await asyncio.sleep(1)

    await broadcast("ROUTE_COMPUTED", {
        "feasible": True,
        "total_minutes": segments[0].duration_minutes if segments else 47,
        "total_hours": round((segments[0].duration_minutes if segments else 47) / 60, 2),
        "segments": [
            {"mode": s.mode, "from": s.from_name, "to": s.to_name,
             "duration_minutes": s.duration_minutes}
            for s in (segments or [])
        ],
        "message": "Ambulance route computed. ETA: ~47 minutes. Well within 24h viability window."
    })
    await asyncio.sleep(1.5)

    # Single ground handoff — BFT still used for signature integrity
    consensus = bft.reach_consensus("PKG_DOM_001", 0, best_patient.location)
    await broadcast("HANDOFF_CONFIRMED", {
        "segment": 1,
        "mode": "ground",
        "signatures": consensus["valid_signatures"],
        "message": f"Handoff confirmed by {consensus['valid_signatures']} nodes. Ambulance en route."
    })
    await asyncio.sleep(2)

    await broadcast("ORGAN_DELIVERED", {
        "recipient_id": best_patient.id,
        "hospital": "Fortis Hospital, Noida",
        "total_time_minutes": segments[0].duration_minutes if segments else 47,
        "viability_remaining_hours": round(donor.viability_hours - (segments[0].duration_minutes if segments else 47) / 60, 1),
        "tier": "DOMESTIC",
        "message": "✅ Organ delivered. Patient saved. Layer 0 domestic match — no international data exposure.",
        "lives_saved": 1
    })


async def run_demo_sequence():
    # Step 1: Donor appears in Paris
    donor = Donor("D_001", "H_PARIS", "O", [45,67,23,89,34,56], 
                  "kidney", 24, (48.8827, 2.3572))
    
    await broadcast("DONOR_REGISTERED", {
        "donor_id": donor.id,
        "hospital": "Hôpital Lariboisière, Paris",
        "organ": "Kidney",
        "viability_hours": donor.viability_hours,
        "location": donor.location,
        "message": "Donor registered. Initiating encrypted global matching..."
    })
    await asyncio.sleep(2)
    
    # Step 2: SMPC matching — broadcast each computation step
    await broadcast("SMPC_STARTED", {
        "message": "Distributing encrypted HLA shares across network nodes...",
        "nodes": [h.id for h in HOSPITALS],
        "plain_data_exposed": False
    })
    await asyncio.sleep(1.5)
    
    best_match, score, computation_log = await matching_engine.find_best_match(
        donor, HOSPITALS, donor.viability_hours
    )
    
    # Stream computation steps
    for i, step in enumerate(computation_log[:6]):  # First 6 for demo pacing
        await broadcast("SMPC_COMPUTATION_STEP", {
            "step": i + 1,
            "patient_id": step["patient_id"],
            "hospital": step["hospital"],
            "score": step["score"],
            "encrypted": True,
            "message": f"Computing compatibility for patient {step['patient_id']}..."
        })
        await asyncio.sleep(0.8)
    
    await broadcast("SMPC_MATCH_FOUND", {
        "recipient_id": best_match.id,
        "recipient_hospital": best_match.hospital_id,
        "compatibility_score": round(score * 100, 1),
        "message": f"Match found! Compatibility: {round(score*100,1)}%. Zero patient records exposed.",
        "plain_data_exposed": False
    })
    await asyncio.sleep(2)
    
    # Step 3: Routing
    await broadcast("ROUTING_STARTED", {
        "message": "Computing time-dependent multi-modal route...",
        "from": "Paris, France",
        "to": "Mumbai, India",
        "viability_remaining_hours": donor.viability_hours
    })
    await asyncio.sleep(1.5)
    
    segments, feasible, total_minutes = routing_engine.compute_route(
        donor.location, best_match.location,
        datetime.now(), donor.viability_hours
    )
    
    await broadcast("ROUTE_COMPUTED", {
        "feasible": feasible,
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 1),
        "segments": [
            {"mode": s.mode, "from": s.from_name, "to": s.to_name,
             "duration_minutes": s.duration_minutes,
             "departure": s.departure_time.isoformat(),
             "arrival": s.arrival_time.isoformat()}
            for s in segments
        ],
        "message": f"Route computed. ETA: {round(total_minutes/60, 1)}h. Within viability window."
    })
    await asyncio.sleep(2)
    
    # Step 4: Transit begins — stream handoffs
    for i, segment in enumerate(segments):
        await broadcast("HANDOFF_INITIATED", {
            "segment": i + 1,
            "mode": segment.mode,
            "from": segment.from_name,
            "to": segment.to_name,
            "message": f"Organ package handed off: {segment.from_name} → {segment.to_name}"
        })
        await asyncio.sleep(1.5)
        
        # Step 5: Byzantine attack on segment 2 (flight handoff)
        if i == 1:
            bft.trigger_byzantine_attack("node_3")
            await broadcast("BYZANTINE_ATTACK", {
                "attacking_node": "node_3",
                "attack_type": "malicious_routing",
                "message": "⚠️ ALERT: Node 3 is sending malicious routing signals!",
                "attempted_action": "Redirect organ package to unauthorized location"
            })
            await asyncio.sleep(2)
        
        # BFT consensus
        consensus = bft.reach_consensus(
            "PKG_001", i, 
            (segment.to_location[0], segment.to_location[1])
        )
        
        if consensus["attack_overruled"]:
            await broadcast("ATTACK_OVERRULED", {
                "valid_signatures": consensus["valid_signatures"],
                "byzantine_rejected": consensus["byzantine_detected"],
                "message": f"✅ Network consensus overruled Byzantine attack. {consensus['valid_signatures']}/7 honest nodes confirm correct routing.",
                "node_3_rejected": True
            })
            bft.restore_node("node_3")
        else:
            await broadcast("HANDOFF_CONFIRMED", {
                "segment": i + 1,
                "signatures": consensus["valid_signatures"],
                "message": f"Handoff confirmed by {consensus['valid_signatures']} nodes."
            })
        
        await asyncio.sleep(1.5)
    
    # Step 6: Delivered
    await broadcast("ORGAN_DELIVERED", {
        "recipient_id": best_match.id,
        "hospital": "Kokilaben Dhirubhai Ambani Hospital, Mumbai",
        "total_time_hours": round(total_minutes / 60, 1),
        "viability_remaining_hours": round(donor.viability_hours - total_minutes/60, 1),
        "message": "✅ Organ successfully delivered. Patient saved.",
        "lives_saved": 1
    })

@app.get("/api/hospitals")
async def get_hospitals():
    return [{"id": h.id, "name": h.name, "city": h.city, 
             "country": h.country, "location": h.location,
             "patient_count": len(h.patients)} for h in HOSPITALS]

@app.get("/api/stats")
async def get_stats():
    return {
        "active_nodes": len(HOSPITALS),
        "patients_in_network": sum(len(h.patients) for h in HOSPITALS),
        "organs_matched_today": 3,
        "average_match_time_seconds": 4.2,
        "plain_data_exposures": 0,
        "byzantine_attacks_blocked": 1
    }
