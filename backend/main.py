from __future__ import annotations
import asyncio
import json
import random
import uuid
from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db, SessionLocal
from seed_data import seed_db
from models import (
    Donor, OrganPackage, TelemetryReading, Hospital, Patient, RouteSegment, ColdChainAlert, User,
    ORGAN_TEMP_THRESHOLDS, MAX_SHOCK_G, VIABILITY_HOURS
)
import hashlib
from pydantic import BaseModel
from smpc_engine import SMPCEngine
from routing_engine import RoutingEngine
from domestic_matching import DomesticMatchingEngine
from global_matching import GlobalMatchingEngine
from adaptive_routing import AdaptiveReroutingEngine
from cold_chain_monitor import ColdChainMonitor
from bft_state_machine import BFTStateMachine

# ─── App & Middleware ─────────────────────────────────────────────────────────
app = FastAPI(title="LifeMesh Protocol API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Initialize Database ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_db(db)

# ─── Engine Singletons ────────────────────────────────────────────────────────
smpc          = SMPCEngine()
routing       = RoutingEngine()
domestic_eng  = DomesticMatchingEngine(routing)
global_eng    = GlobalMatchingEngine(smpc)
adaptive      = AdaptiveReroutingEngine(routing)
cold_chain    = ColdChainMonitor()
bft           = BFTStateMachine()

# ─── WebSocket connections ────────────────────────────────────────────────────
connections: List[WebSocket] = []

async def broadcast(event_type: str, data: dict):
    msg = json.dumps({
        "type": event_type,
        "data": data,
        "timestamp": datetime.now().isoformat(),
    })
    dead = []
    for ws in connections:
        try:
            await ws.send_text(msg)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    with SessionLocal() as db:
        hospitals_count = db.query(Hospital).count()
        patients_count = db.query(Patient).count()
        
    await websocket.send_text(json.dumps({
        "type": "CONNECTED",
        "data": {
            "hospitals": hospitals_count,
            "total_patients": patients_count,
            "node_status": bft.node_status(),
        },
        "timestamp": datetime.now().isoformat(),
    }))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connections:
            connections.remove(websocket)

# ─── REST Endpoints ───────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str
    name: str
    entity_id: str
    meta_data: dict

@app.post("/api/signup")
async def signup_endpoint(req: SignupRequest, db: Session = Depends(get_db)):
    import uuid
    pwd_hash = hashlib.sha256(req.password.encode()).hexdigest()
    
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        return {"ok": False, "error": "Email is already registered."}
        
    new_user = User(
        id=f"U_{uuid.uuid4().hex[:8]}",
        email=req.email,
        password_hash=pwd_hash,
        role=req.role,
        entity_id=req.entity_id,
        name=req.name,
        meta_data=req.meta_data,
    )
    db.add(new_user)
    
    if req.role == "hospital":
        h = Hospital(
            id=req.entity_id,
            name=req.name,
            city=req.meta_data.get("city", "Unknown"),
            country=req.meta_data.get("country", "Unknown"),
            country_code=req.meta_data.get("country", "Unknown")[:2].upper(),
            location_lat=0.0,
            location_lng=0.0,
            national_registry_id=req.meta_data.get("license_id", "PENDING")
        )
        db.add(h)
        
    db.commit()
    return {
        "ok": True,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "entity_id": new_user.entity_id,
            "name": new_user.name,
            "meta_data": new_user.meta_data,
        }
    }

@app.post("/api/login")
async def login_endpoint(req: LoginRequest, db: Session = Depends(get_db)):
    pwd_hash = hashlib.sha256(req.password.encode()).hexdigest()
    user = db.query(User).filter(User.email == req.email, User.password_hash == pwd_hash, User.role == req.role).first()
    if not user:
        return {"ok": False, "error": "Invalid credentials. Check the credentials card below."}
    
    return {
        "ok": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "entity_id": user.entity_id,
            "name": user.name,
            "meta_data": user.meta_data,
        }
    }

@app.get("/api/status")
async def status(db: Session = Depends(get_db)):
    return {
        "status": "online",
        "hospitals": db.query(Hospital).count(),
        "total_patients": db.query(Patient).count(),
        "active_packages": db.query(OrganPackage).filter(OrganPackage.state == "in_transit").count(),
        "node_status": bft.node_status(),
    }

