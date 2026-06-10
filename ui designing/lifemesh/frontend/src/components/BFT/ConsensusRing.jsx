import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function ConsensusRing({ consensus, byzantineNode }) {
  const svgRef = useRef(null)
  const nodeCount = 7
  const radius = 80
  const cx = 120
  const cy = 120
  
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i * 2 * Math.PI / nodeCount) - Math.PI / 2
    return {
      id: i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      isByzantine: i === byzantineNode,
      signed: consensus?.signatures?.[i]?.is_valid
    }
  })

  useEffect(() => {
    if (!consensus) return
    
    // Animate consensus lines appearing
    const tl = gsap.timeline()
    
    nodes.forEach((node, i) => {
      if (node.signed) {
        tl.from(`#consensus-line-${i}`, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        }, i * 0.1)
      }
    })
    
    // Byzantine node shake animation
    if (byzantineNode !== null && byzantineNode !== undefined) {
      gsap.to(`#node-${byzantineNode}`, {
        x: '+=3',
        duration: 0.1,
        repeat: 10,
        yoyo: true,
        ease: 'none'
      })
    }
    
    // Consensus achieved pulse
    if (consensus?.consensus) {
      gsap.fromTo('.consensus-ring-outer', 
        { scale: 0.9, opacity: 0.5, transformOrigin: 'center' },
        { scale: 1.1, opacity: 0, duration: 1, repeat: 3, ease: 'power2.out', transformOrigin: 'center' }
      )
    }
  }, [consensus, byzantineNode])

  return (
    <div className="consensus-ring-container glow-card">
      <h3>BFT Consensus Network</h3>
      <p className="consensus-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {consensus?.consensus 
          ? `✅ Consensus reached (${consensus.valid_signatures}/7 honest nodes)`
          : `Awaiting consensus (${consensus?.valid_signatures || 0}/5 required)`
        }
      </p>
      
      <svg ref={svgRef} viewBox="0 0 240 240" className="consensus-svg">
        {/* Outer ring */}
        <circle className="consensus-ring-outer" cx={cx} cy={cy} r={radius + 20} 
                fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
        
        {/* Consensus lines from center to nodes */}
        {nodes.map(node => (
          node.signed && (
            <line
              key={node.id}
              id={`consensus-line-${node.id}`}
              x1={cx} y1={cy}
              x2={node.x} y2={node.y}
              stroke={node.isByzantine ? '#ff3366' : '#00ff88'}
              strokeWidth={node.isByzantine ? 1 : 1.5}
              strokeDasharray={node.isByzantine ? '4,4' : 'none'}
              opacity={0.6}
            />
          )
        ))}
        
        {/* Node circles */}
        {nodes.map(node => (
          <g key={node.id} id={`node-${node.id}`}>
            <circle
              cx={node.x} cy={node.y} r={12}
              fill={node.isByzantine ? 'rgba(255,51,102,0.3)' : 
                    node.signed ? 'rgba(0,255,136,0.2)' : 'rgba(0,212,255,0.1)'}
              stroke={node.isByzantine ? '#ff3366' : 
                      node.signed ? '#00ff88' : '#00d4ff'}
              strokeWidth={1.5}
            />
            <text x={node.x} y={node.y + 4} 
                  textAnchor="middle" 
                  fill={node.isByzantine ? '#ff3366' : '#e8f4f8'}
                  fontSize="8"
                  fontFamily="JetBrains Mono">
              {node.isByzantine ? '⚠' : node.id + 1}
            </text>
          </g>
        ))}
        
        {/* Center node (coordinator) */}
        <circle cx={cx} cy={cy} r={15} 
                fill="rgba(0,212,255,0.2)" 
                stroke="#00d4ff" strokeWidth={2} />
        <text x={cx} y={cy + 4} textAnchor="middle" 
              fill="#00d4ff" fontSize="8" fontFamily="JetBrains Mono">
          COORD
        </text>
      </svg>
      
      {consensus?.attack_overruled && (
        <div className="attack-overruled-badge">
          ⚡ Byzantine Attack Overruled
        </div>
      )}
    </div>
  )
}
