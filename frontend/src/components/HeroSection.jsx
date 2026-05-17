import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { runMatch, getProgrammes, getStats } from '../lib/api';

const ORANGE = '#FF6A00';
const GOLDEN = '#FFD700';
const BEIGE  = '#F0ECDA';
const SF     = '#487F86';
const HB     = '#134C65';
const MUTED  = 'rgba(240,236,218,0.55)';

// ── Typewriter ─────────────────────────────────────────────────────
const useTypewriter = (texts, speed = 65, pause = 2000) => {
  const [display, setDisplay] = useState('');
  const [tIdx, setTIdx]       = useState(0);
  const [cIdx, setCIdx]       = useState(0);
  const [del,  setDel]        = useState(false);

  useEffect(() => {
    const cur = texts[tIdx];
    const id  = setTimeout(() => {
      if (!del) {
        setDisplay(cur.slice(0, cIdx + 1));
        if (cIdx + 1 === cur.length) setTimeout(() => setDel(true), pause);
        else setCIdx(c => c + 1);
      } else {
        setDisplay(cur.slice(0, cIdx - 1));
        if (cIdx - 1 === 0) {
          setDel(false);
          setTIdx(i => (i + 1) % texts.length);
          setCIdx(0);
        } else {
          setCIdx(c => c - 1);
        }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(id);
  }, [cIdx, del, tIdx, texts, speed, pause]);

  return display;
};

// ── Counter ────────────────────────────────────────────────────────
const Counter = ({ target, suffix = '', label, numColor, labelColor }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = Math.ceil(target / 80);
    const t = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) { clearInterval(t); return target; }
        return prev + step;
      });
    }, 20);
    return () => clearInterval(t);
  }, [target]);

  return (
    <div
      className="relative flex flex-col px-8 py-4 min-w-[130px]"
      style={{ border: `1px solid rgba(72,127,134,0.30)`, background: 'rgba(72,127,134,0.06)' }}
    >
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: numColor }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: numColor }} />
      <span className="font-mono font-bold text-2xl tabular-nums" style={{ color: numColor }}>
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-[11px] tracking-widest uppercase mt-1" style={{ color: labelColor }}>{label}</span>
    </div>
  );
};

// ── Hero ────────────────────────────────────────────────────────────
const HeroSection = () => {
  const navigate = useNavigate();
  const [launching,   setLaunching]   = useState(false);
  const [swarmStatus, setSwarmStatus] = useState(null);
  const [stats, setStats]             = useState({ active_linkages: 0, agents_online: 0, match_accuracy: 0 });

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  const typewriterText = useTypewriter(
    ['Programmable.', 'Automated.', 'Self-Improving.', 'Scalable.'],
    65, 1800,
  );

  const handleSwarm = async () => {
    if (launching) return;
    setLaunching(true);
    setSwarmStatus(null);
    try {
      let programmeId = 'demo-programme-001';
      try {
        const programmes = await getProgrammes();
        if (programmes?.length > 0) programmeId = programmes[0].id;
      } catch (_) { /* no programmes yet */ }
      await runMatch({ programme_id: programmeId });
      setSwarmStatus('ok');
      navigate('/matching');
    } catch (err) {
      console.error('Swarm launch error:', err);
      setSwarmStatus('error');
      setLaunching(false);
    }
  };

  return (
    /* ── Outer wrapper: contains video + content ── */
    <div className="relative w-full min-h-screen overflow-hidden">

      {/* Layer 1 — Video (hero only) */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
      >
        <source src="/background.mp4"  type="video/mp4" />
        <source src="/background.webm" type="video/webm" />
      </video>

      {/* Layer 2 — Dark overlay; raise opacity to darken video */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(14,30,47,0.72)', zIndex: 1 }}
      />

      {/* Layer 3 — All text content */}
      <div
        className="relative flex flex-col items-start justify-center text-left
                   px-12 md:px-20 lg:px-28 py-20 max-w-5xl min-h-screen"
        style={{ zIndex: 2 }}
      >

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6"
          style={{ background: BEIGE, border: `1px solid ${BEIGE}` }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            animate={{ backgroundColor: ['#FF0000', '#00CC44', '#FF0000'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'steps(1)' }}
          />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase font-bold" style={{ color: ORANGE }}>
            Multi-Agent Ecosystem Platform
          </span>
        </motion.div>

        {/* Eyebrow */}
        <p className="text-[1rem] font-mono font-bold tracking-[0.4em] uppercase mb-3" style={{ color: GOLDEN }}>
          Link_OS
        </p>

        {/* Headline */}
        <h1
          className="text-[2.8rem] md:text-[3.6rem] lg:text-[4.2rem] font-extrabold leading-[1.08] tracking-tight mb-3"
          style={{ color: ORANGE }}
        >
          Ecosystem Intelligence,
        </h1>

        {/* Typewriter */}
        <div className="flex items-center gap-2 h-[3.4rem] md:h-[4rem] lg:h-[4.8rem] mb-8">
          <span
            className="text-[2.4rem] md:text-[3rem] lg:text-[3.6rem] font-extrabold leading-none tracking-tight text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${HB} 0%, ${SF} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {typewriterText}
          </span>
          <motion.span
            className="w-[3px] h-[2.8rem] md:h-[3.4rem]"
            style={{ background: SF, boxShadow: `0 0 10px ${SF}` }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'steps(1)' }}
          />
        </div>

        {/* Subtext */}
        <motion.p
          className="text-base md:text-lg mb-10 max-w-2xl leading-relaxed"
          style={{ color: MUTED }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Deploy multi-agent swarms to match mentors, track company trajectories,
          and predict risks — automatically.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap gap-4 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <Counter target={stats.active_linkages} label="Active Linkages" numColor="#FF2020" labelColor="#FF6060" />
          <Counter target={stats.agents_online}    label="Agents Online"   numColor="#00E676" labelColor="#66BB6A" />
          <Counter target={stats.match_accuracy}    label="Match Accuracy"  suffix="%" numColor="#FFFFFF" labelColor="rgba(255,255,255,0.55)" />
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={handleSwarm}
          disabled={launching}
          className="group relative px-12 py-4 text-sm font-mono font-bold tracking-[0.25em] uppercase
                     overflow-hidden hover:-translate-y-1 transition-all duration-300
                     disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: BEIGE, border: `2px solid ${BEIGE}` }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, type: 'spring' }}
          whileHover={launching ? {} : { boxShadow: `0 0 40px rgba(240,236,218,0.45)` }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
                       transition-transform duration-700 skew-x-[-20deg]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
          />
          <span className="relative flex items-center gap-3" style={{ color: '#0E1E2F' }}>
            {launching ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: ORANGE }} />
            ) : (
              <motion.span
                animate={{
                  scale:   [1, 1.4, 0.85, 1.3, 0.95, 1],
                  opacity: [1, 0.5, 1,   0.6, 1,    1],
                  rotate:  [0, -8,  8,  -5,   5,    0],
                }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap className="w-4 h-4 fill-current" style={{ color: ORANGE }} />
              </motion.span>
            )}
            {launching ? 'Initializing...' : 'Initialize Swarm'}
          </span>
        </motion.button>

        {/* Error state */}
        {swarmStatus === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-[11px] font-mono tracking-wider"
            style={{ color: '#FF6060' }}
          >
            ⚠ Backend unreachable — ensure FastAPI is running on port 8000
          </motion.p>
        )}

      </div>
      {/* end content layer */}

    </div>
    /* end outer wrapper */
  );
};

export default HeroSection;
