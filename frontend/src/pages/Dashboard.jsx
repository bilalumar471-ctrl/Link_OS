import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, AlertTriangle, TrendingDown, RefreshCw, Filter } from 'lucide-react';
import { getLinkages, confirmLinkage, closeLinkage } from '../lib/api';

// ── Status badge ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    proposed:  { color: '#818CF8', label: 'PROPOSED' },
    active:    { color: '#40E0D0', label: 'ACTIVE' },
    completed: { color: '#00F0FF', label: 'COMPLETED' },
    dropped:   { color: '#FF4DC4', label: 'DROPPED' },
    reassigned:{ color: '#FF4DC4', label: 'REASSIGNED' },
  };
  const s = map[status] || { color: '#7EAFC4', label: status?.toUpperCase() };
  return (
    <span
      className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5"
      style={{ color: s.color, border: `1px solid ${s.color}40`, background: `${s.color}10` }}
    >
      {s.label}
    </span>
  );
};

// ── Fit score bar ─────────────────────────────────────────────────
const ScoreBar = ({ score = 0 }) => {
  const color = score >= 80 ? '#40E0D0' : score >= 60 ? '#818CF8' : '#FF4DC4';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-[#00F0FF]/10 rounded-none overflow-hidden">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <span className="text-[12px] font-mono w-10 text-right" style={{ color }}>{score}%</span>
    </div>
  );
};

// ── Linkage row ───────────────────────────────────────────────────
const LinkageRow = ({ linkage, onConfirm, onClose, index }) => {
  const [loading, setLoading] = useState(false);
  const mentorName  = linkage.entity_a?.snapshot?.name || linkage.entity_a?.id || '—';
  const companyName = linkage.entity_b?.snapshot?.name || linkage.entity_b?.id || '—';

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(linkage.id); } finally { setLoading(false); }
  };
  const handleClose = async () => {
    setLoading(true);
    try { await onClose(linkage.id); } finally { setLoading(false); }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group border-b border-[#00F0FF]/08 hover:bg-[#00F0FF]/[0.03] transition-colors duration-200"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-none" />
          <span className="text-[13px] text-[#E0E7FF]">{mentorName}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-[13px] text-[#7EAFC4]">{companyName}</span>
      </td>
      <td className="py-4 px-4">
        <ScoreBar score={linkage.fit_score || 0} />
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={linkage.status} />
      </td>
      <td className="py-4 px-4 text-[#7EAFC4] text-[11px] font-mono">
        {linkage.trajectory?.status || '—'}
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {linkage.status === 'proposed' && (
            <button
              disabled={loading}
              onClick={handleConfirm}
              className="text-[10px] font-mono tracking-widest px-2 py-1 border border-[#40E0D0]/40 text-[#40E0D0] hover:bg-[#40E0D0]/10 transition-colors disabled:opacity-40"
            >
              CONFIRM
            </button>
          )}
          {linkage.status === 'active' && (
            <button
              disabled={loading}
              onClick={handleClose}
              className="text-[10px] font-mono tracking-widest px-2 py-1 border border-[#FF4DC4]/40 text-[#FF4DC4] hover:bg-[#FF4DC4]/10 transition-colors disabled:opacity-40"
            >
              CLOSE
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// ── Dashboard page ────────────────────────────────────────────────
const Dashboard = () => {
  const [linkages, setLinkages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getLinkages(filter ? { status: filter } : {});
      setLinkages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, refreshKey]);

  const handleConfirm = async (id) => {
    await confirmLinkage(id);
    setRefreshKey(k => k + 1);
  };
  const handleClose = async (id) => {
    await closeLinkage(id, 'completed', 5.0);
    setRefreshKey(k => k + 1);
  };

  const FILTERS = ['', 'proposed', 'active', 'completed', 'dropped'];
  const stats = {
    total:     linkages.length,
    active:    linkages.filter(l => l.status === 'active').length,
    proposed:  linkages.filter(l => l.status === 'proposed').length,
    avgScore:  linkages.length
      ? Math.round(linkages.reduce((s, l) => s + (l.fit_score || 0), 0) / linkages.length)
      : 0,
  };

  return (
    <div className="min-h-screen pt-20 px-6 md:px-12 pb-20">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-[#00F0FF] uppercase mb-1">Live Data</p>
            <h1 className="text-3xl font-extrabold text-[#E0E7FF] tracking-tight">Linkage Dashboard</h1>
          </div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-2 px-4 py-2 border border-[#00F0FF]/30 text-[#00F0FF] text-[11px] font-mono tracking-widest uppercase hover:bg-[#00F0FF]/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Linkages', value: stats.total, color: '#00F0FF' },
            { label: 'Active',         value: stats.active, color: '#40E0D0' },
            { label: 'Proposed',       value: stats.proposed, color: '#818CF8' },
            { label: 'Avg Fit Score',  value: `${stats.avgScore}%`, color: '#FF4DC4' },
          ].map(({ label, value, color }) => (
            <div key={label} className="relative p-5 border border-[#00F0FF]/15 bg-[#050511]/60">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: color }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: color }} />
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color }}>{label}</p>
              <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          <Filter className="w-4 h-4 text-[#7EAFC4] mt-0.5" />
          {FILTERS.map(f => (
            <button
              key={f || 'all'}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-mono tracking-widest px-3 py-1 uppercase transition-colors ${
                filter === f
                  ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/50'
                  : 'text-[#7EAFC4] border border-[#7EAFC4]/20 hover:border-[#00F0FF]/30 hover:text-[#00F0FF]'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-[#00F0FF]/15 bg-[#050511]/50 overflow-auto">
          {error && (
            <div className="p-6 text-center">
              <p className="text-[#FF4DC4] font-mono text-sm">⚠ {error}</p>
              <p className="text-[#7EAFC4] text-xs mt-1">Make sure the backend is running on port 8000</p>
            </div>
          )}
          {!error && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#00F0FF]/15">
                  {['Mentor', 'Company', 'Fit Score', 'Status', 'Trajectory', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-[10px] font-mono tracking-widest uppercase text-[#7EAFC4]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-[#00F0FF]/08 animate-pulse">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="py-4 px-4">
                            <div className="h-3 bg-[#00F0FF]/10 rounded-none w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : linkages.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-[#7EAFC4] text-sm">
                          No linkages found. Run a match to generate some.
                        </td>
                      </tr>
                    )
                    : linkages.map((l, i) => (
                      <LinkageRow
                        key={l.id}
                        index={i}
                        linkage={l}
                        onConfirm={handleConfirm}
                        onClose={handleClose}
                      />
                    ))
                }
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
