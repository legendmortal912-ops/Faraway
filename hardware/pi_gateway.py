"""
LifeMesh Layer 2 — Raspberry Pi BLE Gateway
Function:
- Scans for Arduino BLE sensor node
- Connects and subscribes to telemetry characteristic
- Parses telemetry string into JSON
- Forwards to FastAPI backend via REST (or WebSockets)
"""

import asyncio
import httpx
import time
import random
import sys

# from bleak import BleakClient, BleakScanner  # Uncomment for real hardware

BACKEND_URL = "http://localhost:8000/api/telemetry"
PACKAGE_ID = "PKG-COLD-CHAIN-DEMO-001"
TARGET_NAME = "LifeMesh_Sensor_01"
CHAR_UUID = "19B10001-E8F2-537E-4F6C-D104768A1214"

SIMULATION_MODE = True  # Set to False to use real BLE hardware

async def send_to_backend(data: dict):
    """Forward telemetry JSON to FastAPI backend"""
    async with httpx.AsyncClient() as client:
        try:
            await client.post(BACKEND_URL, json=data)
            print(f"📡 Forwarded: {data}")
        except Exception as e:
            print(f"❌ Failed to reach backend: {e}")

# ---------------------------------------------------------
# Real Hardware BLE Implementation
# ---------------------------------------------------------
'''
async def handle_rx(_, data: bytearray):
    """Callback when BLE notification received"""
    payload = data.decode("utf-8").strip()
    # Parse format: "T:4.00 H:65.00 S:1.00 B:100 A:0"
    try:
        parts = {p.split(':')[0]: float(p.split(':')[1]) for p in payload.split()}
        telemetry = {
            "package_id": PACKAGE_ID,
            "temperature_c": parts.get('T', 0),
            "humidity_pct": parts.get('H', 0),
            "shock_g": parts.get('S', 0),
            "battery_pct": int(parts.get('B', 100)),
            "alarm_active": bool(parts.get('A', 0))
        }
        asyncio.create_task(send_to_backend(telemetry))
    except Exception as e:
        print(f"Failed to parse payload: {payload} - {e}")

async def run_ble():
    print("🔍 Scanning for LifeMesh sensor...")
    devices = await BleakScanner.discover()
    target_device = next((d for d in devices if d.name == TARGET_NAME), None)

    if not target_device:
        print("❌ Sensor not found. Ensure Arduino is powered on.")
        return

    print(f"✅ Found {TARGET_NAME} at {target_device.address}. Connecting...")
    
    async with BleakClient(target_device.address) as client:
        print(f"🔗 Connected! Subscribing to telemetry characteristic {CHAR_UUID}...")
        await client.start_notify(CHAR_UUID, handle_rx)
        
        # Keep running
        while True:
            await asyncio.sleep(1)
'''

# ---------------------------------------------------------
# Software Simulation Implementation (for local hackathon demo)
# ---------------------------------------------------------
async def run_simulation():
    print("🚀 Starting Pi Gateway Simulation Mode...")
    print(f"Connecting to backend at {BACKEND_URL}")
    
    temp = 4.0
    hum = 65.0
    shock = 1.0
    battery = 100
    
    # Introduce an intentional breach after 10 seconds for demo purposes
    start_time = time.time()

    while True:
        elapsed = time.time() - start_time
        
        # Normal fluctuation
        temp += random.uniform(-0.1, 0.1)
        hum += random.uniform(-0.5, 0.5)
        shock = 1.0 + abs(random.uniform(-0.1, 0.1))
        
        # Trigger Cold Chain Breach Demo
        if 10 < elapsed < 15:
            # Dropped the box!
            shock = random.uniform(3.0, 4.5)
        elif elapsed > 20:
            # Left out of the cooler!
            temp += 0.5  # Rapid heating

        alarm = temp > 6.0 or temp < 2.0 or shock > 2.5
        
        telemetry = {
            "package_id": PACKAGE_ID,
            "temperature_c": round(temp, 2),
            "humidity_pct": round(hum, 2),
            "shock_g": round(shock, 2),
            "battery_pct": battery,
            "alarm_active": alarm
        }
        
        await send_to_backend(telemetry)
        await asyncio.sleep(0.5)  # 2Hz update rate

if __name__ == "__main__":
    try:
        if SIMULATION_MODE:
            asyncio.run(run_simulation())
        else:
            # asyncio.run(run_ble())
            print("BLE mode uncommented in code.")
    except KeyboardInterrupt:
        print("\n🛑 Gateway stopped.")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)
