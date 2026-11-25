export function Logo() {
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
