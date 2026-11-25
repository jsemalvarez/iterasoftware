"use client";

import { useEffect, useRef, useState } from "react";
import { Scene3D } from "@/components/scene-3d";
import { scrollProgress } from "@/lib/scroll-progress";

export type Layer = { title: string; text: string };

/** Recorrido por capas: la escena queda fija y cada tramo de scroll enciende una. */
export function LayerStory({ label, title, layers }: { label: string; title: string; layers: Layer[] }) {
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
    <section ref={ref} id="capas" data-scene-track className="relative border-y border-line" style={{ height: `${layers.length * 75 + 100}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="glow-top absolute inset-0 rotate-180 opacity-60" aria-hidden />
        <Scene3D
          name="layers"
          className="absolute inset-x-0 bottom-0 h-[52%] md:inset-y-0 md:left-[42%] md:h-full"
          fallback={
            <div className="absolute inset-0 flex flex-col-reverse items-center justify-center gap-4 p-8">
              {layers.map((l, i) => (
                <div key={l.title} className={`h-10 w-56 -skew-x-12 rounded border ${i === active ? "border-accent bg-accent/20" : "border-line"}`} />
              ))}
            </div>
          }
        />
        <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-start px-6 pt-24 md:justify-center md:pt-16">
          <div className="max-w-md">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">{label}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            <ol className="mt-6 md:mt-10">
              {layers.map((l, i) => {
                const on = i === active;
                return (
                  <li key={l.title} className={`border-l-2 pl-5 transition-colors duration-500 ${on ? "border-accent" : "border-line"}`}>
                    <h3 className={`flex items-baseline gap-3 py-1 transition-colors duration-500 md:py-2 md:text-xl ${on ? "font-medium text-foreground" : "text-muted/60"}`}>
                      <span className="font-mono text-xs">0{i + 1}</span>
                      {l.title}
                    </h3>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 motion-reduce:transition-none ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <p className="overflow-hidden text-sm leading-relaxed text-muted md:text-base">
                        <span className="block pb-3">{l.text}</span>
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
