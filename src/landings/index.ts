import type { ComponentType } from "react";
import LandingProximamente from "./proximamente";
import LandingV1a from "./v1a";
import LandingV1b from "./v1b";

export type LandingVersion = {
  /** Segmento de la URL: /v1a, /v1b, ... */
  slug: string;
  label: string;
  date: string;
  notes: string;
  Component: ComponentType;
};

/**
 * Registro de versiones de la landing.
 * Para sumar una nueva: crear src/landings/<slug>.tsx y agregarla acá.
 * La primera de la lista es la que se muestra en "/".
 */
export const landingVersions: LandingVersion[] = [
  {
    slug: "v1a",
    label: "v1a · Partículas",
    date: "2026-11",
    notes:
      "Hero centrado con partículas interactivas, cinta de sectores, servicios en bento, proceso, diferenciales y contacto.",
    Component: LandingV1a,
  },
  {
    slug: "v1b",
    label: "v1b · Planta conectada",
    date: "2026-11",
    notes:
      "Hero dividido con diagrama de integración animado, hoy vs. con Itera, servicios en lista, primer proyecto, preguntas frecuentes y cierre en banda ámbar.",
    Component: LandingV1b,
  },
  {
    slug: "proximamente",
    label: "Próximamente",
    date: "2026-11",
    notes: "Página “Muy pronto” con blueprint, hero y tres capacidades.",
    Component: LandingProximamente,
  },
];

export const currentLanding = landingVersions[0];

export function getLanding(slug: string) {
  return landingVersions.find((v) => v.slug === slug);
}
