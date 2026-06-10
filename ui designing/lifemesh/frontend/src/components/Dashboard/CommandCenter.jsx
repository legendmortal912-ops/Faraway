import React from 'react'
import axios from 'axios'
import GlobeMap from '../Globe/GlobeMap'
import EventFeed from './EventFeed'
import SMPCVisualizer from '../SMPC/SMPCVisualizer'
import ConsensusRing from '../BFT/ConsensusRing'
import { useLifemeshStore } from '../../store/lifemeshStore'

const API_URL = 'http://localhost:8000'

export default function CommandCenter() {
  const { demoRunning, setDemoRunning, resetDemo, events, byzantineNode } = useLifemeshStore()

  // Find the latest handoff consensus event
  const latestConsensus = [...events].reverse().find(e => 
      e.type === 'HANDOFF_CONFIRMED' || e.type === 'ATTACK_OVERRULED'
  )?.data || null;

  const runDemo = async (type) => {
    if (demoRunning) return
    resetDemo()
    setDemoRunning(true)
    try {
      const endpoint = type === 'domestic' ? '/api/simulate/domestic-demo' : '/api/simulate/full-demo'
      await axios.post(`${API_URL}${endpoint}`)
    } catch (err) {
      console.error('Failed to start demo', err)
      setDemoRunning(false)
    }
  }

  return (
    <section className="command-center">
      <div className="command-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>OPERATION CONTROL</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Live network status and logistics tracking</p>
        </div>
        <div className="command-actions">
          <button 
            className={`demo-trigger domestic ${demoRunning ? 'disabled' : ''}`}
            onClick={() => runDemo('domestic')}
            disabled={demoRunning}
            style={{ padding: '0.75rem 1.5rem', width: 'auto' }}
          >
            Layer 0: Domestic Match
          </button>
          <button 
            className={`demo-trigger ${demoRunning ? 'disabled' : ''}`}
            onClick={() => runDemo('global')}
            disabled={demoRunning}
            style={{ padding: '0.75rem 1.5rem', width: 'auto' }}
          >
            Layer 1: Global SMPC Match
          </button>
        </div>
      </div>

      <div className="command-grid">
        <div className="col-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlobeMap />
          <SMPCVisualizer />
        </div>
        
        <div className="col-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <EventFeed />
          <ConsensusRing consensus={latestConsensus} byzantineNode={byzantineNode} />
        </div>
      </div>
    </section>
  )
}
