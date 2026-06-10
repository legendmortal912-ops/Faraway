import { NavLink, useLocation } from 'react-router-dom';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import { Activity, LayoutDashboard, Plus, Cpu, Map, Database } from 'lucide-react';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Overview' },
  { to: '/new-donor',   icon: Plus,            label: 'New Donor' },
  { to: '/computation', icon: Cpu,             label: 'Pipeline' },
  { to: '/tracking',    icon: Map,             label: 'Tracking' },
  { to: '/nodes',       icon: Database,        label: 'Node Registry' },
];

export default function Navbar() {
  const wsConnected = useLifeMeshStore(s => s.wsConnected);
  const alarmActive = useLifeMeshStore(s => s.alarmActive);
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(3,7,18,0.85)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
    }}>
      <div className="container" style={{ height: 60, display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Logo */}
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={18} color="#000" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Life<span style={{ color: 'var(--accent)' }}>Mesh</span>
          </span>
        </NavLink>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 8,
              fontSize: '0.85rem', fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              transition: 'all 0.2s',
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {alarmActive && (
            <div className="badge badge-danger" style={{ animation: 'alert-flash 1s infinite' }}>
              ⚠️ Cold Chain Alert
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span className={`pulse-dot ${wsConnected ? 'green' : 'red'}`} />
            {wsConnected ? 'Network Online' : 'Reconnecting...'}
          </div>
        </div>
      </div>
    </nav>
  );
}
