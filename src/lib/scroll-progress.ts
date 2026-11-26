/** Avance del scroll (0 a 1) dentro del [data-scene-track] que contiene al elemento. */
export function scrollProgress(el: HTMLElement) {
  const track = el.closest<HTMLElement>("[data-scene-track]");
  if (!track) return 0;
  const r = track.getBoundingClientRect();
  const range = r.height - window.innerHeight;
  return range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
}
