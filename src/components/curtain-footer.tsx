import { Logo } from "@/components/logo";
import { MagneticLink } from "@/components/magnetic";

type Link = { href: string; label: string };

/**
 * Cierre a pantalla completa que se descubre como un telón al llegar al final.
 * Adaptado de "Motion Footer" (21st.dev, jahed), sin GSAP: el telón usa
 * animaciones de scroll de CSS y, donde no hay soporte, queda quieto.
 */
export function CurtainFooter({
  id,
  links,
  phrases,
  mailto,
  email,
}: {
  id: string;
  links: Link[];
  phrases: string[];
  mailto: string;
  email: string;
}) {
  return (
    <footer id={id} className="curtain border-t border-line">
      <div className="curtain-inner relative flex min-h-svh flex-col overflow-hidden">
        <div aria-hidden className="footer-grid pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="breathe pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[90px]"
        />
        <div aria-hidden className="curtain-word pointer-events-none absolute inset-x-0 bottom-[3vh] select-none text-center">
          ITERA
        </div>

        <div
          aria-hidden
          className="relative z-10 mt-28 -rotate-2 scale-105 overflow-hidden border-y border-line bg-background/70 py-4 shadow-2xl backdrop-blur"
        >
          <div className="marquee flex w-max font-mono text-xs uppercase tracking-[0.3em] text-muted md:text-sm">
            {[...phrases, ...phrases, ...phrases, ...phrases].map((p, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap pr-10">
                {p}
                <span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-14 text-center">
          <h2 className="footer-metal text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            ¿Qué proceso te gustaría dejar de hacer a mano?
          </h2>
          <p className="mt-6 max-w-lg text-muted">
            Contanos en dos líneas qué querés resolver. Te respondemos con una propuesta concreta para empezar.
          </p>
          <div className="mt-10">
            <MagneticLink
              href={mailto}
              className="gap-3 rounded-full bg-accent px-9 py-4 font-semibold text-background shadow-[0_0_50px_-10px_var(--accent)]"
            >
              Escribinos <span aria-hidden>→</span>
            </MagneticLink>
          </div>
          <p className="mt-4 font-mono text-xs text-muted">{email}</p>
          <nav aria-label="Pie de página" className="mt-10 flex flex-wrap justify-center gap-3">
            {links.map((l) => (
              <MagneticLink
                key={l.href}
                href={l.href}
                className="rounded-full border border-line bg-foreground/[0.03] px-5 py-2.5 text-sm text-muted backdrop-blur hover:border-muted/50 hover:text-foreground"
              >
                {l.label}
              </MagneticLink>
            ))}
          </nav>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-between gap-5 px-6 pb-8 sm:flex-row md:px-12">
          <Logo />
          <span className="text-center font-mono text-xs text-muted">© 2026 Itera Software · Software · Industria · IA</span>
          <MagneticLink
            href="#inicio"
            className="size-12 justify-center rounded-full border border-line bg-background/60 text-muted hover:border-accent/60 hover:text-accent"
          >
            <span className="sr-only">Volver arriba</span>
            <span aria-hidden>↑</span>
          </MagneticLink>
        </div>
      </div>
    </footer>
  );
}
