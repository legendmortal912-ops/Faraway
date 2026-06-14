import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';
import { Plus, Package, Ambulance, Snowflake, AlertTriangle } from 'lucide-react';

function KPI({ icon, label, value, color = 'var(--accent-light)', delay = 0 }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    const n = parseInt(value) || 0;
    let i = 0;
    const t = setInterval(() => { i += Math.ceil(n / 25); if (i >= n) { setD(n); clearInterval(t); } else setD(i); }, 30);
    return () => clearInterval(t);
  }, [value]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color }}>{typeof value === 'string' && isNaN(value) ? value : d}</div>
        </div>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      </div>
    </motion.div>
  );
}

const DEMO_RUNS = [
  { run_id: 'RUN-2041', vehicle: 'AMB-DL-01', boxes: 2, from: 'Delhi', to: 'Mumbai', eta: '22:00', status: 'ACTIVE', cold_chain: 'GOOD' },
  { run_id: 'RUN-2040', vehicle: 'AIR-142', boxes: 1, from: 'Paris', to: 'Dubai', eta: '23:45', status: 'ACTIVE', cold_chain: 'WARNING' },
  { run_id: 'RUN-2039', vehicle: 'AMB-MH-02', boxes: 1, from: 'Mumbai', to: 'Bangalore', eta: 'Delivered', status: 'COMPLETED', cold_chain: 'PASS' },
];

const STATUS_COLORS = { ACTIVE: 'var(--accent)', COMPLETED: 'var(--success)', BREACHED: 'var(--danger)' };
const CHAIN_COLORS = { GOOD: 'var(--success)', WARNING: 'var(--warning)', BREACHED: 'var(--danger)', PASS: 'var(--success)' };

export default function LogisticsDashboard() {
  const { user, localRuns, localBoxes, localVehicles, telemetryHistory, activeAlerts, addVehicle, addBox } = useLifeMeshStore();
  const navigate = useNavigate();
  const [showVForm, setShowVForm] = useState(false);
  const [showBForm, setShowBForm] = useState(false);
  const [vf, setVf] = useState({ vehicle_id: '', type: 'Ground Ambulance', driver_name: '', driver_contact: '', max_box_capacity: '2', gateway_mac: '' });
  const [bf, setBf] = useState({ box_id: '', hardware_mac: '', organ_profile: 'Kidney (2-8°C)' });

  const sv = (k, v) => setVf(f => ({ ...f, [k]: v }));
  const sb = (k, v) => setBf(f => ({ ...f, [k]: v }));

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Fleet Overview</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Command Center</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Real-time status of your fleet and active organ shipments.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowVForm(s => !s)} className="btn btn-outline" style={{ fontSize: '0.85rem', borderColor: 'var(--accent-light)', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Vehicle</button>
            <button onClick={() => setShowBForm(s => !s)} className="btn btn-outline" style={{ fontSize: '0.85rem', borderColor: 'var(--accent-light)', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 6 }}><Package size={14} /> Register Box</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <KPI icon={<Ambulance size={28} />} label="Active Runs" value={String(localRuns.filter(r => r.status === 'ACTIVE').length)} delay={0.05} />
          <KPI icon={<Snowflake size={28} />} label="IoT Devices Online" value={String(localBoxes.length)} color="var(--info)" delay={0.1} />
          <KPI icon={<Package size={28} />} label="Boxes in Transit" value={String(localBoxes.filter(b => b.status === 'TRANSIT').length)} color="var(--warning)" delay={0.15} />
          <KPI icon={<AlertTriangle size={28} />} label="Cold Chain Incidents Today" value={String(activeAlerts.length)} color={activeAlerts.length > 0 ? 'var(--danger)' : 'var(--success)'} delay={0.2} />
        </div>

        {/* Inline forms */}
        {showVForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Register New Vehicle</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <F label="Vehicle ID" value={vf.vehicle_id} onChange={v => sv('vehicle_id', v)} />
              <F label="Driver Name" value={vf.driver_name} onChange={v => sv('driver_name', v)} />
              <F label="Pi Gateway MAC" value={vf.gateway_mac} onChange={v => sv('gateway_mac', v)} placeholder="B8:27:EB:xx:xx" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { addVehicle({ ...vf, carrier_id: user?.carrier_id, current_run: null, current_status: 'IDLE' }); setShowVForm(false); }} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Add</button>
              <button onClick={() => setShowVForm(false)} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Cancel</button>
            </div>
          </motion.div>
        )}
        {showBForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Register Container Box</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <F label="Box ID" value={bf.box_id} onChange={v => sb('box_id', v)} placeholder="BOX-KDN-03" />
              <F label="Arduino MAC Address" value={bf.hardware_mac} onChange={v => sb('hardware_mac', v)} placeholder="C4:BE:84:xx:xx" />
              <div>
                <label style={lStyle}>Organ Profile</label>
                <select value={bf.organ_profile} onChange={e => sb('organ_profile', e.target.value)} style={iStyle}>
                  {['Kidney (2-8°C)', 'Liver (0-4°C)', 'Heart (0-4°C)', 'Lung (0-4°C)'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { addBox({ ...bf, assigned_vehicle: null, status: 'IDLE', last_temp: null, alert_count: 0 }); setShowBForm(false); }} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Register</button>
              <button onClick={() => setShowBForm(false)} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Active Runs Table */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1.1rem' }}>Active Runs</h2>
          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr><th>Run ID</th><th>Vehicle</th><th>Boxes</th><th>Route</th><th>ETA</th><th>Status</th><th>Cold Chain</th><th></th></tr>
              </thead>
              <tbody>
                {localRuns.map((r, i) => (
                  <motion.tr key={r.run_id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <td><code style={{ color: 'var(--accent-light)', fontSize: '0.82rem' }}>{r.run_id}</code></td>
                    <td style={{ fontSize: '0.82rem' }}>{r.assigned_vehicle}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{r.boxes.length}</td>
                    <td style={{ fontSize: '0.82rem' }}>{r.from_city} → {r.to_city}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{r.eta}</td>
                    <td>
                      <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 100, background: `${STATUS_COLORS[r.status] || 'var(--text-muted)'}18`, color: STATUS_COLORS[r.status] || 'var(--text-muted)' }}>{r.status}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.68rem', color: CHAIN_COLORS[r.cold_chain_health], fontWeight: 700 }}>● {r.cold_chain_health}</span>
                    </td>
                    <td>
                      <button onClick={() => navigate('/logistics/tracking')} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>View →</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const lStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, display: 'block' };
const iStyle = { width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
function F({ label, value, onChange, placeholder }) {
  return <div><label style={lStyle}>{label}</label><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={iStyle} /></div>;
}
