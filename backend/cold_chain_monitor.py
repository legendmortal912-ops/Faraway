from datetime import datetime
from typing import List
from models import TelemetryReading, ColdChainAlert, ORGAN_TEMP_THRESHOLDS, MAX_SHOCK_G


class ColdChainMonitor:
    """
    Layer 2 — Real-time cold chain monitoring.
    Ingests telemetry from Pi Zero gateway (2 Hz).
    Fires alerts when organ-specific thresholds are breached.
    """

    def __init__(self):
        self.telemetry_log: List[TelemetryReading] = []
        self.active_alerts: List[ColdChainAlert] = []
        self.alarm_active: bool = False

    def ingest(self, reading: TelemetryReading, organ_type: str) -> List[ColdChainAlert]:
        """Process one telemetry reading. Return any new alerts fired."""
        self.telemetry_log.append(reading)
        new_alerts: List[ColdChainAlert] = []
        thresh = ORGAN_TEMP_THRESHOLDS.get(organ_type, ORGAN_TEMP_THRESHOLDS["kidney"])

        # ── Temperature ────────────────────────────────────────────────────────
        if reading.temperature_c < thresh["min"] or reading.temperature_c > thresh["max"]:
            sev = "critical" if (
                reading.temperature_c > thresh["max"] + 2
                or reading.temperature_c < thresh["min"] - 1
            ) else "warning"
            new_alerts.append(ColdChainAlert(
                package_id=reading.package_id,
                timestamp=reading.timestamp,
                alert_type="temperature",
                value=reading.temperature_c,
                threshold=thresh["max"] if reading.temperature_c > thresh["max"] else thresh["min"],
                message=(
                    f"Temperature {reading.temperature_c:.1f}°C outside safe range "
                    f"({thresh['min']}–{thresh['max']}°C) for {organ_type}"
                ),
                severity=sev,
            ))

        # ── Humidity ───────────────────────────────────────────────────────────
        if reading.humidity_pct < 40 or reading.humidity_pct > 85:
            new_alerts.append(ColdChainAlert(
                package_id=reading.package_id,
                timestamp=reading.timestamp,
                alert_type="humidity",
                value=reading.humidity_pct,
                threshold=85.0 if reading.humidity_pct > 85 else 40.0,
                message=f"Humidity {reading.humidity_pct:.1f}% outside safe range (40–85%)",
                severity="warning",
            ))

        # ── Shock / G-force ────────────────────────────────────────────────────
        if reading.shock_g > MAX_SHOCK_G:
            new_alerts.append(ColdChainAlert(
                package_id=reading.package_id,
                timestamp=reading.timestamp,
                alert_type="shock",
                value=reading.shock_g,
                threshold=MAX_SHOCK_G,
                message=f"Shock event: {reading.shock_g:.2f}G exceeds {MAX_SHOCK_G}G limit",
                severity="critical" if reading.shock_g > 5.0 else "warning",
            ))

        # ── Pressure seal ─────────────────────────────────────────────────────
        recent_pressures = [r.pressure_hpa for r in self.telemetry_log[-5:]]
        if len(recent_pressures) >= 2:
            drop = recent_pressures[-2] - reading.pressure_hpa
            if drop > 5.0:
                new_alerts.append(ColdChainAlert(
                    package_id=reading.package_id,
                    timestamp=reading.timestamp,
                    alert_type="seal",
                    value=drop,
                    threshold=5.0,
                    message=f"Possible container seal breach: pressure drop {drop:.1f} hPa",
                    severity="critical",
                ))

        has_critical = any(a.severity == "critical" for a in new_alerts)
        self.alarm_active = has_critical
        reading.alarm_active = has_critical
        self.active_alerts.extend(new_alerts)
        return new_alerts

    def series(self, package_id: str, last_n: int = 120) -> List[dict]:
        readings = [r for r in self.telemetry_log if r.package_id == package_id]
        return [
            {
                "timestamp": r.timestamp.isoformat(),
                "temperature_c": r.temperature_c,
                "humidity_pct": r.humidity_pct,
                "shock_g": r.shock_g,
                "pressure_hpa": r.pressure_hpa,
                "gps_lat": r.gps_lat,
                "gps_lng": r.gps_lng,
                "battery_pct": r.battery_pct,
                "alarm_active": r.alarm_active,
            }
            for r in readings[-last_n:]
        ]

    def alerts(self, package_id: str) -> List[dict]:
        return [
            {
                "alert_type": a.alert_type,
                "value": a.value,
                "threshold": a.threshold,
                "message": a.message,
                "severity": a.severity,
                "timestamp": a.timestamp.isoformat(),
            }
            for a in self.active_alerts
            if a.package_id == package_id
        ]

    def clear_alerts(self, package_id: str):
        self.active_alerts = [a for a in self.active_alerts if a.package_id != package_id]
        self.alarm_active = False
