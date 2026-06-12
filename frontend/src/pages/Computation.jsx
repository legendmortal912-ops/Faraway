import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLifeMeshStore } from '../store/useLifeMeshStore';
import { CheckCircle, Circle, Loader, XCircle, ArrowRight, Lock, Cpu, Plane, Ambulance, CheckCircle2, LockKeyhole, Zap } from 'lucide-react';

const PHASE_ORDER = [
  'donor_registered',
  'layer0_searching',
  'layer0_failed',
  'smpc_started',
  'matched',
  'routing',
  'in_transit',
  'delivered',
];

function phaseIndex(phase) {
  return PHASE_ORDER.indexOf(phase);
}

export default function Computation() {
  const navigate = useNavigate();
  const {
    activeScenario, scenarioPhase, registeredDonor,
    smpcSteps, matchResult, currentRoute, activityFeed,
    demoComplete,
  } = useLifeMeshStore();

  const steps = activeScenario === 'domestic'
    ? [
        { id: 'donor_registered', label: 'Donor Registered', desc: 'Organ & blood type logged in national registry' },
        { id: 'layer0_searching', label: 'Layer 0 — NOTTO Search', desc: 'Scanning same-country hospital priority queue' },
        { id: 'matched',          label: 'Match Found',            desc: 'Compatibility scored, recipient confirmed' },
        { id: 'routing',          label: 'Routing Engine',         desc: 'Ambulance route computed (ground only)' },
        { id: 'in_transit',       label: 'In Transit',             desc: 'Organ en route with BFT handoff tracking' },
        { id: 'delivered',        label: 'Delivered',              desc: <>Patient saved <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} color="var(--success)" /></> },
      ]
    : activeScenario === 'cold_chain'
    ? [
        { id: 'donor_registered',    label: 'Package Registered',  desc: 'Organ package initialized' },
        { id: 'cold_chain_active',   label: 'Sensor Stream Active', desc: 'Arduino BLE → Pi Zero → WebSocket' },
        { id: 'in_transit',          label: 'In Transit',           desc: 'Telemetry streaming at 2 Hz' },
        { id: 'delivered',           label: 'Demo Complete',        desc: <>All events logged <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} color="var(--success)" /></> },
      ]
    : [
        { id: 'donor_registered', label: 'Donor Registered',         desc: 'Organ & blood type logged' },
        { id: 'layer0_searching', label: 'Layer 0 — Domestic Check', desc: 'Checking national registry...' },
        { id: 'layer0_failed',    label: 'Layer 0 — No Match',       desc: 'Escalating to global SMPC network' },
        { id: 'smpc_started',     label: 'Layer 1 — SMPC Initiated', desc: 'Distributing Shamir shares across nodes' },
        { id: 'matched',          label: 'Global Match Found',        desc: 'Optimal recipient identified — zero data exposed' },
        { id: 'routing',          label: 'Multi-Modal Routing',       desc: 'Ground → Air → Ground path computed' },
        { id: 'in_transit',       label: 'In Transit',                desc: 'Tracking active with BFT consensus' },
        { id: 'delivered',        label: 'Delivered',                 desc: <>Patient saved <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} color="var(--success)" /></> },
      ];

  const currentIdx = steps.findIndex(s => s.id === scenarioPhase);

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        <div className="flex-between" style={{ marginBottom: 28 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Computation Pipeline</h2>
            <p style={{ fontSize: '0.875rem' }}>
              {activeScenario
                ? `Running: ${activeScenario === 'domestic' ? 'Layer 0 Domestic Match' : activeScenario === 'global' ? 'Layer 1 Global SMPC' : 'Layer 2 Cold Chain'}`
                : 'No active scenario. Go to New Donor to start.'}
            </p>
          </div>
          {demoComplete && (
            <button className="btn btn-primary" onClick={() => navigate('/tracking')}>
              View Tracking <ArrowRight size={16} />
            </button>
          )}
        </div>

        {!activeScenario && (
          <div className="glass" style={{ padding: 48, textAlign: 'center' }}>
            <Cpu size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <p style={{ marginBottom: 20, fontSize: '1rem' }}>No active computation. Register a donor to begin.</p>
            <button className="btn btn-primary" onClick={() => navigate('/new-donor')}>
              Register Donor
            </button>
          </div>
        )}

        {activeScenario && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

            {/* Pipeline stepper */}
            <div className="glass" style={{ padding: 24 }}>
              <h4 style={{ marginBottom: 20 }}>Protocol Stages</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {steps.map((step, i) => {
                  const done   = i < currentIdx;
                  const active = i === currentIdx;
                  const future = i > currentIdx;
                  return (
                    <div key={step.id} style={{ display: 'flex', gap: 14, paddingBottom: i < steps.length - 1 ? 20 : 0, position: 'relative' }}>
                      {/* Connector line */}
                      {i < steps.length - 1 && (
                        <div style={{
                          position: 'absolute', left: 15, top: 32, bottom: 0, width: 2,
                          background: done ? 'var(--success)' : 'var(--border)',
                          transition: 'background 0.5s',
                        }} />
                      )}

                      {/* Dot */}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? 'var(--success-dim)' : active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                        border: `2px solid ${done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--border)'}`,
                        transition: 'all 0.5s',
                        zIndex: 1,
                        boxShadow: active ? '0 0 16px var(--accent-glow)' : 'none',
                      }}>
                        {done   && <CheckCircle size={14} color="var(--success)" />}
                        {active && <span className="spinner" style={{ width: 14, height: 14 }} />}
                        {future && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</span>}
                      </div>

                      {/* Content */}
                      <div style={{ paddingTop: 4 }}>
                        <div style={{
                          fontSize: '0.875rem', fontWeight: 600,
                          color: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--text-muted)',
                          marginBottom: 2,
                        }}>{step.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right panel — live detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Donor info */}
              {registeredDonor && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 14 }}>Registered Donor</h4>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <Chip label="Hospital" value={registeredDonor.hospital} />
                    <Chip label="Organ" value={registeredDonor.organ} />
                    <Chip label="Blood" value={registeredDonor.blood_type} accent />
                    <Chip label="Viability" value={`${registeredDonor.viability_hours}h`} />
                    <Chip label="Layer" value={`Layer ${registeredDonor.layer ?? 0}`} />
                  </div>
                </motion.div>
              )}

              {/* SMPC steps visualizer */}
              <AnimatePresence>
                {smpcSteps.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20 }}>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                      <h4>SMPC Computation Log</h4>
                      <div className="badge badge-accent"><Lock size={10} /> Encrypted</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                      {smpcSteps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 8,
                            background: step.score > 0.7 ? 'rgba(0,212,170,0.06)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${step.score > 0.7 ? 'rgba(0,212,170,0.2)' : 'var(--border)'}`,
                          }}
                        >
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', width: 20 }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{step.hospital_name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                cmt: {step.commitment}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '1rem', fontWeight: 800,
                                color: step.score > 0.8 ? 'var(--success)' : step.score > 0.6 ? 'var(--accent)' : 'var(--text-muted)',
                              }}>
                                {Math.round(step.score * 100)}%
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>compatibility</div>
                            </div>
                            <div className="badge badge-muted" style={{ fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={10} /> no leak</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Match result */}
              <AnimatePresence>
                {matchResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: 20, border: '1px solid var(--accent)' }}>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                      <h3 style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {matchResult.smpc_used !== false ? <><LockKeyhole size={20} /> Global SMPC Match Found</> : <><Zap size={20} /> Domestic Match Found</>}
                      </h3>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)' }}>
                        {matchResult.compatibility_score}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <Chip label="Recipient Hospital" value={matchResult.hospital_name || matchResult.recipient_hospital} />
                      <Chip label="City" value={matchResult.city || matchResult.recipient_city} />
                      {matchResult.country && <Chip label="Country" value={matchResult.country} />}
                      <Chip label="Data Exposed" value="None" color="var(--success)" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Route segments */}
              <AnimatePresence>
                {currentRoute && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20 }}>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                      <h4>Computed Route</h4>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>
                        ETA: {currentRoute.total_hours || Math.round(currentRoute.total_minutes / 60)}h
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(currentRoute.segments || []).map((seg, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 8,
                          background: seg.mode === 'air' ? 'rgba(96,165,250,0.06)' : 'rgba(16,185,129,0.06)',
                          border: `1px solid ${seg.mode === 'air' ? 'rgba(96,165,250,0.2)' : 'rgba(16,185,129,0.2)'}`,
                        }}>
                          <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{seg.mode === 'air' ? <Plane size={18} /> : <Ambulance size={18} />}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{seg.from} → {seg.to}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{seg.mode}</div>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {seg.duration_minutes} min
                          </span>
                        </div>
                      ))}
                    </div>
                    {demoComplete && (
                      <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="btn btn-primary"
                        style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                        onClick={() => navigate('/tracking')}
                      >
                        Open Live Tracking Map <ArrowRight size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delivered banner */}
              <AnimatePresence>
                {scenarioPhase === 'delivered' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: 24, borderRadius: 16, textAlign: 'center',
                      background: 'var(--success-dim)',
                      border: '1px solid rgba(16,185,129,0.4)',
                    }}
                  >
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={48} color="var(--success)" /></div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)', marginBottom: 4 }}>
                      Organ Successfully Delivered
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Patient saved. Zero patient records exposed across borders.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, value, accent, color }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: color || (accent ? 'var(--accent)' : 'var(--text-primary)') }}>{value || '—'}</div>
    </div>
  );
}
