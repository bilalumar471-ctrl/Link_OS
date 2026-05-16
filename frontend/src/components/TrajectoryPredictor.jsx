import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';

const SF = '#487F86';   // Seafoam Steel
const HB = '#134C65';   // Harbor Blue
const BG = '#F0ECDA';   // Driftwood Beige
const MT = 'rgba(240,236,218,0.55)';  // Muted beige

// ── Pulse dot ─────────────────────────────────────────────────────
const PulseDot = ({ color }) => (
  <div className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
    <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
      style={{ background: color }} />
    <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: color }} />
  </div>
);

// ── Status row ────────────────────────────────────────────────────
const StatusRow = ({ name, status, trend, confidence, dotColor }) => (
  <div
    className="group flex items-center justify-between p-4 border-b transition-all duration-300 relative overflow-hidden"
    style={{ borderColor: 'rgba(72,127,134,0.12)', background: 'rgba(72,127,134,0.02)' }}
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: 'rgba(72,127,134,0.04)' }}
    />
    <div className="flex items-center gap-4 relative z-10">
      <PulseDot color={dotColor} />
      <div>
        <h4 className="text-[14px] tracking-wide" style={{ color: BG }}>{name}</h4>
        <span className="text-[11px] font-mono tracking-wider" style={{ color: 'rgba(72,127,134,0.7)' }}>{status}</span>
      </div>
    </div>
    <div className="flex items-center gap-8 relative z-10">
      <div className="text-right hidden sm:block">
        <span className="block text-[9px] uppercase font-bold tracking-widest" style={{ color: 'rgba(72,127,134,0.55)' }}>Confidence</span>
        <span className="text-[13px] font-mono" style={{ color: BG }}>{confidence}</span>
      </div>
      <div className="w-28 text-right font-mono text-[13px] font-bold">
        {trend === 'improving' && <span className="inline-flex items-center gap-1.5" style={{ color: SF }}><CheckCircle2 className="w-3 h-3"/> STABLE</span>}
        {trend === 'warning'   && <span className="inline-flex items-center gap-1.5" style={{ color: '#2A7A8C' }}><AlertTriangle className="w-3 h-3"/> AT RISK</span>}
        {trend === 'critical'  && <span className="inline-flex items-center gap-1.5" style={{ color: BG }}><TrendingDown className="w-3 h-3"/> CRITICAL</span>}
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────
const TrajectoryPredictor = () => (
  <section className="py-20 px-6 md:px-12 lg:px-20 relative z-10 overflow-hidden">
    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-20 items-center">

      {/* ── Left: Live Telemetry Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -60, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 relative"
      >
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full animate-pulse"
          style={{ background: HB, filter: 'blur(120px)', opacity: 0.12 }}
        />

        <div className="relative">
          {/* Border + corners */}
          <div className="absolute inset-0" style={{ border: `1px solid rgba(72,127,134,0.35)`, boxShadow: '0 0 40px rgba(72,127,134,0.08)' }} />
          {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos, cls], i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 ${cls}`} style={{ borderColor: SF }} />
          ))}

          <div
            className="backdrop-blur-3xl p-8 relative overflow-hidden"
            style={{ background: 'rgba(14,30,47,0.82)', borderTop: `1px solid rgba(72,127,134,0.12)` }}
          >
            {/* Scanline */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
              style={{ background: `linear-gradient(transparent 50%, rgba(72,127,134,0.5) 50%)`, backgroundSize: '100% 4px' }} />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 relative z-10"
              style={{ borderBottom: `1px solid rgba(72,127,134,0.18)` }}>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5" style={{ color: SF }} />
                <span className="font-mono text-[12px] tracking-[0.3em] uppercase" style={{ color: SF }}>Live Telemetry</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1"
                style={{ border: `1px solid rgba(72,127,134,0.30)`, background: 'rgba(72,127,134,0.06)' }}>
                <span className="w-1.5 h-1.5 animate-ping" style={{ background: SF }} />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: SF }}>Streaming</span>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-0 relative z-10">
              <StatusRow name="TechVenture MY ↔ Priya Nair" status="ENGAGEMENT-A42" trend="improving" confidence="92%" dotColor={SF} />
              <StatusRow name="DataCo KL ↔ Lim Wei"         status="ENGAGEMENT-B17" trend="critical"  confidence="78%" dotColor={BG} />
              <StatusRow name="FinTech Hub ↔ Azri Hassan"   status="ENGAGEMENT-C09" trend="warning"   confidence="64%" dotColor="#2A7A8C" />
            </div>
          </div>
        </div>

      </motion.div>

      {/* ── Right: Copy ── */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="w-full lg:w-1/2"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1 mb-8"
          style={{ background: 'rgba(14,30,47,0.80)', border: `1px solid rgba(72,127,134,0.35)` }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono" style={{ color: SF }}>Predictive Analytics</span>
        </div>

        <h2 className="text-5xl md:text-[4rem] leading-[1.05] font-extrabold mb-8 tracking-tight" style={{ color: BG }}>
          Trajectory Predictor
        </h2>
        <p className="text-xl leading-relaxed mb-12" style={{ color: MT }}>
          Don't wait for engagements to fail. LinkOS predicts drops and identifies at-risk relationships weeks before they happen.
        </p>

        <ul className="space-y-8">
          {[
            {
              icon: TrendingDown, color: BG,
              title: 'Early Warning System',
              desc: 'Detects subtle patterns in session ratings and response times to forecast outcomes.',
            },
            {
              icon: Activity, color: SF,
              title: 'Live Radar Telemetry',
              desc: 'Streaming health data updates seamlessly in real-time as interactions happen.',
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <li key={title} className="flex items-start gap-5 group">
              <div className="mt-1 w-10 h-10 flex items-center justify-center shrink-0 relative"
                style={{ border: `1px solid ${color}45` }}>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: color }} />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: color }} />
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <h4 className="font-bold text-[17px] mb-1 tracking-wider uppercase" style={{ color: BG }}>{title}</h4>
                <p className="text-[14px] leading-relaxed" style={{ color: MT }}>{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* ── Aquamarine floating card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,206,209,0.13) 0%, rgba(0,180,180,0.05) 100%)',
            border: '1px solid rgba(0,206,209,0.42)',
            boxShadow: '0 12px 48px rgba(0,206,209,0.18), inset 0 1px 0 rgba(0,206,209,0.12)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: '#00CED1' }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: '#00CED1' }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: '#00CED1' }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: '#00CED1' }} />

          {/* Top glow */}
          <div
            className="absolute -top-8 right-10 w-40 h-24 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(0,206,209,0.22) 0%, transparent 70%)', filter: 'blur(18px)' }}
          />

          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <motion.span
                className="w-2 h-2 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ background: '#00CED1' }}
              />
              <span className="text-[10px] font-mono tracking-[0.32em] uppercase font-bold" style={{ color: '#00CED1' }}>
                Prediction Summary
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5"
              style={{ color: '#00CED1', border: '1px solid rgba(0,206,209,0.30)', background: 'rgba(0,206,209,0.06)' }}>
              Live
            </span>
          </div>

          {/* 3 stat columns */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Avg Confidence', value: '78%',    sub: 'across linkages' },
              { label: 'At-Risk Count',  value: '2',      sub: 'need attention'  },
              { label: 'Next Alert',     value: '~4 hrs', sub: 'estimated'       },
            ].map(({ label, value, sub }) => (
              <div key={label} className="flex flex-col">
                <span className="text-[24px] font-mono font-bold tabular-nums leading-none mb-1" style={{ color: '#00CED1' }}>
                  {value}
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(0,206,209,0.7)' }}>
                  {label}
                </span>
                <span className="text-[9px] mt-0.5" style={{ color: 'rgba(240,236,218,0.30)' }}>
                  {sub}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-5 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(0,206,209,0.15)' }}>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,206,209,0.12)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #00CED1, #7FFFD4)' }}
                initial={{ width: '0%' }}
                whileInView={{ width: '78%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[9px] font-mono" style={{ color: 'rgba(0,206,209,0.55)' }}>78% system health</span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  </section>
);

export default TrajectoryPredictor;
