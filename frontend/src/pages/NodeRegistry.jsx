import { useState } from 'react';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import { motion } from 'framer-motion';
import { Shield, Globe, Users, Building2, Lock } from 'lucide-react';
const COUNTRY_FLAGS = { IN: '🇮🇳', FR: '🇫🇷', BR: '🇧🇷', GB: '🇬🇧', AE: '🇦🇪' };

export default function NodeRegistry() {
  const hospitals = useLifeMeshStore(s => s.hospitals);

  const fallback = [
    { id: 'H_AIIMS',      name: 'AIIMS Delhi',             city: 'Delhi',     country: 'India',  country_code: 'IN', patient_count: 6, national_registry_id: 'NOTTO-DL-001', tier: 'Layer 0' },
    { id: 'H_FORTIS',     name: 'Fortis Hospital Noida',   city: 'Noida',     country: 'India',  country_code: 'IN', patient_count: 6, national_registry_id: 'NOTTO-UP-002', tier: 'Layer 0' },
    { id: 'H_SAFDARJUNG', name: 'Safdarjung Hospital',     city: 'Delhi',     country: 'India',  country_code: 'IN', patient_count: 4, national_registry_id: 'NOTTO-DL-003', tier: 'Layer 0' },
    { id: 'H_PARIS',      name: 'Hôpital Lariboisière',    city: 'Paris',     country: 'France', country_code: 'FR', patient_count: 8, national_registry_id: '',              tier: 'Layer 1' },
    { id: 'H_MUMBAI',     name: 'Kokilaben KDAH',          city: 'Mumbai',    country: 'India',  country_code: 'IN', patient_count: 8, national_registry_id: 'NOTTO-MH-001', tier: 'Layer 0/1' },
    { id: 'H_SAO_PAULO',  name: 'Hospital Albert Einstein', city: 'São Paulo', country: 'Brazil', country_code: 'BR', patient_count: 8, national_registry_id: '',              tier: 'Layer 1' },
    { id: 'H_LONDON',     name: "King's College Hospital",  city: 'London',    country: 'UK',     country_code: 'GB', patient_count: 6, national_registry_id: '',              tier: 'Layer 1' },
    { id: 'H_DUBAI',      name: 'Cleveland Clinic AD',      city: 'Dubai',     country: 'UAE',    country_code: 'AE', patient_count: 6, national_registry_id: '',              tier: 'Layer 1' },
  ];

  const nodes = hospitals.length > 0 ? hospitals : fallback;
  const [selected, setSelected] = useState(null);

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        <div className="flex-between" style={{ marginBottom: 28 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Node Registry</h2>
            <p style={{ fontSize: '0.875rem' }}>All hospital nodes in the LifeMesh network. Patient waitlists are stored as cryptographic commitments — never as raw data.</p>
          </div>
          <div className="badge badge-accent">
            <Shield size={12} /> SMPC-Protected Waitlists
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Nodes',    value: nodes.length, icon: Globe },
            { label: 'Countries',      value: new Set(nodes.map(n=>n.country_code)).size, icon: Globe },
            { label: 'Layer 0 Nodes',  value: nodes.filter(n=>n.tier?.includes('Layer 0')).length, icon: Shield },
            { label: 'Total Patients', value: nodes.reduce((a,n)=>a+(n.patient_count||0),0), icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
          {/* Table */}
          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Location</th>
                  <th>Protocol Tier</th>
                  <th>Patients</th>
                  <th>Registry ID</th>
                  <th>Data Visibility</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, i) => (
                  <motion.tr
                    key={node.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(s => s?.id === node.id ? null : node)}
                    style={{ cursor: 'pointer', background: selected?.id === node.id ? 'rgba(0,212,170,0.05)' : undefined }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>{COUNTRY_FLAGS[node.country_code] || <Building2 size={20} />}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{node.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{node.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{node.city}, {node.country}</td>
                    <td>
                      <span className={`badge ${node.tier === 'Layer 0' ? 'badge-success' : node.tier === 'Layer 1' ? 'badge-accent' : 'badge-info'}`}>
                        {node.tier || 'Layer 1'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{node.patient_count}</td>
                    <td>
                      {node.national_registry_id
                        ? <code style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>{node.national_registry_id}</code>
                        : <span style={{ color: 'var(--text-muted)' }}>SMPC Only</span>
                      }
                    </td>
                    <td>
                      <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={12} /> {node.national_registry_id ? 'National registry' : 'Encrypted shares only'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Node detail */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass"
              style={{ padding: 24, position: 'sticky', top: 80 }}
            >
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3>{COUNTRY_FLAGS[selected.country_code]} {selected.name}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <InfoRow label="Node ID" value={selected.id} mono />
                <InfoRow label="City" value={selected.city} />
                <InfoRow label="Country" value={selected.country} />
                <InfoRow label="Protocol Tier" value={selected.tier || 'Layer 1'} accent />
                <InfoRow label="NOTTO / Registry ID" value={selected.national_registry_id || 'Not applicable (SMPC only)'} />
              </div>

              <div className="glow-line" />

              <h4 style={{ marginBottom: 12 }}>Encrypted Patient Waitlist</h4>
              <p style={{ fontSize: '0.78rem', marginBottom: 16 }}>
                Raw HLA values are never stored in plaintext. Each patient's data is split into Shamir shares before network distribution.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
                {(selected.patients || []).slice(0, 10).map((p, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', borderRadius: 8, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)' }}>{p.id}</span>
                      <span className={`badge badge-muted`} style={{ fontSize: '0.62rem' }}>{p.blood_type}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      HLA: {p.hla_commitment || '████████████████████████████████'}
                    </div>
                  </div>
                ))}
                {!selected.patients?.length && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Patient data visible only via SMPC computation
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{
        fontSize: '0.85rem', fontWeight: 600,
        fontFamily: mono ? 'var(--font-mono)' : undefined,
        color: accent ? 'var(--accent)' : 'var(--text-primary)',
      }}>{value || '—'}</span>
    </div>
  );
}
