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
}: MountOptions & { className?: string; fallback?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onStats });
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    callbacks.current = { onStats };
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
          unmount = mountScene(el, {
            name,
            onStats: (a, b) => callbacks.current.onStats?.(a, b),
          });
          setState("ready");
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
