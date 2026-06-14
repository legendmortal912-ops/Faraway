import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import { motion } from 'framer-motion';
import { BarChart, Globe, Plus, Search, Truck, Building2, Shield, ScrollText, Landmark, Settings } from 'lucide-react';

const NAV = [
  { to: '/hospital/dashboard', icon: <BarChart size={16} />, label: 'Overview' },
  { to: '/hospital/network-donors', icon: <Globe size={16} />, label: 'Network Donors', coordinatorOnly: true },
  { to: '/hospital/register-donor', icon: <Plus size={16} />, label: 'Register Donor', hideForCoordinator: true },
  { to: '/hospital/waitlist', icon: <Search size={16} />, label: 'Waitlist & Matching', hideForCoordinator: true },
  { to: '/hospital/shipments', icon: <Truck size={16} />, label: 'Active Shipments' },
  { to: '/hospital/fleet', icon: <Building2 size={16} />, label: 'Fleet Manager', fleetOnly: true },
  { to: '/hospital/crypto-logs', icon: <Shield size={16} />, label: 'Crypto Logs' },
  { to: '/hospital/history', icon: <ScrollText size={16} />, label: 'History' },
];

export default function HospitalLayout() {
  const { user, logout, wsConnected } = useLifeMeshStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Sidebar */}
      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: 240, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>

        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>LifeMesh Protocol</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{user?.name || 'Hospital'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: wsConnected ? 'var(--success)' : 'var(--danger)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{wsConnected ? 'Network Online' : 'Reconnecting...'}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {user?.is_coordinator && (
            <div style={{ margin: '4px 12px 10px', padding: '6px 10px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, fontSize: '0.68rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Landmark size={14} /> NOTTO Coordinator</div>
          )}
          {NAV.filter(n => {
            if (n.fleetOnly && !user?.has_internal_fleet) return false;
            if (n.coordinatorOnly && !user?.is_coordinator) return false;
            if (n.hideForCoordinator && user?.is_coordinator) return false;
            return true;
          }).map(n => (
            <NavLink key={n.to} to={n.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                marginBottom: 2, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
                background: isActive ? 'rgba(0,212,170,0.1)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              })}>
              <span>{n.icon}</span><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <NavLink to="/hospital/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span><Settings size={16} /></span><span>Settings</span>
          </NavLink>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, width: '100%', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}>
            <span>↩️</span><span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', background: 'transparent' }}>
        <Outlet />
      </main>
    </div>
  );
}
