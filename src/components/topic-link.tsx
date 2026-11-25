"use client";

import type { ReactNode } from "react";
import { requestTopic } from "@/lib/topic-request";

/** Lleva al formulario de contacto con el servicio ya elegido. */
export function TopicLink({ topic, className, children }: { topic: string; className?: string; children: ReactNode }) {
  return (
    <a href="#contacto" onClick={() => requestTopic(topic)} className={className}>
      {children}
    </a>
  );
}
