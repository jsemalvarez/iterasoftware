"use client";

import type { PointerEvent, ReactNode } from "react";

/**
 * Tarjeta con un brillo radial que sigue al cursor, borde iluminado y marcas
 * de esquina tipo plano técnico. Los estilos viven en globals.css (.spotlight-card).
 */
export function SpotlightCard({ className = "", children }: { className?: string; children: ReactNode }) {
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div onPointerMove={onPointerMove} className={`spotlight-card group ${className}`}>
      <span aria-hidden className="spotlight-glow" />
      <span aria-hidden className="corner corner-tl" />
      <span aria-hidden className="corner corner-tr" />
      <span aria-hidden className="corner corner-bl" />
      <span aria-hidden className="corner corner-br" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
