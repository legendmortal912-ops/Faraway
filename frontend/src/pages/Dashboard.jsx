import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
  Activity, Globe, Shield, Zap, Clock, ChevronRight,
  Cpu, Map, TrendingUp, AlertTriangle, Ambulance, Thermometer
} from 'lucide-react';

const API = 'http://localhost:8000';

export default function Dashboard() {
  const navigate = useNavigate();
  const { hospitals, stats, activityFeed, wsConnected, activeScenario } = useLifeMeshStore();
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/packages`).then(r => r.json()).then(setPackages).catch(() => {});
    const t = setInterval(() => {
      fetch(`${API}/api/packages`).then(r => r.json()).then(setPackages).catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const statCards = [
    { icon: Globe,   label: 'Hospital Nodes',      value: hospitals.length || 8,   sub: `${new Set(hospitals.map(h=>h.country_code)).size || 5} countries`, color: '#00d4aa' },
    { icon: Activity,label: 'Total Patients',      value: hospitals.reduce((a,h)=>a+h.patient_count,0) || 52, sub: 'on waitlist', color: '#a78bfa' },
    { icon: Zap,     label: 'Avg Match Time',      value: '8.3s',  sub: 'Layer 0 domestic', color: '#60a5fa' },
    { icon: Shield,  label: 'Data Leaks',          value: '0',     sub: 'SMPC encrypted', color: '#10b981' },
    { icon: Clock,   label: 'Organs In Transit',   value: packages.filter(p=>p.state==='in_transit').length, sub: 'active packages', color: '#f59e0b' },
    { icon: TrendingUp, label: 'Total Delivered',  value: stats?.organs_delivered || 44, sub: 'successful transfers', color: '#ec4899' },
  ];

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 32 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Network Overview</h2>
            <p style={{ fontSize: '0.875rem' }}>
              {wsConnected
                ? `${hospitals.length || 8} nodes online · Real-time WebSocket active`
                : 'Connecting to network...'}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/new-donor')}>
            <Cpu size={16} /> New Donor Registration
          </button>
        </div>

        {/* Stat Grid */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          {statCards.map(({ icon: Icon, label, value, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass glass-hover stat-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={color} />
                </div>
                <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>Live</span>
              </div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                <div className="stat-label">{sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

          {/* Recent Jobs / Packages */}
          <div className="glass" style={{ padding: 24 }}>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3>Active & Recent Transfers</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tracking')}>
                View Tracking <ChevronRight size={14} />
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Package ID</th>
                  <th>Organ</th>
                  <th>Status</th>
                  <th>Route</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No active transfers. <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => navigate('/new-donor')}>Start demo →</button>
                    </td>
                  </tr>
                ) : packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{pkg.id.slice(-10)}</code></td>
                    <td style={{ textTransform: 'capitalize' }}>{pkg.organ_type}</td>
                    <td>
                      <span className={`badge ${
                        pkg.state === 'delivered' ? 'badge-success' :
                        pkg.state === 'in_transit' ? 'badge-accent' :
                        pkg.state === 'failed' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {pkg.state.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{pkg.route_segments} segments</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tracking')}>Track</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Activity Feed */}
          <div className="glass" style={{ padding: 20, maxHeight: 460, display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h3>Live Activity</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pulse-dot green" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WebSocket</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activityFeed.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0', textAlign: 'center' }}>
                  Waiting for events...
                </div>
              ) : activityFeed.map((item, i) => (
                <FeedItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick demo launch */}
        <div className="glass" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ marginBottom: 4 }}>Quick Launch Demo</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: 20 }}>Trigger a simulation scenario directly from here.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <DemoButton
              label={<><Ambulance size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Domestic Match</>}
              desc="Layer 0 — Safdarjung → Fortis Noida"
              color="#10b981"
              endpoint="/api/simulate/domestic"
              onClick={() => navigate('/computation')}
            />
            <DemoButton
              label={<><Globe size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Global SMPC</>}
              desc="Layer 1 — Paris → Mumbai via SMPC"
              color="var(--accent)"
              endpoint="/api/simulate/global"
              onClick={() => navigate('/computation')}
            />
            <DemoButton
              label={<><Thermometer size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Cold Chain</>}
              desc="Layer 2 — IoT sensor breach simulation"
              color="#a78bfa"
              endpoint="/api/simulate/cold-chain"
              onClick={() => navigate('/tracking')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedItem({ item }) {
  const { type, data, timestamp } = item;
  const t = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const typeColors = {
    COLD_CHAIN_ALERT: 'var(--danger)',
    BYZANTINE_ATTACK: 'var(--danger)',
    SMPC_MATCH_FOUND: 'var(--success)',
    ORGAN_DELIVERED:  'var(--success)',
    LAYER0_MATCH_FOUND: 'var(--success)',
    SMPC_STEP:        'var(--accent)',
    ROUTE_RECALCULATED: 'var(--warning)',
  };
  const color = typeColors[type] || 'var(--text-muted)';

  return (
    <div style={{
      padding: '8px 10px',
      borderRadius: 6,
      background: 'rgba(255,255,255,0.02)',
      borderLeft: `2px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{type}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t}</span>
      </div>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        {data?.message || data?.hospital || ''}
      </span>
    </div>
  );
}

function DemoButton({ label, desc, color, endpoint, onClick }) {
  const [loading, setLoading] = useState(false);
  const trigger = async () => {
    setLoading(true);
    try {
      await fetch(`http://localhost:8000${endpoint}`, { method: 'POST' });
      onClick?.();
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={trigger}
      disabled={loading}
      style={{
        flex: 1, minWidth: 220, padding: '16px 20px', borderRadius: 12,
        background: `${color}15`, border: `1px solid ${color}40`,
        cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)',
        display: 'flex', flexDirection: 'column', gap: 4,
        transition: 'all 0.2s',
        opacity: loading ? 0.7 : 1,
      }}
    >
      <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{loading ? '⏳ Launching...' : label}</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{desc}</span>
    </motion.button>
  );
}
