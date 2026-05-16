import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Cpu, Zap } from 'lucide-react';

const NAV = [
  { label: 'Overview',  to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Matching',  to: '/matching' },
  { label: 'Register',  to: '/register' },
];

const Header = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="fixed top-0 w-full z-50 h-14 flex items-center px-8 border-b"
      style={{
        background: 'rgba(14,30,47,0.90)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(72,127,134,0.20)',
      }}
    >
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-3 w-1/4 no-underline">
        <div className="relative w-6 h-6 flex-shrink-0">
          <div className="absolute inset-0 rotate-45 scale-75" style={{ border: '1px solid #487F86' }} />
          <div className="absolute inset-0 rotate-12 scale-50" style={{ border: '1px solid #134C65' }} />
          <Zap className="absolute inset-0 w-3 h-3 m-auto" style={{ color: '#487F86' }} />
        </div>
        <span className="font-mono font-bold tracking-[0.2em] text-sm uppercase" style={{ color: '#FFD700' }}>
          LinkOS
        </span>
        <span
          className="text-[9px] font-mono px-1.5 py-0.5"
          style={{ color: '#F0ECDA', border: '1px solid rgba(240,236,218,0.25)' }}
        >
          v1.2.0
        </span>
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 flex justify-center items-center gap-8">
        {NAV.map(({ label, to }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative group text-[11px] font-mono tracking-[0.2em] uppercase transition-colors duration-200 no-underline ${
                  isActive ? '' : ''
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#487F86' : 'rgba(240,236,218,0.55)',
              })}
            >
              {({ isActive }) => (
                <>
                  {label}
                  <span
                    className="absolute -bottom-0.5 left-0 h-px transition-all duration-300"
                    style={{
                      width: isActive ? '100%' : '0%',
                      background: '#487F86',
                    }}
                  />
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-4 w-1/4 justify-end">
        <span className="text-[10px] font-mono tracking-widest hidden sm:block" style={{ color: 'rgba(240,236,218,0.35)' }}>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <div
          className="flex items-center gap-2 px-3 py-1"
          style={{ border: '1px solid rgba(72,127,134,0.30)', background: 'rgba(72,127,134,0.07)' }}
        >
          <Cpu className="w-3 h-3" style={{ color: '#487F86' }} />
          <span className="text-[10px] font-mono tracking-widest" style={{ color: '#FFFFFF' }}>7 AGENTS</span>
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            animate={{ backgroundColor: ['#FF2020', '#880000', '#FF2020'] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'steps(1)' }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
