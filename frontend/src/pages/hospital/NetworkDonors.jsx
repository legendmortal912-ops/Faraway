import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';

const STATUS_CONFIG = {
  AVAILABLE:    { color: 'var(--success)',      bg: 'rgba(34,197,94,0.1)',   label: 'Available' },
  PENDING_MATCH:{ color: 'var(--warning)',      bg: 'rgba(245,158,11,0.1)', label: 'Pending Match' },
  ACCEPTED:     { color: 'var(--accent)',       bg: 'rgba(0,212,170,0.1)',  label: 'Accepted' },
  DECLINED:     { color: 'var(--text-muted)',   bg: 'rgba(75,85,99,0.1)',   label: 'Declined' },
};

const TIER_CONFIG = {
  DOMESTIC:     { color: 'var(--accent)',       label: 'Domestic' },
  CROSS_BORDER: { color: 'var(--accent-light)', label: 'Cross-Border' },
};

function getViabilityInfo(expires) {
  const ms = new Date(expires) - Date.now();
  if (ms <= 0) return { label: 'Expired', color: 'var(--danger)', pct: 0 };
  const hours = ms / 3600000;
  const totalHours = 12;
  const pct = Math.min((hours / totalHours) * 100, 100);
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const color = hours < 2 ? 'var(--danger)' : hours < 4 ? 'var(--warning)' : 'var(--success)';
  return { label: `${h}h ${m}m`, color, pct };
};

