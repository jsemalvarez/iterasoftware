import { BuildStory } from "@/components/build-story";
import { ClientsSection } from "@/components/clients-section";
import { ContactSection } from "@/components/contact-section";
import { IntegrationBeams } from "@/components/integration-beams";
import { LayerStory } from "@/components/layer-story";
import { Logo } from "@/components/logo";
import { MagneticLink } from "@/components/magnetic";
import { SceneHero } from "@/components/scene-hero";
import { TrainingStory } from "@/components/training-story";
import { WordmarkFooter } from "@/components/wordmark-footer";
import { clients } from "@/lib/clients";
import { serviceLabel, services } from "@/lib/services";
import { softwareLayers } from "@/lib/software-layers";
import { trainingModules } from "@/lib/training";

// TODO: confirmar el correo de contacto real antes de publicar.
const CONTACT_EMAIL = "hola@iterasoftware.com";

const nav = [
  { href: "#software", label: "Software a medida" },
  { href: "#bots", label: "Bots" },
  { href: "#capacitaciones", label: "Capacitaciones" },
  { href: "#clientes", label: "Clientes" },
  { href: "#contacto", label: "Contacto" },
];

const steps = [
  { title: "Diagnóstico", text: "Vemos cómo trabaja tu equipo y elegimos la tarea que más tiempo libera." },
  { title: "Prototipo", text: "Una primera versión con datos reales, en semanas." },
  { title: "Puesta en marcha", text: "Integramos, capacitamos y medimos el impacto." },
  { title: "Iteración", text: "Cada ciclo mejora lo que ya funciona." },
];

export default function LandingV1c() {
  return (
    <div className="grain relative flex flex-1 flex-col">
      <header className="sticky top-0 z-30 h-[4.5rem] border-b border-line/60 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
          <a href="#inicio" aria-label="Itera Software, inicio">
            <Logo />
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted lg:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#contacto" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90">
            Hablemos
          </a>
        </div>
      </header>

      <main id="inicio" className="flex-1">
        <SceneHero scene="city" fallback={<IntegrationBeams />}>
          <div className="max-w-xl">
            <p className="fade-up font-mono text-xs uppercase tracking-widest text-accent">Software · Industria · IA</p>
            <h1
              className="fade-up mt-6 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              Toda tu planta, <span className="text-accent">un solo circuito.</span>
            </h1>
            <p className="fade-up mt-6 max-w-md text-lg text-muted" style={{ animationDelay: "160ms" }}>
              Software a medida e inteligencia artificial para empresas industriales, desde la primera máquina hasta el tablero.
            </p>
            <div className="fade-up mt-8 flex flex-wrap items-center gap-5" style={{ animationDelay: "240ms" }}>
              <MagneticLink href="#contacto" className="gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background">
                Contanos tu desafío <span aria-hidden>→</span>
              </MagneticLink>
              <a href="#software" className="hidden text-sm text-muted underline-offset-4 md:inline transition-colors hover:text-foreground hover:underline">
                Ver cómo funciona
              </a>
            </div>
          </div>
        </SceneHero>

        <LayerStory id="software" label={serviceLabel("software")} title="Tu software a medida, capa por capa." layers={softwareLayers} />

        <BuildStory id="bots" label={serviceLabel("bots")} title={["Del plano al bot,", "y otra vez."]} steps={steps} />

        <TrainingStory
          id="capacitaciones"
          label={serviceLabel("capacitaciones")}
          title="Tecnología que tu equipo sabe usar."
          intro="Talleres de IA, datos y software para gente de la industria, con ejemplos de su propio trabajo."
          topic="Capacitaciones"
          modules={trainingModules}
        />

        <ClientsSection clients={clients} />

        <ContactSection email={CONTACT_EMAIL} />
      </main>

      <div className="border-t border-line">
        <WordmarkFooter
          blurb="Software a medida, bots y capacitaciones en IA para la industria."
          columns={[
            { title: "Servicios", links: services.map((s) => ({ href: `#${s.id}`, label: s.title })) },
            { title: "Contacto", links: [{ href: "#contacto", label: "Escribinos" }, { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL }] },
          ]}
        />
      </div>
    </div>
  );
}
