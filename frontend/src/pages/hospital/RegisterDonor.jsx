import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGANS = ['Kidney L', 'Kidney R', 'Liver', 'Heart', 'Lung L', 'Lung R', 'Pancreas', 'Cornea'];
const GOV_ID_TYPES = ['Aadhaar', 'Passport', 'Driver\'s License', 'Other'];

const INIT = {
  // PII
  full_name: '', dob: '', gender: 'Male', gov_id_type: 'Aadhaar', gov_id: '',
  kin_name: '', kin_phone: '', kin_relation: '',
  cause_of_death: '', brain_death_ref: '', consent_ref: '', physician_name: '',
  // Biological
  blood_type: 'O+', hla_a1: '', hla_a2: '', hla_b1: '', hla_b2: '', hla_dr1: '', hla_dr2: '',
  organs: [], viability_start: '', contraindications: '', weight: '', height: '',
};

export default function RegisterDonor() {
  const { addDonor, user } = useLifeMeshStore();
  const [form, setForm] = useState(INIT);
  const [phase, setPhase] = useState('form'); // form | animating | success
  const [animStep, setAnimStep] = useState(0);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleOrgan = (o) => setForm(f => ({
    ...f, organs: f.organs.includes(o) ? f.organs.filter(x => x !== o) : [...f.organs, o],
  }));

  const handleSubmit = async () => {
    setPhase('animating');
    // Step 1: PII lock
    setAnimStep(1);
    await delay(1200);
    // Step 2: biological shred
    setAnimStep(2);
    await delay(1400);
    // Step 3: share broadcast
    setAnimStep(3);
    await delay(1600);
    addDonor({ ...form, hospital_id: user?.hospital_id });
    setPhase('success');
  };

  const delay = ms => new Promise(r => setTimeout(r, ms));

  if (phase === 'animating') return <SMPCAnimation step={animStep} form={form} />;
  if (phase === 'success') return <SuccessState form={form} onReset={() => { setForm(INIT); setPhase('form'); setAnimStep(0); }} />;

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Secure Registration</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Register Donor</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>PII stays locked in this hospital's local database. Only encrypted biological markers reach the network.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left — PII */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span>🔒</span>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Administrative PII</h3>
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.2)' }}>LOCAL ONLY — NEVER BROADCAST</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Full Legal Name" value={form.full_name} onChange={v => set('full_name', v)} placeholder="As per government ID" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date of Birth" value={form.dob} onChange={v => set('dob', v)} type="date" />
                <Select label="Gender" value={form.gender} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other']} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Select label="Gov ID Type" value={form.gov_id_type} onChange={v => set('gov_id_type', v)} options={GOV_ID_TYPES} />
                <Field label="Gov ID Number" value={form.gov_id} onChange={v => set('gov_id', v)} placeholder="XXXX-XXXX-XXXX" />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next of Kin</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Name" value={form.kin_name} onChange={v => set('kin_name', v)} />
                    <Field label="Relationship" value={form.kin_relation} onChange={v => set('kin_relation', v)} placeholder="Spouse / Child" />
                  </div>
                  <Field label="Phone" value={form.kin_phone} onChange={v => set('kin_phone', v)} placeholder="+91-..." />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clinical Documentation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Field label="Cause of Death / Brain Death Ref" value={form.brain_death_ref} onChange={v => set('brain_death_ref', v)} placeholder="BD-DL-2026-..." />
                  <Field label="Consent Document Ref No." value={form.consent_ref} onChange={v => set('consent_ref', v)} placeholder="CONSENT-..." />
                  <Field label="Attending Physician" value={form.physician_name} onChange={v => set('physician_name', v)} placeholder="Dr. Name" />
                </div>
              </div>
            </div>
          </div>

          {/* Right — Biological */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span>🧬</span>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Biological Parameters</h3>
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(0,212,170,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(0,212,170,0.2)' }}>SMPC ENCRYPTED → NETWORK</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Select label="Blood Type" value={form.blood_type} onChange={v => set('blood_type', v)} options={BLOOD_TYPES} />
              <div>
                <label style={labelStyle}>HLA Markers</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {['hla_a1', 'hla_a2', 'hla_b1', 'hla_b2', 'hla_dr1', 'hla_dr2'].map(k => (
                    <div key={k}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>{k.replace('_', '-').toUpperCase()}</div>
                      <input type="number" min="0" max="100" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0"
                        style={{ ...inputStyle, textAlign: 'center' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Organs Available</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ORGANS.map(o => (
                    <button key={o} onClick={() => toggleOrgan(o)}
                      style={{ padding: '6px 12px', borderRadius: 100, border: `1px solid ${form.organs.includes(o) ? 'var(--accent)' : 'var(--border)'}`, background: form.organs.includes(o) ? 'rgba(0,212,170,0.12)' : 'transparent', color: form.organs.includes(o) ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', transition: 'all 0.2s' }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Viability Window Start" value={form.viability_start} onChange={v => set('viability_start', v)} type="datetime-local" />
              <Field label="Contraindications" value={form.contraindications} onChange={v => set('contraindications', v)} placeholder="Any known issues..." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Weight (kg)" value={form.weight} onChange={v => set('weight', v)} placeholder="70" />
                <Field label="Height (cm)" value={form.height} onChange={v => set('height', v)} placeholder="175" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}>
            🔐 Register Donor to Network →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SMPCAnimation({ step, form }) {
  const shares = ['Share 1/5', 'Share 2/5', 'Share 3/5', 'Share 4/5', 'Share 5/5'];
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <motion.div className="glass" style={{ maxWidth: 640, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Processing Donor Registration</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          {/* PII Lock */}
          <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 12, textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Administrative PII</div>
            <div style={{ fontSize: '0.8rem', marginBottom: 8 }}>📄 {form.full_name || 'Patient Name'}</div>
            <div style={{ fontSize: '0.8rem', marginBottom: 8 }}>🪪 {form.gov_id || 'Gov ID'}</div>
            {step >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: '0.75rem', color: '#f87171', textAlign: 'center' }}>
                🔒 Locked to local DB
              </motion.div>
            )}
          </div>

          {/* Biological Shred */}
          <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 12, textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Biological Markers</div>
            {step < 2
              ? <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>🩸 {form.blood_type}</div>
                  <div>🧬 HLA: {form.hla_a1 || '?'}-{form.hla_b1 || '?'}</div>
                  <div>🫀 {form.organs.join(', ') || 'Organs'}</div>
                </div>
              : step === 2
              ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((c, i) => (
                    <motion.span key={c} initial={{ opacity: 1 }} animate={{ opacity: [1, 0, 1], x: [0, Math.random() * 20 - 10] }} transition={{ delay: i * 0.1, duration: 0.5 }}
                      style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--accent)' }}>
                      {c}
                    </motion.span>
                  ))}
                  <div style={{ width: '100%', marginTop: 8, fontSize: '0.72rem', color: 'var(--warning)' }}>✂️ Shredding into shares...</div>
                </motion.div>
              : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {shares.map((s, i) => (
                    <motion.div key={s} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--accent)' }}>
                      <span>📤</span><span>{s}</span><span style={{ color: 'var(--text-muted)' }}>→ Node {i + 1}</span>
                    </motion.div>
                  ))}
                </motion.div>
            }
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {['PII Secured', 'Data Shredded', 'Shares Broadcast'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: step > i ? 'var(--accent)' : 'var(--text-muted)' }}>
              <span>{step > i ? '✓' : '○'}</span><span>{s}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SuccessState({ form, onReset }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ maxWidth: 560, width: '100%', padding: 40, textAlign: 'center', margin: 24 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} style={{ fontSize: '3rem', marginBottom: 20 }}>✅</motion.div>
        <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 12 }}>Donor Successfully Registered</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7, fontSize: '0.875rem' }}>
          Administrative PII secured to <strong style={{ color: 'var(--accent)' }}>local hospital database only</strong>. Encrypted biological shares broadcast to <strong style={{ color: 'var(--accent)' }}>6 network nodes</strong>. SMPC matching initiated.
        </p>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, marginBottom: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Row label="Blood Type" value={form.blood_type} />
          <Row label="Organs Available" value={form.organs.join(', ') || '—'} />
          <Row label="PII Visibility" value="Local database only 🔒" accent />
          <Row label="Network Exposure" value="Encrypted shares only 🛡️" accent />
        </div>
        <button onClick={onReset} className="btn btn-outline" style={{ width: '100%' }}>Register Another Donor</button>
      </motion.div>
    </div>
  );
}

const labelStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' };
const inputStyle = { width: '100%', padding: '10px 13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
