import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Lock, Zap, Map, Thermometer, ShieldCheck, Activity } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function CanvasMesh() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
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
        ctx.fillStyle = 'rgba(241,194,125,0.3)';
        ctx.fill();
      });
      nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 200) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(241,194,125,${0.15 * (1 - d / 200)})`;
          ctx.lineWidth = 1;
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

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.5 }} />;
}

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <div style={{ background: '#050505', minHeight: '100vh', fontFamily: 'var(--font-sans), Inter, sans-serif', color: '#ededed', overflowX: 'hidden' }}>
      
      {/* Sticky Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '16px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: isScrolled ? 'rgba(5, 5, 5, 0.8)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(24px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
          transition: 'all 0.4s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #F1C27D, #FFDBAC)', boxShadow: '0 0 20px rgba(241,194,125,0.4)' }} />
          <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.04em' }}>LifeMesh</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <button onClick={() => navigate('/login/hospital')} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#a1a1aa'}>Hospitals</button>
          <button onClick={() => navigate('/login/logistics')} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#a1a1aa'}>Carriers</button>
          <button onClick={() => navigate('/signup/hospital')} style={{ background: '#fff', border: 'none', color: '#000', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: '10px 24px', borderRadius: 100, boxShadow: '0 4px 14px rgba(255,255,255,0.1)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>Get Started</button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '160px 24px 60px', overflow: 'hidden' }}>
        
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '80vh', background: 'radial-gradient(circle at center, rgba(241,194,125,0.12) 0%, rgba(255,219,172,0.08) 30%, transparent 60%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        
        <CanvasMesh />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '8px 24px', marginBottom: 40, fontSize: '0.9rem', color: '#e4e4e7', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <span style={{ width: 8, height: 8, background: '#F1C27D', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 12px #F1C27D', animation: 'pulse 2s infinite' }} />
            LifeMesh Network v2.0 is now live globally
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(4rem, 8vw, 7.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.04em' }}>
            The Speed of Life.<br />
            <span style={{ background: 'linear-gradient(135deg, #fff 20%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Delivered.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#a1a1aa', maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 400 }}>
            Connect hospitals and logistics carriers for real-time, cold-chain monitored organ and medical transport. Cryptographically secure, instantly routed.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup/hospital')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: 'none', color: '#000', fontSize: '1.05rem', fontWeight: 600, padding: '18px 40px', borderRadius: 100, cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,255,255,0.15)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Join the Network
            </button>
            <button onClick={() => navigate('/login/hospital')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.05rem', fontWeight: 600, padding: '18px 40px', borderRadius: 100, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              View Live Demo
            </button>
          </motion.div>

          {/* Floating UI Image */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', maxWidth: 1100, marginTop: 80, position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 40px rgba(241,194,125,0.2)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #050505)', zIndex: 1 }} />
            <img src="/dashboard_ui.png" alt="LifeMesh Dashboard" style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.02)' }} />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '40px 24px 100px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '< 60s', label: 'Average Match Time' },
            { value: '100%', label: 'Cryptographic Privacy' },
            { value: '0°C - 4°C', label: 'Cold Chain Integrity' },
            { value: '24/7', label: 'Real-time Tracking' }
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '32px 24px', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section style={{ padding: '60px 24px 120px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.03em' }}>Built for the future of medicine.</h2>
          <p style={{ color: '#a1a1aa', fontSize: '1.25rem', maxWidth: 650, margin: '0 auto' }}>Advanced technology scaling globally to ensure no organ is ever wasted.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, gridAutoRows: '320px' }}>
          
          {/* Feature 1: Global Network Map */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }}
            style={{ gridColumn: 'span 8', background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, position: 'relative', overflow: 'hidden' }}>
            <img src="/network_map.png" alt="Global Network" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
              <Map size={36} color="#fff" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, color: '#fff', letterSpacing: '-0.02em' }}>Global Algorithmic Matching</h3>
              <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 500 }}>
                Our proprietary consensus engine matches donors with critical patients across borders in milliseconds based on HLA compatibility and transport distance.
              </p>
            </div>
          </motion.div>

          {/* Feature 2: Fast Routing */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ delay: 0.1 }}
            style={{ gridColumn: 'span 4', background: 'linear-gradient(145deg, #18181b, #09090b)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Zap size={36} color="#fff" />
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12, color: '#fff', letterSpacing: '-0.02em' }}>Dynamic Rerouting</h3>
              <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.6 }}>Consensus detects flight delays and recalculates routes mid-transit to save organs, assigning new ground vehicles instantly.</p>
            </div>
          </motion.div>

          {/* Feature 3: Security */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ delay: 0.2 }}
            style={{ gridColumn: 'span 4', background: 'linear-gradient(145deg, #18181b, #09090b)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <ShieldCheck size={36} color="#fff" />
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12, color: '#fff', letterSpacing: '-0.02em' }}>Zero-Knowledge</h3>
              <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.6 }}>Patient biology is shredded into encrypted shares. The network matches without ever seeing the actual patient data.</p>
            </div>
          </motion.div>

          {/* Feature 4: IoT Medical Box */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ delay: 0.3 }}
            style={{ gridColumn: 'span 8', background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, position: 'relative', overflow: 'hidden' }}>
            <img src="/medical_box.png" alt="IoT Cold Chain" style={{ position: 'absolute', right: -50, top: '50%', transform: 'translateY(-50%)', height: '120%', objectFit: 'contain', opacity: 0.8 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(9,9,11,1) 40%, rgba(9,9,11,0) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 40, left: 40, width: '50%' }}>
              <Thermometer size={36} color="#fff" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, color: '#fff', letterSpacing: '-0.02em' }}>IoT Cold Chain</h3>
              <p style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Physical smart devices stream temperature and shock telemetry every second, directly alerting the logistics portal if a breach occurs.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{ padding: '140px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(241,194,125,0.08) 0%, transparent 50%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: 24, letterSpacing: '-0.03em' }}>Ready to join the network?</h2>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', marginBottom: 48, lineHeight: 1.6 }}>Transform your hospital's transplant capabilities with cryptographic security and unparalleled speed.</p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup/hospital')} style={{ background: '#fff', color: '#050505', border: 'none', padding: '18px 48px', fontSize: '1.1rem', fontWeight: 700, borderRadius: 100, cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,255,255,0.2)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              Register Hospital
            </button>
            <button onClick={() => navigate('/signup/logistics')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '18px 48px', borderRadius: 100, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              Register Carrier
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 32px 40px', background: '#050505' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #F1C27D, #FFDBAC)' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>LifeMesh Protocol</span>
            </div>
            <p style={{ color: '#71717a', fontSize: '0.9rem', maxWidth: 300, lineHeight: 1.6 }}>Cryptographically Sovereign Organ Logistics. Designed for the future of medicine.</p>
          </div>
          <div style={{ display: 'flex', gap: 60 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginBottom: 8 }}>Platform</span>
              <Link to="/signup/hospital" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Hospital Setup</Link>
              <Link to="/signup/logistics" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Carrier Setup</Link>
              <Link to="/login" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Login</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginBottom: 8 }}>Resources</span>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Documentation</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>API Access</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Privacy Policy</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '60px auto 0', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', color: '#52525b', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 LifeMesh Foundation. All rights reserved.</span>
          <span>Status: Operational (100% Uptime)</span>
        </div>
      </footer>
    </div>
  );
}
