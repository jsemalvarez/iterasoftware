"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Scene3D } from "@/components/scene-3d";
import { TopicLink } from "@/components/topic-link";
import { scrollProgress } from "@/lib/scroll-progress";

export type TrainingModule = { title: string; text: string };

/** Punto del recorrido desde el que el último módulo cuenta como aprendido. */
const FINISH = 0.96;

/** Las capacitaciones, módulo por módulo: el equipo de la escena va sumando color. */
export function TrainingStory({
  id,
  label,
  title,
  intro,
  topic,
  modules,
}: {
  id: string;
  label: string;
  title: string;
  intro: string;
  topic: string;
  modules: readonly TrainingModule[];
}) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [finished, setFinished] = useState(false);
  const count = modules.length;

  // Va aparte de la escena para que los módulos funcionen también sin WebGL
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const p = scrollProgress(el);
      el.style.setProperty("--p", p.toFixed(4));
      setActive(Math.min(count - 1, Math.floor(p * count)));
      setFinished(p >= FINISH);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [count]);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / count) * (el.offsetHeight - window.innerHeight);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
  };

  const learned = finished ? count : active;

  return (
    <section ref={ref} id={id} data-scene-track className="relative border-t border-line" style={{ height: `${count * 75 + 100}svh`, "--p": 0 } as CSSProperties}>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="glow-top absolute inset-0 opacity-50" aria-hidden />
        <Scene3D
          name="training"
          className="relative order-last min-h-0 flex-1 side:absolute side:bottom-0 side:top-[4.5rem] side:left-0 side:mask-r-from-92% side:mask-r-to-100% side:max-lg:right-[46%] lg:right-[38%]"
          fallback={<FlatRoom learned={learned} />}
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pt-24 side:h-full side:justify-center side:pt-[4.5rem]">
          <div className="max-w-md md:max-w-xl side:ml-auto side:w-[min(25rem,44%)] side:max-w-none">
            <p className="font-mono text-xs uppercase tracking-widest text-accent short:text-[10px]">{label}</p>
            <h2 className="mt-3 short:mt-1! text-balance text-2xl font-semibold tracking-tight sm:text-4xl side:max-lg:text-3xl short:text-xl!">{title}</h2>
            <p className="mt-3 hidden leading-relaxed text-muted sm:block short:hidden!">{intro}</p>

            <ol className="mt-5 md:mt-8 short:mt-3!">
              {modules.map((m, i) => {
                const on = i === active;
                const done = i < learned;
                return (
                  <li key={m.title} className="relative pl-10">
                    {i < count - 1 && <span aria-hidden className={`absolute bottom-0 left-[0.6875rem] top-8 w-px transition-colors duration-500 ${done ? "bg-accent" : "bg-line"}`} />}
                    <span
                      aria-hidden
                      className={`absolute left-0 top-1.5 grid size-6 place-items-center rounded-full border text-[11px] transition-colors duration-500 md:top-2.5 short:top-0.5! ${done ? "border-accent bg-accent text-background" : on ? "border-accent text-accent" : "border-line text-muted/60"}`}
                    >
                      {done ? (
                        <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m2.5 6.5 2.5 2.5 4.5-5.5" pathLength="1" className="check-draw" />
                        </svg>
                      ) : (
                        <span className="font-mono">{i + 1}</span>
                      )}
                    </span>
                    <h3>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={on ? "step" : undefined}
                        className={`py-1 text-left transition-colors duration-500 md:py-2 md:text-xl short:py-0.5! short:text-base! ${on ? "font-medium text-foreground" : done ? "text-foreground/70" : "text-muted/60 hover:text-muted"}`}
                      >
                        {m.title}
                      </button>
                    </h3>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 motion-reduce:transition-none ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <p className="overflow-hidden text-sm leading-relaxed text-muted md:text-base short:text-sm!">
                        <span className="block min-h-[4.9rem] pb-3 md:min-h-[4rem] short:min-h-0! short:pb-1!">{m.text}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div aria-hidden className="mt-4 hidden items-center gap-4 font-mono text-[11px] text-muted md:flex short:hidden!">
              <span>Nivel del equipo</span>
              <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
                <span className="absolute inset-0 origin-left scale-x-[var(--p)] rounded-full bg-accent" />
              </span>
            </div>
            <TopicLink
              topic={topic}
              className="group mt-6 hidden items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline md:inline-flex short:hidden!"
            >
              Armemos un plan para tu equipo
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </TopicLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/** La misma mesa en dos dimensiones, para equipos sin WebGL. */
function FlatRoom({ learned }: { learned: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <svg viewBox="0 0 400 300" className="h-full max-h-80 w-full max-w-md" strokeWidth="1.5">
        <rect x="110" y="20" width="180" height="104" rx="8" className="fill-[#111922] stroke-accent" />
        <path d="M130 46h70M130 64h120M130 82h96" className="stroke-muted" />
        <ellipse cx="200" cy="218" rx="130" ry="46" className="fill-[#1c2835] stroke-line" />
        {[60, 108, 164, 236, 292, 340].map((x, i) => {
          const y = [216, 168, 148, 148, 168, 216][i];
          const tone = `transition-colors duration-700 ${learned > i / 2 - 0.5 && learned > 0 ? "fill-accent/30 stroke-accent" : "fill-[#0b0f14] stroke-muted/50"}`;
          return (
            <g key={x} className={tone}>
              <circle cx={x} cy={y} r="13" />
              <path d={`M${x - 20} ${y + 42}a20 22 0 0 1 40 0`} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
