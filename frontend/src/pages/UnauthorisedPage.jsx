import React from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../lib/auth';

const BEIGE  = '#F0ECDA';
const SF     = '#487F86';
const ORANGE = '#FF6A00';
const MUTED  = 'rgba(240,236,218,0.50)';

const UnauthorisedPage = () => {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 mb-8"
          style={{ border: `2px solid ${ORANGE}40`, background: `${ORANGE}08` }}
          animate={{ boxShadow: [`0 0 0px ${ORANGE}00`, `0 0 30px ${ORANGE}25`, `0 0 0px ${ORANGE}00`] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <ShieldOff className="w-8 h-8" style={{ color: ORANGE }} />
        </motion.div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-3" style={{ color: BEIGE }}>
          Access Denied
        </h1>
        <p className="text-sm mb-2" style={{ color: MUTED }}>
          Your role <span className="font-mono font-bold" style={{ color: SF }}>
            {user?.role || 'unknown'}
          </span> does not have permission to access this resource.
        </p>
        <p className="text-[11px] font-mono mb-10" style={{ color: 'rgba(240,236,218,0.30)' }}>
          Contact your system administrator for elevated access.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-mono tracking-widest uppercase transition-colors"
            style={{ border: `1px solid ${SF}50`, color: SF }}
            onMouseEnter={(e) => (e.currentTarget.style.background = `${SF}15`)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-mono tracking-widest uppercase transition-colors"
            style={{ border: `1px solid ${ORANGE}50`, color: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.background = `${ORANGE}15`)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorisedPage;
