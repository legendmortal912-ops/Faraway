import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';
import { Package, Truck, Users, Globe, HeartPulse, Activity, Heart, Wind, Plus, Search } from 'lucide-react';

function KPICard({ icon, label, value, sub, color = 'var(--accent)', delay = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const n = parseInt(value) || 0;
    let i = 0;
    const t = setInterval(() => { i += Math.ceil(n / 30); if (i >= n) { setDisplay(n); clearInterval(t); } else setDisplay(i); }, 30);
    return () => clearInterval(t);
  }, [value]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color, lineHeight: 1 }}>{typeof value === 'string' && isNaN(value) ? value : display}</div>
          {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      </div>
    </motion.div>
  );
}

const ORGAN_BREAKDOWN = [
  { organ: 'Kidney', waiting: 3, available: 2, icon: <HeartPulse size={22} color="#f59e0b" />, color: '#f59e0b' },
  { organ: 'Liver', waiting: 1, available: 0, icon: <Activity size={22} color="#ef4444" />, color: '#ef4444' },
  { organ: 'Heart', waiting: 1, available: 1, icon: <Heart size={22} color="#ec4899" />, color: '#ec4899' },
  { organ: 'Lung', waiting: 0, available: 1, icon: <Wind size={22} color="#3b82f6" />, color: '#3b82f6' },
];

export default function HospitalDashboard() {
  const { user, localPatients, localDonors, localRuns, activityFeed, wsConnected, hospitals } = useLifeMeshStore();
  const navigate = useNavigate();

  const incoming = localRuns.filter(r => r.status === 'ACTIVE').length;
  const outgoing = localDonors.length;

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Hospital Overview</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>Good morning, {user?.name?.split(' ')[0] || 'Coordinator'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Here's what's happening on the LifeMesh network right now.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/hospital/register-donor')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Plus size={15} /> Register Donor
          </button>
          <button onClick={() => navigate('/hospital/waitlist')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            <Search size={15} /> Find Match
          </button>
        </div>
      </motion.div>

      {/* KPI Row 1 */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <KPICard icon={<Package size={26} color="var(--accent)" />} label="Active Incoming Shipments" value={String(incoming)} color="var(--accent)" delay={0.05} />
        <KPICard icon={<Truck size={26} color="var(--warning)" />} label="Active Outgoing Shipments" value={String(outgoing)} color="var(--warning)" delay={0.1} />
        <KPICard icon={<Users size={26} color="var(--danger)" />} label="Patients on Waitlist" value={String(localPatients.length)} color="var(--danger)" delay={0.15} />
        <KPICard icon={<Globe size={26} color="var(--info)" />} label="Network Nodes Online" value={String(hospitals.length)} sub="globally" color="var(--info)" delay={0.2} />
      </div>

      {/* Row 2 — organ breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        {ORGAN_BREAKDOWN.map((o, i) => (
          <motion.div key={o.organ} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.05 }}
            className="glass" style={{ padding: 18 }}>
            <div style={{ marginBottom: 8 }}>{o.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.95rem' }}>{o.organ}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Waiting</span>
              <span style={{ fontWeight: 700, color: o.color }}>{o.waiting}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>In Network</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{o.available}</span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(o.available / Math.max(o.waiting + o.available, 1)) * 100}%`, background: 'var(--success)', borderRadius: 2, transition: 'width 1s ease' }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom row: Activity feed + Network status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Activity feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {activityFeed.length === 0 ? (
              [
                { type: 'MATCH_FOUND', label: 'Match found for Patient P-0041 (94.3% compatibility)', time: '14:23', color: 'var(--success)' },
                { type: 'SHIPMENT_UPDATE', label: 'RUN-2041: Organ in transit — ETA 3h 12m', time: '13:58', color: 'var(--accent)' },
                { type: 'DONOR_REG', label: 'New donor registered — Kidney & Liver available', time: '12:11', color: 'var(--warning)' },
                { type: 'DELIVERY', label: 'RUN-2039 delivered successfully. Viability: 68%', time: '09:34', color: 'var(--success)' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.825rem' }}>{e.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{e.time} today</div>
                  </div>
                </div>
              ))
            ) : activityFeed.slice(0, 20).map((e, i) => (
              <div key={e.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{e.type}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>{new Date(e.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Network Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="glass" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Network Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {hospitals.map((h, i) => (
              <div key={h.hospital_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', flex: 1 }}>{h.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.tier}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>SMPC Engine</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Active — Zero Exposures</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
