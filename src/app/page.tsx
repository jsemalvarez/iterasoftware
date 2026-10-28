const capabilities = [
  {
    code: "01",
    title: "Software industrial",
    text: "Sistemas a medida para planta, producción y gestión operativa.",
  },
  {
    code: "02",
    title: "Automatización con IA",
    text: "Procesos que aprenden, detectan anomalías y deciden más rápido.",
  },
  {
    code: "03",
    title: "Integración de datos",
    text: "Conectamos máquinas, sensores y sistemas en una sola vista.",
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <g className="rotate-slow">
          <path
            d="M22.5 10.5A8 8 0 1 0 24 16"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M19.5 9.5h3.6v3.6"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <circle cx="16" cy="16" r="2.4" fill="var(--foreground)" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-accent">I</span>ter
        <span className="text-accent">A</span>
        <span className="text-muted font-normal">software</span>
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="blueprint pointer-events-none absolute inset-0" />
      <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-40" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <span className="hidden font-mono text-xs text-muted sm:block">
          v0.1 · build en curso
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-background/70 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          MUY PRONTO
        </div>

        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Software que hace
          <br />
          funcionar <span className="text-accent">la industria</span>.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted">
          Desarrollamos software a medida y automatización de procesos con
          inteligencia artificial para empresas industriales. Estamos
          terminando de construir nuestro sitio.{" "}
          <span className="text-foreground">Muy pronto.</span>
        </p>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {capabilities.map((c) => (
            <li key={c.code} className="bg-background/90 p-6 backdrop-blur">
              <span className="font-mono text-xs text-accent">{c.code}</span>
              <h2 className="mt-3 font-medium">{c.title}</h2>
              <p className="mt-2 text-sm text-muted">{c.text}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 font-mono text-xs text-muted sm:flex-row sm:justify-between">
        <span>© 2026 Itera Software</span>
        <span>Software · Industria · IA</span>
      </footer>
    </div>
  );
}
