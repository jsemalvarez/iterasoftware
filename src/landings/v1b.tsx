import { WordmarkFooter } from "@/components/wordmark-footer";
import { Logo } from "@/components/logo";
import { IntegrationBeams } from "@/components/integration-beams";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight-card";
import { ServiceShowcase } from "@/components/service-showcase";
import { Kpi, LiveChart, MessySheet } from "@/components/plant-visuals";

// TODO: confirmar el correo de contacto real antes de publicar.
const CONTACT_EMAIL = "hola@iterasoftware.com";
const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quiero conversar un proyecto")}`;

const nav = [
  { href: "#antes-despues", label: "Qué cambia" },
  { href: "#servicios", label: "Servicios" },
  { href: "#primer-proyecto", label: "Primer proyecto" },
  { href: "#preguntas", label: "Preguntas" },
];

const comparison = [
  {
    today: "Los datos de producción se cargan a mano al final del turno.",
    itera: "Las máquinas reportan solas, en tiempo real.",
  },
  {
    today: "Una parada se detecta cuando alguien la ve.",
    itera: "Alertas automáticas y causa registrada al instante.",
  },
  {
    today: "El control de calidad depende de muestreos manuales.",
    itera: "Visión artificial que inspecciona cada pieza.",
  },
  {
    today: "Cada área tiene su planilla y su versión de la verdad.",
    itera: "Un solo tablero, los mismos números para todos.",
  },
];

const services = [
  {
    n: "01",
    title: "Software a medida para planta",
    text: "Producción, trazabilidad, calidad y mantenimiento, adaptados a tus procesos.",
  },
  {
    n: "02",
    title: "Automatización con IA",
    text: "Detección de anomalías, visión artificial y asistentes para tareas repetitivas.",
  },
  {
    n: "03",
    title: "Integración de datos",
    text: "PLCs, sensores, SCADA, ERP y planillas conectados en una sola fuente de verdad.",
  },
  {
    n: "04",
    title: "Tableros y mantenimiento predictivo",
    text: "OEE, paradas y consumos visibles, y modelos que anticipan fallas.",
  },
];

const firstProject = [
  { start: 1, span: 1, when: "Semana 1", title: "Visita y diagnóstico", text: "Recorremos la planta y elegimos un indicador a mejorar." },
  { start: 2, span: 3, when: "Semanas 2–4", title: "Prototipo con datos reales", text: "Conectamos las primeras fuentes y mostramos resultados." },
  { start: 5, span: 4, when: "Semanas 5–8", title: "Puesta en marcha", text: "Lo llevamos a producción y capacitamos al equipo." },
  { start: 9, span: 1, when: "Después", title: "Iterar", text: "Medimos, ajustamos y sumamos el siguiente proceso." },
];

const faqs = [
  {
    q: "¿Tenemos que cambiar las máquinas o el ERP que ya usamos?",
    a: "No. Nos integramos con lo que ya tenés: PLCs, sensores, ERP y planillas. El objetivo es sumar, no reemplazar.",
  },
  {
    q: "¿Qué tamaño de empresa necesita esto?",
    a: "Trabajamos con plantas de cualquier tamaño. Empezamos por un problema acotado para que el primer resultado llegue rápido.",
  },
  {
    q: "¿De quién es el software y los datos?",
    a: "Tuyos. Entregamos el código y la documentación para que no dependas de nadie.",
  },
  {
    q: "¿La IA reemplaza a los operarios?",
    a: "No. La usamos para sacarles tareas repetitivas y darles mejor información para decidir.",
  },
];

