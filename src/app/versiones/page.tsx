import type { Metadata } from "next";
import Link from "next/link";
import { currentLanding, landingVersions } from "@/landings";

export const metadata: Metadata = {
  title: "Itera Software — Versiones de la landing",
  robots: { index: false, follow: false },
};

export default function VersionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <p className="font-mono text-xs text-muted">/versiones</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Versiones de la landing
      </h1>
      <ul className="mt-10 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {landingVersions.map((v) => (
          <li key={v.slug}>
            <Link
              href={`/${v.slug}`}
              className="flex flex-col gap-1 p-5 transition-colors hover:bg-line/40"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-sm text-accent">/{v.slug}</span>
                <span className="font-medium">{v.label}</span>
                {v.slug === currentLanding.slug && (
                  <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted">
                    ACTUAL
                  </span>
                )}
              </span>
              <span className="text-sm text-muted">
                {v.date} · {v.notes}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