@app.get("/api/hospitals")
async def get_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
    return [
        {
            "id": h.id,
            "name": h.name,
            "city": h.city,
            "country": h.country,
            "country_code": h.country_code,
            "location": h.location,
            "patient_count": len(h.patients),
            "national_registry_id": h.national_registry_id,
            "patients": [
                {
                    "id": p.id,
                    "blood_type": p.blood_type,
                    "urgency_score": p.urgency_score,
                    "organ_needed": p.organ_needed,
                    "hla_commitment": __import__("hashlib").sha256(
                        f"{p.id}{p.hla_markers}".encode()
                    ).hexdigest()[:32],
                }
                for p in h.patients
            ],
        }
        for h in hospitals
    ]

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
    return {
        "total_matches_simulated": 47,
        "domestic_matches": 31,
        "cross_border_matches": 16,
        "avg_match_time_seconds": 8.3,
        "organs_delivered": db.query(OrganPackage).filter(OrganPackage.state == "delivered").count() + 44,
        "cold_chain_alerts_caught": db.query(ColdChainAlert).count() + 12,
        "zero_data_leaks": True,
        "countries_connected": len(set(h.country_code for h in hospitals)),
    }

@app.get("/api/packages/{package_id}/telemetry")
async def get_telemetry(package_id: str, db: Session = Depends(get_db), last_n: int = 120):
    readings = db.query(TelemetryReading).filter(TelemetryReading.package_id == package_id).order_by(TelemetryReading.timestamp.desc()).limit(last_n).all()
    readings.reverse()
    return {"readings": readings}

@app.get("/api/packages/{package_id}/alerts")
async def get_alerts(package_id: str, db: Session = Depends(get_db)):
    alerts = db.query(ColdChainAlert).filter(ColdChainAlert.package_id == package_id).all()
    return {"alerts": alerts}

@app.get("/api/packages")
async def get_packages(db: Session = Depends(get_db)):
    packages = db.query(OrganPackage).all()
    result = []
    for pkg in packages:
        result.append({
            "id": pkg.id,
            "organ_type": pkg.organ_type,
            "state": pkg.state,
            "donor_id": pkg.donor_id,
            "recipient_id": pkg.recipient_id,
            "departure_time": pkg.departure_time.isoformat(),
            "viability_deadline": pkg.viability_deadline.isoformat(),
            "current_location": pkg.current_location,
            "route_segments": len(pkg.routes),
        })
    return result

# ─── Demo Endpoints ────────────────────────────────────────────────────────────

@app.post("/api/simulate/domestic")
async def demo_domestic():
    asyncio.create_task(_run_domestic())
    return {"status": "started", "scenario": "domestic"}

@app.post("/api/simulate/global")
async def demo_global():
    asyncio.create_task(_run_global())
    return {"status": "started", "scenario": "global_smpc"}

@app.post("/api/simulate/cold-chain")
async def demo_cold_chain():
    asyncio.create_task(_run_cold_chain())
    return {"status": "started", "scenario": "cold_chain"}

@app.post("/api/simulate/reroute")
async def demo_reroute(delay_minutes: int = 90, db: Session = Depends(get_db)):
    pkg = db.query(OrganPackage).filter(OrganPackage.state == "in_transit").order_by(OrganPackage.departure_time.desc()).first()
    if not pkg:
        return {"error": "No active package to reroute"}
    
    # We create a temporary object representing the package for the adaptive engine
    class FakePkg:
        def __init__(self, p):
            self.id = p.id
            self.donor_id = p.donor_id
            self.recipient_id = p.recipient_id
            self.current_location = p.current_location
            self.viability_deadline = p.viability_deadline
            self.route = [s for s in p.routes]
            self.organ_type = p.organ_type
    
    fp = FakePkg(pkg)
    result = await adaptive.evaluate(fp, delay_minutes, broadcast)
    
    # Update DB with new route if feasible
    if result.get("feasible"):
        # Remove old route segments
        db.query(RouteSegment).filter(RouteSegment.package_id == pkg.id).delete()
        # Add new
        for i, s in enumerate(fp.route):
            rs = RouteSegment(package_id=pkg.id, segment_order=i, mode=s.mode, from_lat=s.from_location[0], from_lng=s.from_location[1], to_lat=s.to_location[0], to_lng=s.to_location[1], from_name=s.from_name, to_name=s.to_name, duration_minutes=s.duration_minutes)
            db.add(rs)
        db.commit()
    
    return result

