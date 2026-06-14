import { create } from 'zustand';

const WS_URL = 'ws://localhost:8000/ws';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO HOSPITAL ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_HOSPITALS = [
  // ── DONOR REGISTRATION HOSPITALS ──
  {
    hospital_id: 'H_AIIMS',
    name: 'AIIMS Delhi',
    city: 'Delhi', country: 'India', country_code: 'IN',
    tier: 'Layer 0', national_registry_id: 'NOTTO-DL-001',
    has_internal_fleet: true, is_coordinator: false,
    email: 'admin@aiims.edu', password: 'aiims123',
    specializations: ['Kidney', 'Liver', 'Heart'],
  },
  {
    hospital_id: 'H_APOLLO',
    name: 'Apollo Hospitals Mumbai',
    city: 'Mumbai', country: 'India', country_code: 'IN',
    tier: 'Layer 0', national_registry_id: 'NOTTO-MH-004',
    has_internal_fleet: true, is_coordinator: false,
    email: 'admin@apollo.com', password: 'apollo123',
    specializations: ['Heart', 'Lung', 'Liver'],
  },
  {
    hospital_id: 'H_MANIPAL',
    name: 'Manipal Hospital Bangalore',
    city: 'Bangalore', country: 'India', country_code: 'IN',
    tier: 'Layer 0', national_registry_id: 'NOTTO-KA-007',
    has_internal_fleet: false, is_coordinator: false,
    email: 'admin@manipal.edu', password: 'manipal123',
    specializations: ['Kidney', 'Liver'],
  },
  {
    hospital_id: 'H_PGI',
    name: 'PGI Chandigarh',
    city: 'Chandigarh', country: 'India', country_code: 'IN',
    tier: 'Layer 0', national_registry_id: 'NOTTO-PB-003',
    has_internal_fleet: false, is_coordinator: false,
    email: 'admin@pgi.edu.in', password: 'pgi123',
    specializations: ['Cornea', 'Kidney', 'Pancreas'],
  },
  {
    hospital_id: 'H_LARIB',
    name: 'Hôpital Lariboisière',
    city: 'Paris', country: 'France', country_code: 'FR',
    tier: 'Layer 1', national_registry_id: 'ABM-FR-012',
    has_internal_fleet: false, is_coordinator: false,
    email: 'admin@larib.fr', password: 'paris123',
    specializations: ['Kidney', 'Heart', 'Liver'],
  },
  {
    hospital_id: 'H_KCH',
    name: "King's College Hospital",
    city: 'London', country: 'United Kingdom', country_code: 'GB',
    tier: 'Layer 1', national_registry_id: 'NHSBT-LON-009',
    has_internal_fleet: true, is_coordinator: false,
    email: 'admin@kch.nhs.uk', password: 'kings123',
    specializations: ['Kidney', 'Liver', 'Pancreas'],
  },

  // ── NOTTO COORDINATOR (sees all network donors, can accept) ──
  {
    hospital_id: 'H_NOTTO',
    name: 'NOTTO Coordination Hub',
    city: 'Delhi', country: 'India', country_code: 'IN',
    tier: 'Coordinator', national_registry_id: 'NOTTO-HQ-000',
    has_internal_fleet: false, is_coordinator: true,
    email: 'coord@notto.gov.in', password: 'notto123',
    specializations: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO LOGISTICS ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_CARRIERS = [
  // ── INDEPENDENT CARRIERS ──
  {
    carrier_id: 'C_DHL',
    carrier_name: 'DHL Medical Express',
    carrier_type: 'INDEPENDENT',
    operating_regions: ['Global'],
    fleet_size: 18,
    email: 'ops@dhl-medical.com', password: 'dhl123',
  },
  {
    carrier_id: 'C_WORLD',
    carrier_name: 'World Courier Medical',
    carrier_type: 'INDEPENDENT',
    operating_regions: ['Europe', 'Asia', 'Middle East'],
    fleet_size: 11,
    email: 'ops@worldcourier.com', password: 'world123',
  },
  {
    carrier_id: 'C_BLUE',
    carrier_name: 'BlueDart MedLife',
    carrier_type: 'INDEPENDENT',
    operating_regions: ['India', 'Southeast Asia'],
    fleet_size: 24,
    email: 'ops@bluedart-med.com', password: 'blue123',
  },

  // ── HOSPITAL-OWNED FLEETS ──
  {
    carrier_id: 'C_AIIMS_FLEET',
    carrier_name: 'AIIMS Delhi Internal Fleet',
    carrier_type: 'HOSPITAL_FLEET',
    parent_hospital: 'H_AIIMS',
    operating_regions: ['Delhi NCR', 'North India'],
    fleet_size: 4,
    email: 'fleet@aiims.edu', password: 'aiims-fleet123',
  },
  {
    carrier_id: 'C_APOLLO_FLEET',
    carrier_name: 'Apollo MedShift',
    carrier_type: 'HOSPITAL_FLEET',
    parent_hospital: 'H_APOLLO',
    operating_regions: ['Maharashtra', 'West India'],
    fleet_size: 6,
    email: 'fleet@apollo.com', password: 'apollo-fleet123',
  },
  {
    carrier_id: 'C_KCH_FLEET',
    carrier_name: "King's MedTransport",
    carrier_type: 'HOSPITAL_FLEET',
    parent_hospital: 'H_KCH',
    operating_regions: ['UK', 'Europe'],
    fleet_size: 3,
    email: 'fleet@kch.nhs.uk', password: 'kings-fleet123',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SEEDED NETWORK DONORS (registered by hospitals — PII is a placeholder)
// ─────────────────────────────────────────────────────────────────────────────
const NETWORK_DONORS = [
  {
    donor_id: 'DNR-001', hospital_id: 'H_AIIMS', hospital_name: 'AIIMS Delhi', city: 'Delhi',
    // Biological only (PII never shown to coordinator)
    blood_type: 'O+', organs: ['Kidney L', 'Kidney R'],
    hla_a1: 2, hla_a2: 24, hla_b1: 7, hla_b2: 44, hla_dr1: 4, hla_dr2: 11,
    viability_expires: '2026-06-10T20:00:00Z', status: 'AVAILABLE', tier: 'DOMESTIC',
    registered_at: '2026-06-10T14:23:00Z', weight: 72, height: 175,
  },
  {
    donor_id: 'DNR-002', hospital_id: 'H_APOLLO', hospital_name: 'Apollo Hospitals Mumbai', city: 'Mumbai',
    blood_type: 'A+', organs: ['Liver'],
    hla_a1: 1, hla_a2: 3, hla_b1: 8, hla_b2: 57, hla_dr1: 3, hla_dr2: 7,
    viability_expires: '2026-06-10T22:30:00Z', status: 'AVAILABLE', tier: 'DOMESTIC',
    registered_at: '2026-06-10T15:01:00Z', weight: 65, height: 162,
  },
  {
    donor_id: 'DNR-003', hospital_id: 'H_MANIPAL', hospital_name: 'Manipal Hospital Bangalore', city: 'Bangalore',
    blood_type: 'B+', organs: ['Heart', 'Lung L'],
    hla_a1: 11, hla_a2: 29, hla_b1: 44, hla_b2: 62, hla_dr1: 1, hla_dr2: 15,
    viability_expires: '2026-06-10T18:00:00Z', status: 'PENDING_MATCH', tier: 'DOMESTIC',
    registered_at: '2026-06-10T12:45:00Z', weight: 80, height: 180,
  },
  {
    donor_id: 'DNR-004', hospital_id: 'H_PGI', hospital_name: 'PGI Chandigarh', city: 'Chandigarh',
    blood_type: 'AB+', organs: ['Cornea', 'Kidney L'],
    hla_a1: 3, hla_a2: 30, hla_b1: 13, hla_b2: 35, hla_dr1: 6, hla_dr2: 13,
    viability_expires: '2026-06-11T06:00:00Z', status: 'AVAILABLE', tier: 'DOMESTIC',
    registered_at: '2026-06-10T16:10:00Z', weight: 68, height: 170,
  },
  {
    donor_id: 'DNR-005', hospital_id: 'H_LARIB', hospital_name: 'Hôpital Lariboisière', city: 'Paris',
    blood_type: 'O-', organs: ['Kidney R', 'Pancreas'],
    hla_a1: 1, hla_a2: 2, hla_b1: 7, hla_b2: 8, hla_dr1: 3, hla_dr2: 4,
    viability_expires: '2026-06-10T23:00:00Z', status: 'AVAILABLE', tier: 'CROSS_BORDER',
    registered_at: '2026-06-10T13:30:00Z', weight: 74, height: 178,
  },
  {
    donor_id: 'DNR-006', hospital_id: 'H_KCH', hospital_name: "King's College Hospital", city: 'London',
    blood_type: 'A-', organs: ['Liver', 'Kidney L'],
    hla_a1: 24, hla_a2: 26, hla_b1: 38, hla_b2: 44, hla_dr1: 4, hla_dr2: 7,
    viability_expires: '2026-06-11T02:00:00Z', status: 'AVAILABLE', tier: 'CROSS_BORDER',
    registered_at: '2026-06-10T17:05:00Z', weight: 71, height: 176,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PER-HOSPITAL SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
const ALL_PATIENTS = {
  H_AIIMS: [
    { patient_id: 'P-AIIMS-01', blood_type: 'O+', organ_needed: 'Kidney', urgency_score: 0.75, date_registered: '2026-01-15', attending_surgeon: 'Dr. V. Mehta', status: 'Searching' },
    { patient_id: 'P-AIIMS-02', blood_type: 'A+', organ_needed: 'Liver', urgency_score: 1.0, date_registered: '2026-02-01', attending_surgeon: 'Dr. S. Reddy', status: 'Critical' },
    { patient_id: 'P-AIIMS-03', blood_type: 'B+', organ_needed: 'Heart', urgency_score: 0.5, date_registered: '2026-03-10', attending_surgeon: 'Dr. R. Singh', status: 'Searching' },
  ],
  H_APOLLO: [
    { patient_id: 'P-APO-01', blood_type: 'B-', organ_needed: 'Liver', urgency_score: 0.9, date_registered: '2026-01-20', attending_surgeon: 'Dr. P. Shah', status: 'Critical' },
    { patient_id: 'P-APO-02', blood_type: 'O+', organ_needed: 'Heart', urgency_score: 1.0, date_registered: '2026-02-14', attending_surgeon: 'Dr. N. Joshi', status: 'Critical' },
  ],
  H_MANIPAL: [
    { patient_id: 'P-MNP-01', blood_type: 'A-', organ_needed: 'Kidney', urgency_score: 0.6, date_registered: '2026-02-28', attending_surgeon: 'Dr. A. Kumar', status: 'Searching' },
  ],
  H_PGI: [
    { patient_id: 'P-PGI-01', blood_type: 'AB+', organ_needed: 'Cornea', urgency_score: 0.4, date_registered: '2026-03-01', attending_surgeon: 'Dr. M. Sharma', status: 'Searching' },
    { patient_id: 'P-PGI-02', blood_type: 'B+', organ_needed: 'Kidney', urgency_score: 0.8, date_registered: '2026-01-05', attending_surgeon: 'Dr. R. Bahl', status: 'Searching' },
  ],
  H_LARIB: [
    { patient_id: 'P-LAR-01', blood_type: 'O-', organ_needed: 'Kidney', urgency_score: 0.85, date_registered: '2026-02-10', attending_surgeon: 'Dr. C. Dubois', status: 'Searching' },
    { patient_id: 'P-LAR-02', blood_type: 'A+', organ_needed: 'Liver', urgency_score: 0.7, date_registered: '2026-03-05', attending_surgeon: 'Dr. M. Bernard', status: 'Searching' },
  ],
  H_KCH: [
    { patient_id: 'P-KCH-01', blood_type: 'A-', organ_needed: 'Liver', urgency_score: 0.9, date_registered: '2026-01-30', attending_surgeon: 'Dr. J. Williams', status: 'Critical' },
    { patient_id: 'P-KCH-02', blood_type: 'O+', organ_needed: 'Kidney', urgency_score: 0.65, date_registered: '2026-02-22', attending_surgeon: 'Dr. S. Thompson', status: 'Searching' },
  ],
  H_NOTTO: [],
};

const ALL_HISTORY = {
  H_AIIMS: [
    { case_id: 'CASE-001', date: '2026-05-14', organ: 'Kidney', direction: 'Incoming', partner_city: 'Noida, India', tier: 'DOMESTIC', compatibility: 94.3, transit_time: '3h 12m', viability_at_delivery: '68%', cold_chain_events: 0, rerouting_events: 0, outcome: 'Delivered' },
    { case_id: 'CASE-002', date: '2026-04-28', organ: 'Liver', direction: 'Outgoing', partner_city: 'Mumbai, India', tier: 'DOMESTIC', compatibility: 88.1, transit_time: '5h 44m', viability_at_delivery: '42%', cold_chain_events: 1, rerouting_events: 1, outcome: 'Delivered' },
    { case_id: 'CASE-003', date: '2026-03-03', organ: 'Heart', direction: 'Incoming', partner_city: 'Paris, France', tier: 'CROSS_BORDER', compatibility: 91.7, transit_time: '9h 22m', viability_at_delivery: '81%', cold_chain_events: 0, rerouting_events: 0, outcome: 'Delivered' },
  ],
  H_APOLLO: [
    { case_id: 'CASE-A01', date: '2026-05-20', organ: 'Heart', direction: 'Incoming', partner_city: 'Bangalore, India', tier: 'DOMESTIC', compatibility: 96.1, transit_time: '1h 50m', viability_at_delivery: '89%', cold_chain_events: 0, rerouting_events: 0, outcome: 'Delivered' },
    { case_id: 'CASE-A02', date: '2026-04-10', organ: 'Liver', direction: 'Outgoing', partner_city: 'Hyderabad, India', tier: 'DOMESTIC', compatibility: 82.5, transit_time: '2h 10m', viability_at_delivery: '74%', cold_chain_events: 0, rerouting_events: 0, outcome: 'Delivered' },
  ],
  H_MANIPAL: [
    { case_id: 'CASE-M01', date: '2026-05-01', organ: 'Kidney', direction: 'Outgoing', partner_city: 'Chennai, India', tier: 'DOMESTIC', compatibility: 88.0, transit_time: '4h 20m', viability_at_delivery: '61%', cold_chain_events: 1, rerouting_events: 0, outcome: 'Delivered' },
  ],
  H_PGI: [],
  H_LARIB: [
    { case_id: 'CASE-L01', date: '2026-05-12', organ: 'Kidney', direction: 'Incoming', partner_city: 'Lyon, France', tier: 'DOMESTIC', compatibility: 93.8, transit_time: '3h 30m', viability_at_delivery: '77%', cold_chain_events: 0, rerouting_events: 0, outcome: 'Delivered' },
    { case_id: 'CASE-L02', date: '2026-04-22', organ: 'Liver', direction: 'Outgoing', partner_city: 'Delhi, India', tier: 'CROSS_BORDER', compatibility: 91.7, transit_time: '9h 22m', viability_at_delivery: '81%', cold_chain_events: 0, rerouting_events: 0, outcome: 'Delivered' },
  ],
  H_KCH: [
    { case_id: 'CASE-K01', date: '2026-05-18', organ: 'Liver', direction: 'Incoming', partner_city: 'Edinburgh, UK', tier: 'DOMESTIC', compatibility: 89.4, transit_time: '1h 45m', viability_at_delivery: '85%', cold_chain_events: 0, rerouting_events: 0, outcome: 'Delivered' },
  ],
  H_NOTTO: [],
};

const DEMO_VEHICLES = [
  { vehicle_id: 'AMB-DL-01', type: 'Ground Ambulance', registration: 'DL-01-AB-1234', driver_name: 'Rajesh Kumar', driver_contact: '+91-9876543210', max_box_capacity: 3, current_status: 'IN_TRANSIT', gateway_mac: 'B8:27:EB:01:02:03', current_run: 'RUN-2041', carrier_id: 'H_AIIMS' },
  { vehicle_id: 'AMB-DL-02', type: 'Ground Ambulance', registration: 'DL-01-CD-5678', driver_name: 'Suresh Patel', driver_contact: '+91-9876543211', max_box_capacity: 2, current_status: 'IDLE', gateway_mac: 'B8:27:EB:04:05:06', current_run: null, carrier_id: 'H_AIIMS' },
  { vehicle_id: 'AMB-MH-01', type: 'Ground Ambulance', registration: 'MH-04-AB-9999', driver_name: 'Pradeep Sawant', driver_contact: '+91-9876541000', max_box_capacity: 2, current_status: 'IN_TRANSIT', gateway_mac: 'B8:27:EB:07:08:09', current_run: 'RUN-2042', carrier_id: 'H_APOLLO' },
  { vehicle_id: 'AMB-KCH-01', type: 'Ground Ambulance', registration: 'LN-12-AB-4422', driver_name: 'James Harrow', driver_contact: '+44-7700900123', max_box_capacity: 2, current_status: 'IDLE', gateway_mac: 'B8:27:EB:10:11:12', current_run: null, carrier_id: 'H_KCH' },
];

const DEMO_BOXES = [
  { box_id: 'BOX-KDN-01', hardware_mac: 'C4:BE:84:01:02:03', assigned_vehicle: 'AMB-DL-01', organ_profile: 'Kidney (2-8°C)', status: 'TRANSIT', last_temp: 4.2, last_updated: new Date().toISOString(), alert_count: 0 },
  { box_id: 'BOX-HRT-02', hardware_mac: 'C4:BE:84:04:05:06', assigned_vehicle: 'AMB-DL-01', organ_profile: 'Heart (0-4°C)', status: 'TRANSIT', last_temp: 3.8, last_updated: new Date().toISOString(), alert_count: 1 },
  { box_id: 'BOX-LVR-03', hardware_mac: 'C4:BE:84:07:08:09', assigned_vehicle: 'AMB-MH-01', organ_profile: 'Liver (0-4°C)', status: 'TRANSIT', last_temp: 2.9, last_updated: new Date().toISOString(), alert_count: 0 },
];

const DEMO_RUNS = [
  { run_id: 'RUN-2041', assigned_vehicle: 'AMB-DL-01', boxes: ['BOX-KDN-01', 'BOX-HRT-02'], from_city: 'Delhi', to_city: 'Mumbai', eta: '2026-06-10T22:00:00Z', status: 'ACTIVE', cold_chain_health: 'GOOD' },
  { run_id: 'RUN-2042', assigned_vehicle: 'AMB-MH-01', boxes: ['BOX-LVR-03'], from_city: 'Mumbai', to_city: 'Bangalore', eta: '2026-06-10T23:30:00Z', status: 'ACTIVE', cold_chain_health: 'GOOD' },
];

// ─────────────────────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────────────────────
export const useLifeMeshStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,

  login: (email, password, role) => {
    if (role === 'hospital') {
      const match = DEMO_HOSPITALS.find(h => h.email === email && h.password === password);
      if (match) {
        const user = {
          role: 'hospital',
          hospital_id: match.hospital_id,
          name: match.name,
          email: match.email,
          has_internal_fleet: match.has_internal_fleet,
          is_coordinator: match.is_coordinator,
          city: match.city,
          tier: match.tier,
        };
        sessionStorage.setItem('lifemesh_user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
        // Load this hospital's local data
        set({
          localPatients: ALL_PATIENTS[match.hospital_id] || [],
          localHistory: ALL_HISTORY[match.hospital_id] || [],
        });
        return { ok: true };
      }
      return { ok: false, error: 'Invalid credentials. Check the credentials card below.' };
    } else {
      const match = DEMO_CARRIERS.find(c => c.email === email && c.password === password);
      if (match) {
        const user = {
          role: 'logistics',
          carrier_id: match.carrier_id,
          name: match.carrier_name,
          email: match.email,
          carrier_type: match.carrier_type,
          parent_hospital: match.parent_hospital || null,
        };
        sessionStorage.setItem('lifemesh_user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
        return { ok: true };
      }
      return { ok: false, error: 'Invalid credentials. Check the credentials card below.' };
    }
  },

  signup: (formData, role) => {
    const user = role === 'hospital'
      ? { role: 'hospital', hospital_id: 'H_NEW_' + Date.now(), name: formData.hospital_name, email: formData.email, has_internal_fleet: formData.has_internal_fleet === 'yes', is_coordinator: false }
      : { role: 'logistics', carrier_id: 'C_NEW_' + Date.now(), name: formData.company_name, email: formData.email, carrier_type: formData.carrier_type };
    sessionStorage.setItem('lifemesh_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
    return { ok: true };
  },

  logout: () => {
    sessionStorage.removeItem('lifemesh_user');
    set({ user: null, isAuthenticated: false, localPatients: [], localDonors: [], localHistory: [] });
  },

  restoreSession: () => {
    try {
      const saved = sessionStorage.getItem('lifemesh_user');
      if (saved) {
        const user = JSON.parse(saved);
        set({
          user, isAuthenticated: true,
          localPatients: ALL_PATIENTS[user.hospital_id] || [],
          localHistory: ALL_HISTORY[user.hospital_id] || [],
        });
      }
    } catch {}
  },

  // ── Hospital Data ─────────────────────────────────────────────────────────
  hospitals: DEMO_HOSPITALS,
  stats: null,
  packages: [],
  nodeStatus: [],

  // ── Per-Hospital Local Data ───────────────────────────────────────────────
  localPatients: [],
  localDonors: [],
  localHistory: [],
  localVehicles: DEMO_VEHICLES,
  localBoxes: DEMO_BOXES,
  localRuns: DEMO_RUNS,

  // ── Network Donors (visible to coordinator) ───────────────────────────────
  networkDonors: NETWORK_DONORS,

  addPatient: (patient) => set(s => ({
    localPatients: [...s.localPatients, {
      ...patient,
      patient_id: `P-NEW-${String(s.localPatients.length + 1).padStart(3, '0')}`,
      status: 'Searching',
    }]
  })),

  addDonor: (donor) => {
    const newDonor = {
      ...donor,
      donor_id: `DNR-${Date.now()}`,
      registered_at: new Date().toISOString(),
      status: 'AVAILABLE',
    };
    set(s => ({
      localDonors: [...s.localDonors, newDonor],
      // also push into networkDonors so coordinator can see it
      networkDonors: [
        ...s.networkDonors,
        {
          donor_id: newDonor.donor_id,
          hospital_id: donor.hospital_id,
          hospital_name: s.hospitals.find(h => h.hospital_id === donor.hospital_id)?.name || 'Unknown',
          city: s.hospitals.find(h => h.hospital_id === donor.hospital_id)?.city || '',
          blood_type: donor.blood_type,
          organs: donor.organs || [],
          hla_a1: parseInt(donor.hla_a1) || 0,
          hla_a2: parseInt(donor.hla_a2) || 0,
          hla_b1: parseInt(donor.hla_b1) || 0,
          hla_b2: parseInt(donor.hla_b2) || 0,
          hla_dr1: parseInt(donor.hla_dr1) || 0,
          hla_dr2: parseInt(donor.hla_dr2) || 0,
          viability_expires: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          status: 'AVAILABLE',
          tier: ['IN', 'US', 'GB', 'FR', 'DE'].includes(s.hospitals.find(h => h.hospital_id === donor.hospital_id)?.country_code) ? 'DOMESTIC' : 'CROSS_BORDER',
          registered_at: new Date().toISOString(),
          weight: donor.weight || '',
          height: donor.height || '',
        }
      ]
    }));
  },

  acceptDonor: (donor_id) => set(s => {
    const donor = s.networkDonors.find(d => d.donor_id === donor_id);
    if (!donor) return s;

    const newAlert = {
      type: 'LOGISTICS_DISPATCH_REQUIRED',
      message: `New Accepted Donor (${donor_id}) requires carrier dispatch.`,
      ts: new Date().toISOString(),
      level: 'INFO'
    };

    const newRunId = `RUN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBoxId = `BOX-${donor.organs[0]?.substring(0,3).toUpperCase() || 'ORG'}-${Math.floor(10 + Math.random() * 90)}`;
    
    const newRun = {
      run_id: newRunId,
      assigned_vehicle: 'PENDING',
      boxes: [newBoxId],
      from_city: donor.city,
      to_city: 'Pending Match',
      eta: 'TBD',
      status: 'ACTIVE',
      cold_chain_health: 'GOOD'
    };
    
    const newBox = {
      box_id: newBoxId,
      hardware_mac: 'PENDING',
      assigned_vehicle: 'PENDING',
      organ_profile: `${donor.organs[0] || 'Organ'} (2-8°C)`,
      status: 'TRANSIT',
      last_temp: 4.0,
      last_updated: new Date().toISOString(),
      alert_count: 0
    };

    return {
      networkDonors: s.networkDonors.map(d =>
        d.donor_id === donor_id ? { ...d, status: 'ACCEPTED' } : d
      ),
      activeAlerts: [newAlert, ...s.activeAlerts].slice(0, 50),
      localRuns: [newRun, ...s.localRuns],
      localBoxes: [newBox, ...s.localBoxes]
    };
  }),

  declineDonor: (donor_id) => set(s => ({
    networkDonors: s.networkDonors.map(d =>
      d.donor_id === donor_id ? { ...d, status: 'DECLINED' } : d
    )
  })),

  addVehicle: (vehicle) => set(s => ({ localVehicles: [...s.localVehicles, vehicle] })),
  addBox: (box) => set(s => ({ localBoxes: [...s.localBoxes, box] })),

  // ── Demo State ────────────────────────────────────────────────────────────
  activeScenario: null,
  scenarioPhase: null,
  demoComplete: false,
  registeredDonor: null,
  smpcSteps: [],
  matchResult: null,
  currentRoute: null,
  activeSegmentIndex: 0,
  telemetryHistory: [],
  activeAlerts: [],
  alarmActive: false,
  currentPackageId: null,
  activityFeed: [],
  rerouteResult: null,

  // ── WebSocket ─────────────────────────────────────────────────────────────
  wsConnected: false,
  ws: null,

  connectWS: () => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => set({ wsConnected: true, ws });
    ws.onclose = () => { set({ wsConnected: false, ws: null }); setTimeout(() => get().connectWS(), 3000); };
    ws.onmessage = (event) => { try { const msg = JSON.parse(event.data); get().handleEvent(msg); } catch {} };
    set({ ws });
  },

  handleEvent: (msg) => {
    const { type, data, timestamp } = msg;
    set(s => ({ activityFeed: [{ type, data, timestamp, id: Math.random() }, ...s.activityFeed].slice(0, 200) }));
    switch (type) {
      case 'CONNECTED': set({ nodeStatus: data.node_status || [] }); break;
      case 'DEMO_STARTED': set({ activeScenario: data.scenario, scenarioPhase: 'started', smpcSteps: [], matchResult: null, currentRoute: null, activeAlerts: [], alarmActive: false, demoComplete: false, rerouteResult: null }); break;
      case 'DONOR_REGISTERED': set({ registeredDonor: data, scenarioPhase: 'donor_registered' }); break;
      case 'LAYER0_SEARCHING': set({ scenarioPhase: 'layer0_searching' }); break;
      case 'LAYER0_FAILED': set({ scenarioPhase: 'layer0_failed' }); break;
      case 'LAYER0_MATCH_FOUND': set({ matchResult: data, scenarioPhase: 'matched' }); break;
      case 'SMPC_STARTED': set({ scenarioPhase: 'smpc_started', smpcSteps: [] }); break;
      case 'SMPC_STEP': set(s => ({ smpcSteps: [...s.smpcSteps, data] })); break;
      case 'SMPC_MATCH_FOUND': set({ matchResult: data, scenarioPhase: 'matched' }); break;
      case 'ROUTING_STARTED': set({ scenarioPhase: 'routing' }); break;
      case 'ROUTE_COMPUTED': set({ currentRoute: data, currentPackageId: data.package_id, scenarioPhase: 'in_transit', activeSegmentIndex: 0 }); break;
      case 'ROUTE_RECALCULATED': set({ rerouteResult: data, scenarioPhase: 'rerouted' }); break;
      case 'SEGMENT_ACTIVE': set({ activeSegmentIndex: data.segment_index || 0 }); break;
      case 'HANDOFF_CONFIRMED': set(s => ({ activeSegmentIndex: s.activeSegmentIndex + 1 })); break;
      case 'ORGAN_DELIVERED': set({ scenarioPhase: 'delivered', demoComplete: true }); break;
      case 'TELEMETRY_UPDATE': set(s => ({ telemetryHistory: [...s.telemetryHistory, data].slice(-120), alarmActive: data.alarm_active || false, currentPackageId: data.package_id })); break;
      case 'COLD_CHAIN_ALERT': set(s => ({ activeAlerts: [data, ...s.activeAlerts].slice(0, 50), alarmActive: data.alarm_active || false })); break;
      case 'COLD_CHAIN_ACTIVE': set({ scenarioPhase: 'cold_chain_active' }); break;
      case 'COLD_CHAIN_COMPLETE': set({ scenarioPhase: 'delivered', demoComplete: true }); break;
      default: break;
    }
  },

  setStats: (stats) => set({ stats }),
  clearDemo: () => set({ activeScenario: null, scenarioPhase: null, demoComplete: false, smpcSteps: [], matchResult: null, currentRoute: null, activeAlerts: [], alarmActive: false, rerouteResult: null }),
  dismissAlert: (idx) => set(s => ({ activeAlerts: s.activeAlerts.filter((_, i) => i !== idx) })),
}));
