/** Reglas del formulario de contacto, compartidas por el navegador y el servidor. */

import { services } from "./services";

export const contactTopics: string[] = [...services.map((s) => s.title), "Todavía no sé"];

export type ContactValues = {
  name: string;
  company: string;
  email: string;
  topic: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export type ContactState = {
  /** `preview`: todo bien, pero falta configurar el correo (solo en desarrollo). */
  status: "idle" | "sent" | "preview" | "invalid" | "busy" | "error";
  errors?: ContactErrors;
  values?: ContactValues;
};

export const emptyContact: ContactValues = { name: "", company: "", email: "", topic: "", message: "" };

export const contactLimits: Record<keyof ContactValues, number> = { name: 80, company: 100, email: 160, topic: 60, message: 3000 };

/** Campo trampa: las personas no lo ven; los bots suelen completarlo. */
export const TRAP_FIELD = "referencia_interna";

/** Lee y ordena lo que llega del formulario, que puede ser cualquier cosa. */
export function readContact(data: FormData): ContactValues {
  const text = (key: keyof ContactValues) => {
    const value = data.get(key);
    return typeof value === "string" ? value.trim().slice(0, contactLimits[key] + 1) : "";
  };
  const line = (key: keyof ContactValues) => text(key).replace(/\s+/g, " ");
  const topic = line("topic");
  return {
    name: line("name"),
    company: line("company"),
    email: line("email"),
    topic: contactTopics.some((t) => t === topic) ? topic : "",
    message: text("message"),
  };
}

const EMAIL = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]{2,}$/;

export function validateContact(v: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (v.name.trim().length < 2) errors.name = "Decinos tu nombre.";
  if (!v.email.trim()) errors.email = "Dejanos un correo para responderte.";
  else if (!EMAIL.test(v.email.trim())) errors.email = "Revisá el correo: parece incompleto.";
  if (v.message.trim().length < 10) errors.message = "Contanos un poco más, con una o dos frases alcanza.";
  for (const key of Object.keys(contactLimits) as (keyof ContactValues)[]) {
    if (v[key].length > contactLimits[key]) errors[key] = `Es muy largo: el máximo es ${contactLimits[key]} caracteres.`;
  }
  return errors;
}
