/** Los tres servicios, en el orden en que aparecen. `id` es también el ancla de su sección. */
export const services = [
  { id: "software", title: "Desarrollo de software a medida" },
  { id: "bots", title: "Bots y automatizaciones" },
  { id: "capacitaciones", title: "Capacitaciones" },
] as const;

export type ServiceId = (typeof services)[number]["id"];

/** Rótulo de la sección de cada servicio: "01 · Desarrollo de software a medida". */
export const serviceLabel = (id: ServiceId) => {
  const i = services.findIndex((s) => s.id === id);
  return `0${i + 1} · ${services[i].title}`;
};
