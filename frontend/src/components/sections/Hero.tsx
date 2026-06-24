'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, Smartphone } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';

const FIRM_NAME = 'POTUPARTNERS';
const TAGLINE   = 'Excellence Without Compromise';

function GlobeEtching() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef    = useRef<number>(0);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    targetRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }, []);
  const onTouchMove = useCallback((e: TouchEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r || !e.touches[0]) return;
    targetRef.current = { x: (e.touches[0].clientX - r.left) / r.width, y: (e.touches[0].clientY - r.top) / r.height };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    type Vec3 = { x: number; y: number; z: number };
    const project = (latDeg: number, lonDeg: number, cx: number, cy: number, R: number, rotY: number, rotX: number): Vec3 & { sx: number; sy: number; vis: boolean } => {
      const lat = latDeg * Math.PI / 180;
      const lon = lonDeg * Math.PI / 180 + rotY;
      let x = Math.cos(lat) * Math.sin(lon);
      let y = -Math.sin(lat);
      let z = Math.cos(lat) * Math.cos(lon);
      const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
      y = y2; z = z2;
      return { x, y, z, sx: cx + R * x, sy: cy + R * y, vis: z > -0.08 };
    };

    // ─────────────────────────────────────────────────────────────────────────
    //  LAND POLYGONS — simple angular blobs, zero self-intersection
    // ─────────────────────────────────────────────────────────────────────────

    const IDN_SUMATRA: [number,number][] = [
      [ 5.5,  95.5],
      [ 4.0,  97.0],
      [ 1.0, 100.0],
      [-2.0, 103.0],
      [-5.5, 105.5],
      [-4.0, 107.0],
      [ 0.0, 108.0],
      [ 3.5, 106.5],
      [ 5.5,  95.5],
    ];

    const IDN_JAVA: [number,number][] = [
      [-6.0, 106.0],
      [-7.0, 108.5],
      [-7.5, 111.0],
      [-8.5, 114.0],
      [-8.5, 116.0],
      [-8.0, 116.0],
      [-7.5, 113.5],
      [-7.0, 111.0],
      [-6.5, 108.5],
      [-6.0, 106.0],
    ];

    const IDN_KALI: [number,number][] = [
      [ 4.0, 109.0],
      [ 5.5, 111.0],
      [ 5.5, 115.0],
      [ 4.0, 117.5],
      [ 1.5, 118.5],
      [-0.5, 118.5],
      [-2.0, 117.0],
      [-2.0, 114.0],
      [-1.0, 111.0],
      [ 0.5, 109.0],
      [ 2.5, 108.5],
      [ 4.0, 109.0],
    ];

    const IDN_SULAWESI: [number,number][] = [
      [ 3.5, 118.5],
      [ 3.5, 120.0],
      [ 1.5, 121.5],
      [ 1.5, 125.0],
      [ 0.5, 125.0],
      [ 0.5, 123.0],
      [-0.5, 122.5],
      [-4.0, 123.5],
      [-4.5, 122.0],
      [-5.5, 118.5],
      [-4.5, 118.5],
      [-2.0, 120.0],
      [-0.5, 120.0],
      [ 0.5, 119.5],
      [ 1.5, 118.5],
      [ 2.5, 118.0],
      [ 3.5, 118.5],
    ];

    const IDN_PAPUA: [number,number][] = [
      [-0.5, 131.0],
      [ 0.5, 131.0],
      [ 0.0, 133.0],
      [-1.0, 135.0],
      [-2.0, 138.0],
      [-2.0, 141.0],
      [-5.0, 141.0],
      [-7.5, 140.0],
      [-8.5, 137.0],
      [-8.0, 134.0],
      [-6.5, 132.0],
      [-4.5, 130.0],
      [-2.5, 130.0],
      [-0.5, 131.0],
    ];

    const IDN_HALMAHERA: [number,number][] = [
      [ 1.5, 127.5],
      [ 0.5, 127.5],
      [-1.0, 128.5],
      [ 0.0, 129.5],
      [ 1.5, 129.0],
      [ 1.5, 127.5],
    ];

    const IDN_SERAM: [number,number][] = [
      [-2.5, 128.5],
      [-3.5, 130.0],
      [-3.0, 131.0],
      [-2.0, 131.0],
      [-2.0, 129.5],
      [-2.5, 128.5],
    ];

    const IDN_NUSA_TENGGARA: [number,number][] = [
      [-8.0, 116.0],
      [-9.0, 117.0],
      [-9.0, 119.5],
      [-8.5, 120.0],
      [-8.0, 119.0],
      [-7.5, 118.0],
      [-7.5, 116.5],
      [-8.0, 116.0],
    ];

    const IDN_FLORES: [number,number][] = [
      [-8.0, 122.5],
      [-8.5, 124.0],
      [-8.0, 125.5],
      [-7.5, 124.0],
      [-7.5, 122.5],
      [-8.0, 122.5],
    ];

    const IDN_TIMOR: [number,number][] = [
      [-9.5, 124.5],
      [-9.5, 126.5],
      [-9.0, 127.0],
      [-8.5, 126.0],
      [-9.0, 124.5],
      [-9.5, 124.5],
    ];

    // ── NEIGHBOURS ───────────────────────────────────────────────────────────

    const MALAYSIA: [number,number][] = [
      [ 8.0, 100.0],
      [ 5.5, 102.0],
      [ 3.0, 103.0],
      [ 2.0, 103.5],
      [ 3.0, 104.5],
      [ 5.0, 103.5],
      [ 6.5, 101.5],
      [ 8.0, 100.0],
    ];

    const PHILIPPINES: [number,number][] = [
      [18.5, 121.0],
      [15.0, 120.0],
      [12.0, 121.5],
      [10.0, 124.5],
      [11.0, 125.5],
      [13.5, 123.0],
      [16.5, 121.5],
      [18.5, 121.0],
    ];

    const AUSTRALIA: [number,number][] = [
      [-14.0, 129.0],
      [-18.0, 126.0],
      [-25.0, 114.0],
      [-33.0, 115.0],
      [-38.0, 141.0],
      [-38.0, 147.0],
      [-34.0, 151.0],
      [-25.0, 153.0],
      [-18.0, 146.0],
      [-12.0, 141.0],
      [-12.0, 136.0],
      [-14.0, 129.0],
    ];

    const PAPUA_NG: [number,number][] = [
      [-2.0, 142.0],
      [-4.0, 144.0],
      [-7.0, 147.0],
      [-9.0, 148.0],
      [-8.0, 144.0],
      [-4.5, 141.5],
      [-2.0, 142.0],
    ];

    const INDIA: [number,number][] = [
      [35.0,  73.0],
      [28.0,  68.0],
      [22.0,  69.0],
      [18.0,  73.0],
      [10.0,  77.0],
      [ 8.0,  78.0],
      [11.0,  80.0],
      [16.0,  81.0],
      [22.0,  87.0],
      [27.0,  87.0],
      [30.0,  80.0],
      [35.0,  73.0],
    ];

    const CHINA_COAST: [number,number][] = [
      [40.0, 120.0],
      [35.0, 119.0],
      [30.0, 121.0],
      [25.0, 121.0],
      [22.0, 114.0],
      [20.0, 110.0],
      [21.0, 108.0],
      [23.0, 104.0],
      [25.0, 101.0],
      [28.0,  99.0],
      [32.0,  99.0],
      [36.0, 104.0],
      [38.0, 114.0],
      [40.0, 120.0],
    ];

    const THAILAND: [number,number][] = [
      [20.0,  98.0],
      [18.0,  99.0],
      [14.0, 100.0],
      [ 8.0,  98.0],
      [ 8.5, 100.5],
      [12.0, 101.0],
      [15.0, 101.5],
      [18.5, 100.5],
      [20.0,  98.0],
    ];

    const VIETNAM: [number,number][] = [
      [22.0, 104.0],
      [20.0, 106.0],
      [17.0, 107.0],
      [12.0, 109.0],
      [10.0, 107.0],
      [11.0, 104.0],
      [14.0, 103.0],
      [18.0, 104.0],
      [22.0, 104.0],
    ];

    const MYANMAR: [number,number][] = [
      [27.0,  97.0],
      [22.0,  97.0],
      [19.0,  94.0],
      [18.0,  97.0],
      [20.0,  99.0],
      [22.0, 100.0],
      [25.0,  98.0],
      [27.0,  97.0],
    ];

    const JAPAN: [number,number][] = [
      [44.0, 141.0],
      [41.0, 141.0],
      [36.0, 138.0],
      [33.0, 130.0],
      [34.0, 129.0],
      [38.0, 140.0],
      [42.0, 142.0],
      [44.0, 141.0],
    ];

    const SRILANKA: [number,number][] = [
      [10.0, 80.0],
      [ 8.0, 81.0],
      [ 6.0, 81.0],
      [ 6.0, 80.0],
      [ 8.0, 79.5],
      [10.0, 80.0],
    ];

    const CAMBODIA: [number,number][] = [
      [14.5, 102.0],
      [12.0, 102.0],
      [10.5, 104.0],
      [12.5, 105.5],
      [14.5, 103.0],
      [14.5, 102.0],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    //  DOT-MATRIX HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /** Ray-casting point-in-polygon — polygon vertices are [lat, lon] pairs */
    const pointInPolygon = (lat: number, lon: number, poly: [number, number][]): boolean => {
      let inside = false;
      const n = poly.length;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const [yi, xi] = poly[i];
        const [yj, xj] = poly[j];
        const intersect =
          yi > lat !== yj > lat &&
          lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Classify each polygon as Indonesian (bright) or neighbour (dim)
    const indonesianPolygons: [number,number][][] = [
      IDN_KALI, IDN_SUMATRA, IDN_JAVA, IDN_SULAWESI, IDN_PAPUA,
      IDN_HALMAHERA, IDN_SERAM, IDN_NUSA_TENGGARA, IDN_FLORES, IDN_TIMOR,
    ];
    const neighbourPolygons: [number,number][][] = [
      AUSTRALIA, CHINA_COAST, INDIA, MYANMAR, JAPAN, SRILANKA, PAPUA_NG,
      THAILAND, VIETNAM, CAMBODIA, MALAYSIA, PHILIPPINES,
    ];

    /**
     * Precompute land-dot grid once.
     * Each entry: [lat, lon, isIndonesian]
     * Step ≈ 1.2° — good balance of density and performance.
     */
    const STEP = 1.2;
    type DotPoint = { lat: number; lon: number; isIdn: boolean };
    const landDots: DotPoint[] = [];

    for (let lat = -90; lat <= 90; lat += STEP) {
      for (let lon = -180; lon <= 180; lon += STEP) {
        let isIdn = false;
        let isNeighbour = false;

        for (const poly of indonesianPolygons) {
          if (pointInPolygon(lat, lon, poly)) { isIdn = true; break; }
        }
        if (!isIdn) {
          for (const poly of neighbourPolygons) {
            if (pointInPolygon(lat, lon, poly)) { isNeighbour = true; break; }
          }
        }

        if (isIdn || isNeighbour) {
          landDots.push({ lat, lon, isIdn: isIdn });
        }
      }
    }

    /** Draw all land dots for the current globe rotation */
    const drawDotMatrix = (
      cx: number, cy: number, R: number, rotY: number, rotX: number, now: number
    ) => {
      for (const { lat, lon, isIdn } of landDots) {
        const p = project(lat, lon, cx, cy, R, rotY, rotX);
        if (!p.vis || p.z < 0.05) continue;

        const depth = p.z; // 0 → 1, fades toward limb

        if (isIdn) {
          // ── Indonesian islands — vivid gold dots with glow ──────────────
          const pulse = 0.85 + 0.15 * Math.sin(now * 0.001 + lon * 0.25 + lat * 0.18);
          const alpha  = depth * 0.88 * pulse;
          const radius = 1.35 * depth;

          // Glow halo
          const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, radius * 4.5);
          glow.addColorStop(0,   `rgba(212,175,55,${alpha * 0.55})`);
          glow.addColorStop(0.5, `rgba(180,135,35,${alpha * 0.18})`);
          glow.addColorStop(1,   'rgba(120,80,10,0)');
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, radius * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
          const r = 200 + Math.floor(55 * pulse * depth);
          const g = 160 + Math.floor(40 * depth);
          const b = 40 + Math.floor(20 * depth);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        } else {
          // ── Neighbouring countries — subtle, dim dots ────────────────────
          const alpha  = depth * 0.28;
          const radius = 0.85 * depth;

          // Faint halo
          const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, radius * 3.5);
          glow.addColorStop(0,   `rgba(160,120,45,${alpha * 0.35})`);
          glow.addColorStop(1,   'rgba(80,55,10,0)');
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, radius * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160,118,38,${alpha})`;
          ctx.fill();
        }
      }
    };

    interface City { lat: number; lon: number; major: boolean; label: string }
    const CITIES: City[] = [
      { lat:-6.2,  lon:106.8, major:true,  label:'Jakarta'    },
      { lat:1.3,   lon:103.8, major:true,  label:'Singapore'  },
      { lat:-8.7,  lon:115.2, major:false, label:'Bali'       },
      { lat:-7.8,  lon:110.4, major:false, label:'Yogya'      },
      { lat:3.1,   lon:101.7, major:false, label:'KL'         },
      { lat:13.7,  lon:100.5, major:false, label:'Bangkok'    },
      { lat:10.8,  lon:106.7, major:false, label:'HCMC'       },
      { lat:21.0,  lon:105.8, major:false, label:'Hanoi'      },
      { lat:22.3,  lon:114.2, major:true,  label:'Hong Kong'  },
      { lat:31.2,  lon:121.5, major:true,  label:'Shanghai'   },
      { lat:35.7,  lon:139.7, major:true,  label:'Tokyo'      },
      { lat:37.6,  lon:127.0, major:false, label:'Seoul'      },
      { lat:28.6,  lon:77.2,  major:false, label:'Delhi'      },
      { lat:19.1,  lon:72.9,  major:false, label:'Mumbai'     },
      { lat:-33.9, lon:151.2, major:true,  label:'Sydney'     },
      { lat:14.6,  lon:121.0, major:false, label:'Manila'     },
      { lat:0.5,   lon:109.3, major:false, label:'Pontianak'  },
      { lat:-0.9,  lon:119.8, major:false, label:'Palu'       },
      { lat:1.5,   lon:124.8, major:false, label:'Manado'     },
      { lat:-5.1,  lon:119.4, major:false, label:'Makassar'   },
      { lat:-3.7,  lon:128.2, major:false, label:'Ambon'      },
      { lat:-2.5,  lon:140.7, major:false, label:'Jayapura'   },
      { lat:4.0,   lon:114.0, major:false, label:'Brunei'     },
    ];

    const EDGES: [number,number][] = [
      [0,1],[0,2],[0,3],[0,4],[0,16],[0,17],[0,18],[0,19],[0,20],[0,21],
      [1,4],[1,5],[1,6],[1,7],[1,8],[1,15],[1,22],
      [4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],
      [8,11],[9,11],[12,13],[12,1],[13,1],[14,10],[14,8],
      [15,8],[15,1],[16,0],[17,0],[18,1],[19,0],[20,21],[22,1],
    ];

    interface Pulse { ei: number; t: number; spd: number }
    let pulses: Pulse[] = [];
    let pTimer = 0;

    const BASE_ROT = -(118 * Math.PI / 180);
    let globeRot = BASE_ROT;
    const SPIN = 0.006;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.03;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      globeRot += SPIN * dt;
      const rotY = globeRot + (mx - 0.5) * 0.35;
      const rotX = (my - 0.5) * 0.18;

      ctx.clearRect(0, 0, W, H);

      const R  = Math.min(W, H) * 0.56;
      const cx = W * 0.64;
      const cy = H * 0.51;

      // 1. Sphere base
      const sg = ctx.createRadialGradient(cx - R*0.3, cy - R*0.28, R*0.02, cx, cy, R);
      sg.addColorStop(0,   'rgba(28,18,4,0.70)');
      sg.addColorStop(0.6, 'rgba(10,6,1,0.55)');
      sg.addColorStop(1,   'rgba(0,0,0,0.38)');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
      ctx.fillStyle = sg; ctx.fill();

      // 2. Grid
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = '#C6A75E';
      ctx.lineWidth = 0.35;
      for (let latD = -80; latD <= 80; latD += 15) {
        ctx.beginPath(); let f = true;
        for (let lonD = -180; lonD <= 180; lonD += 2) {
          const p = project(latD, lonD, cx, cy, R, rotY, rotX);
          if (!p.vis) { f = true; continue; }
          f ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy); f = false;
        }
        ctx.stroke();
      }
      for (let lonD = -180; lonD < 180; lonD += 15) {
        ctx.beginPath(); let f = true;
        for (let latD = -88; latD <= 88; latD += 2) {
          const p = project(latD, lonD, cx, cy, R, rotY, rotX);
          if (!p.vis) { f = true; continue; }
          f ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy); f = false;
        }
        ctx.stroke();
      }
      ctx.restore();

      // 3. Equator + Tropics
      ctx.save();
      ctx.globalAlpha = 0.13;
      ctx.setLineDash([4, 6]);
      for (const latD of [0, 23.5, -23.5]) {
        ctx.beginPath(); ctx.strokeStyle = latD === 0 ? '#D4AF37' : '#A07830';
        ctx.lineWidth = latD === 0 ? 0.6 : 0.4; let f = true;
        for (let lonD = -180; lonD <= 180; lonD += 2) {
          const p = project(latD, lonD, cx, cy, R, rotY, rotX);
          if (!p.vis) { f = true; continue; }
          f ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy); f = false;
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Dot-matrix land rendering (replaces drawLand / hatchRegion)
      drawDotMatrix(cx, cy, R, rotY, rotX, now);

      // 5. Network edges
      EDGES.forEach(([ai, bi]) => {
        const ca = CITIES[ai], cb = CITIES[bi];
        const pa = project(ca.lat, ca.lon, cx, cy, R, rotY, rotX);
        const pb = project(cb.lat, cb.lon, cx, cy, R, rotY, rotX);
        if (!pa.vis || !pb.vis) return;
        const depth = Math.min(pa.z, pb.z);
        if (depth < 0.05) return;
        const alpha = depth * 0.5;
        const mx2 = (pa.sx + pb.sx) * 0.5 - (pb.sy - pa.sy) * 0.12;
        const my2 = (pa.sy + pb.sy) * 0.5 + (pb.sx - pa.sx) * 0.12;
        const gr = ctx.createLinearGradient(pa.sx, pa.sy, pb.sx, pb.sy);
        gr.addColorStop(0,   `rgba(160,120,35,${alpha * 0.5})`);
        gr.addColorStop(0.5, `rgba(212,175,55,${alpha})`);
        gr.addColorStop(1,   `rgba(160,120,35,${alpha * 0.5})`);
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.quadraticCurveTo(mx2, my2, pb.sx, pb.sy);
        ctx.strokeStyle = gr;
        ctx.lineWidth = 0.55;
        ctx.stroke();
      });

      // 6. Pulse beads
      pTimer += dt;
      if (pTimer > 0.65) {
        pTimer = 0;
        const ei = Math.floor(Math.random() * EDGES.length);
        pulses.push({ ei, t: 0, spd: 0.35 + Math.random() * 0.45 });
      }
      pulses = pulses.filter(p => p.t <= 1);
      pulses.forEach(p => {
        p.t += p.spd * dt;
        const [ai, bi] = EDGES[p.ei];
        const ca = CITIES[ai], cb = CITIES[bi];
        const pa = project(ca.lat, ca.lon, cx, cy, R, rotY, rotX);
        const pb = project(cb.lat, cb.lon, cx, cy, R, rotY, rotX);
        if (!pa.vis || !pb.vis) return;
        const depth = Math.min(pa.z, pb.z);
        if (depth < 0.05) return;
        const t = p.t;
        const mx2 = (pa.sx + pb.sx) * 0.5 - (pb.sy - pa.sy) * 0.12;
        const my2 = (pa.sy + pb.sy) * 0.5 + (pb.sx - pa.sx) * 0.12;
        const bx = (1-t)*(1-t)*pa.sx + 2*(1-t)*t*mx2 + t*t*pb.sx;
        const by = (1-t)*(1-t)*pa.sy + 2*(1-t)*t*my2 + t*t*pb.sy;
        const fade = Math.sin(t * Math.PI) * depth;
        const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 9);
        glow.addColorStop(0,   `rgba(255,220,80,${0.85*fade})`);
        glow.addColorStop(0.4, `rgba(210,160,40,${0.30*fade})`);
        glow.addColorStop(1,   'rgba(140,90,10,0)');
        ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI*2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,245,130,${fade})`; ctx.fill();
      });

      // 7. City ember nodes
      CITIES.forEach(city => {
        const p = project(city.lat, city.lon, cx, cy, R, rotY, rotX);
        if (!p.vis || p.z < 0.08) return;
        const depth = p.z;
        const pulse = (Math.sin(now * 0.002 + city.lon * 0.3) + 1) / 2;
        const r = city.major ? 3.2 : 2.0;
        const boost = city.label === 'Jakarta' ? 1.6 : 1.0;
        const halo = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 6 * boost);
        halo.addColorStop(0,   `rgba(212,175,55,${depth * 0.55 * (0.5 + pulse*0.5) * boost})`);
        halo.addColorStop(0.5, `rgba(160,110,30,${depth * 0.18})`);
        halo.addColorStop(1,   'rgba(80,50,5,0)');
        ctx.beginPath(); ctx.arc(p.sx, p.sy, r * 6 * boost, 0, Math.PI*2);
        ctx.fillStyle = halo; ctx.fill();
        ctx.beginPath(); ctx.arc(p.sx, p.sy, r * (0.75 + pulse * 0.25) * depth, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${200+Math.floor(55*pulse)},${165+Math.floor(35*pulse)},${45+Math.floor(30*pulse)},${depth * 0.92})`;
        ctx.fill();
        if (city.label === 'Jakarta') {
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r * 2.8 * depth, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(255,220,80,${depth * 0.70})`; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r * 4.5 * depth, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(212,175,55,${depth * 0.25})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
        if (city.major && city.label !== 'Jakarta') {
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r * 2.2 * depth, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(198,163,72,${depth * 0.45})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      });

      // 8. Globe rim
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(212,175,55,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
      const rimVig = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.01);
      rimVig.addColorStop(0, 'rgba(0,0,0,0)');
      rimVig.addColorStop(1, 'rgba(0,0,0,0.50)');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
      ctx.fillStyle = rimVig; ctx.fill();

      // 9. Specular highlight
      const sheen = ctx.createRadialGradient(cx - R*0.4, cy - R*0.36, 0, cx - R*0.4, cy - R*0.36, R*0.6);
      sheen.addColorStop(0,   'rgba(255,245,190,0.07)');
      sheen.addColorStop(0.5, 'rgba(212,175,55,0.025)');
      sheen.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
      ctx.fillStyle = sheen; ctx.fill();

      // 10. Atmospheric haze
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.94, cx, cy, R * 1.06);
      atmo.addColorStop(0,   'rgba(160,120,30,0.00)');
      atmo.addColorStop(0.4, 'rgba(180,140,40,0.07)');
      atmo.addColorStop(1,   'rgba(120,90,20,0.00)');
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, Math.PI*2);
      ctx.fillStyle = atmo; ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [onMouseMove, onTouchMove]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function ScalesOfJusticeMobile({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="-30 -20 460 310" xmlns="http://www.w3.org/2000/svg" width={240} height={150} aria-hidden="true" style={style}>
      <defs>
        <linearGradient id="goldGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#C6A75E" />
          <stop offset="50%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#C6A75E" />
          <animate attributeName="x1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
          <animate attributeName="x2" values="100%;200%;100%" dur="3s" repeatCount="indefinite" />
        </linearGradient>
        <filter id="glowMobile" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="strongGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x="175" y="235" width="50" height="6" rx="3" fill="url(#goldGradMobile)" filter="url(#glowMobile)" />
      <rect x="155" y="245" width="90" height="2.5" rx="1.5" fill="url(#goldGradMobile)" opacity="0.8" />
      <rect x="155" y="250" width="90" height="2.5" rx="1.5" fill="url(#goldGradMobile)" opacity="0.5" />
      <rect x="196" y="60" width="8" height="176" rx="4" fill="url(#goldGradMobile)" filter="url(#glowMobile)" />
      <ellipse cx="200" cy="100" rx="10" ry="5" fill="url(#goldGradMobile)" />
      <ellipse cx="200" cy="150" rx="10" ry="5" fill="url(#goldGradMobile)" />
      <ellipse cx="200" cy="200" rx="12" ry="6" fill="url(#goldGradMobile)" />
      <ellipse cx="200" cy="60" rx="10" ry="10" fill="url(#goldGradMobile)" filter="url(#strongGlow)" />
      <ellipse cx="200" cy="52" rx="6" ry="6" fill="url(#goldGradMobile)" />
      <ellipse cx="200" cy="46" rx="4" ry="4" fill="url(#goldGradMobile)" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 200 68; 4 200 68; 0 200 68; -4 200 68; 0 200 68" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95" />
        <path d="M 60 68 Q 130 58 200 68 Q 270 78 340 68" stroke="url(#goldGradMobile)" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#strongGlow)" />
        <circle cx="68" cy="68" r="7" fill="none" stroke="url(#goldGradMobile)" strokeWidth="3" filter="url(#glowMobile)" />
        <circle cx="332" cy="68" r="7" fill="none" stroke="url(#goldGradMobile)" strokeWidth="3" filter="url(#glowMobile)" />
        <line x1="60" y1="75" x2="40" y2="140" stroke="url(#goldGradMobile)" strokeWidth="1.5" opacity="0.9" />
        <line x1="76" y1="75" x2="96" y2="140" stroke="url(#goldGradMobile)" strokeWidth="1.5" opacity="0.9" />
        <line x1="324" y1="75" x2="304" y2="140" stroke="url(#goldGradMobile)" strokeWidth="1.5" opacity="0.9" />
        <line x1="340" y1="75" x2="360" y2="140" stroke="url(#goldGradMobile)" strokeWidth="1.5" opacity="0.9" />
        <path d="M 32 140 Q 68 160 104 140" stroke="url(#goldGradMobile)" strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#strongGlow)" />
        <line x1="32" y1="140" x2="104" y2="140" stroke="url(#goldGradMobile)" strokeWidth="1.5" opacity="0.3" />
        <path d="M 296 140 Q 332 160 368 140" stroke="url(#goldGradMobile)" strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#strongGlow)" />
        <line x1="296" y1="140" x2="368" y2="140" stroke="url(#goldGradMobile)" strokeWidth="1.5" opacity="0.3" />
      </g>
    </svg>
  );
}

export default function HeroSection() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled]         = useState(false);
  const [isIos, setIsIos]                 = useState(false);
  const [showIosHint, setShowIosHint]     = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 200 + FIRM_NAME.length * 70 + 200);
    const t3 = setTimeout(() => setPhase(3), 200 + FIRM_NAME.length * 70 + 900);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIos) { setShowIosHint(v => !v); return; }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const showInstallBtn = !installed && (!!installPrompt || isIos);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-start md:justify-center overflow-hidden grain-overlay bg-black pt-4 md:pt-20"
    >
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <GlobeEtching />
      </div>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(198,167,94,0.09) 0%, transparent 70%)' }} />
      <div className="absolute left-8 top-0 bottom-0 w-px pointer-events-none hidden lg:block"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(198,167,94,0.15) 30%, rgba(198,167,94,0.15) 70%, transparent 100%)' }} />
      <div className="absolute right-8 top-0 bottom-0 w-px pointer-events-none hidden lg:block"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(198,167,94,0.15) 30%, rgba(198,167,94,0.15) 70%, transparent 100%)' }} />
      <div className="absolute top-48 left-0 right-0 flex justify-center pointer-events-none hidden md:flex"
        style={{ opacity: phase >= 1 ? 0.5 : 0, transition: 'opacity 1.2s ease 0.3s' }}>
        <Image src="/lady-of-justice-desktop.png" alt="" width={880} height={171}
          className="object-contain"
          style={{ filter: 'drop-shadow(0 0 24px rgba(198,167,94,0.25))' }}
          priority />
      </div>
      <div className="relative z-10 text-center px-6 flex flex-col items-center">
        <h1 className="font-serif font-light tracking-[0.3em] text-text-primary select-none mb-2"
          style={{ fontSize: 'clamp(2.2rem, 7vw, 6rem)' }} aria-label="PotuPartners">
          {FIRM_NAME.split('').map((char, i) => (
            <span key={i} className="letter-animate inline-block"
              style={{ animationDelay: phase >= 1 ? `${i * 70}ms` : '9999s', opacity: phase < 1 ? 0 : undefined }}>
              {char}
            </span>
          ))}
        </h1>
        <div className="block md:hidden"
          style={{ marginTop: '0px', marginBottom: '0px', opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'scale(1)' : 'scale(0.9)', transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s' }}>
          <ScalesOfJusticeMobile style={{ filter: 'drop-shadow(0 0 12px rgba(198,167,94,0.6))' }} />
        </div>
        <div className="relative overflow-hidden mb-8" style={{ height: '2px', width: 'clamp(120px, 30vw, 320px)' }}>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, transparent, #C6A75E, #D4AF37, #C6A75E, transparent)',
            transform: phase >= 2 ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left',
            transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '0.1s',
          }} />
        </div>
        {showInstallBtn && (
          <div className="relative hidden" style={{ opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.8s ease' }}>
            <button onClick={handleInstall} className="btn-gold px-10 flex items-center gap-2">
              <Smartphone size={14} /><span>Install App</span>
            </button>
            {showIosHint && (
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 bg-surface border border-gold-faint p-4 z-50 text-left">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-l border-t border-gold-faint rotate-45" />
                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  Tap the <span className="text-gold font-medium">Share</span> button in Safari, then select <span className="text-gold font-medium">"Add to Home Screen"</span>.
                </p>
              </div>
            )}
          </div>
        )}
        <p className="font-sans text-[0.7rem] tracking-[0.4em] uppercase text-gold-light font-light mb-3"
          style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
          {TAGLINE}
        </p>
        <p className="font-serif italic text-text-secondary text-lg md:text-xl font-light max-w-xl mt-4 leading-relaxed"
          style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s' }}>
          Trusted counsel for matters that define legacies.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-12"
          style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s' }}>
          <button onClick={() => scrollToSection('services')} className="btn-gold btn-gold-fill px-10">
            <span>Our Services</span>
          </button>
          <button onClick={() => scrollToSection('partners')} className="btn-gold px-10">
            <span>Meet the Partners</span>
          </button>
          {showInstallBtn && (
            <div className="relative hidden md:block">
              <button onClick={handleInstall} className="btn-gold px-10 flex items-center gap-2">
                <Smartphone size={14} /><span>Install App</span>
              </button>
              {showIosHint && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 bg-surface border border-gold-faint p-4 z-50 text-left">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-l border-t border-gold-faint rotate-45" />
                  <p className="font-sans text-xs text-text-secondary leading-relaxed">
                    Tap the <span className="text-gold font-medium">Share</span> button in Safari, then select <span className="text-gold font-medium">"Add to Home Screen"</span>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <style>{`
          @keyframes scroll-glow {
            0%, 100% { opacity: 0.6; text-shadow: none; }
            50% { opacity: 1; color: #D4AF37; text-shadow: 0 0 12px rgba(212, 175, 55, 0.8); }
          }
        `}</style>
        <div className="mt-20 flex flex-col items-center gap-2"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: 'opacity 1s ease 1s' }}>
          <span className="text-[0.6rem] tracking-[0.3em] uppercase text-text-muted" style={{ animation: 'scroll-glow 2.5s infinite ease-in-out' }}>Scroll</span>
          <ChevronDown size={14} className="text-gold animate-bounce opacity-60" />
        </div>
      </div>
      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
        <CornerBracket key={pos} position={pos} visible={phase >= 3} />
      ))}
    </section>
  );
}

function CornerBracket({ position, visible }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; visible: boolean }) {
  const isTop  = position.startsWith('top');
  const isLeft = position.endsWith('left');
  return (
    <div
      className={`absolute ${isTop ? 'top-8' : 'bottom-8'} ${isLeft ? 'left-8' : 'right-8'} w-6 h-6 pointer-events-none hidden md:block`}
      style={{
        borderTop:    isTop  ? '1px solid rgba(198,167,94,0.3)' : 'none',
        borderBottom: !isTop ? '1px solid rgba(198,167,94,0.3)' : 'none',
        borderLeft:   isLeft  ? '1px solid rgba(198,167,94,0.3)' : 'none',
        borderRight:  !isLeft ? '1px solid rgba(198,167,94,0.3)' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.8s',
      }}
    />
  );
}