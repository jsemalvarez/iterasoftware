const EVENT = "itera:topic";

/** Pide que el formulario de contacto arranque con un servicio elegido. */
export function requestTopic(topic: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: topic }));
}

/** Avisa cuando alguien elige un servicio en otra parte de la página. */
export function onTopicRequest(listener: (topic: string) => void) {
  const handle = (e: Event) => listener((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, handle);
  return () => window.removeEventListener(EVENT, handle);
}
