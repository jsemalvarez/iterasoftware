"use client";

import { useState, type ReactNode } from "react";
import { AppWindow, LogStream, PredictiveAlert, VisionGrid, WorkOrders } from "@/components/plant-visuals";

type Service = { n: string; title: string; text: string };

const visuals: Record<string, { title: string; node: ReactNode }> = {
  "01": { title: "itera · órdenes de trabajo", node: <WorkOrders /> },
  "02": { title: "itera · inspección por visión", node: <VisionGrid /> },
  "03": { title: "itera · integración en vivo", node: <LogStream className="h-56" /> },
  "04": { title: "itera · mantenimiento predictivo", node: <PredictiveAlert id="showcase-pred" /> },
};

/**
 * Lista de servicios con un panel que muestra cómo se ve cada uno.
 * Se activa con el cursor, el foco del teclado o un toque.
 */
export function ServiceShowcase({ services }: { services: Service[] }) {
  const [active, setActive] = useState(services[0]?.n ?? "01");
  const current = visuals[active];

  return (
    <div className="grid gap-8 *:min-w-0 md:grid-cols-[1.1fr_1fr] md:items-start">
      <ul className="border-t border-line">
        {services.map((s) => {
          const on = s.n === active;
          return (
            <li key={s.n} className="relative border-b border-line">
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-0 origin-left bg-gradient-to-r from-accent/[0.09] to-transparent transition-transform duration-500 ease-out ${on ? "scale-x-100" : "scale-x-0"}`}
              />
              <span
                aria-hidden
                className={`pointer-events-none absolute bottom-[-1px] left-0 h-px w-full origin-left bg-accent transition-transform duration-500 ease-out ${on ? "scale-x-100" : "scale-x-0"}`}
              />
              <button
                type="button"
                aria-pressed={on}
                onMouseEnter={() => setActive(s.n)}
                onFocus={() => setActive(s.n)}
                onClick={() => setActive(s.n)}
                className="relative grid w-full grid-cols-[3.5rem_1fr_auto] items-start gap-4 px-2 py-7 text-left"
              >
                <span className={`font-mono text-2xl transition-colors ${on ? "text-accent" : "text-muted/50"}`}>{s.n}</span>
                <span>
                  <span className="block text-xl font-medium">{s.title}</span>
                  <span className="mt-1 block text-sm text-muted">{s.text}</span>
                </span>
                <span aria-hidden className={`mt-1 text-xl transition-all ${on ? "translate-x-1 text-accent" : "text-muted"}`}>
                  →
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="md:sticky md:top-28" aria-hidden>
        <div className="relative">
          <div className="pointer-events-none absolute -inset-8 rounded-full bg-accent/10 blur-3xl" />
          <AppWindow title={current?.title ?? ""} className="relative">
            <div key={active} className="fade-up min-h-80 p-5">
              {current?.node}
            </div>
          </AppWindow>
        </div>
      </div>
    </div>
  );
}