export default function NetworkDonors() {
  const { networkDonors, acceptDonor, declineDonor } = useLifeMeshStore();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterOrgan, setFilterOrgan] = useState('All');
  const [filterTier, setFilterTier] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  const allOrgans = [...new Set(networkDonors.flatMap(d => d.organs))].sort();

  const filtered = networkDonors.filter(d =>
    (filterStatus === 'All' || d.status === filterStatus) &&
    (filterOrgan === 'All' || d.organs.includes(filterOrgan)) &&
    (filterTier === 'All' || d.tier === filterTier)
  );

  const available = networkDonors.filter(d => d.status === 'AVAILABLE').length;
  const accepted  = networkDonors.filter(d => d.status === 'ACCEPTED').length;
  const crossBorder = networkDonors.filter(d => d.tier === 'CROSS_BORDER').length;

  const handleAccept = async (id) => {
    setAcceptingId(id);
    await new Promise(r => setTimeout(r, 1200));
    acceptDonor(id);
    setAcceptingId(null);
  };

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 100, padding: '4px 14px', marginBottom: 12, fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
            Coordinator Access — NOTTO
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 6 }}>Network Donor Pool</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            All donors registered across the LifeMesh network. PII is <strong style={{ color: 'var(--danger)' }}>not visible</strong> — only encrypted biological parameters. Accept a donor to trigger SMPC matching.
          </p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { icon: '🟢', label: 'Available Donors', value: available, color: 'var(--success)' },
            { icon: '✅', label: 'Accepted Today', value: accepted, color: 'var(--accent)' },
            { icon: '🌍', label: 'Cross-Border', value: crossBorder, color: 'var(--accent-light)' },
            { icon: '🏥', label: 'Hospitals Contributing', value: [...new Set(networkDonors.map(d => d.hospital_id))].length, color: 'var(--info)' },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>{k.icon}</span>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterBar label="Status" value={filterStatus} onChange={setFilterStatus} options={['All', 'AVAILABLE', 'PENDING_MATCH', 'ACCEPTED', 'DECLINED']} />
          <FilterBar label="Organ" value={filterOrgan} onChange={setFilterOrgan} options={['All', ...allOrgans]} />
          <FilterBar label="Tier" value={filterTier} onChange={setFilterTier} options={['All', 'DOMESTIC', 'CROSS_BORDER']} />
        </div>

        {/* Donor Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((donor, i) => {
            const viab = getViabilityInfo(donor.viability_expires);
            const sc = STATUS_CONFIG[donor.status] || STATUS_CONFIG.AVAILABLE;
            const tc = TIER_CONFIG[donor.tier] || TIER_CONFIG.DOMESTIC;
            const isExpanded = expanded === donor.donor_id;
            const isAccepting = acceptingId === donor.donor_id;

            return (
              <motion.div key={donor.donor_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass" style={{ padding: 0, overflow: 'hidden', borderColor: donor.status === 'ACCEPTED' ? 'rgba(0,212,170,0.3)' : donor.status === 'DECLINED' ? 'rgba(75,85,99,0.2)' : 'var(--border)' }}>

                {/* Card header row */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : donor.donor_id)}>

                  {/* Donor ID + Hospital */}
                  <div style={{ minWidth: 160 }}>
                    <code style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700 }}>{donor.donor_id}</code>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      🏥 {donor.hospital_name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{donor.city}</div>
                  </div>

                  {/* Blood Type */}
                  <div style={{ minWidth: 60, textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{donor.blood_type}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood</div>
                  </div>

                  {/* Organs */}
                  <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {donor.organs.map(o => (
                      <span key={o} style={{ padding: '4px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(0,212,170,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,212,170,0.2)' }}>{o}</span>
                    ))}
                  </div>

                  {/* Tier */}
                  <div style={{ minWidth: 100 }}>
                    <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: 100, fontWeight: 700, color: tc.color, background: `${tc.color}18`, border: `1px solid ${tc.color}30` }}>{tc.label}</span>
                  </div>

                  {/* Viability timer */}
                  <div style={{ minWidth: 130 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Viability</span>
                      <span style={{ color: viab.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{viab.label}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${viab.pct}%`, background: viab.color, borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{ padding: '5px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, background: sc.bg, color: sc.color, minWidth: 100, textAlign: 'center' }}>
                    {sc.label}
                  </span>

                  {/* Actions */}
                  {donor.status === 'AVAILABLE' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={e => { e.stopPropagation(); handleAccept(donor.donor_id); }} disabled={isAccepting}
                        className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '7px 14px', minWidth: 80 }}>
                        {isAccepting ? '⏳...' : '✓ Accept'}
                      </button>
                      <button onClick={e => { e.stopPropagation(); declineDonor(donor.donor_id); }}
                        className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '7px 12px', color: 'var(--text-muted)' }}>
                        ✕
                      </button>
                    </div>
                  )}
                  {donor.status === 'ACCEPTED' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>✅ Matched</span>
                  )}
                  {donor.status === 'DECLINED' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Declined</span>
                  )}

                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: 4 }}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Expanded biological details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                        {/* HLA Data */}
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>🧬 HLA Markers (Encrypted)</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            {['A1','A2','B1','B2','DR1','DR2'].map((k, idx) => {
                              const val = [donor.hla_a1,donor.hla_a2,donor.hla_b1,donor.hla_b2,donor.hla_dr1,donor.hla_dr2][idx];
                              return (
                                <div key={k} style={{ textAlign: 'center', background: 'var(--bg-elevated)', padding: '8px 4px', borderRadius: 6 }}>
                                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                                  <div style={{ fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{val}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Physical */}
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Physical Parameters</div>
                          <InfoRow label="Weight" value={donor.weight ? `${donor.weight} kg` : '—'} />
                          <InfoRow label="Height" value={donor.height ? `${donor.height} cm` : '—'} />
                          <InfoRow label="Organs Available" value={donor.organs.join(', ')} />
                          <InfoRow label="Source Hospital" value={donor.hospital_name} accent />
                          <InfoRow label="Registered At" value={new Date(donor.registered_at).toLocaleTimeString()} />
                        </div>

                        {/* Privacy notice */}
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Privacy Status</div>
                          <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, marginBottom: 10 }}>
                            <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, marginBottom: 4 }}>🔒 PII Locked</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Patient name, age, ID are stored exclusively in {donor.hospital_name}'s local database. This view has zero access.</div>
                          </div>
                          <div style={{ padding: '12px 14px', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 8 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>✓ SMPC Verified</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Biological data transmitted via Shamir's Secret Sharing. No single node holds the full dataset.</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              No donors match the current filters.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function FilterBar({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{label}:</span>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            style={{ padding: '4px 10px', borderRadius: 100, border: `1px solid ${value === o ? 'var(--accent)' : 'var(--border)'}`, background: value === o ? 'rgba(0,212,170,0.1)' : 'transparent', color: value === o ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', transition: 'all 0.15s' }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.78rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
