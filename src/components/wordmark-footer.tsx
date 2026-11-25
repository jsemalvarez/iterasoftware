import { LocalTime } from "@/components/local-time";
import { Logo } from "@/components/logo";

type Column = { title: string; links: { href: string; label: string }[] };

const letters = [..."IterAsoftware"];

function Letters({ mirror = false }: { mirror?: boolean }) {
  return letters.map((l, i) => (
    <span
      key={i}
      className={`wm-letter ${i === 0 || i === 4 ? "text-accent" : i > 4 ? "text-foreground/45" : "text-foreground"}`}
    >
      <span className={mirror ? undefined : "wm-glyph"}>{l}</span>
    </span>
  ));
}

/**
 * Footer con el nombre a todo el ancho: las letras se apoyan en una línea de
 * piso y se reflejan debajo. Adaptado de "Wordmark Reveal Footer"
 * (21st.dev, dhxwhy).
 */
export function WordmarkFooter({ blurb, columns }: { blurb: string; columns: Column[] }) {
  return (
    <footer className="overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 pt-20">
        <div className="grid gap-12 md:grid-cols-[5fr_7fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">{blurb}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">{c.title}</p>
                <ul className="mt-4 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="inline-block text-sm text-foreground/75 transition-all duration-300 hover:translate-x-1 hover:text-accent"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line py-4 font-mono text-xs text-muted">
          <span className="flex items-center gap-2.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Abiertos a nuevos proyectos
          </span>
          <span className="tabular-nums">
            Argentina{" "}
            <span className="text-foreground/80">
              <LocalTime />
            </span>
          </span>
        </div>

        <div className="wm mt-10">
          <div aria-hidden className="select-none">
            <div className="wm-row">
              <Letters />
            </div>
            <div className="h-px w-full bg-gradient-to-r from-accent via-accent/40 to-line" />
            <div className="wm-mirror">
              <div className="wm-row">
                <Letters mirror />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 pt-2 font-mono text-xs text-muted">
          <span>© 2026 Itera Software · Software · Industria · IA</span>
          <a href="#inicio" className="transition-colors hover:text-accent">
            Volver arriba ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
