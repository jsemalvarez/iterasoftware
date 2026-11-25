import type { ReactNode } from "react";

/**
 * Visuales ilustrativos de planta: mini tableros, gráficos y pantallas de
 * sistema dibujados con SVG y CSS (sin imágenes ni librerías). Los datos son
 * de ejemplo. Las animaciones viven en globals.css y respetan reduced-motion.
 */

/* ── Gráfico en vivo ──────────────────────────────────────────────── */

const PERIOD = 300;

// Señal periódica (período = 300) para que el desplazamiento sea continuo.
function signal(x: number) {
  const t = (x / PERIOD) * Math.PI * 2;
  return 52 - 15 * Math.sin(t * 2) - 9 * Math.sin(t * 5 + 1) - 4 * Math.sin(t * 9 + 2);
}

const linePoints = Array.from({ length: (PERIOD * 2) / 5 + 1 }, (_, i) => {
  const x = i * 5;
  return `${x},${signal(x).toFixed(1)}`;
});
const LINE = `M${linePoints.join(" L")}`;
const AREA = `${LINE} L${PERIOD * 2},100 L0,100 Z`;

export function LiveChart({ id, className = "", threshold = 26 }: { id: string; className?: string; threshold?: number }) {
  return (
    <svg viewBox="0 0 300 100" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map((y) => (
        <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
      <g className="chart-scroll">
        <path d={AREA} fill={`url(#${id}-fill)`} />
        <path d={LINE} fill="none" stroke="var(--accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </g>
      <line
        x1="0"
        x2="300"
        y1={threshold}
        y2={threshold}
        stroke="#f87171"
        strokeOpacity="0.7"
        strokeDasharray="4 4"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ── Estado de máquinas ───────────────────────────────────────────── */

type Seg = ["run" | "setup" | "stop", number];

const segColor = { run: "bg-emerald-400/80", setup: "bg-accent/80", stop: "bg-red-400/80" };

const machines: { name: string; oee: string; status: "run" | "setup" | "stop"; segs: Seg[] }[] = [
  { name: "Prensa 01", oee: "91%", status: "run", segs: [["run", 40], ["setup", 6], ["run", 44], ["stop", 3], ["run", 7]] },
  { name: "Torno CNC 02", oee: "84%", status: "run", segs: [["run", 28], ["stop", 8], ["run", 36], ["setup", 10], ["run", 18]] },
  { name: "Inyectora 03", oee: "62%", status: "stop", segs: [["run", 22], ["setup", 14], ["run", 30], ["stop", 22], ["run", 6], ["stop", 6]] },
  { name: "Horno 04", oee: "88%", status: "setup", segs: [["run", 52], ["setup", 8], ["run", 30], ["setup", 10]] },
];

export function MachineStatus({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2.5" : "space-y-3.5"}>
      {machines.map((m, i) => (
        <li key={m.name} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-2 truncate text-muted">
            <span className="relative flex size-1.5">
              {m.status === "run" && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
              <span
                className={`relative inline-flex size-1.5 rounded-full ${m.status === "run" ? "bg-emerald-400" : m.status === "stop" ? "bg-red-400" : "bg-accent"}`}
              />
            </span>
            {m.name}
          </span>
          <span className="draw-line flex h-2 overflow-hidden rounded-full bg-line" style={{ transitionDelay: `${300 + i * 150}ms` }}>
            {m.segs.map(([kind, w], j) => (
              <span key={j} className={`${segColor[kind]} h-full border-r border-background/60 last:border-r-0`} style={{ width: `${w}%` }} />
            ))}
          </span>
          <span className={`text-right ${m.status === "stop" ? "text-red-400" : "text-foreground/80"}`}>{m.oee}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Inspección por visión artificial ─────────────────────────────── */

export function VisionGrid() {
  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, i) => {
          const defect = i === 6;
          return (
            <div
              key={i}
              className={`relative flex aspect-square items-center justify-center rounded-md border ${defect ? "border-red-400/80 bg-red-400/10" : "border-line bg-background/50"}`}
            >
              <span className={`size-1/2 rounded-full border-2 ${defect ? "border-red-400/70" : "border-muted/40"}`}>
                <span className={`m-auto mt-[30%] block size-1/3 rounded-full ${defect ? "bg-red-400/40" : "bg-muted/20"}`} />
              </span>
              {defect ? (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-red-400 px-1.5 py-px font-mono text-[9px] font-semibold text-background">
                  defecto 0,97
                </span>
              ) : (
                <span className="absolute right-1 top-0.5 font-mono text-[9px] text-emerald-400/80">✓</span>
              )}
            </div>
          );
        })}
      </div>
      <div aria-hidden className="vision-scan pointer-events-none absolute inset-x-0 h-8 -translate-y-1/2">
        <div className="h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-accent/80 shadow-[0_0_12px_var(--accent)]" />
      </div>
    </div>
  );
}

/* ── Flujo de mensajes entre sistemas ─────────────────────────────── */

const logLines = [
  ["opc", "prensa01/temp", "182,4 °C"],
  ["mqtt", "linea2/oee", "0,874"],
  ["erp", "orden 4471", "en curso"],
  ["opc", "torno02/rpm", "2.400"],
  ["xls", "scrap_turno_b", "importado"],
  ["mqtt", "horno04/estado", "setup"],
  ["erp", "orden 4469", "cerrada"],
  ["opc", "inyect03/ciclo", "31,2 s"],
];

const tagColor: Record<string, string> = {
  opc: "text-sky-300 border-sky-300/30",
  mqtt: "text-emerald-300 border-emerald-300/30",
  erp: "text-accent border-accent/30",
  xls: "text-violet-300 border-violet-300/30",
};

export function LogStream({ className = "h-40" }: { className?: string }) {
  return (
    <div className={`log-mask relative overflow-hidden ${className}`}>
      <ul className="log-scroll font-mono text-[11px]">
        {[...logLines, ...logLines].map(([tag, topic, value], i) => (
          <li key={i} className="flex items-center gap-2 py-1" aria-hidden={i >= logLines.length}>
            <span className={`w-10 shrink-0 rounded border px-1 text-center text-[9px] uppercase ${tagColor[tag]}`}>{tag}</span>
            <span className="truncate text-muted">{topic}</span>
            <span className="ml-auto shrink-0 text-foreground/80">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Órdenes de trabajo ───────────────────────────────────────────── */

const orders = [
  { id: "OT-4471", item: "Brida Ø120", where: "Línea 2", pct: 72, state: "En curso" },
  { id: "OT-4472", item: "Eje 30 mm", where: "Torno 02", pct: 100, state: "Terminada" },
  { id: "OT-4473", item: "Carcasa PP", where: "Inyectora 03", pct: 18, state: "Demorada" },
  { id: "OT-4474", item: "Tapa Ø80", where: "Prensa 01", pct: 46, state: "En curso" },
];

const stateStyle: Record<string, string> = {
  "En curso": "text-accent bg-accent/10",
  Terminada: "text-emerald-300 bg-emerald-400/10",
  Demorada: "text-red-300 bg-red-400/10",
};

export function WorkOrders() {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
        <span>Órdenes de trabajo · hoy</span>
        <span className="text-accent">3 activas</span>
      </div>
      <ul className="divide-y divide-line/70 font-mono text-[11px]">
      {orders.map((o, i) => (
        <li key={o.id} className="grid grid-cols-[3.75rem_1fr_auto] items-center gap-3 py-2.5 sm:grid-cols-[3.75rem_1fr_4rem_auto]">
          <span className="text-foreground/80">{o.id}</span>
          <span className="min-w-0">
            <span className="block truncate text-foreground/70">{o.item}</span>
            <span className="block truncate text-[10px] text-muted">{o.where}</span>
          </span>
          <span className="hidden h-1.5 overflow-hidden rounded-full bg-line sm:block">
            <span
              className={`draw-line block h-full rounded-full ${o.pct === 100 ? "bg-emerald-400/80" : o.state === "Demorada" ? "bg-red-400/80" : "bg-accent"}`}
              style={{ width: `${o.pct}%`, transitionDelay: `${300 + i * 150}ms` }}
            />
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] ${stateStyle[o.state]}`}>{o.state}</span>
        </li>
      ))}
      </ul>
    </div>
  );
}

/* ── Indicadores ──────────────────────────────────────────────────── */

export function Kpi({ label, value, delta, bad = false }: { label: string; value: string; delta?: string; bad?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-background/60 px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-lg font-semibold tabular-nums">
        {value}
        {delta && <span className={`whitespace-nowrap font-mono text-[10px] font-normal ${bad ? "text-red-300" : "text-emerald-300"}`}>{delta}</span>}
      </p>
    </div>
  );
}

export function PredictiveAlert({ id }: { id: string }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Kpi label="OEE" value="87,4%" delta="▲ 3,1" />
        <Kpi label="Paradas" value="2" delta="▼ 4" />
        <Kpi label="Scrap" value="1,8%" delta="▼ 0,6" />
      </div>
      <div className="relative rounded-lg border border-line bg-background/60 p-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-muted">
          <span>vibración · M-07</span>
          <span>últimas 24 h</span>
        </div>
        <LiveChart id={id} className="h-20 w-full" />
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-red-400/40 bg-background/90 px-2 py-1 font-mono text-[10px] text-red-300 backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
          Rodamiento: revisar en 9 días
        </div>
      </div>
    </div>
  );
}

/* ── Ventana de aplicación ────────────────────────────────────────── */

export function AppWindow({ title, meta, children, className = "" }: { title: string; meta?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-[#0d1218]/95 shadow-2xl shadow-black/50 ${className}`}>
      <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </span>
        <span className="truncate">{title}</span>
        {meta && <span className="ml-auto hidden shrink-0 sm:inline">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

/** Tablero completo de planta (vista ilustrativa). */
export function PlantDashboard() {
  return (
    <AppWindow title="itera · tablero de planta" meta="actualizado hace 2 s">
      <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi label="OEE planta" value="86,9%" delta="▲ 2,4" />
            <Kpi label="Piezas hoy" value="12.480" delta="▲ 6%" />
            <Kpi label="Paradas" value="3" delta="▼ 5" />
            <Kpi label="Scrap" value="1,9%" delta="▲ 0,2" bad />
          </div>
          <div className="rounded-lg border border-line bg-background/60 p-3">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-muted">
              <span>producción por hora · línea 2</span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                en vivo
              </span>
            </div>
            <LiveChart id="dash" className="h-32 w-full sm:h-40" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-line bg-background/60 p-3">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">Máquinas · turno B</p>
            <MachineStatus compact />
            <div className="mt-3 flex gap-3 font-mono text-[9px] text-muted">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400" />marcha</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-accent" />setup</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-400" />parada</span>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-background/60 p-3">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted">Eventos</p>
            <LogStream className="h-24" />
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

/* ── La planilla de siempre (para el "hoy") ───────────────────────── */

const sheet = [
  ["Turno", "Piezas", "Paradas", "Obs."],
  ["A", "1.240", "2", "ok"],
  ["B", "1.180 (aprox)", "??", "ver con Juan"],
  ["C", "#REF!", "1", ""],
  ["Total", "#REF!", "#¿NOMBRE?", "revisar"],
];

export function MessySheet() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#11161c]">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2 font-mono text-[10px] text-muted">
        <span className="rounded-sm bg-emerald-700/60 px-1 text-[9px] font-bold text-emerald-100">X</span>
        produccion_FINAL_v3 (2).xlsx
      </div>
      <table className="w-full border-collapse font-mono text-[11px]">
        <tbody>
          {sheet.map((row, r) => (
            <tr key={r} className={r === 0 ? "bg-line/40 text-muted" : "text-foreground/70"}>
              <td className="w-6 border border-line/70 px-1.5 py-1.5 text-center text-[9px] text-muted/60">{r + 1}</td>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`border border-line/70 px-2 py-1.5 last:max-sm:hidden ${cell.startsWith("#") ? "text-red-400" : ""} ${cell === "??" || cell.includes("Juan") ? "bg-accent/10 text-accent/80 italic" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
