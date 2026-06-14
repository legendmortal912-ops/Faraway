import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import { motion } from 'framer-motion';
import { Package, MapPin, RefreshCw, ClipboardList } from 'lucide-react';

const NAV = [
  { to: '/logistics/dashboard', icon: <Package size={16} />, label: 'Fleet Command' },
  { to: '/logistics/tracking', icon: <MapPin size={16} />, label: 'Live Tracking' },
  { to: '/logistics/rerouting', icon: <RefreshCw size={16} />, label: 'Emergency Rerouting' },
  { to: '/logistics/audit', icon: <ClipboardList size={16} />, label: 'Audit Logs' },
];

export default function LogisticsLayout() {
  const { user, logout, wsConnected } = useLifeMeshStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    document.documentElement.classList.add('theme-logistics');
    return () => {
      document.documentElement.classList.remove('theme-logistics');
    };
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: 240, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>

        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>LifeMesh Logistics</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{user?.name || 'Carrier'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: wsConnected ? 'var(--success)' : 'var(--danger)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{wsConnected ? 'Network Online' : 'Reconnecting...'}</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                marginBottom: 2, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
                background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
                color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--accent-light)' : '2px solid transparent',
              })}>
              <span>{n.icon}</span><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, width: '100%', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}>
            <span>↩️</span><span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', background: 'transparent' }}>
        <Outlet />
      </main>
    </div>
  );
}
