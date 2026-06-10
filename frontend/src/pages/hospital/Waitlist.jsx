import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';

const URGENCY = [
  { label: 'Routine', value: 0.25, color: '#3b82f6' },
  { label: 'Urgent', value: 0.5, color: '#f59e0b' },
  { label: 'Critical', value: 0.75, color: '#ef4444' },
  { label: 'Super Urgent', value: 1.0, color: '#dc2626' },
];
const STATUS_COLOR = { Searching: 'var(--accent)', 'Domestic Match Found': 'var(--warning)', 'Global Match Found': 'var(--accent-light)', 'In Transit': 'var(--info)', Received: 'var(--success)', Critical: 'var(--danger)' };

const INIT = { full_name: '', dob: '', gender: 'Male', blood_type: 'O+', hla_a1: '', hla_a2: '', hla_b1: '', hla_b2: '', hla_dr1: '', hla_dr2: '', organ_needed: 'Kidney', urgency: 0.5, attending_surgeon: '', contraindications: '' };

export default function Waitlist() {
  const { localPatients, addPatient } = useLifeMeshStore();
  const [tab, setTab] = useState('waitlist');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [filter, setFilter] = useState('All');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    addPatient(form);
    setForm(INIT);
    setShowForm(false);
  };

  const filtered = localPatients.filter(p => filter === 'All' || p.organ_needed === filter);

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Privacy-Protected</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Waitlist & Matching</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Patient PII stored locally only. HLA markers are SMPC-encrypted before network matching.</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn btn-primary">➕ Add Patient</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['waitlist', 'matching'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 20px', borderRadius: 7, border: 'none', background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              {t === 'waitlist' ? 'Patient Waitlist' : 'Match Resolution'}
            </button>
          ))}
        </div>

        {/* Add patient form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass" style={{ padding: 24, marginBottom: 20, overflow: 'hidden' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register New Patient</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--danger)', textTransform: 'uppercase', marginBottom: 4 }}>🔒 PII — Local Only</div>
                  <Field label="Full Name" value={form.full_name} onChange={v => set('full_name', v)} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Date of Birth" value={form.dob} onChange={v => set('dob', v)} type="date" />
                    <Select label="Gender" value={form.gender} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other']} />
                  </div>
                  <Field label="Attending Surgeon" value={form.attending_surgeon} onChange={v => set('attending_surgeon', v)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>🧬 Biological — SMPC Encrypted</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Select label="Blood Type" value={form.blood_type} onChange={v => set('blood_type', v)} options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
                    <Select label="Organ Needed" value={form.organ_needed} onChange={v => set('organ_needed', v)} options={['Kidney','Liver','Heart','Lung','Pancreas']} />
                  </div>
                  <div>
                    <label style={labelStyle}>Urgency</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {URGENCY.map(u => (
                        <button key={u.label} onClick={() => set('urgency', u.value)}
                          style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1px solid ${form.urgency === u.value ? u.color : 'var(--border)'}`, background: form.urgency === u.value ? `${u.color}18` : 'transparent', color: form.urgency === u.value ? u.color : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field label="Contraindications" value={form.contraindications} onChange={v => set('contraindications', v)} placeholder="Any known issues..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={handleAdd} className="btn btn-primary">Register Patient</button>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'waitlist' && (
          <>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['All', 'Kidney', 'Liver', 'Heart', 'Lung'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, background: filter === f ? 'rgba(0,212,170,0.1)' : 'transparent', color: filter === f ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {f}
                </button>
              ))}
            </div>

            <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Patient ID</th><th>Organ Needed</th><th>Blood Type</th>
                    <th>Urgency</th><th>Days on List</th><th>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const urg = URGENCY.find(u => u.value === p.urgency_score) || URGENCY[1];
                    const days = Math.floor((Date.now() - new Date(p.date_registered)) / 86400000);
                    return (
                      <motion.tr key={p.patient_id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <td><code style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{p.patient_id}</code></td>
                        <td style={{ fontWeight: 600 }}>{p.organ_needed}</td>
                        <td><span className="badge badge-muted">{p.blood_type}</span></td>
                        <td><span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, background: `${urg.color}18`, color: urg.color }}>{urg.label}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{isNaN(days) ? '—' : days}</td>
                        <td>
                          <span style={{ fontSize: '0.72rem', color: STATUS_COLOR[p.status] || 'var(--accent)', fontWeight: 600 }}>● {p.status}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'matching' && <MatchResolution />}
      </motion.div>
    </div>
  );
}

function MatchResolution() {
  const { smpcSteps, matchResult, scenarioPhase } = useLifeMeshStore();
  const [accepted, setAccepted] = useState(false);
  const demo = matchResult || (scenarioPhase === 'matched' ? true : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Active computations */}
      <div className="glass" style={{ padding: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Active SMPC Computations</h3>
        {smpcSteps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No active computations. Register a donor or start a demo scenario.
          </div>
        ) : smpcSteps.map((s, i) => (
          <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--accent)' }}>{s.step || i + 1}.</span>
            <span style={{ color: 'var(--text-secondary)' }}>{s.node}</span>
            <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.operation}</span>
            <span style={{ color: 'var(--success)', fontSize: '0.68rem' }}>NO DATA EXPOSED ✓</span>
          </div>
        ))}
      </div>

      {/* Match found card */}
      {matchResult && !accepted && (
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass" style={{ padding: 24, border: '1px solid rgba(0,212,170,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🎯 Match Found</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>{matchResult.compatibility_score?.toFixed(1) || '94.3'}% Compatibility</h3>
            </div>
            <span style={{ padding: '4px 12px', borderRadius: 100, background: matchResult.match_tier === 'DOMESTIC' ? 'rgba(0,212,170,0.1)' : 'rgba(167,139,250,0.1)', color: matchResult.match_tier === 'DOMESTIC' ? 'var(--accent)' : 'var(--accent-light)', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${matchResult.match_tier === 'DOMESTIC' ? 'rgba(0,212,170,0.3)' : 'rgba(167,139,250,0.3)'}` }}>
              {matchResult.match_tier || 'GLOBAL'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <MatchInfo label="Organ" value={matchResult.organ_type || 'Kidney'} />
            <MatchInfo label="Est. Transit" value={matchResult.estimated_transit || '6h 30m'} />
            <MatchInfo label="Donor Country" value={matchResult.donor_hospital_city || 'Delhi, India'} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setAccepted(true)} className="btn btn-primary" style={{ flex: 1 }}>✓ Accept Match</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>✕ Decline</button>
          </div>
        </motion.div>
      )}
      {accepted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 20, border: '1px solid rgba(0,212,170,0.3)' }}>
          <div style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 8 }}>✅ Match Accepted — Carrier allocation in progress...</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Check Active Shipments for live tracking once a carrier is assigned.</div>
        </motion.div>
      )}
    </div>
  );
}

function MatchInfo({ label, value }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 8 }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{value}</div>
    </div>
  );
}

const labelStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' };
const inputStyle = { width: '100%', padding: '10px 13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
function Field({ label, value, onChange, type = 'text', placeholder }) {
  return <div><label style={labelStyle}>{label}</label><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} /></div>;
}
function Select({ label, value, onChange, options }) {
  return <div><label style={labelStyle}>{label}</label><select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle }}>{options.map(o => <option key={o}>{o}</option>)}</select></div>;
}
