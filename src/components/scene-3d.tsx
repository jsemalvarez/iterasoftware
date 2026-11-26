"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MountOptions } from "@/three/mount";

/**
 * Escena 3D con carga diferida: three.js se descarga recién cuando el bloque
 * está por entrar en pantalla. Sin WebGL muestra el contenido de `fallback`.
 */
export function Scene3D({
  name,
  className = "",
  fallback,
  onStats,
  energy = 0,
}: Omit<MountOptions, "getEnergy"> & { className?: string; fallback?: ReactNode; energy?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({ onStats, energy });
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    latest.current = { onStats, energy };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let unmount: (() => void) | undefined;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        try {
          const { mountScene } = await import("@/three/mount");
          if (cancelled) return;
          const mounted = mountScene(el, {
            name,
            onStats: (a, b) => latest.current.onStats?.(a, b),
            getEnergy: () => latest.current.energy,
          });
          unmount = mounted.unmount;
          await mounted.ready;
          if (!cancelled) setState("ready");
        } catch {
          if (!cancelled) setState("failed");
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      unmount?.();
    };
  }, [name]);

  return (
    <div aria-hidden className={className}>
      <div
        ref={ref}
        className={`absolute inset-0 transition-opacity duration-1000 ${state === "ready" ? "opacity-100" : "opacity-0"}`}
      />
      {state === "failed" && fallback}
    </div>
  );
}
