import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Zap, LockKeyhole, RadioTower, Lock, Map, RefreshCw, Thermometer, Building2, Plane } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,170,0.7)';
        ctx.fill();
      });
      nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,170,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(() => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const stats = [
    { value: '114,000+', label: 'Patients waiting in the US alone' },
    { value: '20/day', label: 'People die daily on transplant waitlists' },
    { value: '30%', label: 'Of organs wasted due to logistics failure' },
  ];

  const layers = [
    { icon: <Zap size={32} color="var(--accent)" />, title: 'Layer 0 — Domestic Fast Match', desc: 'Same-country, direct routing via national registry. Match in under 60 seconds.' },
    { icon: <LockKeyhole size={32} color="var(--accent)" />, title: 'Layer 1 — Cross-Border SMPC', desc: 'Encrypted global matching using Shamir\'s Secret Sharing. Zero data exposure across borders.' },
    { icon: <RadioTower size={32} color="var(--accent)" />, title: 'Layer 2 — Cold Chain Hardware', desc: 'IoT monitoring via Arduino + Raspberry Pi. Real-time temperature, shock, and seal alerts.' },
  ];

  const techCards = [
    { icon: <Lock size={28} color="var(--accent)" />, title: 'SMPC', desc: 'Shamir\'s Secret Sharing splits patient data into encrypted shares — only partial data exists at any one node.' },
    { icon: <Map size={28} color="var(--accent)" />, title: 'Time-Dependent Routing', desc: 'Route optimization accounts for organ viability windows — not just distance.' },
    { icon: <RefreshCw size={28} color="var(--accent)" />, title: 'Adaptive Rerouting', desc: 'PBFT consensus detects flight delays and automatically recalculates routes to prevent organ loss.' },
    { icon: <Thermometer size={28} color="var(--accent)" />, title: 'IoT Cold Chain', desc: 'Physical Arduino Nano BLE devices stream temperature readings every second to prevent cold chain breaks.' },
  ];

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 24, fontSize: '0.78rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Network Active — 8 Nodes Online
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Every Second<br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Costs a Life.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            A cryptographically sovereign organ logistics network.<br />Zero data exposure. Global reach.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login/hospital')} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}>
              <Building2 size={18} /> Hospital Login
            </button>
            <button onClick={() => navigate('/login/logistics')} className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}>
              <Plane size={18} /> Logistics Login
            </button>
          </motion.div>
        </div>

        {/* Stat Cards */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, marginTop: 64, flexWrap: 'wrap', justifyContent: 'center' }}>
          {stats.map((s, i) => (
            <div key={i} className="glass" style={{ padding: '20px 28px', textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 160 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>How It Works</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Three layers of technology working in concert</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {layers.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="glass glass-hover" style={{ padding: 28 }}>
              <div style={{ marginBottom: 12 }}>{l.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>{l.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{l.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy Guarantee */}
      <section style={{ padding: '60px 24px', background: 'linear-gradient(135deg, rgba(0,212,170,0.04), rgba(167,139,250,0.04))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Lock size={48} color="var(--accent)" /></div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16 }}>Privacy Guaranteed by Mathematics</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Patient PII is locked in your hospital's local database. Biological markers are shredded into encrypted Shamir Shares before leaving your network.
            <br /><strong style={{ color: 'var(--accent)' }}>Your patients' names never leave your hospital's database. Ever.</strong>
          </p>
        </div>
      </section>

      {/* Tech Cards */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Core Technologies</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {techCards.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass glass-hover" style={{ padding: 24 }}>
              <div style={{ marginBottom: 10 }}>{t.icon}</div>
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{t.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <Link to="/signup/hospital" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem' }}>Register Hospital</Link>
          <Link to="/signup/logistics" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem' }}>Register Carrier</Link>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>LifeMesh Protocol © 2026 — Cryptographically Sovereign Organ Logistics</p>
      </footer>
    </div>
  );
}
