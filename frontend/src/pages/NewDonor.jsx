import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import { Heart, Zap, Globe, ArrowRight, Info } from 'lucide-react';

const HOSPITALS = [
  { id: 'H_SAFDARJUNG', name: 'Safdarjung Hospital', city: 'Delhi', country: 'India', tier: 'Layer 0' },
  { id: 'H_AIIMS',      name: 'AIIMS Delhi',          city: 'Delhi', country: 'India', tier: 'Layer 0' },
  { id: 'H_FORTIS',     name: 'Fortis Noida',         city: 'Noida', country: 'India', tier: 'Layer 0' },
  { id: 'H_PARIS',      name: 'Hôpital Lariboisière', city: 'Paris', country: 'France', tier: 'Layer 1' },
  { id: 'H_MUMBAI',     name: 'Kokilaben KDAH',        city: 'Mumbai', country: 'India', tier: 'Layer 0/1' },
  { id: 'H_SAO_PAULO',  name: 'Hospital Albert Einstein', city: 'São Paulo', country: 'Brazil', tier: 'Layer 1' },
  { id: 'H_LONDON',     name: "King's College Hospital",  city: 'London', country: 'UK', tier: 'Layer 1' },
  { id: 'H_DUBAI',      name: 'Cleveland Clinic Abu Dhabi', city: 'Dubai', country: 'UAE', tier: 'Layer 1' },
];

const ORGANS = [
  { value: 'kidney', label: 'Kidney', viability: '24h', color: '#a78bfa' },
  { value: 'liver',  label: 'Liver',  viability: '12h', color: '#f59e0b' },
  { value: 'heart',  label: 'Heart',  viability: '4h',  color: '#ef4444' },
  { value: 'lung',   label: 'Lung',   viability: '6h',  color: '#60a5fa' },
];

const BLOOD_TYPES = ['A', 'B', 'AB', 'O'];

export default function NewDonor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hospital: 'H_SAFDARJUNG',
    organ: 'kidney',
    blood_type: 'B',
    hla: ['55', '72', '30', '85', '40', '60'],
    urgency: 0.8,
  });
  const [scenario, setScenario] = useState('domestic');
  const [submitting, setSubmitting] = useState(false);

  const selectedOrgan = ORGANS.find(o => o.value === form.organ);
  const selectedHospital = HOSPITALS.find(h => h.id === form.hospital);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const endpoint = scenario === 'domestic'
      ? '/api/simulate/domestic'
      : scenario === 'global'
      ? '/api/simulate/global'
      : '/api/simulate/cold-chain';
    try {
      await fetch(`http://localhost:8000${endpoint}`, { method: 'POST' });
      navigate('/computation');
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 900 }}>

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 4 }}>New Donor Registration</h2>
          <p style={{ fontSize: '0.875rem' }}>
            Register a donor and initialize the matching protocol. The system will automatically select the optimal layer.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

            {/* Main form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Scenario selector */}
              <div className="glass" style={{ padding: 20 }}>
                <h4 style={{ marginBottom: 16 }}>Demo Scenario</h4>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { id: 'domestic',   icon: Zap,   label: 'Domestic',   desc: 'Layer 0 — Safdarjung → Fortis', color: '#10b981' },
                    { id: 'global',     icon: Globe,  label: 'Global SMPC', desc: 'Layer 1 — Paris → Mumbai',      color: 'var(--accent)' },
                    { id: 'cold_chain', icon: Heart,  label: 'Cold Chain',  desc: 'Layer 2 — IoT sensor demo',     color: '#a78bfa' },
                  ].map(({ id, icon: Icon, label, desc, color }) => (
                    <motion.div
                      key={id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setScenario(id)}
                      style={{
                        flex: 1, padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${scenario === id ? color : 'var(--border)'}`,
                        background: scenario === id ? `${color}15` : 'var(--bg-elevated)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Icon size={16} color={color} />
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: scenario === id ? color : 'var(--text-primary)' }}>{label}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Hospital */}
              <div className="glass" style={{ padding: 20 }}>
                <h4 style={{ marginBottom: 16 }}>Source Hospital</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Hospital</label>
                    <select className="form-select" value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}>
                      {HOSPITALS.map(h => (
                        <option key={h.id} value={h.id}>{h.name}, {h.city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {BLOOD_TYPES.map(bt => (
                        <button
                          key={bt} type="button"
                          onClick={() => setForm(f => ({ ...f, blood_type: bt }))}
                          className={`btn ${form.blood_type === bt ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                          style={{ flex: 1 }}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organ */}
              <div className="glass" style={{ padding: 20 }}>
                <h4 style={{ marginBottom: 16 }}>Organ Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                  {ORGANS.map(({ value, label, viability, color }) => (
                    <motion.div
                      key={value}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setForm(f => ({ ...f, organ: value }))}
                      style={{
                        padding: '12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        border: `1px solid ${form.organ === value ? color : 'var(--border)'}`,
                        background: form.organ === value ? `${color}15` : 'var(--bg-elevated)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: form.organ === value ? color : 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>±{viability}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* HLA Markers */}
              <div className="glass" style={{ padding: 20 }}>
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h4>HLA Markers</h4>
                  <div className="badge badge-accent">
                    <span style={{ fontFamily: 'var(--font-mono)' }}>Shamir-encrypted before transmission</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                  {form.hla.map((val, i) => (
                    <div key={i} className="form-group">
                      <label className="form-label">HLA-{i + 1}</label>
                      <input
                        type="number" min={1} max={99} className="form-input"
                        value={val}
                        onChange={e => {
                          const h = [...form.hla];
                          h[i] = e.target.value;
                          setForm(f => ({ ...f, hla: h }));
                        }}
                        style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="alert-warning" style={{ marginTop: 14, padding: '8px 14px' }}>
                  <Info size={14} color="var(--warning)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--warning)' }}>
                    These values will be split into Shamir shares before leaving this node. Raw values are never transmitted.
                  </span>
                </div>
              </div>
            </div>

            {/* Summary panel */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
                <h3 style={{ marginBottom: 20 }}>Registration Summary</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SummaryRow label="Hospital" value={selectedHospital?.name} />
                  <SummaryRow label="Location" value={`${selectedHospital?.city}, ${selectedHospital?.country}`} />
                  <SummaryRow label="Blood Type" value={form.blood_type} accent />
                  <SummaryRow label="Organ" value={selectedOrgan?.label} />
                  <SummaryRow label="Viability Window" value={selectedOrgan?.viability} />
                  <SummaryRow label="Urgency Score" value={`${Math.round(form.urgency * 100)}%`} />
                  <div className="glow-line" style={{ margin: '8px 0' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>SELECTED SCENARIO</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {scenario === 'domestic' && <><span className="badge badge-success">Layer 0</span><span style={{ fontSize: '0.85rem' }}>Domestic Fast Match</span></>}
                      {scenario === 'global'   && <><span className="badge badge-accent">Layer 1</span><span style={{ fontSize: '0.85rem' }}>Cross-Border SMPC</span></>}
                      {scenario === 'cold_chain' && <><span className="badge badge-info">Layer 2</span><span style={{ fontSize: '0.85rem' }}>Cold Chain Hardware</span></>}
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                {submitting ? <><span className="spinner" />Initializing...</> : <>Initialize Matching Protocol <ArrowRight size={16} /></>}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>{value || '—'}</span>
    </div>
  );
}
