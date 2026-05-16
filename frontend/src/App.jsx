import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Matching from './pages/Matching';
import Register from './pages/Register';

// ── Coastal background (no video — video lives in HeroSection only) ───────
const Background = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    {/* Base colour */}
    <div className="absolute inset-0" style={{ background: '#0E1E2F' }} />

    {/* Subtle grid */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          'linear-gradient(#487F86 1px, transparent 1px), linear-gradient(90deg, #487F86 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />

    {/* Dot starfield */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: 'radial-gradient(#F0ECDA 1px, transparent 1px)',
        backgroundSize: '90px 90px',
      }}
    />

    {/* Bottom depth glow */}
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1600px] h-[480px]"
      style={{
        background: 'radial-gradient(ellipse, rgba(19,76,101,0.30) 0%, rgba(72,127,134,0.08) 55%, transparent 75%)',
        filter: 'blur(80px)',
      }}
    />

    {/* Top-right accent */}
    <div
      className="absolute top-0 right-0 w-[600px] h-[400px]"
      style={{
        background: 'radial-gradient(ellipse at top right, rgba(72,127,134,0.10) 0%, transparent 65%)',
        filter: 'blur(60px)',
      }}
    />
  </div>
);

const AppLayout = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ color: '#F0ECDA' }}>
      <Background />

      {/* Cursor glow — seafoam tint */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none z-10 transition-transform duration-75 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(72,127,134,0.08) 0%, rgba(72,127,134,0) 60%)',
          mixBlendMode: 'screen',
        }}
      />

      <div className="relative z-20">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <div className="relative w-full pt-14">
                <Landing />
              </div>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matching"  element={<Matching />} />
          <Route path="/register"  element={<Register />} />
          <Route path="*"          element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