export default function LandingV1b() {
  return (
    <div className="grain relative flex flex-1 flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-background/80 backdrop-blur-md">
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
            className="rounded-full border border-accent/60 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-background"
          >
            Hablemos
          </a>
        </div>
      </header>

      <main id="inicio" className="flex-1">
        {/* ── Hero dividido ── */}
        <section className="relative overflow-hidden">
          <div className="blueprint pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 md:min-h-[calc(100svh-4.5rem)] md:grid-cols-[1.1fr_1fr] md:py-16">
            <div>
              <p className="fade-up font-mono text-xs uppercase tracking-widest text-accent">
                Software · Industria · IA
              </p>
              <h1
                className="fade-up mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                Tus máquinas ya tienen los datos.{" "}
                <span className="text-accent">Nosotros los hacemos trabajar.</span>
              </h1>
              <p className="fade-up mt-6 max-w-lg text-lg text-muted" style={{ animationDelay: "160ms" }}>
                Conectamos la planta con la gestión y automatizamos procesos con
                inteligencia artificial. Software a medida para empresas
                industriales.
              </p>
              <div className="fade-up mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "240ms" }}>
                <a
                  href={mailto}
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition-all hover:gap-3"
                >
                  Agendá un diagnóstico
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
                <a href="#antes-despues" className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline">
                  Ver qué cambia
                </a>
              </div>
            </div>

            <div className="fade-up relative" style={{ animationDelay: "200ms" }}>
              <div className="overflow-hidden rounded-2xl border border-line bg-background/80 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[11px] text-muted">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    planta.conectada
                  </span>
                  <span>6 fuentes · 1 vista</span>
                </div>
                <IntegrationBeams />
              </div>
            </div>
          </div>
        </section>

        {/* ── Hoy vs. con Itera ── */}
        <section id="antes-despues" className="scroll-mt-20 border-y border-line bg-line/10">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Qué cambia</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Lo que hoy se hace a mano, <span className="text-muted">mañana se hace solo.</span>
              </h2>
            </Reveal>
            <Reveal className="mt-12 grid items-center gap-6 *:min-w-0 md:grid-cols-[1fr_auto_1fr]">
              <div aria-hidden className="relative -rotate-1 opacity-80 grayscale-[30%] transition duration-500 hover:rotate-0 hover:opacity-100">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">Hoy</p>
                <MessySheet />
              </div>
              <div aria-hidden className="flex items-center justify-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-accent/50 bg-background font-mono text-accent shadow-[0_0_30px_-6px_var(--accent)] max-md:rotate-90">
                  →
                </span>
              </div>
              <div aria-hidden className="relative">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-accent">Con Itera</p>
                <div className="rounded-xl border border-accent/30 bg-[#0d1218] p-3 shadow-[0_20px_60px_-25px_var(--accent)]">
                  <div className="grid grid-cols-3 gap-2">
                    <Kpi label="Piezas" value="3.610" delta="▲ 4%" />
                    <Kpi label="Paradas" value="3" delta="▼ 2" />
                    <Kpi label="OEE" value="86,9%" delta="▲ 2,4" />
                  </div>
                  <div className="mt-2 rounded-lg border border-line bg-background/60 p-2">
                    <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-muted">
                      <span>producción · turno B</span>
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                        en vivo
                      </span>
                    </div>
                    <LiveChart id="hoy-itera" className="h-20 w-full" />
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal className="mt-10 overflow-hidden rounded-2xl border border-line bg-background/40">
              <div className="hidden grid-cols-2 border-b border-line bg-background/60 font-mono text-xs uppercase tracking-widest md:grid">
                <span className="px-6 py-4 text-muted">Hoy</span>
                <span className="relative border-l border-line px-6 py-4 text-accent">
                  Con Itera
                  <span aria-hidden className="draw-line absolute inset-x-0 bottom-0 h-px bg-accent" />
                </span>
              </div>
              <ul className="divide-y divide-line">
                {comparison.map((row, i) => (
                  <li key={row.today}>
                    <Reveal delay={150 + i * 110} className="group grid md:grid-cols-2">
                      <p className="flex gap-3 px-6 py-5 text-muted transition-opacity duration-300 md:group-hover:opacity-50">
                        <span aria-hidden className="font-mono text-muted/60">✕</span>
                        <span>
                          <span className="sr-only">Hoy: </span>
                          <span className="decoration-muted/60 decoration-1 transition-all md:group-hover:line-through">
                            {row.today}
                          </span>
                        </span>
                      </p>
                      <p className="flex gap-3 border-line px-6 pb-5 text-foreground transition-colors duration-300 md:border-l md:pt-5 md:group-hover:bg-accent/[0.06]">
                        <span
                          aria-hidden
                          className="font-mono text-accent transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                        <span>
                          <span className="sr-only">Con Itera: </span>
                          {row.itera}
                        </span>
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ── Servicios en lista ── */}
        <section id="servicios" className="overflow-x-clip scroll-mt-20 mx-auto w-full max-w-6xl px-6 py-24">
          <div className="space-y-12">
            <Reveal className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Servicios</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Cuatro formas <span className="text-muted">de empezar.</span>
              </h2>
              <p className="mt-4 text-muted">
                Podés arrancar por cualquiera. En general, una lleva a la otra.
              </p>
            </Reveal>
            <Reveal>
              <ServiceShowcase services={services} />
            </Reveal>
          </div>
        </section>

        {/* ── Primer proyecto ── */}
        <section id="primer-proyecto" className="scroll-mt-20 border-y border-line bg-line/10">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Primer proyecto</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Así suele verse <span className="text-muted">un primer proyecto juntos.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted">
                Los tiempos son orientativos y dependen de cada planta.
              </p>
            </Reveal>
            <Reveal className="mt-12">
              {/* Diagrama de Gantt (desktop) */}
              <div className="hidden overflow-hidden rounded-2xl border border-line bg-background/50 md:block">
                <div className="grid grid-cols-[14rem_repeat(9,1fr)] border-b border-line font-mono text-[10px] uppercase tracking-wider text-muted">
                  <span className="px-5 py-3">Etapa</span>
                  {Array.from({ length: 8 }, (_, w) => (
                    <span key={w} className="border-l border-line px-2 py-3 text-center">
                      S{w + 1}
                    </span>
                  ))}
                  <span className="border-l border-line px-2 py-3 text-center text-accent">∞</span>
                </div>
                {firstProject.map((step, i) => {
                  const last = i === firstProject.length - 1;
                  return (
                    <div key={step.when} className="group grid grid-cols-[14rem_repeat(9,1fr)] border-b border-line last:border-b-0">
                      <div className="px-5 py-5">
                        <p className="font-mono text-[11px] text-accent">{step.when}</p>
                        <h3 className="mt-1 font-medium">{step.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{step.text}</p>
                      </div>
                      <div className="relative col-span-9 grid grid-cols-9">
                        {Array.from({ length: 9 }, (_, w) => (
                          <span key={w} aria-hidden className="border-l border-line/60" />
                        ))}
                        <div
                          aria-hidden
                          className="absolute inset-y-0 flex items-center px-1.5"
                          style={{ left: `${((step.start - 1) / 9) * 100}%`, width: `${(step.span / 9) * 100}%` }}
                        >
                          <span
                            className={`gantt-bar flex h-9 w-full items-center rounded-lg border px-3 font-mono text-[10px] transition-shadow duration-300 group-hover:shadow-[0_0_24px_-6px_var(--accent)] ${last ? "hazard-soft border-accent/40 text-accent" : "border-accent/60 bg-accent text-background"}`}
                            style={{ transitionDelay: `${400 + i * 350}ms` }}
                          >
                            {last ? "↻" : `${step.span} sem`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tarjetas (mobile) */}
              <ol className="grid gap-4 md:hidden">
                {firstProject.map((step, i) => (
                  <li key={step.when} className="stagger-in" style={{ transitionDelay: `${300 + i * 200}ms` }}>
                    <SpotlightCard className={i === firstProject.length - 1 ? "border-accent/50! bg-accent/5!" : ""}>
                      <div className="p-6">
                        <span className="font-mono text-xs text-accent">{step.when}</span>
                        <h3 className="mt-4 text-lg font-medium">{step.title}</h3>
                        <p className="mt-2 text-sm text-muted">{step.text}</p>
                      </div>
                    </SpotlightCard>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ── Preguntas ── */}
        <section id="preguntas" className="scroll-mt-20 mx-auto w-full max-w-3xl px-6 py-24">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Preguntas frecuentes</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Lo que nos <span className="text-muted">suelen preguntar.</span></h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 80}>
                <details className="faq group rounded-2xl border border-line bg-line/10 px-6 transition-colors open:border-accent/40 open:bg-accent/[0.04] hover:border-muted/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line font-mono text-lg text-accent transition-all duration-300 group-open:rotate-45 group-open:border-accent/50 group-open:bg-accent group-open:text-background"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Cierre ── */}
        <section className="relative overflow-hidden bg-accent text-background">
          <div aria-hidden className="hazard pointer-events-none absolute inset-0" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Empecemos por un proceso.
              </h2>
              <p className="mt-2 max-w-md text-background/75">
                Contanos cuál te quita más tiempo y te proponemos cómo resolverlo.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <a
                href={mailto}
                className="group inline-flex items-center gap-2 rounded-full bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:gap-3"
              >
                Escribinos
                <span aria-hidden className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <span className="font-mono text-xs text-background/70">{CONTACT_EMAIL}</span>
            </div>
          </div>
        </section>
      </main>

      <WordmarkFooter
        blurb="Software a medida para la industria y automatización de procesos con inteligencia artificial."
        columns={[
          { title: "Servicios", links: services.map((x) => ({ href: "#servicios", label: x.title })) },
          { title: "Conocenos", links: nav.filter((n) => n.href !== "#servicios") },
          { title: "Contacto", links: [{ href: mailto, label: "Escribinos" }] },
        ]}
      />
    </div>
  );
}
