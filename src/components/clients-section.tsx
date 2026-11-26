import { Reveal } from "@/components/reveal";
import type { Client } from "@/lib/clients";

/** Cuántos logos hacen falta como mínimo para que la cinta cubra el ancho. */
const FILL = 6;

function Logo({ client, hidden }: { client: Client; hidden: boolean }) {
  return (
    <a
      href={client.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={hidden ? -1 : undefined}
      className="group flex flex-col items-center gap-3 px-2 text-muted transition-colors hover:text-foreground"
    >
      {/* Si el logo ya trae el rubro, no se repite abajo */}
      {client.logo ? (
        // El logo entero en el gris del texto: su silueta recorta un fondo del color actual
        <span
          role="img"
          aria-label={`${client.name}, ${client.sector}`}
          className="block h-16 bg-current md:h-20"
          style={{
            aspectRatio: `${client.logo.width} / ${client.logo.height}`,
            maskImage: `url(${client.logo.src})`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      ) : (
        <>
          <span className="text-4xl font-semibold tracking-tight">{client.name}</span>
          <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-widest">{client.sector}</span>
        </>
      )}
      <span className="sr-only">(se abre en otra pestaña)</span>
    </a>
  );
}

/** Clientes: sus logos pasan de derecha a izquierda y se frenan al pasar el cursor. */
export function ClientsSection({ clients }: { clients: Client[] }) {
  // Con pocos clientes, la lista se repite hasta llenar la cinta
  const row = Array.from({ length: Math.max(1, Math.ceil(FILL / clients.length)) }, () => clients).flat();

  return (
    <section id="clientes" className="scroll-mt-[4.5rem] border-t border-line pb-24">
      <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-24 md:pt-28">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Clientes</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Empresas que ya trabajan <span className="text-muted">con nosotros.</span>
          </h2>
        </Reveal>
      </div>

      <Reveal className="py-12 md:py-14">
        <div className="marquee-mask overflow-hidden">
          <ul className="marquee flex w-max items-center gap-24 md:gap-32">
            {[...row, ...row].map((client, i) => {
              // Solo la primera aparición de cada cliente se lee y se enfoca
              const repeat = i >= clients.length;
              return (
                <li key={i} aria-hidden={repeat ? true : undefined}>
                  <Logo client={client} hidden={repeat} />
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
