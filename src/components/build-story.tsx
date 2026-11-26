"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Scene3D } from "@/components/scene-3d";
import { upgradesAt } from "@/lib/build-stages";
import { scrollProgress } from "@/lib/scroll-progress";

export type Step = { title: string; text: string };

/** Historial del plano: en qué punto del scroll aparece cada revisión. */
const revisions = [
  { at: 0, rev: "0.0", note: "Relevamiento" },
  { at: 0.25, rev: "0.1", note: "Prototipo en prueba" },
  { at: 0.5, rev: "1.0", note: "En producción" },
  { at: upgradesAt[0], rev: "1.1", note: "+ Lee fotos y PDF" },
  { at: upgradesAt[1], rev: "1.2", note: "+ Tablero en vivo" },
  { at: upgradesAt[2], rev: "1.3", note: "+ Dos bots más" },
];

/** Punto del recorrido al que lleva cada paso: con su etapa ya completa. */
const stops = [0, 0.44, 0.7, 1];

function output(orders: number, cycleTenths: number) {
  if (!cycleTenths) return "Todavía sin publicar";
  const cycle = `${(cycleTenths / 10).toFixed(1).replace(".", ",")} s`;
  return orders ? `${orders} ${orders === 1 ? "pedido" : "pedidos"} · ${cycle} c/u` : `${cycle} por pedido`;
}

/** Los pasos del trabajo, contados por un plano que se convierte en un bot. */
export function BuildStory({ id, label, title, steps }: { id: string; label: string; title: [string, string]; steps: Step[] }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [revision, setRevision] = useState(0);
  const [stats, setStats] = useState<[orders: number, cycle: number] | null>(null);
  const count = steps.length;

  // Va aparte de la escena para que los pasos funcionen también sin WebGL
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const p = scrollProgress(el);
      el.style.setProperty("--p", p.toFixed(4));
      setActive(Math.min(count - 1, Math.floor(p * count)));
      setRevision(revisions.findLastIndex((r) => p >= r.at));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [count]);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + stops[i] * (el.offsetHeight - window.innerHeight);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
  };

  const { rev, note } = revisions[revision];

  return (
    <section
      ref={ref}
      id={id}
      data-scene-track
      className="relative border-t border-line"
      style={{ height: `${count * 65 + 100}svh`, "--p": 0 } as CSSProperties}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="blueprint absolute inset-0 opacity-60" />
        <Scene3D
          name="blueprint"
          className="absolute inset-x-0 bottom-[19%] top-[26%] mask-b-from-80% mask-b-to-100% md:inset-0 md:mask-none square:bottom-[19%]! square:top-[22%]!"
          fallback={<FlatPlan stage={active} />}
          onStats={(orders, cycle) => setStats([orders, cycle])}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-background via-background/70 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/85 to-transparent" />

        <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-between px-6 pb-8 pt-24 md:pb-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{label}</p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {title[0]} <span className="text-muted">{title[1]}</span>
              </h2>
            </div>

            <dl
              aria-hidden
              className="grid w-full shrink-0 grid-cols-[auto_1fr] border border-line bg-background/70 font-mono text-[11px] backdrop-blur md:w-72 *:px-3 *:py-1.5"
            >
              <dt className="border-b border-r border-line text-muted">Rev. {rev}</dt>
              <dd key={rev} className="rev-in truncate border-b border-line text-accent">
                {note}
              </dd>
              <dt className="border-r border-line text-muted">Simulación</dt>
              <dd className="tabular-nums text-foreground/80">
                {stats ? output(...stats) : "—"}
              </dd>
            </dl>
          </div>

          <div>
            <div aria-hidden className="relative h-px bg-line">
              <div className="absolute inset-0 origin-left scale-x-[var(--p)] bg-accent" />
              {steps.map((s, i) => (
                <span
                  key={s.title}
                  className={`absolute top-1/2 size-2.5 -translate-y-1/2 rotate-45 border transition-colors duration-500 ${i <= active ? "border-accent bg-accent" : "border-muted/50 bg-background"}`}
                  style={{ left: `${(i / count) * 100}%` }}
                />
              ))}
            </div>
            <ol className="grid md:grid-cols-4">
              {steps.map((s, i) => {
                const on = i === active;
                return (
                  <li
                    key={s.title}
                    className={`col-start-1 row-start-1 pr-6 pt-6 transition-opacity duration-500 md:col-auto md:row-auto ${on ? "" : "pointer-events-none opacity-0 md:pointer-events-auto md:opacity-60 md:hover:opacity-90"}`}
                  >
                    <h3>
                      <button type="button" onClick={() => goTo(i)} aria-current={on ? "step" : undefined} className="flex items-baseline gap-3 text-left text-lg font-medium md:text-xl">
                        <span className={`font-mono text-xs ${on ? "text-accent" : "text-muted"}`}>0{i + 1}</span>
                        {s.title}
                      </button>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** El mismo plano en dos dimensiones, para equipos sin WebGL. */
function FlatPlan({ stage }: { stage: number }) {
  const tone = `transition-all duration-700 ${stage >= 2 ? "fill-accent/20 stroke-accent" : "fill-transparent stroke-[#a9d1f7]"}`;
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <svg viewBox="0 0 640 420" className="h-full max-h-96 w-full max-w-2xl" strokeWidth="1.5">
        <rect x="10" y="10" width="620" height="400" className="fill-[#0f2133] stroke-[#a9d1f7]/50" />
        <rect x="212" y="84" width="216" height="226" rx="8" className={tone} />
        <path d="M212 106H428" className={tone} />
        <rect x="56" y="126" width="112" height="160" rx="8" className={tone} />
        <path d="M56 148H168" className={tone} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="66" y={158 + i * 40} width="60" height="14" rx="7" className={tone} />
            <rect x="106" y={176 + i * 40} width="52" height="14" rx="7" className={tone} />
          </g>
        ))}
        <rect x="472" y="126" width="112" height="160" rx="8" className={tone} />
        <path d="M472 148H584" className={tone} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="482" y={158 + i * 24} width="92" height="16" rx="4" className={tone} />
        ))}
        <path d="M176 206h24l-6-5m6 5l-6 5M436 206h24l-6-5m6 5l-6 5" className="fill-none stroke-accent" />
        <FlatBot x={320} y={216} tone={tone} />
        <path d="M262 318H378" className={tone} />
        {stage < 3 ? (
          <path d="M56 352H584M56 344v16M584 344v16" className="fill-none stroke-accent" />
        ) : (
          [112, 528].map((x) => (
            <g key={x} transform={`translate(${x} 346) scale(0.5)`}>
              <FlatBot x={0} y={0} tone={tone} />
            </g>
          ))
        )}
      </svg>
    </div>
  );
}

function FlatBot({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className={tone}>
      <path d="M0 -66V-84" />
      <circle cy="-89" r="5" />
      <rect x="-54" y="-66" width="108" height="72" rx="27" />
      <rect x="-42" y="-54" width="84" height="48" rx="18" />
      <rect x="-23" y="-42" width="11" height="20" rx="5.5" />
      <rect x="12" y="-42" width="11" height="20" rx="5.5" />
      <rect x="-38" y="16" width="76" height="62" rx="26" />
      <circle cy="46" r="13" strokeDasharray="66 16" />
      <path d="M-42 30L-62 74M42 30L62 74" />
      <circle cx="-64" cy="79" r="8" />
      <circle cx="64" cy="79" r="8" />
    </g>
  );
}
