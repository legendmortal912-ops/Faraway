import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLifeMeshStore } from '../../store/useLifeMeshStore';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { AlertTriangle, Snowflake, Package } from 'lucide-react';

export default function HospitalShipments() {
  const { localRuns, localBoxes, telemetryHistory, activeAlerts, alarmActive } = useLifeMeshStore();
  const [selectedRun, setSelectedRun] = useState(localRuns[0] || null);

  const ROUTE_STEPS = ['Donor Hospital', 'Airport Pickup', 'Flight AI-142', 'Mumbai Airport', 'Recipient Hospital'];

  return (
    <div className="page" style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Alarm Banner */}
        {alarmActive && (
          <motion.div initial={{ y: -40 }} animate={{ y: 0 }}
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ animation: 'pulse 1s infinite', display: 'flex' }}><AlertTriangle size={24} color="#f87171" /></span>
            <div style={{ flex: 1 }}>
              <span style={{ color: '#f87171', fontWeight: 700 }}>CRITICAL COLD CHAIN ALERT</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 12, fontSize: '0.85rem' }}>Temperature threshold breached — check telemetry below</span>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Live Tracking</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Active Shipments</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
          {/* Run list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {localRuns.length === 0 ? (
              <div className="glass" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No active shipments. Trigger a demo scenario from the Dashboard.
              </div>
            ) : localRuns.map(run => (
              <motion.div key={run.run_id} whileHover={{ scale: 1.01 }} onClick={() => setSelectedRun(run)}
                className="glass" style={{ padding: 16, cursor: 'pointer', borderColor: selectedRun?.run_id === run.run_id ? 'var(--accent)' : 'var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <code style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{run.run_id}</code>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 100, background: run.status === 'ACTIVE' ? 'rgba(0,212,170,0.1)' : 'var(--bg-elevated)', color: run.status === 'ACTIVE' ? 'var(--accent)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>{run.status}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{run.from_city} → {run.to_city}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Snowflake size={12} /> {run.cold_chain_health}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Package size={12} /> {run.boxes.length} box{run.boxes.length !== 1 ? 'es' : ''}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedRun && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Route Timeline */}
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Route Timeline</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {ROUTE_STEPS.map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < ROUTE_STEPS.length - 1 ? 1 : 0 }}>
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? 'var(--accent)' : i === 3 ? 'rgba(0,212,170,0.2)' : 'var(--bg-elevated)', border: `2px solid ${i < 3 ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '0.7rem', color: i < 3 ? '#000' : 'var(--text-muted)' }}>
                          {i < 3 ? '✓' : i === 3 ? '●' : '○'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: i < 3 ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center', maxWidth: 70, margin: '0 auto' }}>{s}</div>
                      </div>
                      {i < ROUTE_STEPS.length - 1 && <div style={{ height: 2, flex: 1, background: i < 2 ? 'var(--accent)' : 'var(--border)', margin: '0 4px' }} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Telemetry */}
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Container Box Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {localBoxes.filter(b => selectedRun.boxes.includes(b.box_id)).map(box => (
                    <div key={box.box_id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{box.box_id}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{box.organ_profile}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <TempGauge temp={box.last_temp} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: box.last_temp > 6 ? 'var(--danger)' : box.last_temp > 4 ? 'var(--warning)' : 'var(--success)' }}>{box.last_temp}°C</div>
                        <div style={{ fontSize: '0.65rem', color: box.alert_count > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{box.alert_count} alerts</div>
                      </div>
                      <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: 100, background: box.status === 'TRANSIT' ? 'rgba(0,212,170,0.1)' : 'var(--bg-card)', color: box.status === 'TRANSIT' ? 'var(--accent)' : 'var(--text-muted)' }}>{box.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Chart */}
              {telemetryHistory.length > 0 && (
                <div className="glass" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Live Temperature Feed</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={telemetryHistory.slice(-60)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="ts" tick={false} />
                      <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                      <ReferenceLine y={8} stroke="var(--danger)" strokeDasharray="4 4" label={{ value: 'MAX', fill: 'var(--danger)', fontSize: 10 }} />
                      <ReferenceLine y={2} stroke="var(--info)" strokeDasharray="4 4" label={{ value: 'MIN', fill: 'var(--info)', fontSize: 10 }} />
                      <Line type="monotone" dataKey="temperature" stroke="var(--accent)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TempGauge({ temp }) {
  const pct = Math.min(Math.max(temp / 10, 0), 1);
  const color = temp > 6 ? 'var(--danger)' : temp > 4 ? 'var(--warning)' : 'var(--success)';
  return (
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}
