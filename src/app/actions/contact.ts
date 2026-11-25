"use server";

import { headers } from "next/headers";
import { readContact, TRAP_FIELD, validateContact, type ContactState, type ContactValues } from "@/lib/contact";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

// Freno básico por IP. Vive en memoria: cada instancia del servidor cuenta lo suyo.
const recent = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  if (recent.size > 2000) recent.clear();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return true;
  recent.set(ip, [...hits, now]);
  return false;
}

/** Envía el mensaje por la API de Resend. La respuesta va directo a quien escribió. */
async function deliver(v: ContactValues, config: { key: string; to: string; from: string }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: v.email,
      subject: `Consulta de ${v.name}${v.company ? ` (${v.company})` : ""}`,
      text: [
        `Nombre: ${v.name}`,
        `Empresa: ${v.company || "—"}`,
        `Correo: ${v.email}`,
        `Tema: ${v.topic || "—"}`,
        "",
        v.message,
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend respondió ${response.status}`);
}

export async function sendContact(_previous: ContactState, data: FormData): Promise<ContactState> {
  const values = readContact(data);

  // A un bot se le responde como si hubiera salido bien
  if (data.get(TRAP_FIELD)) return { status: "sent", values };

  const errors = validateContact(values);
  if (Object.keys(errors).length) return { status: "invalid", errors, values };

  const { RESEND_API_KEY: key, CONTACT_TO: to, CONTACT_FROM: from } = process.env;
  if (!key || !to || !from) {
    if (process.env.NODE_ENV === "development") return { status: "preview", values };
    console.error("[contacto] Faltan RESEND_API_KEY, CONTACT_TO o CONTACT_FROM.");
    return { status: "error", values };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim();
  if (ip && tooMany(ip)) return { status: "busy", values };

  try {
    await deliver(values, { key, to, from });
    return { status: "sent", values };
  } catch (error) {
    console.error("[contacto] No se pudo enviar:", error instanceof Error ? error.message : error);
    return { status: "error", values };
  }
}
