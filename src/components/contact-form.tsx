"use client";

import { useActionState, useEffect, useRef, useState, type CSSProperties, type ReactNode, type SubmitEvent } from "react";
import { sendContact } from "@/app/actions/contact";
import {
  contactLimits,
  contactTopics,
  emptyContact,
  readContact,
  TRAP_FIELD,
  validateContact,
  type ContactErrors,
  type ContactState,
  type ContactValues,
} from "@/lib/contact";
import { onTopicRequest } from "@/lib/topic-request";

type Key = keyof ContactValues;

const field =
  "w-full rounded-lg border border-line bg-[#0b1016] px-3.5 py-2.5 text-base text-foreground outline-none sm:text-[15px] transition-colors placeholder:text-muted/60 hover:border-muted/40 focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-red-400/80";

/** Cuánto del formulario está resuelto, de 0 a 1. */
function completion(v: ContactValues) {
  const errors = validateContact(v);
  const done = [!errors.name, !errors.email, !errors.message, v.company.trim() !== "", v.topic !== ""];
  return done.filter(Boolean).length / done.length;
}

/**
 * Formulario de contacto con forma de chip. `onEnergy` avisa cuánto está
 * completo (0 a 1) y pasa a 2 cuando el mensaje salió.
 */
export function ContactForm({ email, onEnergy }: { email: string; onEnergy: (energy: number) => void }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { status: "idle" });
  const [values, setValues] = useState<ContactValues>(state.values ?? emptyContact);
  const [errors, setErrors] = useState<ContactErrors>(state.errors ?? {});
  const [seen, setSeen] = useState(state);
  const [closed, setClosed] = useState<ContactState | null>(null);
  const thanks = useRef<HTMLHeadingElement>(null);

  // Cada respuesta del servidor trae sus propios errores
  if (state !== seen) {
    setSeen(state);
    setErrors(state.errors ?? {});
  }

  const sent = (state.status === "sent" || state.status === "preview") && state !== closed;
  const level = completion(values);
  const energy = sent ? 2 : pending ? 1 : level;

  useEffect(() => onEnergy(energy), [energy, onEnergy]);
  useEffect(() => onTopicRequest((topic) => setValues((v) => ({ ...v, topic }))), []);
  useEffect(() => {
    if (sent) thanks.current?.focus();
  }, [sent]);

  const set = (key: Key) => (e: { target: { value: string } }) => {
    const { value } = e.target;
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((all) => ({ ...all, [key]: undefined }));
  };

  function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    const found = validateContact(readContact(new FormData(e.currentTarget)));
    const [first] = Object.keys(found);
    if (!first) return;
    e.preventDefault();
    setErrors(found);
    (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
  }

  const input = (key: Key) => ({
    id: `contacto-${key}`,
    name: key,
    value: values[key],
    onChange: set(key),
    maxLength: contactLimits[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `contacto-${key}-error` : undefined,
  });

  return (
    <div className="chip-card relative" style={{ "--energy": Math.min(1, energy) } as CSSProperties}>
      <div className="relative rounded-2xl border border-line bg-[#0d1218] p-6 shadow-[0_30px_80px_-20px_black] sm:p-7">
        <div aria-hidden className="mb-5 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted">
          <span className="flex items-center gap-2.5">
            <span className="size-2 rounded-full border border-muted/60" />
            Entrada 01
          </span>
          <span className="flex gap-1.5">
            {[0.2, 0.4, 0.6, 0.8, 1].map((mark) => (
              <span
                key={mark}
                className={`size-1.5 rounded-full transition-all duration-500 ${energy >= mark ? "bg-accent shadow-[0_0_10px_var(--accent)]" : "bg-line"}`}
              />
            ))}
          </span>
        </div>

        {sent ? (
          <div role="status" className="flex min-h-96 flex-col justify-center">
            <svg viewBox="0 0 48 48" aria-hidden className="size-14 fill-none stroke-accent" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" className="opacity-30" />
              <path d="m15 24.5 6.5 6.5L34 18" pathLength="1" className="check-draw" />
            </svg>
            <h3 ref={thanks} tabIndex={-1} className="mt-6 scroll-mt-32 text-2xl font-semibold tracking-tight outline-none sm:text-3xl">
              Gracias, {state.values?.name}.
            </h3>
            <p className="mt-3 leading-relaxed text-muted">
              Recibimos tu mensaje. Te vamos a responder a <span className="wrap-anywhere text-foreground">{state.values?.email}</span>.
            </p>
            {state.status === "preview" && (
              <p className="mt-5 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
                Modo de prueba: el mensaje no se envió, falta configurar el correo.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setValues(emptyContact);
                setClosed(state);
              }}
              className="mt-8 self-start text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Nombre" error={errors.name}>
                <input {...input("name")} required autoComplete="name" className={field} />
              </Field>
              <Field id="company" label="Empresa" optional error={errors.company}>
                <input {...input("company")} autoComplete="organization" className={field} />
              </Field>
            </div>
            <Field id="email" label="Correo" error={errors.email}>
              <input {...input("email")} type="email" required autoComplete="email" inputMode="email" placeholder="vos@empresa.com" className={field} />
            </Field>

            <fieldset>
              <legend className="mb-2 text-sm text-foreground/85">
                ¿Por dónde querés empezar? <span className="text-muted">(opcional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {contactTopics.map((topic) => (
                  <label
                    key={topic}
                    className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-muted/50 hover:text-foreground has-checked:border-accent has-checked:bg-accent/10 has-checked:text-accent has-focus-visible:ring-2 has-focus-visible:ring-accent/40"
                  >
                    <input type="radio" name="topic" value={topic} checked={values.topic === topic} onChange={set("topic")} className="sr-only" />
                    {topic}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="message" label="¿Qué querés mejorar?" error={errors.message}>
              <textarea
                {...input("message")}
                required
                rows={3}
                placeholder="Por ejemplo: cargamos los partes de producción a mano en planillas y los datos llegan tarde."
                className={`${field} min-h-20 resize-y leading-relaxed`}
              />
            </Field>

            {/* Trampa para bots: fuera de la vista y del recorrido del teclado */}
            <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
              <label>
                No completar
                <input name={TRAP_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
              </label>
            </div>

            <div aria-live="polite">
              {(state.status === "error" || state.status === "busy") && !pending && (
                <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {state.status === "busy" ? "Recibimos varios mensajes seguidos. Probá de nuevo en unos minutos, " : "No pudimos enviar el mensaje. Probá de nuevo "}
                  o escribinos a{" "}
                  <a href={`mailto:${email}`} className="underline underline-offset-4">
                    {email}
                  </a>
                  .
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="group flex w-full items-center justify-center gap-3 rounded-full bg-accent px-6 py-3 font-semibold text-background transition-all hover:shadow-[0_0_40px_-8px_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? "Enviando…" : "Enviar mensaje"}
              {!pending && (
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>
            <p className="text-center text-xs text-muted">Usamos tus datos solo para responderte.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, optional, error, children }: { id: Key; label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={`contacto-${id}`} className="mb-2 block text-sm text-foreground/85">
        {label} {optional && <span className="text-muted">(opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`contacto-${id}-error`} className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
