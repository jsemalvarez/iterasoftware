"use client";

import { useState, type ReactNode } from "react";
import { Scene3D } from "@/components/scene-3d";

export type HeroScene = "city";

/** Qué muestra el contador de la simulación en cada escena. */
const hud: Record<HeroScene, [label: string, className: string][]> = {
  city: [
    ["Señales entregadas", "text-accent"],
    ["En tránsito", "text-foreground"],
  ],
};

/** Hero con una escena 3D de fondo y un contador de la simulación. */
export function SceneHero({ scene, children, fallback }: { scene: HeroScene; children: ReactNode; fallback: ReactNode }) {
  const [stats, setStats] = useState<[number, number] | null>(null);

  return (
    <section className="relative isolate -mt-[4.5rem] overflow-hidden">
      <Scene3D
        name={scene}
        className="absolute inset-0 -z-10"
        fallback={<div className="absolute bottom-0 right-0 w-full max-w-xl opacity-60">{fallback}</div>}
        onStats={(a, b) => setStats([a, b])}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/45 to-transparent md:bg-gradient-to-r md:via-background/75 md:via-35% md:to-65%" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-background" />

      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6 pb-8 pt-32 md:justify-center md:pt-24">
        <div className="md:my-auto">{children}</div>
        <div
          aria-hidden
          className={`mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-64 font-mono text-[11px] text-muted transition-opacity duration-700 md:gap-x-6 md:pt-8 md:text-xs ${stats ? "" : "opacity-0"}`}
        >
          <span className="rounded-full border border-line bg-background/70 px-3 py-1 backdrop-blur">Simulación</span>
          {hud[scene].map(([label, tone], i) => (
            <span key={label}>
              {label} <span className={`tabular-nums ${tone}`}>{stats?.[i] ?? 0}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
