import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';
import { ClipboardList, CheckCircle2, Timer, Globe2, FileText, BarChart } from 'lucide-react';

const OUTCOME_COLOR = { Delivered: 'var(--success)', Failed: 'var(--danger)', Rerouted: 'var(--warning)' };
const TIER_COLOR = { DOMESTIC: 'var(--accent)', CROSS_BORDER: 'var(--accent-light)' };

export default function History() {
  const { localHistory } = useLifeMeshStore();
  const [filterDir, setFilterDir] = useState('All');
  const [filterOrgan, setFilterOrgan] = useState('All');
  const [filterTier, setFilterTier] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = localHistory.filter(h =>
    (filterDir === 'All' || h.direction === filterDir) &&
    (filterOrgan === 'All' || h.organ === filterOrgan) &&
    (filterTier === 'All' || h.tier === filterTier)
  );

  const total = localHistory.length;
  const avgTransit = '4h 56m';
  const crossBorder = localHistory.filter(h => h.tier === 'CROSS_BORDER').length;
  const successRate = Math.round((localHistory.filter(h => h.outcome === 'Delivered').length / total) * 100);

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Audit Trail</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Transplant History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Complete record of all past organ transports this hospital was involved in.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Cases', value: total, icon: <ClipboardList size={24} />, color: 'var(--accent)' },
            { label: 'Success Rate', value: `${successRate}%`, icon: <CheckCircle2 size={24} />, color: 'var(--success)' },
            { label: 'Avg Transit Time', value: avgTransit, icon: <Timer size={24} />, color: 'var(--warning)' },
            { label: 'Cross-Border', value: crossBorder, icon: <Globe2 size={24} />, color: 'var(--accent-light)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <FilterGroup label="Direction" value={filterDir} onChange={setFilterDir} options={['All', 'Incoming', 'Outgoing']} />
          <FilterGroup label="Organ" value={filterOrgan} onChange={setFilterOrgan} options={['All', 'Kidney', 'Liver', 'Heart', 'Lung']} />
          <FilterGroup label="Tier" value={filterTier} onChange={setFilterTier} options={['All', 'DOMESTIC', 'CROSS_BORDER']} />
        </div>

        {/* Table */}
        <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Case ID</th><th>Date</th><th>Organ</th><th>Direction</th>
                <th>Partner City</th><th>Tier</th><th>Compatibility</th>
                <th>Transit Time</th><th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <>
                  <motion.tr key={h.case_id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setExpanded(expanded === h.case_id ? null : h.case_id)}
                    style={{ cursor: 'pointer', background: expanded === h.case_id ? 'rgba(0,212,170,0.03)' : undefined }}>
                    <td><code style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{h.case_id}</code></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{h.date}</td>
                    <td style={{ fontWeight: 600 }}>{h.organ}</td>
                    <td>
                      <span className="badge badge-muted">{h.direction === 'Incoming' ? '↓' : '↑'} {h.direction}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{h.partner_city}</td>
                    <td>
                      <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: 100, background: `${TIER_COLOR[h.tier]}18`, color: TIER_COLOR[h.tier], border: `1px solid ${TIER_COLOR[h.tier]}40` }}>
                        {h.tier.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{h.compatibility}%</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{h.transit_time}</td>
                    <td>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: OUTCOME_COLOR[h.outcome] }}>● {h.outcome}</span>
                    </td>
                  </motion.tr>

                  {expanded === h.case_id && (
                    <tr key={`${h.case_id}-detail`}>
                      <td colSpan={9} style={{ padding: 0 }}>
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Case Timeline</div>
                              {[
                                ['Donor Registered', '09:14'],
                                ['SMPC Matching Started', '09:15'],
                                [`Match Found (${h.tier})`, '09:16'],
                                ['Carrier Assigned', '09:20'],
                                ['Organ Picked Up', '09:45'],
                                ['In Transit', '10:00'],
                                ['Organ Delivered', h.direction === 'Incoming' ? '14:22' : '15:30'],
                              ].map(([ev, ts]) => (
                                <div key={ev} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: '0.78rem' }}>
                                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{ts}</span>
                                  <span style={{ color: 'var(--text-secondary)' }}>{ev}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Metrics</div>
                              <Info label="Viability at Delivery" value={h.viability_at_delivery} />
                              <Info label="Cold Chain Events" value={`${h.cold_chain_events} events`} />
                              <Info label="Rerouting Events" value={`${h.rerouting_events} events`} />
                              <Info label="Compatibility" value={`${h.compatibility}%`} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Export</div>
                              <button className="btn btn-outline" style={{ width: '100%', marginBottom: 8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><FileText size={14} /> Export Case PDF</button>
                              <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><BarChart size={14} /> Export CSV</button>
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

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{label}:</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            style={{ padding: '4px 12px', borderRadius: 100, border: `1px solid ${value === o ? 'var(--accent)' : 'var(--border)'}`, background: value === o ? 'rgba(0,212,170,0.1)' : 'transparent', color: value === o ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.78rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
