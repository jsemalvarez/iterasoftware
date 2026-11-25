"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Argentina/Buenos_Aires",
});

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, 1000);
  return () => clearInterval(timer);
}

/** Hora actual de Argentina. En el servidor muestra guiones para no romper la hidratación. */
export function LocalTime() {
  return useSyncExternalStore(
    subscribe,
    () => format.format(new Date()),
    () => "--:--",
  );
}
