"use client";

import { forwardRef, useCallback, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";

/**
 * Diagrama de integración: nodos de planta conectados a un hub central con
 * haces de luz animados. Adaptado del componente "Animated Beam Integration"
 * de 21st.dev (abushaidislam7), sin framer-motion y con la paleta de Itera.
 */

type BeamProps = {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  endYOffset?: number;
  startColor?: string;
  stopColor?: string;
};

function Beam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  endYOffset = 0,
  startColor = "#f5a524",
  stopColor = "#e8edf2",
}: BeamProps) {
  const id = useId().replace(/:/g, "");
  const [d, setD] = useState("");
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [grad, setGrad] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const update = useCallback(() => {
    const c = containerRef.current;
    const a = fromRef.current;
    const b = toRef.current;
    if (!c || !a || !b) return;
    const rc = c.getBoundingClientRect();
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const sx = ra.left - rc.left + ra.width / 2;
    const sy = ra.top - rc.top + ra.height / 2;
    const ex = rb.left - rc.left + rb.width / 2;
    const ey = rb.top - rc.top + rb.height / 2 + endYOffset;
    setBox({ w: rc.width, h: rc.height });
    setD(`M ${sx},${sy} Q ${(sx + ex) / 2},${(sy + ey) / 2 - curvature} ${ex},${ey}`);
    setGrad({ x1: sx, y1: sy, x2: ex, y2: ey });
  }, [containerRef, fromRef, toRef, curvature, endYOffset]);

  useEffect(() => {
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [update, containerRef]);

  return (
    <svg
      fill="none"
      width={box.w}
      height={box.h}
      viewBox={`0 0 ${box.w} ${box.h}`}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={`g${id}`} gradientUnits="userSpaceOnUse" {...grad}>
          <stop offset="0%" stopColor={startColor} stopOpacity="0" />
          <stop offset="25%" stopColor={startColor} stopOpacity="0.85" />
          <stop offset="60%" stopColor={stopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={stopColor} stopOpacity="0" />
        </linearGradient>
        <filter id={`f${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={d} stroke="var(--line)" strokeWidth={1.5} strokeLinecap="round" />
      {d && (
        <path
          d={d}
          pathLength={200}
          stroke={`url(#g${id})`}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray="45 155"
          filter={`url(#f${id})`}
          className={reverse ? "beam beam-reverse" : "beam"}
          style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        />
      )}
    </svg>
  );
}

const Node = forwardRef<HTMLDivElement, { label: string; hint: string; children?: ReactNode; hub?: boolean }>(
  function Node({ label, hint, children, hub }, ref) {
    return (
      <div className="z-10 flex flex-col items-center gap-2">
        <div
          ref={ref}
          className={
            hub
              ? "flex size-20 items-center justify-center rounded-2xl border border-accent/40 bg-background shadow-[0_0_40px_-8px_var(--accent)] ring-8 ring-accent/5"
              : "flex size-12 items-center justify-center rounded-xl border border-line bg-background/90 font-mono text-[10px] font-semibold text-foreground backdrop-blur transition-colors hover:border-accent/50"
          }
        >
          {children ?? label}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{hint}</span>
      </div>
    );
  },
);

function HubMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-10 w-10" aria-hidden>
      <g className="rotate-slow">
        <path d="M22.5 10.5A8 8 0 1 0 24 16" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M19.5 9.5h3.6v3.6" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx="16" cy="16" r="2.4" fill="var(--foreground)" />
    </svg>
  );
}

export function IntegrationBeams() {
  const container = useRef<HTMLDivElement>(null);
  const plc = useRef<HTMLDivElement>(null);
  const sensors = useRef<HTMLDivElement>(null);
  const scada = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const erp = useRef<HTMLDivElement>(null);
  const sheets = useRef<HTMLDivElement>(null);
  const quality = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={container}
      role="img"
      aria-label="Diagrama: PLC, sensores, SCADA, ERP, planillas y calidad conectados a Itera"
      className="relative flex h-[340px] w-full items-center justify-center overflow-hidden"
    >
      <div className="flex size-full max-h-[260px] max-w-md flex-col items-stretch justify-between px-2">
        <div className="flex items-center justify-between">
          <Node ref={plc} label="PLC" hint="Máquinas" />
          <Node ref={erp} label="ERP" hint="Gestión" />
        </div>
        <div className="flex items-center justify-between">
          <Node ref={sensors} label="IoT" hint="Sensores" />
          <Node ref={hub} label="Itera" hint="Itera" hub>
            <HubMark />
          </Node>
          <Node ref={sheets} label="XLS" hint="Planillas" />
        </div>
        <div className="flex items-center justify-between">
          <Node ref={scada} label="SCADA" hint="Supervisión" />
          <Node ref={quality} label="QA" hint="Calidad" />
        </div>
      </div>

      <Beam containerRef={container} fromRef={plc} toRef={hub} curvature={-50} endYOffset={-8} />
      <Beam containerRef={container} fromRef={sensors} toRef={hub} delay={0.4} />
      <Beam containerRef={container} fromRef={scada} toRef={hub} curvature={50} endYOffset={8} delay={0.8} />
      <Beam containerRef={container} fromRef={erp} toRef={hub} curvature={-50} endYOffset={-8} delay={0.2} reverse />
      <Beam containerRef={container} fromRef={sheets} toRef={hub} delay={0.6} reverse />
      <Beam containerRef={container} fromRef={quality} toRef={hub} curvature={50} endYOffset={8} delay={1} reverse />
    </div>
  );
}