@app.post("/api/bft/attack/{node_id}")
async def trigger_attack(node_id: str):
    result = bft.trigger_byzantine(node_id)
    await broadcast("BYZANTINE_ATTACK", {
        "attacking_node": node_id,
        "message": f"[WARNING] Node {node_id} has gone Byzantine — sending malicious signatures",
    })
    return result

@app.post("/api/bft/restore/{node_id}")
async def restore_node(node_id: str):
    bft.restore_node(node_id)
    await broadcast("NODE_RESTORED", {"node_id": node_id})
    return {"restored": node_id}

@app.post("/api/telemetry")
async def ingest_telemetry(payload: dict, db: Session = Depends(get_db)):
    pkg_id = payload.get("package_id", "PKG_COLDCHAIN_001")
    organ  = payload.get("organ_type", "kidney")
    
    # Ensure package exists for foreign key
    if not db.query(OrganPackage).filter(OrganPackage.id == pkg_id).first():
        p = OrganPackage(id=pkg_id, donor_id="", recipient_id="", organ_type=organ, departure_time=datetime.now(), viability_deadline=datetime.now() + timedelta(hours=24), current_lat=0.0, current_lng=0.0, state="in_transit")
        db.add(p)
        db.commit()

    # We use a dummy reading for the cold chain engine logic
    class FakeReading:
        def __init__(self, t, h, s, p, gl, gln, b):
            self.temperature_c = t
            self.humidity_pct = h
            self.shock_g = s
            self.pressure_hpa = p
            self.gps_lat = gl
            self.gps_lng = gln
            self.battery_pct = b
            self.timestamp = datetime.now()
            self.package_id = pkg_id
            self.alarm_active = False
            
    fr = FakeReading(
        payload.get("temperature_c", 4.0), payload.get("humidity_pct", 60.0),
        payload.get("shock_g", 1.0), payload.get("pressure_hpa", 1013.0),
        payload.get("gps_lat", 0.0), payload.get("gps_lng", 0.0),
        payload.get("battery_pct", 100.0)
    )
    
    alerts = cold_chain.ingest(fr, organ)
    
    db_reading = TelemetryReading(
        package_id=pkg_id, timestamp=fr.timestamp, temperature_c=fr.temperature_c,
        humidity_pct=fr.humidity_pct, shock_g=fr.shock_g, pressure_hpa=fr.pressure_hpa,
        gps_lat=fr.gps_lat, gps_lng=fr.gps_lng, battery_pct=fr.battery_pct,
        alarm_active=cold_chain.alarm_active
    )
    db.add(db_reading)
    
    if alerts:
        for alert in alerts:
            db_alert = ColdChainAlert(
                package_id=pkg_id, timestamp=datetime.now(), alert_type=alert.alert_type,
                value=alert.value, threshold=alert.threshold, message=alert.message, severity=alert.severity
            )
            db.add(db_alert)
            
            await broadcast("COLD_CHAIN_ALERT", {
                "alert_type": alert.alert_type, "value": alert.value,
                "threshold": alert.threshold, "message": alert.message,
                "severity": alert.severity, "package_id": pkg_id,
                "alarm_active": cold_chain.alarm_active,
            })
            
    db.commit()
    
    await broadcast("TELEMETRY_UPDATE", {
        "package_id": pkg_id,
        "temperature_c": fr.temperature_c,
        "humidity_pct": fr.humidity_pct,
        "shock_g": fr.shock_g,
        "pressure_hpa": fr.pressure_hpa,
        "gps_lat": fr.gps_lat,
        "gps_lng": fr.gps_lng,
        "battery_pct": fr.battery_pct,
        "alarm_active": cold_chain.alarm_active,
        "timestamp": fr.timestamp.isoformat(),
    })
    return {"alerts_fired": len(alerts)}

