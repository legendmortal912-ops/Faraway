import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';
import { Ambulance, Plane, AlertTriangle, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

const DEMO_VEHICLES_MAP = [
  { id: 'AMB-DL-01', driver: 'Rajesh Kumar', type: 'Ground', isGround: true, lat: 28.66, lng: 77.22, boxes: ['BOX-KDN-01', 'BOX-HRT-02'], status: 'IN_TRANSIT', overall: 'GOOD' },
  { id: 'AIR-142', driver: 'Capt. Mehta', type: 'Air', isGround: false, lat: 48.85, lng: 2.35, boxes: ['BOX-LVR-01'], status: 'IN_TRANSIT', overall: 'WARNING' },
];

export default function LiveTracking() {
  const { localBoxes, telemetryHistory, alarmActive } = useLifeMeshStore();
  const [selectedVehicle, setSelectedVehicle] = useState(DEMO_VEHICLES_MAP[0]);
  const [selectedBox, setSelectedBox] = useState(null);

  const boxes = localBoxes.filter(b => selectedVehicle.boxes.includes(b.box_id));

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Emergency Alert Banner */}
        {alarmActive && (
          <motion.div initial={{ y: -40 }} animate={{ y: 0 }}
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ animation: 'pulse 0.8s infinite', display: 'flex' }}><AlertTriangle size={24} color="#f87171" /></span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#f87171', fontWeight: 800, marginBottom: 2 }}>CRITICAL COLD CHAIN BREACH DETECTED</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Temperature threshold exceeded — immediate action required</div>
            </div>
            <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.8rem' }}>View Details</button>
          </motion.div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Real-Time Operations</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Live Tracking</h1>
        </div>

        {/* Carrier Selection Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {DEMO_VEHICLES_MAP.map(v => (
            <button key={v.id} onClick={() => { setSelectedVehicle(v); setSelectedBox(null); }}
              className="glass" style={{ padding: '12px 18px', cursor: 'pointer', border: `1px solid ${selectedVehicle.id === v.id ? 'var(--accent-light)' : 'var(--border)'}`, background: selectedVehicle.id === v.id ? 'rgba(167,139,250,0.1)' : 'transparent', textAlign: 'left', borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedVehicle.id === v.id ? 'var(--accent-light)' : 'var(--text-primary)' }}>{v.id}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                {v.isGround ? <Ambulance size={12} /> : <Plane size={12} />} {v.type} · {v.driver}
              </div>
              <div style={{ fontSize: '0.68rem', marginTop: 4, color: v.overall === 'GOOD' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>● {v.overall}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Map Placeholder */}
          <div className="glass" style={{ padding: 0, overflow: 'hidden', minHeight: 400, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d1117 0%, #0a0f1a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <svg width="300" height="300" viewBox="0 0 300 300" style={{ opacity: 0.4 }}>
                <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(0,212,170,0.2)" strokeWidth="1" />
                <ellipse cx="150" cy="150" rx="120" ry="40" fill="none" stroke="rgba(0,212,170,0.1)" strokeWidth="1" />
                <ellipse cx="150" cy="150" rx="120" ry="80" fill="none" stroke="rgba(0,212,170,0.1)" strokeWidth="1" />
                <line x1="30" y1="150" x2="270" y2="150" stroke="rgba(0,212,170,0.1)" strokeWidth="1" />
                <line x1="150" y1="30" x2="150" y2="270" stroke="rgba(0,212,170,0.1)" strokeWidth="1" />
                <path d="M 90 160 Q 150 80 210 140" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
                </path>
                <circle cx="150" cy="120" r="6" fill="var(--accent)">
                  <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="90" cy="160" r="4" fill="rgba(0,212,170,0.5)" />
                <circle cx="210" cy="140" r="4" fill="rgba(0,212,170,0.5)" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><MapPin size={16} /> {selectedVehicle.id} — Live Position</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>lat: {selectedVehicle.lat}° · lng: {selectedVehicle.lng}°</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>Add Mapbox token in Tracking.jsx for full 3D globe</div>
              </div>
            </div>
            {/* Status overlay */}
            <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(3,7,18,0.8)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{DEMO_VEHICLES_MAP.filter(v => v.status === 'IN_TRANSIT').length} vehicles active</span>
            </div>
          </div>

          {/* Per-box sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Container Boxes — {selectedVehicle.id}</h3>
            {boxes.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registered boxes linked to this vehicle in demo data.</div>
            ) : boxes.map(box => (
              <motion.div key={box.box_id} whileHover={{ scale: 1.01 }} onClick={() => setSelectedBox(selectedBox?.box_id === box.box_id ? null : box)}
                className="glass" style={{ padding: 16, cursor: 'pointer', borderColor: selectedBox?.box_id === box.box_id ? 'var(--accent-light)' : 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <code style={{ color: 'var(--accent-light)', fontSize: '0.82rem' }}>{box.box_id}</code>
                  <span style={{ fontSize: '0.68rem', color: box.last_temp > 6 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                    {box.last_temp != null ? `${box.last_temp}°C` : '--°C'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{box.organ_profile}</div>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(((box.last_temp || 4) / 10) * 100, 100)}%`, background: box.last_temp > 6 ? 'var(--danger)' : box.last_temp > 4 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.5s ease' }} />
                </div>
              </motion.div>
            ))}

            {/* Telemetry chart for selected box */}
            {telemetryHistory.length > 0 && (
              <div className="glass" style={{ padding: 16 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>Live Temperature</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={telemetryHistory.slice(-40)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis tick={false} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={25} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.72rem' }} />
                    <ReferenceLine y={8} stroke="var(--danger)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="temperature" stroke="var(--accent-light)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
