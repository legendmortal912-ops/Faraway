import { create } from 'zustand'

export const useLifemeshStore = create((set) => ({
  events: [],
  organPackage: null,
  hospitals: [],
  stats: {
    active_nodes: 3,
    patients_in_network: 0,
    organs_matched_today: 0,
    plain_data_exposures: 0,
    byzantine_attacks_blocked: 0
  },
  byzantineNode: null,
  demoRunning: false,
  
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event],
    byzantineNode: event.type === 'BYZANTINE_ATTACK' 
      ? parseInt(event.data.attacking_node.split('_')[1]) 
      : event.type === 'ATTACK_OVERRULED' ? null : state.byzantineNode
  })),
  
  setOrganPackage: (updater) => set((state) => ({
    organPackage: typeof updater === 'function' 
      ? updater(state.organPackage) 
      : updater
  })),
  
  setHospitals: (hospitals) => set({ hospitals }),
  setStats: (stats) => set({ stats }),
  setDemoRunning: (running) => set({ demoRunning: running }),
  resetDemo: () => set({ events: [], organPackage: null, byzantineNode: null, demoRunning: false })
}))
