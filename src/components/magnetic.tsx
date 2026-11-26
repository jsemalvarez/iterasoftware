"use client";

import type { PointerEvent, ReactNode } from "react";

/** Enlace que se deja atraer por el cursor y vuelve con rebote (ver .magnetic en globals.css). */
export function MagneticLink({ href, className = "", children }: { href: string; className?: string; children: ReactNode }) {
  function onPointerMove(e: PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse") return;
    // Se mide el contenedor quieto: si se midiera el enlace, su propio movimiento haría vibrar el efecto.
    const r = e.currentTarget.parentElement!.getBoundingClientRect();
    e.currentTarget.style.setProperty("--tx", `${(e.clientX - r.left - r.width / 2) * 0.3}px`);
    e.currentTarget.style.setProperty("--ty", `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
  }
  function onPointerLeave(e: PointerEvent<HTMLAnchorElement>) {
    e.currentTarget.style.removeProperty("--tx");
    e.currentTarget.style.removeProperty("--ty");
  }
  return (
    <span className="inline-flex">
      <a href={href} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={`magnetic ${className}`}>
        {children}
      </a>
    </span>
  );
}
