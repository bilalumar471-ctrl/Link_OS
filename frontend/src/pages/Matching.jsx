import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Terminal, ChevronRight, AlertCircle } from 'lucide-react';
import { runMatch, streamReasoning } from '../lib/api';

// ── Log line component ────────────────────────────────────────────
const LogLine = ({ line, index }) => {
  const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('fail');
  const isSuccess = line.toLowerCase().includes('matched') || line.toLowerCase().includes('complete') || line.toLowerCase().includes('score');
  const isThinking = line.toLowerCase().includes('thinking') || line.toLowerCase().includes('reasoning') || line.startsWith('>');

  const color = isError ? '#FF4DC4' : isSuccess ? '#40E0D0' : isThinking ? '#818CF8' : '#7EAFC4';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 py-0.5"
    >
      <span className="text-[#00F0FF]/30 font-mono text-[11px] w-10 flex-shrink-0 text-right select-none">
        {String(index + 1).padStart(3, '0')}
      </span>
      <span className="font-mono text-[12px] leading-relaxed" style={{ color }}>
        {isThinking && <ChevronRight className="inline w-3 h-3 mr-1 opacity-60" />}
        {line}
      </span>
    </motion.div>
  );
};

// ── Matching page ─────────────────────────────────────────────────
const Matching = () => {
  const [programmeId, setProgrammeId] = useState('');
  const [running, setRunning]         = useState(false);
  const [streaming, setStreaming]     = useState(false);
  const [logs, setLogs]               = useState([]);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const logRef = useRef(null);
  const stopStream = useRef(null);

  // Auto-scroll log window
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Cleanup on unmount
  useEffect(() => () => stopStream.current?.(), []);

  const handleRun = async () => {
    if (!programmeId.trim()) return;
    setRunning(true);
    setLogs([]);
    setResult(null);
    setError(null);

    try {
      // 1. Start SSE stream for reasoning logs BEFORE triggering the match
      setStreaming(true);
      stopStream.current = streamReasoning(
        (line) => setLogs(prev => [...prev, line]),
        () => setStreaming(false),
      );

      // 2. Trigger the match agent
      const matchRes = await runMatch({ programme_id: programmeId.trim() });
      setResult(matchRes);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
      setTimeout(() => {
        handleStop();
      }, 1000);
    }
  };

  const handleStop = () => {
    stopStream.current?.();
    setStreaming(false);
  };

  const totalMatches = result?.matches?.length ?? 0;

  return (
    <div className="min-h-screen pt-20 px-6 md:px-12 pb-20">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-mono tracking-[0.3em] text-[#818CF8] uppercase mb-1">Agent Orchestrator</p>
          <h1 className="text-3xl font-extrabold text-[#E0E7FF] tracking-tight mb-2">Run Matching Engine</h1>
          <p className="text-[#7EAFC4] text-sm max-w-xl">
            Trigger the multi-agent swarm for a programme. Gemini reasoning will stream live as agents evaluate each mentor-company pair.
          </p>
        </div>

        {/* Input + trigger */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00F0FF]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00F0FF]" />
            <input
              type="text"
              value={programmeId}
              onChange={e => setProgrammeId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !running && handleRun()}
              placeholder="Enter Programme ID…"
              className="w-full bg-[#050511]/80 border border-[#00F0FF]/25 text-[#E0E7FF] font-mono text-sm px-4 py-3 focus:outline-none focus:border-[#00F0FF]/70 placeholder-[#7EAFC4]/40 transition-colors"
            />
          </div>

          <motion.button
            onClick={handleRun}
            disabled={running || !programmeId.trim()}
            className="relative flex items-center gap-2 px-6 py-3 text-sm font-mono tracking-[0.2em] uppercase border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group"
            whileHover={{ boxShadow: '0 0 30px rgba(0,240,255,0.2)' }}
          >
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-[#00F0FF]/10 to-transparent" />
            <Zap className={`w-4 h-4 ${running ? 'animate-pulse' : 'fill-current'}`} />
            {running ? 'Running…' : 'Run Match'}
          </motion.button>

          {streaming && (
            <button
              onClick={handleStop}
              className="px-4 py-3 text-[11px] font-mono tracking-widest uppercase border border-[#FF4DC4]/40 text-[#FF4DC4] hover:bg-[#FF4DC4]/10 transition-colors"
            >
              Stop
            </button>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-4 border border-[#FF4DC4]/30 bg-[#FF4DC4]/05 mb-6"
            >
              <AlertCircle className="w-4 h-4 text-[#FF4DC4] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#FF4DC4] font-mono text-sm">{error}</p>
                <p className="text-[#7EAFC4] text-xs mt-1">Make sure the backend is running at localhost:8000</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result summary */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-4 mb-6"
            >
              {[
                { label: 'Matches Generated', value: totalMatches, color: '#40E0D0' },
                { label: 'Programme',         value: programmeId,  color: '#818CF8' },
                { label: 'Status',            value: result.status || 'Done', color: '#00F0FF' },
              ].map(({ label, value, color }) => (
                <div key={label} className="relative p-4 border border-[#00F0FF]/15 bg-[#050511]/60">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: color }} />
                  <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color }}>{label}</p>
                  <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live reasoning terminal */}
        <div className="border border-[#00F0FF]/20 bg-[#020209] overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[#00F0FF]/15 bg-[#050511]">
            <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="font-mono text-[11px] tracking-widest text-[#7EAFC4] uppercase">Gemini Reasoning Log</span>
            {streaming && (
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="w-1.5 h-1.5 bg-[#40E0D0] rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-[#40E0D0] tracking-widest">LIVE</span>
              </span>
            )}
            {!streaming && logs.length > 0 && (
              <span className="text-[10px] font-mono text-[#7EAFC4]/50 ml-auto tracking-widest">
                {logs.length} LINES
              </span>
            )}
          </div>

          {/* Log body */}
          <div
            ref={logRef}
            className="p-4 h-[400px] overflow-y-auto scrollbar-thin"
            style={{ scrollbarColor: 'rgba(0,240,255,0.2) transparent' }}
          >
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-[#7EAFC4]/30">
                <Terminal className="w-8 h-8" />
                <p className="font-mono text-[12px] tracking-widest">
                  {running ? 'Initialising agents…' : 'Enter a Programme ID and run match to see reasoning logs'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {logs.map((line, i) => (
                  <LogLine key={i} line={line} index={i} />
                ))}
                {streaming && (
                  <div className="flex gap-3 py-0.5 mt-1">
                    <span className="text-[#00F0FF]/30 font-mono text-[11px] w-10 text-right">···</span>
                    <span className="font-mono text-[12px] text-[#00F0FF]/60 animate-pulse">▋</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Matched pairs */}
        <AnimatePresence>
          {result?.matches?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h2 className="text-lg font-bold text-[#E0E7FF] mb-4 tracking-tight">Generated Matches</h2>
              <div className="space-y-3">
                {result.matches.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between p-4 border border-[#00F0FF]/15 bg-[#050511]/60 hover:bg-[#00F0FF]/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] font-mono text-[#7EAFC4]/60 uppercase tracking-widest">Mentor</p>
                        <p className="text-[#E0E7FF] text-sm">{m.mentor_name || m.mentor_id}</p>
                      </div>
                      <div className="text-[#00F0FF]/40 font-mono text-xs">→</div>
                      <div>
                        <p className="text-[10px] font-mono text-[#7EAFC4]/60 uppercase tracking-widest">Company</p>
                        <p className="text-[#E0E7FF] text-sm">{m.company_name || m.company_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-[#7EAFC4]/60 uppercase tracking-widest">Fit Score</p>
                      <p className="text-[#40E0D0] font-mono font-bold text-lg">{m.fit_score}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Matching;
