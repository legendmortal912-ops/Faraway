import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useLifemeshStore } from '../../store/lifemeshStore'

export default function SMPCVisualizer() {
  const { events } = useLifemeshStore()
  const containerRef = useRef(null)
  
  const smpcEvents = events.filter(e => 
    e.type.startsWith('SMPC_') || e.type === 'DONOR_REGISTERED'
  )

  useEffect(() => {
    if (!smpcEvents.length) return
    
    // Animate new computation steps in
    gsap.from('.smpc-step:last-child', {
      opacity: 0,
      x: -20,
      duration: 0.5,
      ease: 'power3.out'
    })
  }, [smpcEvents.length])

  return (
    <div className="smpc-visualizer glow-card" ref={containerRef}>
      <div className="smpc-header">
        <div className="smpc-icon">🔐</div>
        <div>
          <h3>SMPC Computation Engine</h3>
          <p className="smpc-subtitle">Zero-knowledge matching in progress</p>
        </div>
        <div className="smpc-shield">
          <div className="shield-pulse" />
          NO DATA EXPOSED
        </div>
      </div>
      
      {/* Node network visualization */}
      <div className="smpc-nodes">
        {['Paris', 'Mumbai', 'São Paulo', 'Node 4', 'Node 5'].map((node, i) => (
          <div key={i} className={`smpc-node ${i < 3 ? 'active' : 'passive'}`}>
            <div className="node-circle">
              <div className="node-inner">{i + 1}</div>
            </div>
            <span>{node}</span>
            {i < 4 && <div className="node-connector" />}
          </div>
        ))}
      </div>
      
      {/* Computation steps */}
      <div className="smpc-steps">
        {smpcEvents.map((event, i) => (
          <div key={i} className={`smpc-step ${event.type}`}>
            <div className="step-indicator">
              {event.type === 'SMPC_MATCH_FOUND' ? '✅' : 
               event.type === 'SMPC_STARTED' ? '⚙️' : '🔢'}
            </div>
            <div className="step-content">
              <div className="step-message">{event.data.message}</div>
              {event.data.score && (
                <div className="step-score">
                  Score: <span className="score-value">{event.data.score}</span>
                </div>
              )}
              {event.data.encrypted && (
                <div className="step-encrypted">
                  <span className="encrypted-badge">ENCRYPTED</span>
                  <CryptoHashDisplay />
                </div>
              )}
            </div>
          </div>
        ))}
        {!smpcEvents.length && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                Awaiting SMPC trigger...
            </div>
        )}
      </div>
    </div>
  )
}

function CryptoHashDisplay() {
  const hashRef = useRef(null)
  
  useEffect(() => {
    // Animate scrambling hash characters
    const chars = '0123456789abcdef'
    let interval = setInterval(() => {
      if (hashRef.current) {
        hashRef.current.textContent = Array.from({ length: 16 }, () => 
          chars[Math.floor(Math.random() * chars.length)]
        ).join('')
      }
    }, 80)
    
    // Settle on final value after 2 seconds
    setTimeout(() => {
      clearInterval(interval)
      if (hashRef.current) {
        hashRef.current.textContent = 'a3f9d2e1b4c8f7a0'
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <code ref={hashRef} className="crypto-hash">????????????????</code>
  )
}
