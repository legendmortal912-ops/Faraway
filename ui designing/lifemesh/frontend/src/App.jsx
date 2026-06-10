import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLifemeshStore } from './store/lifemeshStore'
import HeroSection from './components/Hero/HeroSection'
import CommandCenter from './components/Dashboard/CommandCenter'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const { addEvent, setStats, setOrganPackage } = useLifemeshStore()
  const wsRef = useRef(null)

  useEffect(() => {
    // WebSocket connection
    wsRef.current = new WebSocket('ws://localhost:8000/ws')
    
    wsRef.current.onmessage = (msg) => {
      const event = JSON.parse(msg.data)
      
      // Route events to store
      addEvent(event)
      
      // Handle specific event types
      switch(event.type) {
        case 'SMPC_MATCH_FOUND':
        case 'DOMESTIC_MATCH_FOUND':
          setOrganPackage(prev => ({...prev, matchFound: true, ...event.data}))
          break
        case 'ROUTE_COMPUTED':
          setOrganPackage(prev => ({...prev, route: event.data}))
          break
        case 'ORGAN_DELIVERED':
          // Optionally handle delivery state
          break
      }
    }

    // Attempt to fetch initial stats and hospitals
    fetch('http://localhost:8000/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Failed to fetch initial stats:", err))

    return () => wsRef.current?.close()
  }, [])

  return (
    <div className="app">
      <HeroSection />
      <CommandCenter />
    </div>
  )
}
