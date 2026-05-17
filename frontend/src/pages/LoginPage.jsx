import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, User, Eye, EyeOff, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';

const ORANGE = '#FF6A00';
const GOLDEN = '#FFD700';
const BEIGE  = '#F0ECDA';
const SF     = '#487F86';
const HB     = '#134C65';
const AQ     = '#00CED1';
const MUTED  = 'rgba(240,236,218,0.50)';

const TEST_USERS = [
  { username: 'superadmin', password: 'admin123',   role: 'Super Admin',      desc: 'Full system access' },
  { username: 'progadmin',  password: 'admin123',   role: 'Programme Admin',  desc: 'Manage matches & linkages' },
  { username: 'mentor01',   password: 'mentor123',  role: 'Mentor',           desc: 'View linkages only' },
  { username: 'company01',  password: 'company123', role: 'Company',          desc: 'View linkages only' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillUser = (u) => {
    setUsername(u.username);
    setPassword(u.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Background — matches the app's Coastal Command theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: '#0E1E2F' }} />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#487F86 1px, transparent 1px), linear-gradient(90deg, #487F86 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#F0ECDA 1px, transparent 1px)',
            backgroundSize: '90px 90px',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(19,76,101,0.18) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[480px] mx-6">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className="absolute inset-0 rotate-45 scale-75" style={{ border: `1px solid ${SF}` }} />
              <div className="absolute inset-0 rotate-12 scale-50" style={{ border: `1px solid ${HB}` }} />
              <Zap className="absolute inset-0 w-4 h-4 m-auto" style={{ color: SF }} />
            </div>
            <span className="font-mono font-bold tracking-[0.2em] text-lg uppercase" style={{ color: GOLDEN }}>
              LinkOS
            </span>
          </div>
          <p className="text-[11px] font-mono tracking-[0.3em] uppercase" style={{ color: MUTED }}>
            Ecosystem Intelligence Platform
          </p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative p-8 overflow-hidden"
          style={{
            background: 'rgba(14,30,47,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(72,127,134,0.25)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.45)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: SF }} />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: SF }} />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: SF }} />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: SF }} />

          {/* Scanline effect */}
          <div
            className="absolute left-0 right-0 h-px pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${SF}40, transparent)`,
              animation: 'scanline 4s linear infinite',
            }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2" style={{ background: `${SF}18`, border: `1px solid ${SF}40` }}>
              <Lock className="w-4 h-4" style={{ color: AQ }} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: BEIGE }}>
                Authentication Required
              </h1>
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: MUTED }}>
                Enter credentials to access the system
              </p>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-3 mb-6"
                style={{ border: '1px solid rgba(255,77,196,0.30)', background: 'rgba(255,77,196,0.06)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#FF4DC4' }} />
                <p className="text-[12px] font-mono" style={{ color: '#FF4DC4' }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-[10px] font-mono tracking-[0.25em] uppercase mb-2" style={{ color: SF }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${SF}80` }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username…"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 text-[13px] font-mono outline-none transition-colors"
                  style={{
                    background: 'rgba(14,30,47,0.60)',
                    border: '1px solid rgba(72,127,134,0.35)',
                    color: BEIGE,
                    caretColor: AQ,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = `${AQ}88`)}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(72,127,134,0.35)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-mono tracking-[0.25em] uppercase mb-2" style={{ color: SF }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${SF}80` }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password…"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 text-[13px] font-mono outline-none transition-colors"
                  style={{
                    background: 'rgba(14,30,47,0.60)',
                    border: '1px solid rgba(72,127,134,0.35)',
                    color: BEIGE,
                    caretColor: AQ,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = `${AQ}88`)}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(72,127,134,0.35)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showPwd
                    ? <EyeOff className="w-4 h-4" style={{ color: BEIGE }} />
                    : <Eye className="w-4 h-4" style={{ color: BEIGE }} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-3 py-3.5 text-[12px] font-mono font-bold tracking-[0.25em] uppercase
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group relative"
              style={{ background: BEIGE, color: '#0E1E2F', border: `2px solid ${BEIGE}` }}
              whileHover={loading ? {} : { boxShadow: `0 0 32px rgba(240,236,218,0.35)`, y: -1 }}
            >
              <div
                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
              />
              <span className="relative flex items-center gap-2">
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: ORANGE }} />
                  : <Zap className="w-4 h-4 fill-current" style={{ color: ORANGE }} />
                }
                {loading ? 'Authenticating…' : 'Login'}
              </span>
            </motion.button>
          </form>
        </motion.div>


      </div>
    </div>
  );
};

export default LoginPage;
