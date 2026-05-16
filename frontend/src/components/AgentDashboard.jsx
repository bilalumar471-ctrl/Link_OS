import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserCog, ShieldAlert, Activity, FileSearch,
  GitBranch, Brain, MessageSquare, Network, ArrowRight
} from 'lucide-react';

const SF    = '#487F86';
const HB    = '#134C65';
const BEIGE = '#F0ECDA';
const MUTED = 'rgba(240,236,218,0.55)';

// ── Tilt card ─────────────────────────────────────────────────────
const AgentCard = ({ title, icon: Icon, accentColor, delay, features, badge, href, layer }) => {
  const ref      = useRef(null);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 20 });
  const sy = useSpring(my, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { mx.set(0); my.set(0); setHovered(false); }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className="group relative flex flex-col h-full cursor-pointer"
      onClick={() => navigate(href)}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `0 20px 60px -8px ${accentColor}35, 0 0 0 1px ${accentColor}18` }}
      />

      <div
        className="relative flex flex-col h-full overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #132338 0%, #0E1B2C 100%)',
          border: `1px solid ${accentColor}25`,
        }}
      >
        {/* Top bar */}
        <div className="h-[2px] flex-shrink-0"
          style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}00)` }} />

        <div className="flex flex-col flex-1 p-5" style={{ transform: 'translateZ(18px)' }}>

          {/* Icon */}
          <div className="relative w-10 h-10 flex items-center justify-center mb-4 flex-shrink-0">
            <div
              className="absolute inset-0 rotate-45 transition-all duration-300 group-hover:scale-110"
              style={{ border: `1px solid ${accentColor}40`, background: `${accentColor}0A` }}
            />
            <AnimatePresence>
              {hovered && (
                <motion.div
                  className="absolute inset-0 rotate-45"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.0, opacity: 0 }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  style={{ border: `1px solid ${accentColor}` }}
                />
              )}
            </AnimatePresence>
            <Icon className="w-4 h-4 relative z-10" style={{ color: accentColor }} />
          </div>

          {/* Badge */}
          <span
            className="self-start text-[8px] font-mono tracking-[0.22em] uppercase px-2 py-0.5 mb-3 flex-shrink-0"
            style={{ color: accentColor, border: `1px solid ${accentColor}25`, background: `${accentColor}08` }}
          >
            {badge}
          </span>

          {/* Title */}
          <div className="mb-4 flex-shrink-0">
            <h3 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: BEIGE }}>
              {title}
            </h3>
            <div className="h-[1px]" style={{ background: `linear-gradient(90deg, ${accentColor}55, transparent)` }} />
          </div>

          {/* Features */}
          <ul className="space-y-1.5 flex-1">
            {features.map((feat, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 px-2 py-1.5 text-[11px] transition-colors duration-200 hover:text-[#F0ECDA]"
                style={{ color: MUTED, background: `${accentColor}07`, borderLeft: `2px solid ${accentColor}40` }}
              >
                <div className="w-1 h-1 flex-shrink-0" style={{ background: accentColor }} />
                {feat}
              </li>
            ))}
          </ul>

          {/* Status */}
          <div className="mt-4 flex items-center justify-between pt-3 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(72,127,134,0.10)' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: accentColor }} />
              <span className="text-[8px] font-mono tracking-widest uppercase" style={{ color: accentColor }}>Active</span>
            </div>
            <div
              className="flex items-center gap-1 text-[8px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0"
              style={{ color: accentColor }}
            >
              Open <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        {/* Scanline */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-full h-[1px]"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}35, transparent)` }}
            animate={{ top: ['-5%', '105%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ── Layer label ────────────────────────────────────────────────────
const LayerLabel = ({ label, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="flex items-center gap-3 mb-4"
  >
    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }} />
    <span className="text-[9px] font-mono tracking-[0.35em] uppercase" style={{ color }}>{label}</span>
    <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${color}40, transparent)` }} />
  </motion.div>
);

// ── Agent data ─────────────────────────────────────────────────────
const CORE_AGENTS = [
  {
    title: 'Mentor Agent',
    icon: UserCog,
    accentColor: SF,
    badge: 'Matching Engine',
    delay: 0.05,
    href: '/dashboard',
    features: ['Semantic Expertise Matching', 'Cosine Similarity Scoring', 'Gemini Fit Evaluation'],
  },
  {
    title: 'Risk Agent',
    icon: ShieldAlert,
    accentColor: BEIGE,
    badge: 'Threat Monitor',
    delay: 0.12,
    href: '/matching',
    features: ['Failure Pattern Detection', 'Engagement Risk Flags', 'Severity Classification'],
  },
  {
    title: 'Trajectory Predictor',
    icon: Activity,
    accentColor: '#2A7A8C',
    badge: 'Health Monitor',
    delay: 0.19,
    href: '/dashboard',
    features: ['Session Trend Analysis', 'Dropout Probability Score', 'Live Alert Streaming'],
  },
];

const ANALYTICS_AGENTS = [
  {
    title: 'Post-Mortem Engine',
    icon: FileSearch,
    accentColor: '#7E6A3A',
    badge: 'Failure Analyst',
    delay: 0.26,
    href: '/dashboard',
    features: ['Lesson Extraction', 'Failure Pattern Write-back', 'Session Log Analysis'],
  },
  {
    title: 'Evolution Engine',
    icon: GitBranch,
    accentColor: '#4A7A5C',
    badge: 'Cross-Cohort',
    delay: 0.32,
    href: '/dashboard',
    features: ['Future Fit Forecasting', 'Cohort Growth Projection', 'Domain Alignment Tracking'],
  },
  {
    title: 'Self-Reflection Engine',
    icon: Brain,
    accentColor: '#6A5A8C',
    badge: 'System Auditor',
    delay: 0.38,
    href: '/dashboard',
    features: ['Prediction vs Actual Audit', 'Systematic Bias Detection', 'Weight Adjustment Output'],
  },
  {
    title: 'NL Interface Agent',
    icon: MessageSquare,
    accentColor: '#5A7A6C',
    badge: 'Query Engine',
    delay: 0.44,
    href: '/dashboard',
    features: ['Natural Language Queries', '2-Step Gemini Routing', 'Plain English Summaries'],
  },
];

// ── Dashboard ──────────────────────────────────────────────────────
const AgentDashboard = () => (
  <section className="py-24 px-6 md:px-12 lg:px-20 relative z-10">
    <div className="max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-5"
          style={{ border: `1px solid rgba(72,127,134,0.30)`, background: 'rgba(72,127,134,0.04)' }}
        >
          <Network className="w-3.5 h-3.5 animate-pulse" style={{ color: SF }} />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: SF }}>
            Tactical Architecture
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
          style={{ color: BEIGE }}
        >
          Multi-Agent Dashboard
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base max-w-xl"
          style={{ color: MUTED }}
        >
          All 7 agents operate concurrently across the ecosystem linkage network.
        </motion.p>
      </div>

      {/* ── Core Matching Layer (3 cards) ── */}
      <LayerLabel label="Core Matching Layer" color={SF} delay={0.0} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {CORE_AGENTS.map(a => <AgentCard key={a.title} {...a} />)}
      </div>

      {/* ── Analytics & Intelligence Layer (4 cards) ── */}
      <LayerLabel label="Analytics & Intelligence Layer" color="#7E6A3A" delay={0.2} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {ANALYTICS_AGENTS.map(a => <AgentCard key={a.title} {...a} />)}
      </div>

    </div>
  </section>
);

export default AgentDashboard;
