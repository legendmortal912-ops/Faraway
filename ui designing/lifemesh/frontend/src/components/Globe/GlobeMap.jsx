import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { gsap } from 'gsap'
import { useLifemeshStore } from '../../store/lifemeshStore'

// Use placeholder token as requested if a real one isn't available
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE'

const HOSPITAL_NODES = [
  // Domestic (India)
  { id: 'H_AIIMS', name: 'AIIMS Delhi', coords: [77.2100, 28.5665], color: '#00d4ff', tier: 'domestic' },
  { id: 'H_FORTIS_NOIDA', name: 'Fortis Noida', coords: [77.3910, 28.5355], color: '#00d4ff', tier: 'domestic' },
  { id: 'H_SAFDARJUNG', name: 'Safdarjung Delhi', coords: [77.2075, 28.5706], color: '#00d4ff', tier: 'domestic' },
  // International (cross-border SMPC)
  { id: 'H_PARIS', name: 'Paris', coords: [2.3572, 48.8827], color: '#00ff88', tier: 'global' },
  { id: 'H_MUMBAI', name: 'Mumbai', coords: [72.8697, 19.1136], color: '#00ff88', tier: 'global' },
  { id: 'H_SAO_PAULO', name: 'São Paulo', coords: [-46.6892, -23.5989], color: '#00ff88', tier: 'global' },
]

export default function GlobeMap() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const { events, organPackage } = useLifemeshStore()

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 20],
      zoom: 1.5,
      projection: 'globe',
      fog: {
        color: 'rgb(3, 7, 18)',
        'high-color': 'rgb(10, 22, 40)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(3, 7, 18)',
        'star-intensity': 0.6
      }
    })

    map.current.on('load', () => {
      // Add hospital node markers
      HOSPITAL_NODES.forEach(node => {
        // Pulsing circle for each hospital
        map.current.addSource(`pulse-${node.id}`, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Point', coordinates: node.coords } }
        })
        
        map.current.addLayer({
          id: `pulse-${node.id}`,
          type: 'circle',
          source: `pulse-${node.id}`,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 6, 5, 16],
            'circle-color': '#00d4ff',
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-blur': 0.1
          }
        })

        // Custom HTML marker with pulse animation
        const el = document.createElement('div')
        el.className = 'hospital-marker'
        el.innerHTML = `
          <div class="marker-pulse"></div>
          <div class="marker-dot"></div>
          <div class="marker-label">${node.name}</div>
        `
        new mapboxgl.Marker(el).setLngLat(node.coords).addTo(map.current)
      })

      // Globe rotation animation
      let isRotating = true
      const rotateGlobe = () => {
        if (!isRotating || !map.current) return
        const center = map.current.getCenter()
        center.lng += 0.05
        map.current.setCenter(center)
        requestAnimationFrame(rotateGlobe)
      }
      rotateGlobe()

      // Stop rotation on interaction
      map.current.on('mousedown', () => { isRotating = false })
    })
    
    return () => {
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
    }
  }, [])

  // Focus map based on active demo tier
  useEffect(() => {
      const demoStartEvent = events.find(e => e.type === 'DONOR_REGISTERED');
      if (demoStartEvent && map.current) {
          if (demoStartEvent.data.tier === 'DOMESTIC') {
              // Zoom to Delhi NCR for domestic demo
              map.current.flyTo({
                  center: [77.2090, 28.55],
                  zoom: 10,
                  duration: 2000
              });
          } else {
              // Zoom out to globe for global demo
              map.current.flyTo({
                  center: [20, 20],
                  zoom: 1.5,
                  duration: 2000
              });
          }
      }
  }, [events]);

  // Draw flight arc when route is computed
  useEffect(() => {
    if (!organPackage?.route || !map.current) return
    
    const segments = organPackage.route.segments
    
    // Check if it's a domestic (ground only) or global (air included) route
    const airSegment = segments?.find(s => s.mode === 'air')
    
    if (airSegment) {
        // Global demo route mapping
        const arcCoords = createGreatCircleArc(
          [2.3572, 48.8827],   // Paris CDG
          [72.8697, 19.1136],  // Mumbai BOM
          100  // points along arc
        )

        if (map.current.getSource('flight-arc')) {
          map.current.getSource('flight-arc').setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: arcCoords }
          })
        } else {
          map.current.addSource('flight-arc', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'LineString', coordinates: arcCoords } }
          })
          
          map.current.addLayer({
            id: 'flight-arc-glow',
            type: 'line',
            source: 'flight-arc',
            paint: {
              'line-color': '#00ff88',
              'line-width': 4,
              'line-opacity': 0.8,
              'line-blur': 3
            }
          })
          
          map.current.addLayer({
            id: 'flight-arc',
            type: 'line',
            source: 'flight-arc',
            paint: {
              'line-color': '#ffffff',
              'line-width': 1.5,
              'line-opacity': 1,
              'line-dasharray': [2, 2]
            }
          })
        }

        // Fly globe to show the route
        map.current.flyTo({
          center: [37.6, 34.0],  // Midpoint between Paris and Mumbai
          zoom: 2.5,
          duration: 3000,
          essential: true
        })
    } else {
        // Domestic route mapping (Delhi to Noida)
        const groundCoords = [
            [77.2075, 28.5706], // Safdarjung
            [77.3910, 28.5355]  // Fortis Noida
        ];
        
        if (map.current.getSource('ground-route')) {
            map.current.getSource('ground-route').setData({
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: groundCoords }
            });
        } else {
            map.current.addSource('ground-route', {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'LineString', coordinates: groundCoords } }
            });
            
            map.current.addLayer({
                id: 'ground-route-glow',
                type: 'line',
                source: 'ground-route',
                paint: {
                    'line-color': '#00d4ff',
                    'line-width': 4,
                    'line-opacity': 0.8,
                    'line-blur': 3
                }
            });
        }
    }
  }, [organPackage?.route])

  return (
    <div className="globe-container">
      <div ref={mapContainer} className="globe-map" />
      <div className="globe-overlay">
        <div className="globe-title">GLOBAL NODE NETWORK</div>
        <div className="globe-node-count">
          <span className="count">6</span> Active Hospital Nodes
        </div>
      </div>
    </div>
  )
}

function createGreatCircleArc(start, end, numPoints) {
  const coords = []
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const lat = start[1] + t * (end[1] - start[1])
    const lng = start[0] + t * (end[0] - start[0])
    // Add altitude curve for arc effect
    const altitude = Math.sin(Math.PI * t) * 20
    coords.push([lng, lat + altitude * 0.1])
  }
  return coords
}
