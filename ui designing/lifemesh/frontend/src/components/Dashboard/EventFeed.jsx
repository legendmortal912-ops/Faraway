import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useLifemeshStore } from '../../store/lifemeshStore'

const EVENT_CONFIG = {
  DONOR_REGISTERED: { icon: '🫁', color: 'var(--accent-primary)', label: 'DONOR' },
  SMPC_STARTED: { icon: '🔐', color: 'var(--accent-primary)', label: 'SMPC' },
  SMPC_COMPUTATION_STEP: { icon: '⚙️', color: 'var(--accent-primary)', label: 'COMPUTE' },
  SMPC_MATCH_FOUND: { icon: '✅', color: 'var(--accent-success)', label: 'MATCH' },
  ROUTING_STARTED: { icon: '🗺️', color: 'var(--accent-primary)', label: 'ROUTING' },
  ROUTE_COMPUTED: { icon: '✈️', color: 'var(--accent-success)', label: 'ROUTE' },
  HANDOFF_INITIATED: { icon: '🤝', color: 'var(--accent-warning)', label: 'HANDOFF' },
  BYZANTINE_ATTACK: { icon: '⚠️', color: 'var(--accent-danger)', label: 'ATTACK' },
  ATTACK_OVERRULED: { icon: '🛡️', color: 'var(--accent-success)', label: 'DEFENDED' },
  HANDOFF_CONFIRMED: { icon: '✅', color: 'var(--accent-success)', label: 'CONFIRMED' },
  ORGAN_DELIVERED: { icon: '💚', color: 'var(--accent-success)', label: 'DELIVERED' },
  DOMESTIC_SEARCH_STARTED: { icon: '🔍', color: 'var(--accent-primary)', label: 'SEARCH' },
  DOMESTIC_NO_MATCH: { icon: '❌', color: 'var(--accent-warning)', label: 'NO MATCH' },
  DOMESTIC_MATCH_FOUND: { icon: '✅', color: 'var(--accent-success)', label: 'MATCH' },
}

export default function EventFeed() {
  const { events } = useLifemeshStore()
  const feedRef = useRef(null)
  
  useEffect(() => {
    if (!events.length) return
    
    // Animate latest event in
    const lastEvent = feedRef.current?.querySelector('.event-item:first-child')
    if (lastEvent) {
      gsap.from(lastEvent, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power3.out'
      })
    }
    
    // Flash effect for critical events
    const latest = events[events.length - 1]
    if (latest?.type === 'BYZANTINE_ATTACK') {
      gsap.to('.command-center', {
        boxShadow: '0 0 60px rgba(255,51,102,0.5)',
        duration: 0.3,
        yoyo: true,
        repeat: 3
      })
    }
  }, [events.length])

  return (
    <div className="event-feed glow-card">
      <div className="feed-header">
        <span className="feed-title">LIVE EVENT STREAM</span>
        <div className="feed-status">
          <div className="feed-dot" />
          LIVE
        </div>
      </div>
      
      <div className="feed-items" ref={feedRef}>
        {[...events].reverse().map((event, i) => {
          const config = EVENT_CONFIG[event.type] || 
                        { icon: '📡', color: 'var(--text-secondary)', label: 'EVENT' }
          return (
            <div key={`${event.type}-${i}`} className={`event-item event-${event.type.toLowerCase()}`}>
              <div className="event-icon">{config.icon}</div>
              <div className="event-body">
                <div className="event-header">
                  <span className="event-label" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span className="event-time">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="event-message">{event.data.message}</div>
                {event.data.score && (
                  <div className="event-score">
                    Match Score: <strong>{event.data.score}%</strong>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        {!events.length && (
          <div className="feed-empty" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div className="empty-pulse" />
            Awaiting network events...
          </div>
        )}
      </div>
    </div>
  )
}
