"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de "virutas" en canvas que se apartan del cursor y vuelven a su lugar
 * con un resorte. Adaptado del componente "Interactive Dot Grid Hero" de
 * 21st.dev (nexus-ui), sin framer-motion y con la paleta de Itera.
 */

type Particle = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  color: string;
  alpha: number;
};

type ParticleFieldProps = {
  /** Separación promedio entre partículas, en px. */
  gap?: number;
  /** Radio de repulsión alrededor del cursor, en px. */
  radius?: number;
  strength?: number;
  spring?: number;
  damping?: number;
  colors?: string[];
  className?: string;
};

const DEFAULT_COLORS = ["#f5a524", "#f5a524", "#e8edf2", "#8a96a3", "#8a96a3", "#3a4654"];

export function ParticleField({
  gap = 56,
  radius = 140,
  strength = 6,
  spring = 0.06,
  damping = 0.82,
  colors = DEFAULT_COLORS,
  className,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const cvs = canvas;
    const c = ctx;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -9999, y: -9999, active: false };
    let particles: Particle[] = [];
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = true;

    function build() {
      const jitter = gap * 0.5;
      const cols = Math.ceil(W / gap) + 1;
      const rows = Math.ceil(H / gap) + 1;
      particles = [];
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const ox = col * gap + (Math.random() - 0.5) * jitter * 2;
          const oy = r * gap + (Math.random() - 0.5) * jitter * 2;
          particles.push({
            ox,
            oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
            w: 1.6 + Math.random() * 1.4,
            h: 6 + Math.random() * 8,
            rot: Math.random() * Math.PI * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.35 + Math.random() * 0.45,
          });
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      W = cvs.offsetWidth;
      H = cvs.offsetHeight;
      cvs.width = W * dpr;
      cvs.height = H * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduceMotion) draw();
    }

    function draw() {
      c.clearRect(0, 0, W, H);
      const active = mouse.active && !reduceMotion;
      const r2 = radius * radius;

      for (const p of particles) {
        if (active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = ((radius - d) / radius) ** 2 * strength;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx = (p.vx + (p.ox - p.x) * spring) * damping;
        p.vy = (p.vy + (p.oy - p.y) * spring) * damping;
        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.hypot(p.vx, p.vy);
        const len = p.h + Math.min(speed * 0.6, 6);
        c.save();
        c.translate(p.x, p.y);
        c.rotate(speed > 0.5 ? Math.atan2(p.vy, p.vx) + Math.PI / 2 : p.rot);
        c.globalAlpha = p.alpha;
        c.fillStyle = p.color;
        c.beginPath();
        c.roundRect(-p.w / 2, -len / 2, p.w, len, p.w / 2);
        c.fill();
        c.restore();
      }
      c.globalAlpha = 1;
    }

    // El navegador ya pausa requestAnimationFrame en pestañas ocultas;
    // fuera de pantalla solo nos salteamos el dibujo.
    function loop() {
      if (visible) draw();
      raf = requestAnimationFrame(loop);
    }

    const onMove = (x: number, y: number) => {
      const rect = cvs.getBoundingClientRect();
      mouse.x = x - rect.left;
      mouse.y = y - rect.top;
      mouse.active = true;
    };
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend", onLeave);

    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(cvs);
    const ro = new ResizeObserver(resize);
    ro.observe(cvs);
    resize();
    if (!reduceMotion) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend", onLeave);
    };
  }, [gap, radius, strength, spring, damping, colors]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
    />
  );
}
