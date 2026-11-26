import type { ComponentType } from "react";
import LandingProximamente from "./proximamente";
import LandingV1c from "./v1c";

export type LandingVersion = {
  /** Segmento de la URL: /v1c, ... */
  slug: string;
  label: string;
  date: string;
  notes: string;
  Component: ComponentType;
};

/**
 * Registro de versiones de la landing.
 * Para sumar una nueva: crear src/landings/<slug>.tsx y agregarla acá.
 * La que se muestra en "/" se elige abajo, en `currentSlug`.
 */
export const landingVersions: LandingVersion[] = [
  {
    slug: "v1c",
    label: "v1c · Ciudad circuito",
    date: "2026-11",
    notes:
      "Hero 3D con una placa de circuito como ciudad, software a medida por capas, bots, capacitaciones, clientes y contacto.",
    Component: LandingV1c,
  },
  {
    slug: "proximamente",
    label: "Próximamente",
    date: "2026-11",
    notes: "Página “Muy pronto” con blueprint, hero y tres capacidades.",
    Component: LandingProximamente,
  },
];

/** Versión publicada en "/" hasta definir el diseño final. */
const currentSlug = "proximamente";

export const currentLanding = landingVersions.find((v) => v.slug === currentSlug) ?? landingVersions[0];

export function getLanding(slug: string) {
  return landingVersions.find((v) => v.slug === slug);
}
