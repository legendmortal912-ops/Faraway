import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';
import { Plus, Package, Ambulance, RadioTower } from 'lucide-react';

const VEHICLE_TYPES = ['Ground Ambulance', 'Air Charter', 'Motorcycle Courier'];
const VEHICLE_STATUSES = ['IDLE', 'EN_ROUTE_PICKUP', 'IN_TRANSIT', 'MAINTENANCE'];
const STATUS_COLORS = { IDLE: 'var(--success)', EN_ROUTE_PICKUP: 'var(--warning)', IN_TRANSIT: 'var(--accent)', MAINTENANCE: 'var(--danger)' };

export default function FleetManager() {
  const { localVehicles, localBoxes, addVehicle, addBox } = useLifeMeshStore();
  const [tab, setTab] = useState('vehicles');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showBoxForm, setShowBoxForm] = useState(false);
  const [vForm, setVForm] = useState({ vehicle_id: '', type: 'Ground Ambulance', registration: '', driver_name: '', driver_contact: '', max_box_capacity: '2', current_status: 'IDLE', gateway_mac: '' });
  const [bForm, setBForm] = useState({ box_id: '', hardware_mac: '', organ_profile: 'Kidney (2-8°C)', status: 'IDLE' });

  const sv = (k, v) => setVForm(f => ({ ...f, [k]: v }));
  const sb = (k, v) => setBForm(f => ({ ...f, [k]: v }));

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Internal Fleet</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Fleet Manager</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage your hospital's transport vehicles and IoT-enabled organ containers.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {tab === 'vehicles' && <button onClick={() => setShowVehicleForm(s => !s)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Add Vehicle</button>}
            {tab === 'boxes' && <button onClick={() => setShowBoxForm(s => !s)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Register Box</button>}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[
            ['vehicles', <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Ambulance size={14} /> Vehicles</div>],
            ['boxes', <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Package size={14} /> Container Boxes</div>]
          ].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 20px', borderRadius: 7, border: 'none', background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Vehicle Form */}
        <AnimatePresence>
          {showVehicleForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass" style={{ padding: 24, marginBottom: 20, overflow: 'hidden' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register New Vehicle</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="Vehicle ID" value={vForm.vehicle_id} onChange={v => sv('vehicle_id', v)} placeholder="AMB-DL-03" />
                <Select label="Type" value={vForm.type} onChange={v => sv('type', v)} options={VEHICLE_TYPES} />
                <Field label="Registration No." value={vForm.registration} onChange={v => sv('registration', v)} placeholder="DL-01-AB-..." />
                <Field label="Driver Name" value={vForm.driver_name} onChange={v => sv('driver_name', v)} placeholder="Name" />
                <Field label="Driver Contact" value={vForm.driver_contact} onChange={v => sv('driver_contact', v)} placeholder="+91-..." />
                <Field label="Max Box Capacity" value={vForm.max_box_capacity} onChange={v => sv('max_box_capacity', v)} placeholder="2" />
                <Field label="Pi Gateway MAC" value={vForm.gateway_mac} onChange={v => sv('gateway_mac', v)} placeholder="B8:27:EB:xx:xx:xx" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => { addVehicle({ ...vForm, carrier_id: 'H_AIIMS', current_run: null }); setShowVehicleForm(false); }} className="btn btn-primary">Add Vehicle</button>
                <button onClick={() => setShowVehicleForm(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Box Form */}
        <AnimatePresence>
          {showBoxForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass" style={{ padding: 24, marginBottom: 20, overflow: 'hidden' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register New Container Box</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Box ID" value={bForm.box_id} onChange={v => sb('box_id', v)} placeholder="BOX-KDN-03" />
                <Field label="Arduino BLE MAC Address" value={bForm.hardware_mac} onChange={v => sb('hardware_mac', v)} placeholder="C4:BE:84:xx:xx:xx" />
                <Select label="Organ Calibration Profile" value={bForm.organ_profile} onChange={v => sb('organ_profile', v)} options={['Kidney (2-8°C)', 'Liver (0-4°C)', 'Heart (0-4°C)', 'Lung (0-4°C)', 'Cornea (2-8°C)']} />
              </div>
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <RadioTower size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> This MAC address must match the device flashed with the LifeMesh firmware. The Raspberry Pi gateway will pair with this box over BLE automatically.
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => { addBox({ ...bForm, assigned_vehicle: null, last_temp: null, last_updated: null, alert_count: 0 }); setShowBoxForm(false); }} className="btn btn-primary">Register Box</button>
                <button onClick={() => setShowBoxForm(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tables */}
        {tab === 'vehicles' && (
          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead><tr><th>Vehicle ID</th><th>Type</th><th>Driver</th><th>Status</th><th>Boxes Loaded</th><th>Current Run</th></tr></thead>
              <tbody>
                {localVehicles.map((v, i) => (
                  <motion.tr key={v.vehicle_id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td><code style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{v.vehicle_id}</code></td>
                    <td style={{ fontSize: '0.82rem' }}>{v.type}</td>
                    <td style={{ fontSize: '0.82rem' }}>{v.driver_name}</td>
                    <td><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 100, background: `${STATUS_COLORS[v.current_status]}18`, color: STATUS_COLORS[v.current_status], border: `1px solid ${STATUS_COLORS[v.current_status]}40` }}>{v.current_status.replace('_', ' ')}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{localBoxes.filter(b => b.assigned_vehicle === v.vehicle_id).length} / {v.max_box_capacity}</td>
                    <td>{v.current_run ? <code style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>{v.current_run}</code> : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'boxes' && (
          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead><tr><th>Box ID</th><th>Hardware MAC</th><th>Organ Profile</th><th>Assigned Vehicle</th><th>Status</th><th>Last Temp</th><th>Alerts</th></tr></thead>
              <tbody>
                {localBoxes.map((b, i) => (
                  <motion.tr key={b.box_id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td><code style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{b.box_id}</code></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.hardware_mac || '—'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{b.organ_profile}</td>
                    <td style={{ fontSize: '0.82rem' }}>{b.assigned_vehicle || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td><span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 100, background: b.status === 'TRANSIT' ? 'rgba(0,212,170,0.1)' : 'var(--bg-elevated)', color: b.status === 'TRANSIT' ? 'var(--accent)' : 'var(--text-muted)' }}>{b.status}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: b.last_temp > 6 ? 'var(--danger)' : 'var(--success)' }}>{b.last_temp != null ? `${b.last_temp}°C` : '—'}</td>
                    <td style={{ color: b.alert_count > 0 ? 'var(--danger)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.alert_count}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

const labelStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' };
const inputStyle = { width: '100%', padding: '10px 13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
function Field({ label, value, onChange, placeholder }) {
  return <div><label style={labelStyle}>{label}</label><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} /></div>;
}
function Select({ label, value, onChange, options }) {
  return <div><label style={labelStyle}>{label}</label><select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle }}>{options.map(o => <option key={o}>{o}</option>)}</select></div>;
}
