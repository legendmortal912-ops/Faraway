import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  ReferenceLine, Tooltip, CartesianGrid
} from 'recharts';
import { AlertTriangle, Thermometer, Wind, Zap, Activity, RotateCcw, Globe, Plane, Ambulance } from 'lucide-react';

const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';

export default function Tracking() {
  const {
    telemetryHistory, activeAlerts, alarmActive,
    currentRoute, activeSegmentIndex, activityFeed,
    currentPackageId, scenarioPhase,
  } = useLifeMeshStore();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [triggeringReroute, setTriggeringReroute] = useState(false);

  // Init Mapbox
  useEffect(() => {
    import('mapbox-gl').then((mapboxgl) => {
      if (mapInstance.current || !mapRef.current) return;
      if (MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
        setMapError(true);
        return;
      }
      mapboxgl.default.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.default.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [20, 20],
        zoom: 1.6,
        projection: 'globe',
        antialias: true,
      });

      map.on('error', (e) => {
        if (e && e.error && e.error.message && e.error.message.includes('token')) {
          setMapError(true);
        }
      });

      map.on('load', () => {
        map.setFog({ color: 'rgba(0,8,30,0.8)', 'high-color': '#000', 'horizon-blend': 0.05 });
        setMapLoaded(true);
      });

      mapInstance.current = map;
    });
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  // Draw route on map
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !currentRoute?.segments) return;
    const map = mapInstance.current;

    // Remove old layers
    ['route-air', 'route-ground', 'route-points'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });

    const segs = currentRoute.segments;
    const coords = segs.reduce((acc, seg) => {
      if (acc.length === 0) acc.push([seg.from_location.lng, seg.from_location.lat]);
      acc.push([seg.to_location.lng, seg.to_location.lat]);
      return acc;
    }, []);

    // Air segments
    const airSegs = segs.filter(s => s.mode === 'air');
    if (airSegs.length) {
      airSegs.forEach((seg, i) => {
        const id = `route-air-${i}`;
        if (!map.getSource(id)) {
          map.addSource(id, { type: 'geojson', data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [
              [seg.from_location.lng, seg.from_location.lat],
              [seg.to_location.lng, seg.to_location.lat],
            ]},
          }});
          map.addLayer({ id, type: 'line', source: id, paint: {
            'line-color': '#00d4aa', 'line-width': 2, 'line-opacity': 0.8, 'line-dasharray': [4, 2],
          }});
        }
      });
    }

    // All coords line
    if (coords.length > 1) {
      if (!map.getSource('route-full')) {
        map.addSource('route-full', { type: 'geojson', data: {
          type: 'Feature', geometry: { type: 'LineString', coordinates: coords }
        }});
        map.addLayer({ id: 'route-full', type: 'line', source: 'route-full', paint: {
          'line-color': '#00d4aa', 'line-width': 1.5, 'line-opacity': 0.4,
        }});
      }
    }

    // Hospital markers
    const mapboxgl = window.mapboxgl;
    const allPoints = [
      { coords: [segs[0].from_location.lng, segs[0].from_location.lat], label: 'Donor', color: '#ef4444' },
      { coords: [segs[segs.length-1].to_location.lng, segs[segs.length-1].to_location.lat], label: 'Recipient', color: '#00d4aa' },
    ];

    allPoints.forEach(pt => {
      const el = document.createElement('div');
      el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${pt.color};border:2px solid #fff;box-shadow:0 0 12px ${pt.color};`;
      if (mapboxgl) new mapboxgl.Marker({ element: el }).setLngLat(pt.coords).addTo(map);
    });

    // Fly to route bounds
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 80, duration: 2000 });
  }, [mapLoaded, currentRoute]);

  const triggerReroute = async () => {
    setTriggeringReroute(true);
    try {
      await fetch('http://localhost:8000/api/simulate/reroute?delay_minutes=90', { method: 'POST' });
    } finally {
      setTimeout(() => setTriggeringReroute(false), 3000);
    }
  };

  const temp   = telemetryHistory.map((r, i) => ({ i, v: r.temperature_c }));
  const shock  = telemetryHistory.map((r, i) => ({ i, v: r.shock_g }));
  const hum    = telemetryHistory.map((r, i) => ({ i, v: r.humidity_pct }));
  const press  = telemetryHistory.map((r, i) => ({ i, v: r.pressure_hpa }));
  const latest = telemetryHistory[telemetryHistory.length - 1];

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>

      {/* Critical alarm banner */}
      <AnimatePresence>
        {alarmActive && (
          <motion.div
            initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
            className="alert-critical"
            style={{ margin: '0 24px', marginTop: 8, borderRadius: 10 }}
          >
            <AlertTriangle size={20} color="var(--danger)" />
            <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>
              🚨 COLD CHAIN BREACH — Physical buzzer active on Arduino device
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 48 }}>

        <div className="flex-between" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Live Tracking & Telemetry</h2>
            <p style={{ fontSize: '0.875rem' }}>
              {currentPackageId
                ? `Package: ${currentPackageId} · ${scenarioPhase?.replace('_', ' ')}`
                : 'No active package in transit'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-warning btn-sm"
              onClick={triggerReroute}
              disabled={triggeringReroute || !currentRoute}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {triggeringReroute ? <><RotateCcw size={14} /> Rerouting...</> : <><Plane size={14} /> Simulate Flight Delay</>}
            </button>
          </div>
        </div>

        {/* Map + right panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }}>

          {/* Mapbox */}
          <div className="mapbox-wrap" style={{ height: 420 }}>
            {mapError && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 12, background: 'rgba(3,7,18,0.9)', padding: 32, textAlign: 'center'
              }}>
                <Globe size={32} color="var(--danger)" />
                <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600 }}>Mapbox Token Required</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Please edit <code style={{color: 'var(--accent)'}}>src/pages/Tracking.jsx</code> and replace <code>MAPBOX_TOKEN</code> with a valid Mapbox access token to view the live 3D routing visualization.
                </p>
              </div>
            )}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            {!currentRoute && !mapError && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 12, background: 'rgba(3,7,18,0.7)',
              }}>
                <Activity size={32} color="var(--text-muted)" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active route. Run a demo scenario first.</p>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Route segments tracker */}
            {currentRoute?.segments && (
              <div className="glass" style={{ padding: 16 }}>
                <h4 style={{ marginBottom: 14 }}>Route Progress</h4>
                {currentRoute.segments.map((seg, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '8px 10px', borderRadius: 8, marginBottom: 6,
                    background: i === activeSegmentIndex ? 'var(--accent-dim)' : i < activeSegmentIndex ? 'var(--success-dim)' : 'transparent',
                    border: `1px solid ${i === activeSegmentIndex ? 'var(--accent)' : i < activeSegmentIndex ? 'var(--success)' : 'var(--border)'}`,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>{seg.mode === 'air' ? <Plane size={16} /> : <Ambulance size={16} />}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: i <= activeSegmentIndex ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {seg.from} → {seg.to}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{seg.duration_minutes} min</div>
                    </div>
                    {i < activeSegmentIndex && <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>✓</span>}
                    {i === activeSegmentIndex && <span className="pulse-dot accent" />}
                  </div>
                ))}
              </div>
            )}

            {/* Alerts */}
            <div className="glass" style={{ padding: 16, flex: 1, overflow: 'hidden' }}>
              <h4 style={{ marginBottom: 12 }}>Cold Chain Alerts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {activeAlerts.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    All parameters within safe range ✓
                  </div>
                ) : activeAlerts.map((alert, i) => (
                  <div key={i} className={alert.severity === 'critical' ? 'alert-critical' : 'alert-warning'} style={{ padding: '8px 12px', fontSize: '0.78rem' }}>
                    <AlertTriangle size={13} color={alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'} />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry charts */}
        {telemetryHistory.length > 0 && (
          <div className="glass" style={{ padding: 20 }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h3>Live Sensor Telemetry</h3>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {latest && (
                  <>
                    <TelChip icon={<Thermometer size={13} />} label="Temp" value={`${latest.temperature_c?.toFixed(1)}°C`} ok={latest.temperature_c <= 6} />
                    <TelChip icon={<Wind size={13} />} label="Humidity" value={`${latest.humidity_pct?.toFixed(0)}%`} ok={latest.humidity_pct >= 40 && latest.humidity_pct <= 85} />
                    <TelChip icon={<Zap size={13} />} label="Shock" value={`${latest.shock_g?.toFixed(2)}G`} ok={latest.shock_g <= 2.5} />
                    <TelChip icon={<Activity size={13} />} label="Battery" value={`${latest.battery_pct?.toFixed(0)}%`} ok />
                  </>
                )}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span className="pulse-dot green" style={{ width: 6, height: 6 }} />
                  2 Hz stream
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <ChartPanel title="Temperature (°C)" data={temp} color="#ef4444" refLines={[{v:0,c:'#60a5fa'},{v:6,c:'#ef4444'}]} domain={[-2, 12]} />
              <ChartPanel title="Shock / G-Force" data={shock} color="#f59e0b" refLines={[{v:2.5,c:'#ef4444'}]} domain={[0, 8]} />
              <ChartPanel title="Humidity (%)" data={hum} color="#60a5fa" refLines={[{v:40,c:'#ef4444'},{v:85,c:'#ef4444'}]} domain={[20, 100]} />
              <ChartPanel title="Pressure (hPa)" data={press} color="#a78bfa" refLines={[]} domain={[990, 1030]} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TelChip({ icon, label, value, ok }) {
  return (
    <div style={{
      display: 'flex', gap: 6, alignItems: 'center', padding: '5px 10px',
      borderRadius: 8, background: ok ? 'var(--success-dim)' : 'var(--danger-dim)',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>
      <span style={{ color: ok ? 'var(--success)' : 'var(--danger)' }}>{icon}</span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: ok ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function ChartPanel({ title, data, color, refLines = [], domain }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="i" hide />
          <YAxis domain={domain} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.78rem' }}
            labelStyle={{ display: 'none' }}
            formatter={v => [v.toFixed(2), title]}
          />
          {refLines.map((r, i) => (
            <ReferenceLine key={i} y={r.v} stroke={r.c} strokeDasharray="3 3" strokeOpacity={0.7} />
          ))}
          <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
