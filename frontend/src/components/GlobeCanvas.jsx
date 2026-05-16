import React, { useRef, useEffect } from 'react';

const toRad = d => (d * Math.PI) / 180;

const project = (lat, lon, rotY, R, cx, cy) => {
  const phi = toRad(lat);
  const theta = toRad(lon + rotY);
  const x3 = R * Math.cos(phi) * Math.sin(theta);
  const y3 = R * Math.sin(phi);
  const z3 = R * Math.cos(phi) * Math.cos(theta);
  return { sx: cx + x3, sy: cy - y3, z: z3 };
};

// Simplified continent polygon outlines [lat, lon]
const CONTINENTS = [
  // North America
  [[70,-140],[50,-125],[35,-120],[20,-105],[10,-85],[10,-75],[30,-80],[45,-65],[65,-55],[70,-75],[70,-140]],
  // South America
  [[10,-70],[0,-50],[-20,-40],[-33,-55],[-55,-65],[-55,-70],[-30,-70],[-10,-75],[10,-70]],
  // Europe
  [[72,28],[55,5],[36,-5],[36,10],[50,15],[60,30],[72,28]],
  // Africa
  [[37,10],[10,42],[-25,33],[-34,25],[-15,0],[5,-5],[20,38],[37,10]],
  // Asia (main)
  [[70,30],[55,60],[50,90],[55,130],[45,140],[25,120],[5,100],[15,75],[30,50],[50,30],[70,30]],
  // Malay Peninsula
  [[5,100],[5,104],[1,103],[4,102],[5,100]],
  // Australia
  [[-16,128],[-14,145],[-32,152],[-38,140],[-22,114],[-16,128]],
];

// Data points [lat, lon, label]
const DATA_POINTS = [
  [1.35, 103.82, 'SG'],
  [3.14, 101.69, 'KL'],
  [13.75, 100.52, 'BK'],
  [14.55, 121.03, 'MN'],
  [31.23, 121.47, 'SH'],
  [35.68, 139.69, 'TK'],
  [22.32, 114.17, 'HK'],
  [-6.21, 106.84, 'JK'],
  [51.51, -0.12, 'LN'],
  [40.71, -74.01, 'NY'],
  [-33.87, 151.21, 'SY'],
  [19.08, 72.88, 'MB'],
];

// Connection pairs
const CONNECTIONS = [[0,1],[0,2],[0,7],[1,2],[3,4],[4,5],[0,6],[4,6],[8,9],[1,3]];

const GlobeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const SIZE = 520;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + 'px';
    canvas.style.height = SIZE + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R = 210;
    let rot = 100; // start showing SE Asia
    let animId;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      time += 0.016;

      // ── 1. Sphere body ──
      const bodyGrad = ctx.createRadialGradient(cx - 65, cy - 65, 10, cx, cy, R);
      bodyGrad.addColorStop(0, 'rgba(90, 50, 180, 0.95)');
      bodyGrad.addColorStop(0.45, 'rgba(20, 8, 70, 0.98)');
      bodyGrad.addColorStop(1, 'rgba(3, 3, 14, 1)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      // Clip all subsequent drawing inside sphere
      ctx.clip();

      // ── 2. Lat/lon grid ──
      ctx.lineWidth = 0.4;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      // longitude lines
      for (let lon = 0; lon < 360; lon += 20) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = project(lat, lon, rot, R, cx, cy);
          if (p.z < 0) { first = true; continue; }
          first ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy);
          first = false;
        }
        ctx.stroke();
      }
      // latitude lines
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lon = 0; lon <= 360; lon += 3) {
          const p = project(lat, lon, rot, R, cx, cy);
          if (p.z < 0) { first = true; continue; }
          first ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy);
          first = false;
        }
        ctx.stroke();
      }

      // ── 3. Continent outlines ──
      CONTINENTS.forEach(pts => {
        ctx.beginPath();
        let first = true;
        pts.forEach(([lat, lon]) => {
          const p = project(lat, lon, rot, R, cx, cy);
          if (p.z < 5) { first = true; return; }
          first ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy);
          first = false;
        });
        ctx.closePath();
        ctx.strokeStyle = 'rgba(160, 190, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(80, 50, 150, 0.12)';
        ctx.fill();
      });

      // ── 4. Connection arcs ──
      CONNECTIONS.forEach(([i, j]) => {
        const a = DATA_POINTS[i], b = DATA_POINTS[j];
        const pa = project(a[0], a[1], rot, R, cx, cy);
        const pb = project(b[0], b[1], rot, R, cx, cy);
        if (pa.z < 0 || pb.z < 0) return;
        const mx = (pa.sx + pb.sx) / 2;
        const my = (pa.sy + pb.sy) / 2 - 25;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.quadraticCurveTo(mx, my, pb.sx, pb.sy);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ── 5. Data points with pulsing rings ──
      DATA_POINTS.forEach(([lat, lon], idx) => {
        const p = project(lat, lon, rot, R, cx, cy);
        if (p.z < 0) return;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + idx);

        // Outer ring
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 6 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 + pulse * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glow
        const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, 7);
        glow.addColorStop(0, 'rgba(0,240,255,0.9)');
        glow.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 7, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00F0FF';
        ctx.fill();
      });

      ctx.restore();

      // ── 6. Limb atmosphere glow (outside clip) ──
      const limbGrad = ctx.createRadialGradient(cx, cy, R - 8, cx, cy, R + 30);
      limbGrad.addColorStop(0, 'rgba(112,0,255,0.5)');
      limbGrad.addColorStop(0.5, 'rgba(0,240,255,0.15)');
      limbGrad.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R + 30, 0, Math.PI * 2);
      ctx.fillStyle = limbGrad;
      ctx.fill();

      rot += 0.12;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative" style={{ width: 520, height: 520 }}>
      {/* Orbital rings — CSS behind canvas */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Ring A */}
        <div className="absolute w-[600px] h-[200px] rounded-full border border-[#7000FF]/40 shadow-[0_0_20px_rgba(112,0,255,0.2)]"
          style={{ transform: 'rotateX(75deg)' }} />
        {/* Ring B */}
        <div className="absolute w-[480px] h-[160px] rounded-full border border-[#00F0FF]/20"
          style={{ transform: 'rotateX(75deg)' }} />
      </div>
      <canvas ref={canvasRef} className="relative z-10" />
    </div>
  );
};

export default GlobeCanvas;
