import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 860 }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>LifeMesh Protocol</div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: 10 }}>Select Your Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Choose the role that best describes your organization.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            {
              icon: '🏥', title: 'Hospital / Transplant Center',
              desc: 'Register donors, manage your patient waitlist, coordinate organ matching, and track incoming shipments.',
              login: '/login/hospital', signup: '/signup/hospital',
              color: 'var(--accent)', badge: 'Medical Institution',
            },
            {
              icon: '✈️', title: 'Logistics / Courier Company',
              desc: 'Manage your fleet, track active organ shipments, monitor cold chain integrity, and handle emergency rerouting.',
              login: '/login/logistics', signup: '/signup/logistics',
              color: 'var(--accent-light)', badge: 'Carrier / Fleet',
            },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="glass" style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '3rem' }}>{card.icon}</div>
              <div style={{ display: 'inline-flex' }}>
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: card.color, background: `${card.color}18`, border: `1px solid ${card.color}40`, borderRadius: 100, padding: '3px 10px' }}>{card.badge}</span>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.3 }}>{card.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, flexGrow: 1 }}>{card.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => navigate(card.login)} className="btn btn-primary" style={{ width: '100%', background: `linear-gradient(135deg, ${card.color}, ${card.color}aa)` }}>
                  Login →
                </button>
                <button onClick={() => navigate(card.signup)} className="btn btn-outline" style={{ width: '100%' }}>
                  Register Organization
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ textAlign: 'center', marginTop: 32 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>← </span>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem' }}>Back to Home</button>
        </motion.div>
      </div>
    </div>
  );
}
