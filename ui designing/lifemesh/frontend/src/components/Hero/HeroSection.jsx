import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const mountRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Three.js setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    camera.position.z = 5

    // Create particle network representing hospital nodes
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      
      // Cyan particles
      colors[i * 3] = 0
      colors[i * 3 + 1] = 0.83
      colors[i * 3 + 2] = 1
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    })
    
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      particles.rotation.x += 0.0003
      particles.rotation.y += 0.0005
      renderer.render(scene, camera)
    }
    animate()

    // GSAP scroll-based camera movement
    gsap.to(camera.position, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      z: 8,
      ease: 'none'
    })

    return () => {
      renderer.dispose()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // GSAP text reveal on mount
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 })
    
    tl.from('.hero-eyebrow', { 
      opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' 
    })
    .from('.hero-title span', { 
      opacity: 0, y: 60, duration: 1, stagger: 0.1, ease: 'power4.out' 
    }, '-=0.4')
    .from('.hero-subtitle', { 
      opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' 
    }, '-=0.6')
    .from('.hero-stats', { 
      opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out' 
    }, '-=0.4')
    .from('.hero-cta', { 
      opacity: 0, scale: 0.9, duration: 0.6, ease: 'back.out(1.7)' 
    }, '-=0.3')
  }, [])

  return (
    <section className="hero" ref={mountRef}>
      <canvas ref={canvasRef} className="hero-canvas" />
      
      <div className="hero-content">
        <p className="hero-eyebrow">THE LIFEMESH PROTOCOL</p>
        
        <h1 className="hero-title">
          {'Every Second'.split('').map((char, i) => (
            <span key={`w1-${i}`}>{char === ' ' ? '\u00A0' : char}</span>
          ))}
          <br />
          {'Costs a Life.'.split('').map((char, i) => (
            <span key={`w2-${i}`} className="accent">{char === ' ' ? '\u00A0' : char}</span>
          ))}
        </h1>
        
        <p className="hero-subtitle">
          A cryptographically sovereign organ logistics network.<br />
          Zero data exposure. Global reach. Human lives, saved.
        </p>
        
        <div className="hero-stats">
          {[
            { value: '114,000+', label: 'Patients waiting in the US alone' },
            { value: '20', label: 'People die daily on the waitlist' },
            { value: '30%', label: 'Of organs wasted due to logistics' }
          ].map((stat, i) => (
            <div key={i} className="hero-stat">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
        
        <button className="hero-cta" onClick={() => {
          document.querySelector('.command-center').scrollIntoView({ behavior: 'smooth' })
        }}>
          Launch Live Demo
          <span className="cta-arrow">↓</span>
        </button>
      </div>
      
      <div className="hero-scroll-indicator">
        <div className="scroll-line" />
        <span>Scroll to enter</span>
      </div>
    </section>
  )
}
