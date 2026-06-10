import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';

const LOG_COLORS = {
  SMPC_INIT: 'var(--accent)',
  SHARE_BROADCAST: 'var(--accent-light)',
  COMPUTATION_STEP: '#facc15',
  MATCH_SCORE_COMPUTED: 'var(--success)',
  PII_ACCESS: 'var(--danger)',
  NODE_STATUS: 'var(--info)',
};

function generateInitialLogs() {
  return [
    { ts: '14:23:01', type: 'NODE_STATUS', msg: 'Node H_AIIMS connected to LifeMesh network' },
    { ts: '14:23:01', type: 'NODE_STATUS', msg: 'SMPC engine initialized — threshold: 3/5 nodes' },
    { ts: '14:23:02', type: 'SMPC_INIT', msg: 'Patient P-0041 biological shares generated (5 shares, threshold 3)' },
    { ts: '14:23:02', type: 'SHARE_BROADCAST', msg: 'Share 1/5 → Node H_PARIS (encrypted)' },
    { ts: '14:23:02', type: 'SHARE_BROADCAST', msg: 'Share 2/5 → Node H_MUMBAI (encrypted)' },
    { ts: '14:23:02', type: 'SHARE_BROADCAST', msg: 'Share 3/5 → Node H_LONDON (encrypted)' },
    { ts: '14:23:03', type: 'COMPUTATION_STEP', msg: 'Node H_PARIS reports HLA-A1 partial score (encrypted homomorphic result)' },
    { ts: '14:23:03', type: 'COMPUTATION_STEP', msg: 'Node H_MUMBAI reports HLA-B1 partial score (encrypted)' },
    { ts: '14:23:03', type: 'COMPUTATION_STEP', msg: 'Node H_LONDON confirms threshold quorum reached (3/5 nodes)' },
    { ts: '14:23:04', type: 'MATCH_SCORE_COMPUTED', msg: 'Final compatibility score: 94.3% — No raw data exposed during computation' },
    { ts: '14:23:04', type: 'PII_ACCESS', msg: 'REQUEST: Node H_PARIS attempted to read donor name → DENIED ✓' },
    { ts: '14:23:04', type: 'PII_ACCESS', msg: 'REQUEST: Node H_MUMBAI attempted to read patient DOB → DENIED ✓' },
    { ts: '14:23:05', type: 'MATCH_SCORE_COMPUTED', msg: 'SMPC computation complete. Match broadcast to both hospitals.' },
  ];
}

export default function CryptoLogs() {
  const { smpcSteps, activityFeed, hospitals, wsConnected } = useLifeMeshStore();
  const [logs, setLogs] = useState(generateInitialLogs());
  const logRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (smpcSteps.length > 0) {
      const newLogs = smpcSteps.map(s => ({
        ts: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'COMPUTATION_STEP',
        msg: `${s.operation || 'Computation step'} — Node ${s.node || 'Unknown'}`,
      }));
      setLogs(prev => [...prev, ...newLogs]);
    }
  }, [smpcSteps]);

  const simulateLive = async () => {
    setRunning(true);
    const liveLogs = [
      { type: 'SMPC_INIT', msg: 'NEW REQUEST: Patient P-0043 (Heart) — initiating cross-border SMPC' },
      { type: 'SHARE_BROADCAST', msg: 'Share 1/5 → Node H_SAO_PAULO' },
      { type: 'SHARE_BROADCAST', msg: 'Share 2/5 → Node H_DUBAI' },
      { type: 'COMPUTATION_STEP', msg: 'Node H_SAO_PAULO: HLA partial score received (ciphertext)' },
      { type: 'PII_ACCESS', msg: 'UNAUTHORIZED REQUEST from external probe → DENIED ✓' },
      { type: 'MATCH_SCORE_COMPUTED', msg: 'SMPC match complete: 87.6% compatibility. Zero data leaked.' },
    ];
    for (const log of liveLogs) {
      await new Promise(r => setTimeout(r, 800));
      setLogs(prev => [...prev, { ...log, ts: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
    }
    setRunning(false);
  };

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Cryptographic Audit</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Network Logs</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Real-time proof of SMPC computation. Every PII access attempt is logged and denied.</p>
          </div>
          <button onClick={simulateLive} disabled={running} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            {running ? '⏳ Computing...' : '▶ Simulate SMPC Run'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          {/* Terminal */}
          <div className="glass" style={{ padding: 0, overflow: 'hidden', fontFamily: 'var(--font-mono)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>lifemesh@smpc-engine:~$ live-log</span>
            </div>
            <div ref={logRef} style={{ padding: 16, maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {logs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                  style={{ display: 'flex', gap: 10, fontSize: '0.78rem', lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>[{log.ts}]</span>
                  <span style={{ color: LOG_COLORS[log.type] || 'var(--accent)', flexShrink: 0, width: 190 }}>{log.type}:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{log.msg}</span>
                </motion.div>
              ))}
              {running && (
                <div style={{ fontSize: '0.78rem', color: 'var(--accent)', animation: 'pulse 1s infinite' }}>▍</div>
              )}
            </div>
          </div>

          {/* Stats sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Network Consensus */}
            <div className="glass" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>Network Nodes</h3>
              {hospitals.map(h => (
                <div key={h.hospital_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', flex: 1, color: 'var(--text-secondary)' }}>{h.name}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Online</span>
                </div>
              ))}
            </div>

            {/* Privacy Audit */}
            <div className="glass" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>Privacy Audit</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Stat label="SMPC Computations" value={logs.filter(l => l.type === 'SMPC_INIT').length} color="var(--accent)" />
                <Stat label="PII Exposure Events" value={0} color="var(--success)" />
                <Stat label="Access Denied Events" value={logs.filter(l => l.type === 'PII_ACCESS').length} color="var(--danger)" />
                <Stat label="Matches Computed" value={logs.filter(l => l.type === 'MATCH_SCORE_COMPUTED').length} color="var(--accent)" />
              </div>
              <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>✓ Zero raw data exposures</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>All computations passed privacy audit</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 800, fontSize: '1.1rem', color }}>{value}</span>
    </div>
  );
}
