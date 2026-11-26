"use client";

import { useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { Scene3D } from "@/components/scene-3d";

/**
 * Cierre: la ciudad circuito vuelve a oscuras y se va encendiendo a medida que
 * se completa el formulario.
 */
export function ContactSection({ email }: { email: string }) {
  const [energy, setEnergy] = useState(0);

  return (
    <section id="contacto" className="relative isolate scroll-mt-[4.5rem] overflow-hidden border-t border-line">
      <Scene3D
        name="finale"
        energy={energy}
        className="absolute inset-x-0 top-0 -z-10 h-[46rem] mask-b-from-70% mask-b-to-100% lg:h-full lg:mask-none"
        fallback={<div className="glow-top absolute inset-0" />}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-gradient-to-b from-background via-background/70 to-transparent lg:h-[78%] lg:via-background/80 lg:via-60%" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="mx-auto grid w-full max-w-6xl gap-x-12 px-6 pb-24 pt-20 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-center lg:py-10">
        <div className="pb-72 lg:self-start lg:pb-0 lg:pt-10">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Contacto</p>
          <h2 className="footer-metal mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl xl:text-6xl">
            ¿Qué idea venís postergando?
          </h2>
          <p className="mt-5 max-w-md text-muted md:text-lg">
            Contanos en dos líneas qué te está frenando y arrancamos por el diagnóstico. También podés escribirnos a{" "}
            <a href={`mailto:${email}`} className="text-foreground underline decoration-accent/60 underline-offset-4 transition-colors hover:text-accent">
              {email}
            </a>
            .
          </p>
        </div>
        <ContactForm email={email} onEnergy={setEnergy} />
      </div>
    </section>
  );
}