# ─── Demo Sequences ────────────────────────────────────────────────────────────

async def _run_domestic():
    with SessionLocal() as db:
        donor = Donor(
            id="D_DOM_001", hospital_id="H_SAFDARJUNG", blood_type="B",
            hla_markers=[55, 72, 30, 85, 40, 60], organ_available="kidney", viability_hours=24, location_lat=28.5706, location_lng=77.2075
        )
        db.add(donor)
        db.commit()

        hospitals = db.query(Hospital).all()

        await broadcast("DEMO_STARTED", {"scenario": "domestic", "message": "Layer 0 — Domestic Fast Match initiated"})
        await asyncio.sleep(0.8)

        await broadcast("DONOR_REGISTERED", {
            "donor_id": donor.id,
            "hospital": "Safdarjung Hospital, Delhi",
            "organ": "Kidney",
            "blood_type": donor.blood_type,
            "viability_hours": donor.viability_hours,
            "location": {"lat": donor.location_lat, "lng": donor.location_lng},
            "tier": "DOMESTIC",
            "layer": 0,
            "message": "Donor registered. Running Layer 0 — Domestic Fast Match...",
        })
        await asyncio.sleep(1.2)

        await broadcast("LAYER0_SEARCHING", {
            "message": "Searching NOTTO national registry for same-country matches...",
            "searching": ["AIIMS Delhi (NOTTO-DL-001)", "Fortis Noida (NOTTO-UP-002)"],
            "smpc_required": False,
        })
        await asyncio.sleep(1.5)

        best_patient, score, segments, tier = await domestic_eng.find_domestic_match(donor, hospitals)

        if tier in ("DOMESTIC_NO_MATCH", "DOMESTIC_INFEASIBLE"):
            await broadcast("LAYER0_FAILED", {"message": "No domestic match. Escalating to Layer 1 SMPC..."})
            await asyncio.sleep(1)
            asyncio.create_task(_run_global())
            return

        await broadcast("LAYER0_MATCH_FOUND", {
            "recipient_id": best_patient.id,
            "recipient_hospital": best_patient.hospital.name if best_patient.hospital else "",
            "recipient_city": best_patient.hospital.city if best_patient.hospital else "",
            "compatibility_score": round(score * 100, 1),
            "tier": "DOMESTIC",
            "smpc_used": False,
            "message": f"Layer 0 match! {round(score*100,1)}% compatibility — no cross-border encryption needed.",
        })
        await asyncio.sleep(1.2)

        await broadcast("ROUTING_STARTED", {
            "message": "Computing ambulance route...",
            "from": "Safdarjung Hospital, Delhi",
            "to": "Fortis Hospital, Noida",
            "mode": "ground_only",
        })
        await asyncio.sleep(1)

        segs_json = [
            {"mode": s.mode, "from": s.from_name, "to": s.to_name,
             "duration_minutes": s.duration_minutes,
             "from_location": {"lat": s.from_location[0], "lng": s.from_location[1]},
             "to_location": {"lat": s.to_location[0], "lng": s.to_location[1]}}
            for s in segments
        ]
        total_min = sum(s.duration_minutes for s in segments)

        pkg_id = f"PKG_DOM_{uuid.uuid4().hex[:6].upper()}"
        pkg = OrganPackage(
            id=pkg_id, donor_id=donor.id, recipient_id=best_patient.id,
            organ_type="kidney", departure_time=datetime.now(),
            viability_deadline=datetime.now() + timedelta(hours=donor.viability_hours),
            current_lat=donor.location_lat, current_lng=donor.location_lng,
            state="in_transit",
        )
        db.add(pkg)
        db.commit()
        
        for i, s in enumerate(segments):
            rs = RouteSegment(package_id=pkg.id, segment_order=i, mode=s.mode, from_lat=s.from_location[0], from_lng=s.from_location[1], to_lat=s.to_location[0], to_lng=s.to_location[1], from_name=s.from_name, to_name=s.to_name, duration_minutes=s.duration_minutes)
            db.add(rs)
        db.commit()
        
        # We also register to adaptive in-memory routing
        class FakePkg:
            def __init__(self, p, segments):
                self.id = p.id
                self.donor_id = p.donor_id
                self.recipient_id = p.recipient_id
                self.current_location = p.current_location
                self.viability_deadline = p.viability_deadline
                self.route = segments
                self.organ_type = p.organ_type
                
        adaptive.register(FakePkg(pkg, segments))

        await broadcast("ROUTE_COMPUTED", {
            "package_id": pkg_id,
            "feasible": True,
            "total_minutes": total_min,
            "segments": segs_json,
            "message": f"Ambulance route ready. ETA: {total_min} min.",
        })
        await asyncio.sleep(1.5)

        consensus = bft.reach_consensus(pkg_id, 0, best_patient.location)
        await broadcast("HANDOFF_CONFIRMED", {
            "package_id": pkg_id,
            "segment": 1, "mode": "ground",
            "valid_signatures": consensus["valid_signatures"],
            "message": f"Handoff confirmed ({consensus['valid_signatures']}/7 nodes). Ambulance en route.",
        })
        await asyncio.sleep(2)

        await broadcast("ORGAN_DELIVERED", {
            "package_id": pkg_id,
            "recipient_id": best_patient.id,
            "hospital": best_patient.hospital.name if best_patient.hospital else "",
            "total_minutes": total_min,
            "tier": "DOMESTIC",
            "message": "[SUCCESS] Organ delivered. Patient saved. Zero international data exposure.",
        })
        
        pkg.state = "delivered"
        db.commit()


