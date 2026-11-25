import { IntegrationBeams } from "@/components/integration-beams";
import { LayerStory } from "@/components/layer-story";
import { Logo } from "@/components/logo";
import { MagneticLink } from "@/components/magnetic";
import { Reveal } from "@/components/reveal";
import { SceneHero, type HeroScene } from "@/components/scene-hero";
import { ServiceShowcase } from "@/components/service-showcase";
import { WordmarkFooter } from "@/components/wordmark-footer";

// TODO: confirmar el correo de contacto real antes de publicar.
const CONTACT_EMAIL = "hola@iterasoftware.com";
const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quiero conversar un proyecto")}`;

const nav = [
  { href: "#capas", label: "Cómo se conecta" },
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
];

const layers = [
  { title: "Máquinas", text: "Empezamos por lo que ya tenés: prensas, tornos, hornos y sensores, nuevos o con décadas de uso." },
  { title: "Conexión", text: "PLCs, SCADA y planillas hablan el mismo idioma, sin frenar la producción." },
  { title: "Datos", text: "Una sola fuente de verdad, ordenada y en tiempo real." },
  { title: "Inteligencia", text: "Modelos que detectan anomalías, inspeccionan piezas y anticipan fallas." },
  { title: "Decisiones", text: "Tableros y alertas a medida, para actuar a tiempo en planta y en gerencia." },
];

const services = [
  { n: "01", title: "Software a medida para planta", text: "Producción, trazabilidad, calidad y mantenimiento, adaptados a tus procesos." },
  { n: "02", title: "Automatización con IA", text: "Detección de anomalías, visión artificial y asistentes para tareas repetitivas." },
  { n: "03", title: "Integración de datos", text: "PLCs, sensores, SCADA, ERP y planillas conectados en una sola fuente de verdad." },
  { n: "04", title: "Tableros y mantenimiento predictivo", text: "OEE, paradas y consumos visibles, y modelos que anticipan fallas." },
];

const steps = [
  { title: "Diagnóstico", text: "Recorremos la planta y elegimos el problema que más valor libera." },
  { title: "Prototipo", text: "Una primera versión con datos reales, en semanas." },
  { title: "Puesta en marcha", text: "Integramos, capacitamos y medimos el impacto." },
  { title: "Iteración", text: "Cada ciclo mejora lo que ya funciona." },
];

const heroTitle: Record<HeroScene, [string, string]> = {
  city: ["Toda tu planta,", "un solo circuito."],
  factory: ["Tu línea ve,", "aprende y mejora."],
};

/** v1c con la línea de producción en el hero, para comparar. */
export function LandingV1cLinea() {
  return <LandingV1c scene="factory" />;
}

export default function LandingV1c({ scene = "city" }: { scene?: HeroScene }) {
  return (
    <div className="grain relative flex flex-1 flex-col">
      <header className="sticky top-0 z-30 h-[4.5rem] border-b border-line/60 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
          <a href="#inicio" aria-label="Itera Software, inicio">
            <Logo />
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
          <a href={mailto} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90">
            Hablemos
          </a>
        </div>
      </header>

      <main id="inicio" className="flex-1">
        <SceneHero scene={scene} fallback={<IntegrationBeams />}>
          <div className="max-w-xl">
            <p className="fade-up font-mono text-xs uppercase tracking-widest text-accent">Software · Industria · IA</p>
            <h1
              className="fade-up mt-6 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              {heroTitle[scene][0]} <span className="text-accent">{heroTitle[scene][1]}</span>
            </h1>
            <p className="fade-up mt-6 max-w-md text-lg text-muted" style={{ animationDelay: "160ms" }}>
              Software a medida e inteligencia artificial para empresas industriales, desde la primera máquina hasta el tablero.
            </p>
            <div className="fade-up mt-8 flex flex-wrap items-center gap-5" style={{ animationDelay: "240ms" }}>
              <MagneticLink href={mailto} className="gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background">
                Contanos tu desafío <span aria-hidden>→</span>
              </MagneticLink>
              <a href="#capas" className="hidden text-sm text-muted underline-offset-4 md:inline transition-colors hover:text-foreground hover:underline">
                Ver cómo funciona
              </a>
            </div>
          </div>
        </SceneHero>

        <LayerStory label="Cómo se conecta" title="De la máquina a la decisión, capa por capa." layers={layers} />

        <section id="servicios" className="mx-auto w-full max-w-6xl scroll-mt-20 overflow-x-clip px-6 py-28">
          <Reveal className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Servicios</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Elegí por dónde <span className="text-muted">empezar.</span>
            </h2>
          </Reveal>
          <Reveal className="mt-12">
            <ServiceShowcase services={services} />
          </Reveal>
        </section>

        <section id="proceso" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-28">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Cómo trabajamos</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                Corto, medible <span className="text-muted">y otra vez.</span>
              </h2>
            </Reveal>
            <Reveal className="mt-14">
              <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="group relative overflow-hidden bg-background p-7 pt-28 transition-colors hover:bg-[#121820]">
                    <span
                      aria-hidden
                      className="absolute -top-4 right-3 text-[7rem] font-bold leading-none text-line transition-colors duration-500 group-hover:text-accent/25"
                    >
                      {i + 1}
                    </span>
                    <h3 className="relative text-xl font-medium">{s.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <section id="contacto" className="relative scroll-mt-20 overflow-hidden border-t border-line px-6 py-32 text-center">
          <div aria-hidden className="glow-top pointer-events-none absolute inset-0" />
          <Reveal className="relative">
            <h2 className="footer-metal mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              ¿Qué proceso te gustaría dejar de hacer a mano?
            </h2>
            <div className="mt-10">
              <MagneticLink href={mailto} className="gap-3 rounded-full bg-accent px-9 py-4 font-semibold text-background shadow-[0_0_50px_-10px_var(--accent)]">
                Escribinos <span aria-hidden>→</span>
              </MagneticLink>
            </div>
            <p className="mt-4 font-mono text-xs text-muted">{CONTACT_EMAIL}</p>
          </Reveal>
        </section>
      </main>

      <div className="border-t border-line">
        <WordmarkFooter
          blurb="Software a medida para la industria y automatización de procesos con inteligencia artificial."
          columns={[
            { title: "Servicios", links: services.map((s) => ({ href: "#servicios", label: s.title })) },
            { title: "Conocenos", links: nav.filter((n) => n.href !== "#servicios" && n.href !== "#contacto") },
            { title: "Contacto", links: [{ href: mailto, label: "Escribinos" }] },
          ]}
        />
      </div>
    </div>
  );
}
