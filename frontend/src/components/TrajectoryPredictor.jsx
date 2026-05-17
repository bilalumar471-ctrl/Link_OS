import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, TrendingDown, CheckCircle2, X, Plus, Calendar, Check, Clock, Star } from 'lucide-react';
import { getLinkages, getSessions, flagLinkage } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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
const StatusRow = ({ name, status, trend, confidence, dotColor, onClick }) => {
  const isAtRisk = trend === 'warning' || trend === 'critical';
  
  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between p-4 border-b transition-all duration-300 relative overflow-hidden cursor-pointer hover:bg-white/5"
      style={{ 
        borderColor: 'rgba(72,127,134,0.12)', 
        background: isAtRisk ? 'rgba(239, 68, 68, 0.04)' : 'rgba(72,127,134,0.02)',
        borderLeft: isAtRisk ? '2px solid #EF4444' : 'none'
      }}
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
          <span className="block text-[9px] uppercase font-bold tracking-widest" style={{ color: 'rgba(72,127,134,0.55)' }}>Drop Probability</span>
          <span className="text-[13px] font-mono" style={{ color: BG }}>{confidence}</span>
        </div>
        <div className="w-28 text-right font-mono text-[13px] font-bold">
          {trend === 'improving' && <span className="inline-flex items-center gap-1.5" style={{ color: SF }}><CheckCircle2 className="w-3 h-3"/> → STABLE</span>}
          {trend === 'warning'   && <span className="inline-flex items-center gap-1.5" style={{ color: '#EF4444' }}><AlertTriangle className="w-3 h-3"/> ↓ AT RISK</span>}
          {trend === 'critical'  && <span className="inline-flex items-center gap-1.5" style={{ color: '#EF4444' }}><TrendingDown className="w-3 h-3"/> ↓ CRITICAL</span>}
        </div>
      </div>
    </div>
  );
};

