import type { ReactNode } from "react";
import { CurtainFooter } from "@/components/curtain-footer";
import { Logo } from "@/components/logo";
import { ParticleField } from "@/components/particle-field";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight-card";
import { Kpi, LiveChart, LogStream, MachineStatus, MessySheet, PlantDashboard, PredictiveAlert, VisionGrid, WorkOrders } from "@/components/plant-visuals";

// TODO: confirmar el correo de contacto real antes de publicar.
const CONTACT_EMAIL = "hola@iterasoftware.com";
const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quiero conversar un proyecto")}`;

const nav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#por-que", label: "Por qué Itera" },
  { href: "#contacto", label: "Contacto" },
];

const sectors = [
  "Metalmecánica",
  "Alimentos y bebidas",
  "Plásticos",
  "Energía",
  "Logística",
  "Agroindustria",
  "Química",
  "Autopartes",
];

const services = [
  {
    code: "01",
    title: "Software a medida para planta",
    text: "Sistemas de producción, trazabilidad, calidad y mantenimiento pensados para cómo trabaja tu planta, no al revés.",
    tags: ["MES liviano", "Trazabilidad", "Órdenes de trabajo"],
    span: "md:col-span-2",
  },
  {
    code: "02",
    title: "Automatización con IA",
    text: "Detección de anomalías, visión artificial para control de calidad y asistentes que resuelven tareas repetitivas.",
    tags: ["Visión", "Anomalías", "Agentes"],
    span: "",
  },
  {
    code: "03",
    title: "Integración de datos",
    text: "Conectamos PLCs, sensores, ERP y planillas en una sola fuente de verdad, en tiempo real.",
    tags: ["OPC UA", "MQTT", "ERP"],
    span: "",
  },
  {
    code: "04",
    title: "Tableros y mantenimiento predictivo",
    text: "OEE, paradas y consumo a la vista de todos. Modelos que avisan antes de que una máquina falle.",
    tags: ["OEE", "Alertas", "Predicción"],
    span: "md:col-span-2",
  },
];

const steps = [
  {
    n: "01",
    title: "Diagnóstico en planta",
    text: "Recorremos el proceso con tu equipo y elegimos el problema que más valor libera al resolverse.",
  },
  {
    n: "02",
    title: "Prototipo en semanas",
    text: "Una primera versión funcionando con datos reales, para validar rápido y sin grandes apuestas.",
  },
  {
    n: "03",
    title: "Puesta en marcha",
    text: "Integramos con tus sistemas, capacitamos a los operarios y medimos el impacto desde el día uno.",
  },
  {
    n: "04",
    title: "Iteración continua",
    text: "Cada ciclo suma mejoras sobre lo que ya funciona. Por eso nos llamamos Itera.",
  },
];

const principles = [
  {
    title: "Hablamos el idioma de la planta",
    text: "Turnos, paradas, scrap y OEE no son palabras nuevas para nosotros.",
  },
  {
    title: "Resultados medibles",
    text: "Cada proyecto arranca con un indicador concreto y termina con él mejorado.",
  },
  {
    title: "Tecnología que se queda",
    text: "Código y datos son tuyos. Documentamos todo para que no dependas de nadie.",
  },
];

const serviceVisual: Record<string, ReactNode> = {
  "01": <WorkOrders />,
  "02": <VisionGrid />,
  "03": <LogStream className="h-44" />,
  "04": <PredictiveAlert id="svc-pred" />,
};

const stepVisual: Record<string, ReactNode> = {
  "01": <MessySheet />,
  "02": (
    <div className="rounded-lg border border-line bg-background/60 p-3">
      <p className="mb-2 font-mono text-[10px] text-muted">prototipo · línea 2</p>
      <LiveChart id="step-proto" className="h-24 w-full" />
    </div>
  ),
  "03": (
    <div className="rounded-lg border border-line bg-background/60 p-3">
      <MachineStatus compact />
    </div>
  ),
  "04": (
    <div className="grid grid-cols-3 gap-2">
      <Kpi label="Ciclo 1" value="71%" />
      <Kpi label="Ciclo 2" value="79%" delta="▲ 8" />
      <Kpi label="Ciclo 3" value="87%" delta="▲ 8" />
    </div>
  ),
};

