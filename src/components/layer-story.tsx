"use client";

import { useEffect, useRef, useState } from "react";
import { Scene3D } from "@/components/scene-3d";
import { scrollProgress } from "@/lib/scroll-progress";

export type Layer = { title: string; text: string };

/** Recorrido por capas: la escena queda fija y cada tramo de scroll enciende una. */
export function LayerStory({ id, label, title, layers }: { id: string; label: string; title: string; layers: Layer[] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const count = layers.length;

  // Va aparte de la escena para que la lista funcione también sin WebGL
  useEffect(() => {
    const onScroll = () => {
      if (ref.current) setActive(Math.min(count - 1, Math.floor(scrollProgress(ref.current) * count)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [count]);

  return (
    <section ref={ref} id={id} data-scene-track className="relative border-y border-line" style={{ height: `${layers.length * 75 + 100}svh` }}>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="glow-top absolute inset-0 rotate-180 opacity-60" aria-hidden />
        <Scene3D
          name="layers"
          className="relative order-last min-h-0 flex-1 side:absolute side:bottom-0 side:top-[4.5rem] side:right-0 side:max-lg:left-[46%] lg:left-[42%]"
          fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
              {layers.map((l, i) => (
                <div
                  key={l.title}
                  className={`w-56 rounded-lg border px-4 py-3 text-sm transition-colors duration-500 ${i === active ? "border-accent bg-accent/20" : "border-line text-muted"}`}
                >
                  {l.title}
                </div>
              ))}
            </div>
          }
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pt-24 side:h-full side:justify-center side:pt-[4.5rem]">
          <div className="max-w-md md:max-w-xl side:max-lg:max-w-[43%] lg:max-w-md">
            <p className="font-mono text-xs uppercase tracking-widest text-accent short:text-[10px]">{label}</p>
            <h2 className="mt-3 short:mt-1! text-balance text-2xl font-semibold tracking-tight sm:text-4xl side:max-lg:text-3xl short:text-xl!">{title}</h2>
            <ol className="mt-6 md:mt-10 short:mt-3!">
              {layers.map((l, i) => {
                const on = i === active;
                return (
                  <li key={l.title} className={`border-l-2 pl-5 transition-colors duration-500 ${on ? "border-accent" : "border-line"}`}>
                    <h3 className={`flex items-baseline gap-3 py-1 transition-colors duration-500 md:py-2 md:text-xl short:py-0.5! short:text-base! ${on ? "font-medium text-foreground" : "text-muted/60"}`}>
                      <span className="font-mono text-xs">0{i + 1}</span>
                      {l.title}
                    </h3>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 motion-reduce:transition-none ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <p className="overflow-hidden text-sm leading-relaxed text-muted md:text-base short:text-sm!">
                        <span className="block min-h-[4.9rem] pb-3 md:min-h-[4rem] short:min-h-0! short:pb-1!">{l.text}</span>
                      </p>
                    </div>
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