// ── Error Boundary ──────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100%', background: 'red', color: 'white', padding: 20, zIndex: 9999 }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <button onClick={() => this.props.onClose()} style={{ marginTop: 20, padding: 10, background: 'white', color: 'red' }}>Close</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Detail Panel ──────────────────────────────────────────────────
const DetailPanel = ({ linkage, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [flagged, setFlagged] = useState(linkage.manually_flagged || false);

  useEffect(() => {
    getSessions(linkage.id).then(setSessions).catch(console.error);
  }, [linkage.id]);

  const handleFlag = async () => {
    if (flagged) return;
    try {
      await flagLinkage(linkage.id);
      setFlagged(true);
    } catch (e) {
      console.error(e);
    }
  };

  const mName = linkage.entity_a?.snapshot?.name || 'Unknown Mentor';
  const cName = linkage.entity_b?.snapshot?.name || 'Unknown Company';
  const pName = linkage.programme_id || 'Unknown Programme';
  const tStatus = linkage.trajectory?.status || 'stable';
  const isStable = tStatus === 'improving' || tStatus === 'stable';
  const isAtRisk = !isStable;

  const dropProbRaw = linkage.trajectory?.drop_probability;
  let dropProbVal = 0;
  if (dropProbRaw !== undefined) {
    dropProbVal = Math.round(dropProbRaw * 100);
  } else {
    if (tStatus === 'critical') dropProbVal = 85;
    else if (tStatus === 'warning' || tStatus === 'declining') dropProbVal = 70;
    else dropProbVal = 12;
  }

  const safeSessions = Array.isArray(sessions) ? sessions : [];

  const chartData = safeSessions.map((s, i) => ({
    name: `S${i + 1}`,
    rating: s.rating || 0,
    responseTime: s.response_time_hours || 0
  }));

  const avgRating = safeSessions.length ? (safeSessions.reduce((a, b) => a + (b.rating || 0), 0) / safeSessions.length).toFixed(1) : '0.0';
  const avgResponse = safeSessions.length ? (safeSessions.reduce((a, b) => a + (b.response_time_hours || 0), 0) / safeSessions.length).toFixed(1) : '0.0';

  return (
    <motion.div
      initial={{ x: 420 }}
      animate={{ x: 0 }}
      exit={{ x: 420 }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        background: '#0F1A2E',
        borderLeft: '1px solid rgba(32,178,170,0.2)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* HEADER */}
      <div style={{ padding: 16, borderBottom: '1px solid rgba(32,178,170,0.1)' }}>
        <button onClick={onClose} style={{ float: 'right', color: '#8899B0' }}>
          <X className="w-5 h-5" />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#E8EDF5' }}>{cName} ↔ {mName}</h2>
        <p style={{ fontSize: 10, color: '#8899B0', textTransform: 'uppercase', marginTop: 4 }}>
          ENGAGEMENT-{(linkage.id || 'NEW').slice(0,4)} · {pName}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* TRAJECTORY PREDICTION BLOCK */}
        <div style={{
          background: isAtRisk ? 'rgba(239,68,68,0.06)' : 'rgba(32,178,170,0.06)',
          borderLeft: `3px solid ${isAtRisk ? '#EF4444' : '#20B2AA'}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: '#C4A882', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🔮 Trajectory Prediction
            </span>
            <span style={{ fontSize: 9, padding: '2px 6px', background: '#20B2AA', color: '#fff', borderRadius: 99, fontWeight: 'bold' }}>
              AI LIVE
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#8899B0' }}>Status</span>
            <span style={{ fontSize: 12, color: isAtRisk ? '#EF4444' : '#20B2AA', fontWeight: 'bold' }}>
              {isAtRisk ? '↓ DECLINING' : '→ STABLE'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#8899B0' }}>Predicted outcome</span>
            <span style={{ fontSize: 12, color: isAtRisk ? '#EF4444' : '#20B2AA' }}>
              {linkage.trajectory?.predicted_outcome?.toUpperCase() || (isAtRisk ? 'DROP' : 'COMPLETED')}
            </span>
          </div>
          
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#8899B0' }}>Drop probability</span>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#EF4444' }}>{dropProbVal}%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(239,68,68,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${dropProbVal}%`, height: '100%', background: '#EF4444' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#8899B0' }}>Predicted drop</span>
            <span style={{ fontSize: 12, color: '#F59E0B' }}>Week {linkage.trajectory?.predicted_drop_week || '6'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#8899B0' }}>Confidence</span>
            <span style={{ fontSize: 12, color: '#20B2AA' }}>
              {typeof linkage.trajectory?.confidence === 'number' 
                ? `${Math.round(linkage.trajectory.confidence * 100)}%` 
                : (linkage.trajectory?.confidence || 'HIGH').toString().toUpperCase()}
            </span>
          </div>

          <div style={{ 
            borderLeft: '2px solid rgba(32,178,170,0.5)', 
            paddingLeft: 12, 
            fontSize: 12, 
            color: '#8899B0', 
            fontStyle: 'italic', 
            lineHeight: 1.6 
          }}>
            "{linkage.trajectory?.trajectory_reason || 'No reasoning available'}"
          </div>

          <div style={{
            background: 'rgba(245,158,11,0.08)',
            borderLeft: '2px solid #F59E0B',
            borderRadius: 6,
            padding: '10px 12px',
            marginTop: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#C4A882', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ⚡ Recommended Action
              </span>
              <span style={{ 
                fontSize: 9, 
                padding: '2px 6px', 
                background: linkage.trajectory?.action_urgency === 'immediate' ? '#EF4444' : linkage.trajectory?.action_urgency === 'this_week' ? '#F59E0B' : '#64748B',
                color: '#fff', 
                borderRadius: 99, 
                fontWeight: 'bold' 
              }}>
                {(typeof linkage.trajectory?.action_urgency === 'string' ? linkage.trajectory.action_urgency : 'MONITOR').replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#E8EDF5' }}>{linkage.trajectory?.recommended_action || 'Continue monitoring the engagement.'}</p>
          </div>
        </div>

        {/* SESSION TREND BLOCK */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: '#C4A882', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Session Trend
          </div>
          <div style={{ height: 100, width: '100%', marginBottom: 8 }}>
            {safeSessions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="rating" stroke={isAtRisk ? '#EF4444' : '#20B2AA'} strokeWidth={2} dot={{ r: 4, fill: isAtRisk ? '#EF4444' : '#20B2AA' }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8899B0', fontSize: 12 }}>
                Not enough data
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8899B0' }}>AVG RATING</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#E8EDF5' }}>{avgRating} stars</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8899B0' }}>AVG RESPONSE TIME</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#E8EDF5' }}>{avgResponse} hours</span>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(32,178,170,0.1)', marginBottom: 24 }} />

        {/* SESSION LOG BLOCK */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: '#C4A882', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Session Log
          </div>
          {safeSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#8899B0' }}>
              <Calendar className="w-5 h-5 mx-auto mb-2 opacity-50" />
              <p style={{ fontSize: 12 }}>No sessions logged yet</p>
            </div>
          ) : (
            safeSessions.map((s, i) => (
              <div key={s.id || i} style={{
                background: 'rgba(32,178,170,0.04)',
                border: '1px solid rgba(32,178,170,0.1)',
                borderRadius: 6,
                padding: '8px 10px',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <span style={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace', color: '#20B2AA' }}>S{s.session_number || i + 1}</span>
                <span style={{ fontSize: 11, color: '#8899B0', flex: 1 }}>{s.logged_at ? new Date(s.logged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Unknown'}</span>
                {s.rating >= 3 ? <Check className="w-3 h-3 text-[#22C55E]" /> : <X className="w-3 h-3 text-[#EF4444]" />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star className="w-3 h-3 text-[#E8EDF5]" />
                  <span style={{ fontSize: 11, color: '#E8EDF5' }}>{s.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock className="w-3 h-3 text-[#8899B0]" />
                  <span style={{ fontSize: 11, color: '#8899B0' }}>{s.response_time_hours || 0}h</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ padding: 16, borderTop: '1px solid rgba(32,178,170,0.1)' }}>
        <button 
          onClick={() => alert("Open Session Modal")}
          style={{ width: '100%', background: '#20B2AA', color: '#fff', fontSize: 12, fontWeight: 'bold', padding: '10px 0', borderRadius: 6, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Plus className="w-4 h-4" />
          LOG NEW SESSION
        </button>
        <button 
          onClick={handleFlag}
          style={{ 
            width: '100%', 
            background: flagged ? '#EF4444' : 'transparent', 
            border: `1px solid #EF4444`, 
            color: flagged ? '#fff' : '#EF4444', 
            fontSize: 12, 
            fontWeight: 'bold', 
            padding: '10px 0', 
            borderRadius: 6, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 6,
            transition: 'all 0.2s'
          }}
        >
          {flagged ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {flagged ? 'FLAGGED' : 'FLAG FOR REVIEW'}
        </button>
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────
const TrajectoryPredictor = () => {
  const [linkages, setLinkages] = useState([]);
  const [selectedLinkage, setSelectedLinkage] = useState(null);

  useEffect(() => {
    getLinkages({ status: 'active' })
      .then(data => setLinkages(data || []))
      .catch(console.error);
  }, []);

  const avgConfidence = linkages.length > 0 
    ? Math.round(linkages.reduce((sum, l) => sum + (l.fit_score || 0), 0) / linkages.length)
    : 0;
  
  const atRiskCount = linkages.filter(l => 
    l.trajectory?.status === 'declining' || l.trajectory?.status === 'critical'
  ).length;

  const nextAlert = atRiskCount > 0 ? '~2 hrs' : 'None';

  const displayLinkages = [...linkages].sort((a, b) => {
    const riskScore = (l) => l.trajectory?.status === 'critical' ? 2 : l.trajectory?.status === 'declining' ? 1 : 0;
    return riskScore(b) - riskScore(a);
  }).slice(0, 3);

  return (
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
            <div className="space-y-0 relative z-10 min-h-[160px]">
              {displayLinkages.length === 0 ? (
                <div className="p-4 mt-8 text-[#F0ECDA]/50 text-sm font-mono text-center">No active linkages to track.</div>
              ) : (
                displayLinkages.map((l, i) => {
                  const mName = l.entity_a?.snapshot?.name || 'Unknown Mentor';
                  const cName = l.entity_b?.snapshot?.name || 'Unknown Company';
                  const tStatus = l.trajectory?.status || 'stable';
                  
                  let trend = 'improving';
                  let dotColor = SF;
                  if (tStatus === 'declining') { trend = 'warning'; dotColor = '#2A7A8C'; }
                  if (tStatus === 'critical') { trend = 'critical'; dotColor = BG; }

                  const dropProbRaw = l.trajectory?.drop_probability;
                  let dropProbVal = 0;
                  if (dropProbRaw !== undefined) {
                    dropProbVal = Math.round(dropProbRaw * 100);
                  } else {
                    if (trend === 'critical') dropProbVal = 85;
                    else if (trend === 'warning') dropProbVal = 70;
                    else dropProbVal = 12;
                  }

                  return (
                    <StatusRow 
                      key={l.id || i}
                      name={`${cName} ↔ ${mName}`}
                      status={`ENGAGEMENT-${l.id?.slice(0,4).toUpperCase() || 'NEW'}`}
                      trend={trend}
                      confidence={`${dropProbVal}%`}
                      dotColor={dotColor}
                      onClick={() => setSelectedLinkage(l)}
                    />
                  );
                })
              )}
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
              { label: 'Avg Confidence', value: `${avgConfidence}%`,    sub: 'across linkages' },
              { label: 'At-Risk Count',  value: atRiskCount.toString(),      sub: 'need attention'  },
              { label: 'Next Alert',     value: nextAlert, sub: 'estimated'       },
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
                whileInView={{ width: `${avgConfidence}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[9px] font-mono" style={{ color: 'rgba(0,206,209,0.55)' }}>{avgConfidence}% system health</span>
          </div>
        </motion.div>

      </motion.div>
    </div>

    <AnimatePresence>
      {selectedLinkage && (
        <ErrorBoundary onClose={() => setSelectedLinkage(null)}>
          <DetailPanel 
            key={selectedLinkage.id} 
            linkage={selectedLinkage} 
            onClose={() => setSelectedLinkage(null)} 
          />
        </ErrorBoundary>
      )}
    </AnimatePresence>
  </section>
  );
};

export default TrajectoryPredictor;
