import { useState } from 'react';
import { motion } from 'framer-motion';

const DEMO_RUNS = [
  { run_id: 'RUN-2041', from: 'Delhi', to: 'Mumbai', organ: 'Kidney', viability_left: '4h 12m', eta_original: '22:00', status: 'ACTIVE', alert: false },
  { run_id: 'RUN-2040', from: 'Paris', to: 'Dubai', organ: 'Liver', viability_left: '1h 40m', eta_original: '23:45', status: 'ACTIVE', alert: true },
];

const REASONS = ['Flight delayed', 'Flight cancelled', 'Vehicle breakdown', 'Road closure', 'Cold chain breach', 'Other'];

export default function EmergencyRerouting() {
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('Flight delayed');
  const [delay, setDelay] = useState(60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history] = useState([
    { run_id: 'RUN-2038', reason: 'Flight cancelled', old_eta: '18:30', new_eta: '22:45', outcome: 'Feasible', date: '2026-06-09' },
    { run_id: 'RUN-2035', reason: 'Vehicle breakdown', old_eta: '14:00', new_eta: '15:20', outcome: 'Feasible', date: '2026-06-07' },
    { run_id: 'RUN-2031', reason: 'Cold chain breach', old_eta: '11:15', new_eta: 'N/A', outcome: 'Emergency Protocol', date: '2026-06-05' },
  ]);

  const handleReroute = async () => {
    setLoading(true); setResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const feasible = selected.viability_left !== '1h 40m';
    setResult({
      feasible,
      old_route: [`${selected.from}`, 'Airport', 'Flight AI-142', `${selected.to}`],
      new_route: feasible
        ? [`${selected.from}`, 'Alternate Airport', 'Flight AI-199 (+${delay}m)', `${selected.to}`]
        : [`${selected.from}`, '⚠️ Nearest Hospital: Kokilaben KDAH'],
      old_eta: selected.eta_original,
      new_eta: feasible ? '01:15 (next day)' : 'EMERGENCY PROTOCOL',
    });
    setLoading(false);
  };

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Crisis Management</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Emergency Rerouting</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Recalculate organ transport routes in real-time when transit fails.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          {/* Run list */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Active Runs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEMO_RUNS.map(r => (
                <motion.div key={r.run_id} whileHover={{ scale: 1.01 }} onClick={() => { setSelected(r); setResult(null); }}
                  className="glass" style={{ padding: 16, cursor: 'pointer', borderColor: selected?.run_id === r.run_id ? 'var(--accent-light)' : r.alert ? 'rgba(239,68,68,0.4)' : 'var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <code style={{ color: 'var(--accent-light)', fontSize: '0.82rem' }}>{r.run_id}</code>
                    {r.alert && <span style={{ fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 700 }}>⚠️ AT RISK</span>}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{r.from} → {r.to}</div>
                  <div style={{ fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>🫀 {r.organ} · </span>
                    <span style={{ color: r.alert ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>⏱️ {r.viability_left} left</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reroute controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!selected ? (
              <div className="glass" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                ← Select an active run to trigger rerouting
              </div>
            ) : (
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Reroute: {selected.run_id}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={lStyle}>Reason for Rerouting</label>
                    <select value={reason} onChange={e => setReason(e.target.value)} style={iStyle}>
                      {REASONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lStyle}>Estimated Delay: {delay} minutes</label>
                    <input type="range" min="15" max="300" step="15" value={delay} onChange={e => setDelay(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-light)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      <span>15 min</span><span>5 hours</span>
                    </div>
                  </div>
                  <button onClick={handleReroute} disabled={loading} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-light), #7c3aed)' }}>
                    {loading ? '🔄 Computing new route...' : '🔄 Trigger Reroute Request'}
                  </button>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass" style={{ padding: 24, border: `1px solid ${result.feasible ? 'rgba(0,212,170,0.3)' : 'rgba(239,68,68,0.4)'}` }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, color: result.feasible ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                  {result.feasible ? '✓ FEASIBLE — New Route Found' : '🚨 INFEASIBLE — Emergency Protocol Activated'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {['Old Route', 'New Route'].map((label, idx) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
                      {(idx === 0 ? result.old_route : result.new_route).map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: idx === 0 ? 'var(--text-muted)' : 'var(--accent-light)', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.8rem', textDecoration: idx === 0 ? 'line-through' : 'none', color: idx === 0 ? 'var(--text-muted)' : 'var(--text-primary)' }}>{s}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: idx === 0 ? 'var(--text-muted)' : result.feasible ? 'var(--success)' : 'var(--danger)', marginTop: 8 }}>
                        ETA: {idx === 0 ? result.old_eta : result.new_eta}
                      </div>
                    </div>
                  ))}
                </div>
                {result.feasible && (
                  <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', background: 'linear-gradient(135deg, var(--accent-light), #7c3aed)' }}>
                    ✓ Confirm New Route
                  </button>
                )}
                {!result.feasible && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: '0.8rem', color: '#f87171' }}>
                    Alert sent to both hospitals. Nearest compatible transplant center located: Kokilaben KDAH, Mumbai.
                  </div>
                )}
              </motion.div>
            )}

            {/* History */}
            <div className="glass" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>Rerouting History</h3>
              <table className="data-table" style={{ width: '100%' }}>
                <thead><tr><th>Run ID</th><th>Date</th><th>Reason</th><th>Old ETA</th><th>New ETA</th><th>Outcome</th></tr></thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.run_id}>
                      <td><code style={{ color: 'var(--accent-light)', fontSize: '0.78rem' }}>{h.run_id}</code></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.date}</td>
                      <td style={{ fontSize: '0.78rem' }}>{h.reason}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{h.old_eta}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{h.new_eta}</td>
                      <td><span style={{ fontSize: '0.68rem', color: h.outcome === 'Feasible' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{h.outcome}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const lStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' };
const iStyle = { width: '100%', padding: '10px 13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