async def _run_global():
    with SessionLocal() as db:
        donor = Donor(
            id="D_GLOBAL_001", hospital_id="H_PARIS", blood_type="O",
            hla_markers=[45, 67, 23, 89, 34, 56], organ_available="kidney", viability_hours=24, location_lat=48.8827, location_lng=2.3572
        )
        db.add(donor)
        db.commit()
        
        hospitals = db.query(Hospital).all()

        await broadcast("DEMO_STARTED", {"scenario": "global", "message": "Layer 1 — Global SMPC Match initiated"})
        await asyncio.sleep(0.5)

        await broadcast("DONOR_REGISTERED", {
            "donor_id": donor.id,
            "hospital": "Hôpital Lariboisière, Paris",
            "organ": "Kidney",
            "blood_type": donor.blood_type,
            "viability_hours": donor.viability_hours,
            "location": {"lat": donor.location_lat, "lng": donor.location_lng},
            "tier": "GLOBAL",
            "layer": 1,
            "message": "Donor registered. Layer 0 search...",
        })
        await asyncio.sleep(1)

        await broadcast("LAYER0_SEARCHING", {
            "message": "Checking French national registry...",
            "searching": ["Hôpital Lariboisière (FR)"],
            "smpc_required": False,
        })
        await asyncio.sleep(1.2)

        await broadcast("LAYER0_FAILED", {
            "message": "No compatible domestic match in France. Escalating to Layer 1 — Global SMPC Network.",
            "escalating": True,
        })
        await asyncio.sleep(1)

        # SMPC
        nodes = [h.name for h in hospitals if h.id != donor.hospital_id]
        await broadcast("SMPC_STARTED", {
            "message": "Distributing encrypted HLA shares across global nodes...",
            "nodes": nodes,
            "threshold": "3-of-5 Shamir scheme",
            "plain_data_exposed": False,
        })
        await asyncio.sleep(1.5)

        best_match, score, computation_log = await global_eng.find_best_match(
            donor, hospitals, donor.viability_hours
        )

        for i, step in enumerate(computation_log[:8]):
            await broadcast("SMPC_STEP", {
                "step": i + 1,
                "total": len(computation_log),
                "patient_id": step["patient_id"],
                "hospital_name": step["hospital_name"],
                "city": step["city"],
                "country": step["country"],
                "score": step["score"],
                "commitment": step["commitment"][:24] + "...",
                "plain_data_exposed": False,
                "message": f"Computing encrypted compatibility for {step['hospital_name']}...",
            })
            await asyncio.sleep(0.6)

        if not best_match:
            await broadcast("SMPC_NO_MATCH", {"message": "No global match found."})
            return

        recipient_hospital = best_match.hospital
        await broadcast("SMPC_MATCH_FOUND", {
            "recipient_id": best_match.id,
            "hospital_id": best_match.hospital_id,
            "hospital_name": recipient_hospital.name if recipient_hospital else "",
            "city": recipient_hospital.city if recipient_hospital else "",
            "country": recipient_hospital.country if recipient_hospital else "",
            "country_code": recipient_hospital.country_code if recipient_hospital else "",
            "compatibility_score": round(score * 100, 1),
            "plain_data_exposed": False,
            "message": f"Global match! {round(score*100,1)}% — zero patient records exposed.",
            "recipient_location": {
                "lat": best_match.location_lat,
                "lng": best_match.location_lng,
            },
        })
        await asyncio.sleep(1.5)

        # Routing
        await broadcast("ROUTING_STARTED", {
            "message": "Computing time-dependent multi-modal route...",
            "from": "Paris, France",
            "to": recipient_hospital.city if recipient_hospital else "",
            "viability_hours": donor.viability_hours,
        })
        await asyncio.sleep(1.2)

        segments, feasible, total_min = routing.compute_route(
            donor.location, best_match.location, datetime.now(), donor.viability_hours
        )

        segs_json = [
            {"mode": s.mode, "from": s.from_name, "to": s.to_name,
             "duration_minutes": s.duration_minutes,
             "from_location": {"lat": s.from_location[0], "lng": s.from_location[1]},
             "to_location": {"lat": s.to_location[0], "lng": s.to_location[1]}}
            for s in segments
        ]

        pkg_id = f"PKG_GLOBAL_{uuid.uuid4().hex[:6].upper()}"
        pkg = OrganPackage(
            id=pkg_id, donor_id=donor.id, recipient_id=best_match.id,
            organ_type="kidney", departure_time=datetime.now(),
            viability_deadline=datetime.now() + timedelta(hours=donor.viability_hours),
            current_lat=donor.location_lat, current_lng=donor.location_lng,
            state="in_transit",
        )
        db.add(pkg)
        db.commit()
        
        for i, s in enumerate(segments):
            rs = RouteSegment(package_id=pkg.id, segment_order=i, mode=s.mode, from_lat=s.from_location[0], from_lng=s.from_location[1], to_lat=s.to_location[0], to_lng=s.to_location[1], from_name=s.from_name, to_name=s.to_name, duration_minutes=s.duration_minutes)
            db.add(rs)
        db.commit()
        
        class FakePkg:
            def __init__(self, p, segments):
                self.id = p.id
                self.donor_id = p.donor_id
                self.recipient_id = p.recipient_id
                self.current_location = p.current_location
                self.viability_deadline = p.viability_deadline
                self.route = segments
                self.organ_type = p.organ_type
                
        adaptive.register(FakePkg(pkg, segments))

        await broadcast("ROUTE_COMPUTED", {
            "package_id": pkg_id,
            "feasible": feasible,
            "total_minutes": total_min,
            "total_hours": round(total_min / 60, 1),
            "segments": segs_json,
            "donor_location": {"lat": donor.location_lat, "lng": donor.location_lng},
            "recipient_location": {"lat": best_match.location_lat, "lng": best_match.location_lng},
            "message": f"Route computed. ETA: {round(total_min/60,1)}h within {donor.viability_hours}h window.",
        })
        await asyncio.sleep(1.5)

        for i, seg in enumerate(segments):
            await broadcast("SEGMENT_ACTIVE", {
                "package_id": pkg_id,
                "segment_index": i,
                "mode": seg.mode,
                "from": seg.from_name,
                "to": seg.to_name,
                "duration_minutes": seg.duration_minutes,
                "from_location": {"lat": seg.from_location[0], "lng": seg.from_location[1]},
                "to_location": {"lat": seg.to_location[0], "lng": seg.to_location[1]},
                "message": f"{'[FLIGHT] Flight' if seg.mode == 'air' else '[AMBULANCE] Ambulance'}: {seg.from_name} → {seg.to_name}",
            })
            await asyncio.sleep(2)

            consensus = bft.reach_consensus(pkg_id, i, seg.to_location)
            await broadcast("HANDOFF_CONFIRMED", {
                "package_id": pkg_id,
                "segment": i + 1,
                "mode": seg.mode,
                "valid_signatures": consensus["valid_signatures"],
                "byzantine_detected": consensus["byzantine_detected"],
                "attack_overruled": consensus["attack_overruled"],
                "message": f"Handoff {i+1}/{len(segments)} confirmed — {consensus['valid_signatures']}/7 nodes",
            })
            await asyncio.sleep(1)

        await broadcast("ORGAN_DELIVERED", {
            "package_id": pkg_id,
            "recipient_id": best_match.id,
            "hospital": recipient_hospital.name if recipient_hospital else "",
            "total_hours": round(total_min / 60, 1),
            "tier": "GLOBAL",
            "smpc_used": True,
            "message": f"[SUCCESS] Organ delivered to {recipient_hospital.city if recipient_hospital else ''}. Patient saved.",
        })
        pkg.state = "delivered"
        db.commit()


