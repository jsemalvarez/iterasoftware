"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Hace aparecer su contenido (fade + slide) cuando entra en pantalla.
 * Sin JavaScript el contenido se ve igual: el estado oculto solo aplica
 * con `@media (scripting: enabled)` (ver .reveal en globals.css).
 * Los hijos pueden reaccionar a `.reveal.is-visible` para animaciones propias.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Retraso en ms, útil para escalonar elementos de una lista. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
