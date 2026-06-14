import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import { Plane, RadioTower } from 'lucide-react';

const FLEET_TYPES = ['Ground Ambulance', 'Air Charter', 'Commercial Air', 'Ground Courier'];
const REGIONS = ['India', 'Europe', 'North America', 'Southeast Asia', 'Middle East', 'Global'];
const CARRIER_TYPES = ['Independent Carrier', 'Hospital-Owned Fleet'];
const STEPS = ['Company Info', 'Credentials', 'Fleet Size', 'Contact'];

export default function LogisticsAuth({ mode }) {
  const navigate = useNavigate();
  const { login, signup } = useLifeMeshStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', company_name: '', carrier_type: 'Independent Carrier',
    parent_hospital_id: '', address: '', city: '', country: 'India', reg_number: '',
    transport_license: '', iata_certified: 'No', fleet_types: [], operating_regions: [],
    num_ground: '', num_air_routes: '', num_iot_boxes: '',
    coordinator_name: '', coordinator_phone: '', ops_center_phone: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (key, val) => setForm(f => ({
    ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
  }));

  const handleLogin = async () => {
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    const res = login(form.email, form.password, 'logistics');
    setLoading(false);
    if (res.ok) navigate('/logistics/dashboard');
    else setError(res.error);
  };

  const handleSignup = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    signup(form, 'logistics');
    navigate('/logistics/dashboard');
  };

  useEffect(() => {
    document.documentElement.classList.add('theme-logistics');
    return () => {
      document.documentElement.classList.remove('theme-logistics');
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{ width: '42%', background: 'linear-gradient(145deg, rgba(var(--accent-light-rgb),0.08), rgba(var(--accent-light-rgb),0.02))', borderRight: '1px solid var(--border)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 12, display: 'flex' }}><Plane size={36} color="var(--accent-light)" /></div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>Logistics Portal</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
            For medical courier companies and hospital-owned fleets. Manage your vehicles, track shipments, and ensure cold chain compliance — without ever seeing patient data.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Zero patient data exposure', 'Real-time IoT telemetry', 'Emergency rerouting system', 'Compliance audit exports'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-light)', fontWeight: 700 }}>✓</span> {f}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: 16, background: 'rgba(var(--accent-light-rgb),0.06)', borderRadius: 10, border: '1px solid rgba(var(--accent-light-rgb),0.15)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent-light)', display: 'block', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Plane size={14} /> Demo Accounts</strong>
          {[
            ['DHL Medical Express', 'ops@dhl-medical.com', 'dhl123'],
            ['World Courier Medical', 'ops@worldcourier.com', 'world123'],
            ['BlueDart MedLife', 'ops@bluedart-med.com', 'blue123'],
            ['AIIMS Fleet (Hospital)', 'fleet@aiims.edu', 'aiims-fleet123'],
            ['Apollo Fleet (Hospital)', 'fleet@apollo.com', 'apollo-fleet123'],
            ["King's Fleet (Hospital)", 'fleet@kch.nhs.uk', 'kings-fleet123'],
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
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, marginBottom: 32, width: 'fit-content' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => navigate(`/${m}/logistics`)}
                style={{ padding: '8px 20px', borderRadius: 7, border: 'none', background: mode === m ? 'var(--bg-card)' : 'transparent', color: mode === m ? 'var(--accent-light)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {m}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Fleet Operations Login</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.875rem' }}>Access your carrier operations dashboard</p>
                <Field label="Operations Email" value={form.email} onChange={v => set('email', v)} type="email" placeholder="ops@carrier.com" />
                <Field label="Password" value={form.password} onChange={v => set('password', v)} type="password" placeholder="••••••••" />
                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#f87171', marginBottom: 16 }}>{error}</div>}
                <button onClick={handleLogin} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 8, background: 'linear-gradient(135deg, var(--accent-light), var(--accent))' }}>
                  {loading ? 'Authenticating...' : 'Sign In →'}
                </button>
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                  {STEPS.map((s, i) => (
                    <div key={i} style={{ flex: 1 }}>
                      <div style={{ height: 3, borderRadius: 2, background: i + 1 <= step ? 'var(--accent-light)' : 'var(--border)', marginBottom: 4, transition: 'background 0.3s' }} />
                      <div style={{ fontSize: '0.6rem', color: i + 1 === step ? 'var(--accent-light)' : 'var(--text-muted)', fontWeight: 600 }}>{s}</div>
                    </div>
                  ))}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>Step {step} — {STEPS[step - 1]}</h2>

                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Field label="Company / Fleet Name" value={form.company_name} onChange={v => set('company_name', v)} placeholder="DHL Medical Express" />
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Carrier Type</label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {CARRIER_TYPES.map(t => (
                          <button key={t} onClick={() => set('carrier_type', t)}
                            style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: `1px solid ${form.carrier_type === t ? 'var(--accent-light)' : 'var(--border)'}`, background: form.carrier_type === t ? 'rgba(var(--accent-light-rgb),0.1)' : 'transparent', color: form.carrier_type === t ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.carrier_type === 'Hospital-Owned Fleet' && (
                      <Field label="Parent Hospital ID" value={form.parent_hospital_id} onChange={v => set('parent_hospital_id', v)} placeholder="H_AIIMS" />
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="City" value={form.city} onChange={v => set('city', v)} placeholder="Mumbai" />
                      <Field label="Country" value={form.country} onChange={v => set('country', v)} placeholder="India" />
                    </div>
                    <Field label="Company Registration No." value={form.reg_number} onChange={v => set('reg_number', v)} placeholder="U63090DL2010PLC..." />
                  </div>
                )}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Field label="Transport License No." value={form.transport_license} onChange={v => set('transport_license', v)} placeholder="MH-TRANS-2024-..." />
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>IATA Biological Specimens Certification</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['Yes', 'No', 'Pending'].map(o => (
                          <button key={o} onClick={() => set('iata_certified', o)}
                            style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${form.iata_certified === o ? 'var(--accent-light)' : 'var(--border)'}`, background: form.iata_certified === o ? 'rgba(var(--accent-light-rgb),0.1)' : 'transparent', color: form.iata_certified === o ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Fleet Types Operated</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {FLEET_TYPES.map(t => (
                          <button key={t} onClick={() => toggleArr('fleet_types', t)}
                            style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${form.fleet_types.includes(t) ? 'var(--accent-light)' : 'var(--border)'}`, background: form.fleet_types.includes(t) ? 'rgba(var(--accent-light-rgb),0.1)' : 'transparent', color: form.fleet_types.includes(t) ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Operating Regions</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {REGIONS.map(r => (
                          <button key={r} onClick={() => toggleArr('operating_regions', r)}
                            style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${form.operating_regions.includes(r) ? 'var(--accent-light)' : 'var(--border)'}`, background: form.operating_regions.includes(r) ? 'rgba(var(--accent-light-rgb),0.1)' : 'transparent', color: form.operating_regions.includes(r) ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Field label="Number of Ground Vehicles" value={form.num_ground} onChange={v => set('num_ground', v)} placeholder="12" />
                    <Field label="Number of Air-Capable Routes" value={form.num_air_routes} onChange={v => set('num_air_routes', v)} placeholder="4" />
                    <Field label="Number of IoT-Enabled Containers" value={form.num_iot_boxes} onChange={v => set('num_iot_boxes', v)} placeholder="24" />
                    <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(var(--accent-light-rgb),0.05)', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <RadioTower size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent-light)' }} /> You will register each container's hardware MAC address individually in your Fleet Dashboard after login.
                    </p>
                  </div>
                )}
                {step === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Field label="Fleet Coordinator Name" value={form.coordinator_name} onChange={v => set('coordinator_name', v)} placeholder="John Smith" />
                    <Field label="Operations Email" value={form.email} onChange={v => set('email', v)} type="email" placeholder="ops@carrier.com" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Direct Phone" value={form.coordinator_phone} onChange={v => set('coordinator_phone', v)} placeholder="+1-..." />
                      <Field label="24/7 Ops Center" value={form.ops_center_phone} onChange={v => set('ops_center_phone', v)} placeholder="+1-..." />
                    </div>
                    <Field label="Password" value={form.password} onChange={v => set('password', v)} type="password" placeholder="Min 8 characters" />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  {step > 1 && <button onClick={() => setStep(s => s - 1)} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>}
                  {step < 4
                    ? <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-light), var(--accent))' }}>Next →</button>
                    : <button onClick={handleSignup} disabled={loading} className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-light), var(--accent))', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                        {loading ? 'Registering Carrier...' : <><Plane size={16} /> Register Carrier Node</>}
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
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}
