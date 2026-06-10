import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../store/useLifeMeshStore';

const ORGAN_TYPES = ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Cornea'];
const HOSPITAL_TYPES = ['Government', 'Private', 'Trust', 'University'];
const COUNTRIES = ['India', 'France', 'United Kingdom', 'Brazil', 'UAE', 'United States', 'Germany', 'Australia'];
const NOTIFY_METHODS = ['Dashboard only', 'Email', 'SMS', 'All'];

export default function HospitalAuth({ mode }) {
  const navigate = useNavigate();
  const { login, signup } = useLifeMeshStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '',
    hospital_name: '', hospital_type: 'Government',
    address: '', city: '', state: '', country: 'India', pin: '',
    license_id: '', organ_specializations: [], year_established: '',
    accreditation: '', coordinator_name: '', designation: '',
    direct_phone: '', emergency_phone: '', timezone: 'IST (UTC+5:30)',
    notify_method: 'Dashboard only', has_internal_fleet: 'no',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleOrgan = (o) => setForm(f => ({
    ...f,
    organ_specializations: f.organ_specializations.includes(o)
      ? f.organ_specializations.filter(x => x !== o)
      : [...f.organ_specializations, o],
  }));

  const handleLogin = async () => {
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    const res = login(form.email, form.password, 'hospital');
    setLoading(false);
    if (res.ok) navigate('/hospital/dashboard');
    else setError(res.error);
  };

  const handleSignup = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    signup(form, 'hospital');
    navigate('/hospital/dashboard');
  };

  const STEPS = ['Institutional Info', 'Credentials', 'Primary Contact', 'Network Config'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{ width: '42%', background: 'linear-gradient(145deg, rgba(0,212,170,0.08), rgba(0,212,170,0.02))', borderRight: '1px solid var(--border)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏥</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>Hospital Portal</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Secure access for transplant coordinators and hospital administrators. Patient data stays local — only encrypted biological markers reach the network.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Zero-knowledge matching', 'PII never leaves your server', 'Real-time organ tracking', 'SMPC-protected waitlists'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span> {f}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: 16, background: 'rgba(0,212,170,0.06)', borderRadius: 10, border: '1px solid rgba(0,212,170,0.15)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: 8 }}>🏥 Demo Accounts</strong>
          {[
            ['AIIMS Delhi', 'admin@aiims.edu', 'aiims123'],
            ['Apollo Mumbai', 'admin@apollo.com', 'apollo123'],
            ['Manipal Bangalore', 'admin@manipal.edu', 'manipal123'],
            ['PGI Chandigarh', 'admin@pgi.edu.in', 'pgi123'],
            ['Lariboisière Paris', 'admin@larib.fr', 'paris123'],
            ["King's London", 'admin@kch.nhs.uk', 'kings123'],
            ['NOTTO Coordinator ⭐', 'coord@notto.gov.in', 'notto123'],
          ].map(([n, e, p]) => (
            <div key={e} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', flexShrink: 0 }}>{n}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{p}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/')} style={{ marginTop: 32, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left' }}>← Back to home</button>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>

          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, marginBottom: 32, width: 'fit-content' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => navigate(`/${m}/hospital`)}
                style={{ padding: '8px 20px', borderRadius: 7, border: 'none', background: mode === m ? 'var(--bg-card)' : 'transparent', color: mode === m ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {m}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.875rem' }}>Sign in to your hospital's LifeMesh account</p>
                <Field label="Hospital Admin Email" value={form.email} onChange={v => set('email', v)} type="email" placeholder="admin@hospital.com" />
                <Field label="Password" value={form.password} onChange={v => set('password', v)} type="password" placeholder="••••••••" />
                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#f87171', marginBottom: 16 }}>{error}</div>}
                <button onClick={handleLogin} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 8 }}>
                  {loading ? 'Authenticating...' : 'Sign In →'}
                </button>
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                  {STEPS.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: 3, borderRadius: 2, background: i + 1 <= step ? 'var(--accent)' : 'var(--border)', marginBottom: 4, transition: 'background 0.3s' }} />
                      <div style={{ fontSize: '0.6rem', color: i + 1 === step ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>{s}</div>
                    </div>
                  ))}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Step {step} — {STEPS[step - 1]}</h2>

                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Field label="Hospital Name" value={form.hospital_name} onChange={v => set('hospital_name', v)} placeholder="Full legal hospital name" />
                    <Select label="Institution Type" value={form.hospital_type} onChange={v => set('hospital_type', v)} options={HOSPITAL_TYPES} />
                    <Field label="Street Address" value={form.address} onChange={v => set('address', v)} placeholder="123 Medical Ave" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="City" value={form.city} onChange={v => set('city', v)} placeholder="Delhi" />
                      <Field label="State / Province" value={form.state} onChange={v => set('state', v)} placeholder="Delhi" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Select label="Country" value={form.country} onChange={v => set('country', v)} options={COUNTRIES} />
                      <Field label="PIN / ZIP" value={form.pin} onChange={v => set('pin', v)} placeholder="110029" />
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Field label="Transplant License / NOTTO ID" value={form.license_id} onChange={v => set('license_id', v)} placeholder="NOTTO-DL-001" />
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Organ Specializations</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {ORGAN_TYPES.map(o => (
                          <button key={o} onClick={() => toggleOrgan(o)}
                            style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${form.organ_specializations.includes(o) ? 'var(--accent)' : 'var(--border)'}`, background: form.organ_specializations.includes(o) ? 'rgba(0,212,170,0.1)' : 'transparent', color: form.organ_specializations.includes(o) ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Year Established" value={form.year_established} onChange={v => set('year_established', v)} placeholder="1956" />
                      <Field label="Accreditation Body" value={form.accreditation} onChange={v => set('accreditation', v)} placeholder="NABH / JCI" />
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Coordinator Name" value={form.coordinator_name} onChange={v => set('coordinator_name', v)} placeholder="Dr. Priya Sharma" />
                      <Field label="Designation" value={form.designation} onChange={v => set('designation', v)} placeholder="Transplant Coordinator" />
                    </div>
                    <Field label="Official Email" value={form.email} onChange={v => set('email', v)} type="email" placeholder="coordinator@hospital.com" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Direct Phone" value={form.direct_phone} onChange={v => set('direct_phone', v)} placeholder="+91-..." />
                      <Field label="24/7 Emergency Contact" value={form.emergency_phone} onChange={v => set('emergency_phone', v)} placeholder="+91-..." />
                    </div>
                    <Field label="Password" value={form.password} onChange={v => set('password', v)} type="password" placeholder="Min 8 characters" />
                  </div>
                )}
                {step === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Select label="Preferred Notification Method" value={form.notify_method} onChange={v => set('notify_method', v)} options={NOTIFY_METHODS} />
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Does this hospital operate its own transport fleet?</label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {['yes', 'no'].map(opt => (
                          <button key={opt} onClick={() => set('has_internal_fleet', opt)}
                            style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${form.has_internal_fleet === opt ? 'var(--accent)' : 'var(--border)'}`, background: form.has_internal_fleet === opt ? 'rgba(0,212,170,0.1)' : 'transparent', color: form.has_internal_fleet === opt ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600 }}>
                            {opt === 'yes' ? '✓ Yes' : '✕ No'}
                          </button>
                        ))}
                      </div>
                      {form.has_internal_fleet === 'yes' && (
                        <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(0,212,170,0.05)', padding: '8px 12px', borderRadius: 6 }}>
                          ✓ You can register fleet vehicles after login in the Internal Fleet Manager tab.
                        </p>
                      )}
                    </div>
                    <div className="glass" style={{ padding: 16, marginTop: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Registration Summary</div>
                      <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <SumRow label="Hospital" value={form.hospital_name || '—'} />
                        <SumRow label="Location" value={`${form.city}, ${form.country}`} />
                        <SumRow label="License ID" value={form.license_id || '—'} />
                        <SumRow label="Specializations" value={form.organ_specializations.join(', ') || '—'} />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  {step > 1 && <button onClick={() => setStep(s => s - 1)} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>}
                  {step < 4
                    ? <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" style={{ flex: 1 }}>Next →</button>
                    : <button onClick={handleSignup} disabled={loading} className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), #00a884)' }}>
                        {loading ? 'Registering Node...' : '🏥 Register Hospital Node'}
                      </button>
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SumRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={{ color: 'var(--text-muted)', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