function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent ${className}`}>
      <span className="h-px w-6 bg-accent" />
      {children}
    </p>
  );
}

export default function LandingV1a() {
  return (
    <div className="grain relative flex flex-1 flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
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
          <a
            href={mailto}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Hablemos
          </a>
        </div>
      </header>

      <main id="inicio" className="flex-1">
        {/* ── Hero ── */}
        <section className="relative isolate overflow-hidden">
          <ParticleField />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,var(--background)_15%,transparent_70%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

          <div className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-6xl flex-col justify-center px-6 py-24">
            <div className="fade-up mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-background/70 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Software · Industria · IA
            </div>

            <h1
              className="fade-up max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              Software que hace
              <br />
              funcionar <span className="text-accent">la industria</span>.
            </h1>

            <p
              className="fade-up mt-6 max-w-xl text-lg text-muted"
              style={{ animationDelay: "160ms" }}
            >
              Desarrollamos software a medida y automatizamos procesos con
              inteligencia artificial para empresas industriales. Menos
              planillas, menos paradas, más decisiones con datos.
            </p>

            <div
              className="fade-up mt-10 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <a
                href={mailto}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition-all hover:gap-3"
              >
                Contanos tu desafío
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center rounded-full border border-line bg-background/60 px-6 py-3 text-sm font-medium text-foreground/80 backdrop-blur transition-colors hover:border-muted hover:text-foreground"
              >
                Ver servicios
              </a>
            </div>
          </div>
        </section>

        {/* ── Sectores ── */}
        <section aria-label="Sectores" className="border-y border-line py-6">
          <div className="marquee-mask overflow-hidden">
            <div className="marquee flex w-max gap-12 font-mono text-sm text-muted">
              {[...sectors, ...sectors].map((s, i) => (
                <span key={i} className="flex items-center gap-12 whitespace-nowrap" aria-hidden={i >= sectors.length}>
                  {s}
                  <span className="text-accent">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Vista del tablero ── */}
        <section aria-label="Vista del tablero" className="relative px-6 pt-24">
          <div aria-hidden className="glow-top pointer-events-none absolute inset-x-0 top-0 h-[32rem]" />
          <div className="relative mx-auto w-full max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <SectionLabel className="justify-center">Tu planta, en una pantalla</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                Lo que pasa en el piso, <span className="text-muted">a la vista de todos.</span>
              </h2>
            </Reveal>
            <Reveal className="mt-14">
              <div className="tilt-in relative">
                <div aria-hidden className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent/40 via-line to-transparent" />
                <div className="relative">
                  <PlantDashboard />
                </div>
              </div>
              <p className="mt-4 text-center font-mono text-[11px] text-muted/70">
                Vista ilustrativa · cada tablero se arma a la medida de tu proceso
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Servicios ── */}
        <section id="servicios" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-28">
          <Reveal>
            <SectionLabel>Servicios</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Del tablero de control <span className="text-muted">a la línea de producción.</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.code} delay={i * 90} className={s.span}>
                <SpotlightCard className="h-full">
                  <article className={`grid h-full gap-8 p-7 ${s.span ? "md:grid-cols-[1fr_1.25fr] md:items-center" : ""}`}>
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-accent">{s.code}</span>
                        <span
                          aria-hidden
                          className="font-mono text-sm text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent"
                        >
                          →
                        </span>
                      </div>
                      <h3 className="mt-6 text-2xl font-medium tracking-tight">{s.title}</h3>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{s.text}</p>
                      <ul className="mt-auto flex flex-wrap gap-2 pt-6">
                        {s.tags.map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-line bg-background/60 px-3 py-1 font-mono text-[11px] text-muted transition-colors group-hover:border-accent/30"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      aria-hidden
                      className="rounded-xl border border-line bg-background/50 p-4 transition-colors duration-300 group-hover:border-accent/25"
                    >
                      {serviceVisual[s.code]}
                    </div>
                  </article>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Proceso ── */}
        <section id="proceso" className="scroll-mt-20 border-y border-line bg-line/10">
          <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-28 *:min-w-0 md:grid-cols-[1fr_1.6fr]">
            <Reveal className="md:sticky md:top-28 md:self-start">
              <SectionLabel>Cómo trabajamos</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                Iteramos <span className="text-muted">hasta que funcione en planta.</span>
              </h2>
            </Reveal>

            <ol className="timeline relative space-y-12 pl-12 md:pl-16">
              <li aria-hidden role="presentation" className="absolute bottom-0 left-[11px] top-3 m-0 w-0.5 bg-line">
                <div className="timeline-fill size-full bg-gradient-to-b from-accent/40 to-accent shadow-[0_0_16px_var(--accent)]" />
              </li>
              {steps.map((s) => (
                <li key={s.n}>
                  <Reveal className="relative">
                    <span
                      aria-hidden
                      className="step-dot absolute -left-12 top-0 flex size-6 items-center justify-center rounded-full border border-accent bg-background shadow-[0_0_18px_-2px_var(--accent)] md:-left-16"
                    >
                      <span className="size-2 rounded-full bg-accent" />
                    </span>
                    <p className="font-mono text-xs leading-6 text-accent">Paso {s.n}</p>
                    <SpotlightCard className="mt-3">
                      <div className="grid gap-6 p-6 *:min-w-0 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                        <div>
                          <h3 className="text-xl font-medium">{s.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                        </div>
                        <div aria-hidden>{stepVisual[s.n]}</div>
                      </div>
                    </SpotlightCard>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Por qué Itera ── */}
        <section id="por-que" className="scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-28">
          <div className="grid gap-14 md:grid-cols-[1fr_1.4fr]">
            <Reveal className="md:sticky md:top-28 md:self-start">
              <SectionLabel>Por qué Itera</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                Ingeniería de software <span className="text-muted">con los pies en el piso de planta.</span>
              </h2>
              <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
                {[
                  ["2–4", "semanas al primer prototipo"],
                  ["100%", "del código y los datos, tuyos"],
                  ["1", "indicador claro por proyecto"],
                ].map(([v, l]) => (
                  <div key={l} className="flex flex-col-reverse justify-end bg-background p-4">
                    <dt className="mt-1 text-xs leading-snug text-muted">{l}</dt>
                    <dd className="text-2xl font-semibold tracking-tight text-accent sm:text-3xl">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <ul className="divide-y divide-line border-y border-line">
              {principles.map((p, i) => (
                <li key={p.title}>
                  <Reveal delay={i * 120}>
                    <div className="group relative grid grid-cols-[4rem_1fr] gap-4 py-8">
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100"
                      />
                      <span className="pl-4 font-mono text-3xl text-muted/40 transition-colors duration-300 group-hover:text-accent">
                        0{i + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-medium">{p.title}</h3>
                        <p className="mt-1 text-muted">{p.text}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </main>

      <CurtainFooter
        id="contacto"
        links={nav.filter((n) => n.href !== "#contacto")}
        phrases={["Software a medida", "Datos en tiempo real", "Visión artificial", "Mantenimiento predictivo", "Iteración continua"]}
        mailto={mailto}
        email={CONTACT_EMAIL}
      />
    </div>
  );
}