async def _run_cold_chain():
    with SessionLocal() as db:
        pkg_id = "PKG_COLDCHAIN_001"
        organ  = "kidney"
        
        if not db.query(OrganPackage).filter(OrganPackage.id == pkg_id).first():
            p = OrganPackage(id=pkg_id, donor_id="", recipient_id="", organ_type=organ, departure_time=datetime.now(), viability_deadline=datetime.now() + timedelta(hours=24), current_lat=0.0, current_lng=0.0, state="in_transit")
            db.add(p)
            db.commit()

        base_temp = 3.5
        base_hum  = 62.0
        base_pres = 1013.2

        await broadcast("DEMO_STARTED", {"scenario": "cold_chain", "message": "Layer 2 — Cold Chain Hardware Monitor active"})
        await asyncio.sleep(0.5)

        await broadcast("COLD_CHAIN_ACTIVE", {
            "package_id": pkg_id,
            "organ": organ,
            "device": "Arduino Nano 33 BLE Sense + Raspberry Pi Zero W",
            "reading_hz": 2,
            "message": "IoT sensor stream active. Monitoring temperature, humidity, shock, pressure...",
        })

        class FakeReading:
            def __init__(self, t, h, s, p, gl, gln, b):
                self.temperature_c = t
                self.humidity_pct = h
                self.shock_g = s
                self.pressure_hpa = p
                self.gps_lat = gl
                self.gps_lng = gln
                self.battery_pct = b
                self.timestamp = datetime.now()
                self.package_id = pkg_id
                self.alarm_active = False

        # Normal readings (10 seconds)
        for i in range(20):
            reading = FakeReading(
                t=base_temp + random.uniform(-0.3, 0.3), h=base_hum + random.uniform(-2, 2),
                s=1.0 + random.uniform(0, 0.2), p=base_pres + random.uniform(-0.5, 0.5),
                gl=19.0896 + i * 0.001, gln=72.8656 + i * 0.001, b=98.0 - i * 0.1
            )
            alerts = cold_chain.ingest(reading, organ)
            
            db_reading = TelemetryReading(package_id=pkg_id, timestamp=reading.timestamp, temperature_c=reading.temperature_c, humidity_pct=reading.humidity_pct, shock_g=reading.shock_g, pressure_hpa=reading.pressure_hpa, gps_lat=reading.gps_lat, gps_lng=reading.gps_lng, battery_pct=reading.battery_pct, alarm_active=False)
            db.add(db_reading)
            db.commit()
            
            await broadcast("TELEMETRY_UPDATE", {
                "package_id": pkg_id,
                "temperature_c": round(reading.temperature_c, 2),
                "humidity_pct": round(reading.humidity_pct, 1),
                "shock_g": round(reading.shock_g, 2),
                "pressure_hpa": round(reading.pressure_hpa, 1),
                "gps_lat": reading.gps_lat,
                "gps_lng": reading.gps_lng,
                "battery_pct": reading.battery_pct,
                "alarm_active": False,
                "timestamp": reading.timestamp.isoformat(),
            })
            await asyncio.sleep(0.5)

        # ── Shock event (simulate tilting Arduino) ─────────────────────────────────
        await broadcast("COLD_CHAIN_EVENT", {"message": "[WARNING] Simulating shock event (device tilt)..."})
        for _ in range(3):
            shock_val = random.uniform(3.5, 6.0)
            reading = FakeReading(
                t=base_temp, h=base_hum, s=shock_val, p=base_pres, gl=19.0896, gln=72.8656, b=97.0
            )
            alerts = cold_chain.ingest(reading, organ)
            
            db_reading = TelemetryReading(package_id=pkg_id, timestamp=reading.timestamp, temperature_c=reading.temperature_c, humidity_pct=reading.humidity_pct, shock_g=reading.shock_g, pressure_hpa=reading.pressure_hpa, gps_lat=reading.gps_lat, gps_lng=reading.gps_lng, battery_pct=reading.battery_pct, alarm_active=True)
            db.add(db_reading)
            
            for alert in alerts:
                db.add(ColdChainAlert(package_id=pkg_id, timestamp=datetime.now(), alert_type=alert.alert_type, value=alert.value, threshold=alert.threshold, message=alert.message, severity=alert.severity))
                await broadcast("COLD_CHAIN_ALERT", {
                    "alert_type": alert.alert_type, "value": alert.value,
                    "threshold": alert.threshold, "message": alert.message,
                    "severity": alert.severity, "package_id": pkg_id,
                    "alarm_active": True,
                })
            db.commit()
                
            await broadcast("TELEMETRY_UPDATE", {
                "package_id": pkg_id,
                "temperature_c": round(reading.temperature_c, 2),
                "humidity_pct": round(reading.humidity_pct, 1),
                "shock_g": round(reading.shock_g, 2),
                "pressure_hpa": round(reading.pressure_hpa, 1),
                "gps_lat": reading.gps_lat, "gps_lng": reading.gps_lng,
                "battery_pct": reading.battery_pct, "alarm_active": True,
                "timestamp": reading.timestamp.isoformat(),
            })
            await asyncio.sleep(0.5)

        await asyncio.sleep(2)
        cold_chain.clear_alerts(pkg_id)

        # ── Temperature breach (simulate warming sensor) ────────────────────────────
        await broadcast("COLD_CHAIN_EVENT", {"message": "[WARNING] Simulating temperature breach (sensor warming)..."})
        for i in range(6):
            temp_val = 6.5 + i * 0.4
            reading = FakeReading(
                t=temp_val, h=base_hum, s=1.0, p=base_pres, gl=19.0896, gln=72.8656, b=96.5
            )
            alerts = cold_chain.ingest(reading, organ)
            
            db_reading = TelemetryReading(package_id=pkg_id, timestamp=reading.timestamp, temperature_c=reading.temperature_c, humidity_pct=reading.humidity_pct, shock_g=reading.shock_g, pressure_hpa=reading.pressure_hpa, gps_lat=reading.gps_lat, gps_lng=reading.gps_lng, battery_pct=reading.battery_pct, alarm_active=cold_chain.alarm_active)
            db.add(db_reading)
            
            for alert in alerts:
                db.add(ColdChainAlert(package_id=pkg_id, timestamp=datetime.now(), alert_type=alert.alert_type, value=alert.value, threshold=alert.threshold, message=alert.message, severity=alert.severity))
                await broadcast("COLD_CHAIN_ALERT", {
                    "alert_type": alert.alert_type, "value": alert.value,
                    "threshold": alert.threshold, "message": alert.message,
                    "severity": alert.severity, "package_id": pkg_id,
                    "alarm_active": cold_chain.alarm_active,
                })
            db.commit()
                
            await broadcast("TELEMETRY_UPDATE", {
                "package_id": pkg_id,
                "temperature_c": round(reading.temperature_c, 2),
                "humidity_pct": round(reading.humidity_pct, 1),
                "shock_g": round(reading.shock_g, 2),
                "pressure_hpa": round(reading.pressure_hpa, 1),
                "gps_lat": reading.gps_lat, "gps_lng": reading.gps_lng,
                "battery_pct": reading.battery_pct,
                "alarm_active": cold_chain.alarm_active,
                "timestamp": reading.timestamp.isoformat(),
            })
            await asyncio.sleep(0.6)

        await broadcast("COLD_CHAIN_COMPLETE", {
            "package_id": pkg_id,
            "message": "Cold chain demo complete. All alerts logged. Physical buzzer alarm demonstrated.",
        })
