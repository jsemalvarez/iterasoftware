import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLanding, landingVersions } from "@/landings";

// Cada versión es una página entera distinta: no hay una parte común que mostrar
// antes de saber cuál es, así que la navegación espera a la versión. Además
// mantiene el 404 real para las que no existen (dentro de un Suspense no lo tendría).
export const instant = false;

// Se prerenderizan las versiones registradas; cualquier otro segmento da 404.
export function generateStaticParams() {
  return landingVersions.map((v) => ({ version: v.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[version]">): Promise<Metadata> {
  const { version } = await params;
  const landing = getLanding(version);
  return {
    title: `Itera Software — ${landing?.label ?? version}`,
    // Las versiones son para revisión interna, no para buscadores.
    robots: { index: false, follow: false },
  };
}

export default async function VersionPage({
  params,
}: PageProps<"/[version]">) {
  const { version } = await params;
  const landing = getLanding(version);
  if (!landing) notFound();
  const Landing = landing.Component;
  return <Landing />;
}
