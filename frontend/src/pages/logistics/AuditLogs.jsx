import { useState } from 'react';
import { motion } from 'framer-motion';

const DEMO_HISTORY = [
  { run_id: 'RUN-2039', date: '2026-06-09', route: 'Mumbai → Bangalore', organ: 'Liver', vehicle: 'AMB-MH-02', driver: 'Vikram S.', duration_actual: '3h 45m', duration_planned: '3h 20m', cold_incidents: 0, reroute_events: 0, status: 'COMPLETED', compliance: 'PASS' },
  { run_id: 'RUN-2038', date: '2026-06-09', route: 'Paris → Frankfurt', organ: 'Heart', vehicle: 'AIR-140', driver: 'Capt. Berg', duration_actual: '4h 12m', duration_planned: '3h 50m', cold_incidents: 0, reroute_events: 1, status: 'COMPLETED', compliance: 'PASS' },
  { run_id: 'RUN-2035', date: '2026-06-07', route: 'Delhi → Chennai', organ: 'Kidney', vehicle: 'AMB-DL-02', driver: 'Suresh P.', duration_actual: '8h 30m', duration_planned: '7h 00m', cold_incidents: 1, reroute_events: 1, status: 'COMPLETED', compliance: 'CONDITIONAL' },
  { run_id: 'RUN-2031', date: '2026-06-05', route: 'London → Madrid', organ: 'Lung', vehicle: 'AIR-135', driver: 'Capt. Cruz', duration_actual: '—', duration_planned: '3h 10m', cold_incidents: 3, reroute_events: 2, status: 'BREACHED', compliance: 'FAIL' },
];

const COMPLIANCE_COLORS = { PASS: 'var(--success)', CONDITIONAL: 'var(--warning)', FAIL: 'var(--danger)' };
const STATUS_COLORS = { COMPLETED: 'var(--success)', BREACHED: 'var(--danger)' };

export default function AuditLogs() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = DEMO_HISTORY.filter(h => filterStatus === 'All' || h.status === filterStatus);

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Regulatory Compliance</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Audit Logs</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cold chain proof of custody for medical boards, IATA, and insurance.</p>
          </div>
          <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-light), #7c3aed)', fontSize: '0.85rem' }}>
            📄 Export All Compliance Reports
          </button>
        </div>

        {/* Summary */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Runs', value: DEMO_HISTORY.length, color: 'var(--accent-light)' },
            { label: 'Compliant Runs', value: DEMO_HISTORY.filter(h => h.compliance === 'PASS').length, color: 'var(--success)' },
            { label: 'Cold Chain Incidents', value: DEMO_HISTORY.reduce((a, h) => a + h.cold_incidents, 0), color: 'var(--warning)' },
            { label: 'Failed Compliance', value: DEMO_HISTORY.filter(h => h.compliance === 'FAIL').length, color: 'var(--danger)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['All', 'COMPLETED', 'BREACHED'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${filterStatus === f ? 'var(--accent-light)' : 'var(--border)'}`, background: filterStatus === f ? 'rgba(167,139,250,0.1)' : 'transparent', color: filterStatus === f ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr><th>Run ID</th><th>Date</th><th>Route</th><th>Organ</th><th>Vehicle</th><th>Duration</th><th>Cold Incidents</th><th>Rerouting</th><th>Status</th><th>Compliance</th></tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <>
                  <motion.tr key={h.run_id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setExpanded(expanded === h.run_id ? null : h.run_id)} style={{ cursor: 'pointer' }}>
                    <td><code style={{ color: 'var(--accent-light)', fontSize: '0.82rem' }}>{h.run_id}</code></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.date}</td>
                    <td style={{ fontSize: '0.78rem' }}>{h.route}</td>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{h.organ}</td>
                    <td style={{ fontSize: '0.78rem' }}>{h.vehicle}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      <span style={{ color: h.duration_actual !== h.duration_planned ? 'var(--warning)' : 'var(--text-primary)' }}>{h.duration_actual}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>/ {h.duration_planned}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: h.cold_incidents > 0 ? 'var(--warning)' : 'var(--text-muted)', textAlign: 'center' }}>{h.cold_incidents}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: h.reroute_events > 0 ? 'var(--warning)' : 'var(--text-muted)', textAlign: 'center' }}>{h.reroute_events}</td>
                    <td><span style={{ fontSize: '0.72rem', fontWeight: 700, color: STATUS_COLORS[h.status] }}>● {h.status}</span></td>
                    <td><span style={{ fontSize: '0.72rem', fontWeight: 700, color: COMPLIANCE_COLORS[h.compliance] }}>{h.compliance}</span></td>
                  </motion.tr>
                  {expanded === h.run_id && (
                    <tr key={`${h.run_id}-exp`}>
                      <td colSpan={10} style={{ padding: 0 }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          style={{ padding: '16px 24px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', gap: 24 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Full Delivery Timeline</div>
                              {['Run manifest created', 'Driver dispatched', 'Organ picked up', 'Transit segment 1 complete', h.reroute_events > 0 ? 'Route recalculated' : 'Transit segment 2 complete', h.status === 'COMPLETED' ? 'Organ delivered' : 'BREACH — Emergency protocol'].map((e, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 5, fontSize: '0.78rem' }}>
                                  <span style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-mono)', flexShrink: 0, width: 50 }}>{String(8 + i * 1).padStart(2, '0')}:00</span>
                                  <span style={{ color: i === 5 && h.status === 'BREACHED' ? 'var(--danger)' : 'var(--text-secondary)' }}>{e}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ flexShrink: 0 }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Export</div>
                              <button className="btn btn-outline" style={{ width: 180, marginBottom: 8, fontSize: '0.8rem', borderColor: 'var(--accent-light)', color: 'var(--accent-light)' }}>📄 PDF Compliance Report</button>
                              <button className="btn btn-ghost" style={{ width: 180, fontSize: '0.8rem' }}>📊 Export CSV</button>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
