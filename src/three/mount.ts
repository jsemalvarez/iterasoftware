import {
  ACESFilmicToneMapping,
  Material,
  Mesh,
  PCFShadowMap,
  PMREMGenerator,
  Texture,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { scrollProgress } from "@/lib/scroll-progress";
import { createCircuitCity } from "./circuit-city";
import { createFactoryLine } from "./factory-line";
import { createLayerStack } from "./layer-stack";
import type { SceneInstance } from "./types";

const scenes = { city: createCircuitCity, factory: createFactoryLine, layers: createLayerStack };

export type SceneName = keyof typeof scenes;

export type MountOptions = {
  name: SceneName;
  onStats?: (a: number, b: number) => void;
};

/** Monta una escena en el contenedor. Lanza un error si no hay WebGL. */
export function mountScene(container: HTMLElement, { name, onStats }: MountOptions) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  let quality = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(quality);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.className = "absolute inset-0 size-full";
  container.appendChild(renderer.domElement);

  const instance: SceneInstance = scenes[name](onStats);
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  instance.scene.environment = environment.texture;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  let last = 0;
  let time = 0;
  let visible = true;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let progress = scrollProgress(container);

  function render(delta: number) {
    const target = scrollProgress(container);
    progress = motion.matches ? target : progress + (target - progress) * Math.min(1, delta * 7);
    pointerX += (targetX - pointerX) * Math.min(1, delta * 4);
    pointerY += (targetY - pointerY) * Math.min(1, delta * 4);
    instance.update({ time, delta, pointerX, pointerY, progress, reduced: motion.matches });
    renderer.render(instance.scene, instance.camera);
  }

  // Si el equipo no llega a ~40 cuadros por segundo, baja la resolución de a poco
  let frames = 0;
  let elapsed = 0;
  function adapt(frame: number) {
    if (frame > 0.25) return; // volvió de una pestaña en segundo plano
    elapsed += frame;
    if (++frames < 45) return;
    if (elapsed / frames > 0.025 && quality > 0.7) {
      quality = Math.max(0.7, quality * 0.8);
      renderer.setPixelRatio(quality);
      render(0);
    }
    frames = elapsed = 0;
  }

  function loop(now: number) {
    const frame = (now - last) / 1000;
    const delta = Math.min(0.05, frame);
    last = now;
    if (visible && !motion.matches) {
      time += delta;
      render(delta);
      adapt(frame);
    }
    raf = requestAnimationFrame(loop);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    instance.camera.aspect = w / h;
    instance.resize?.(w / h);
    instance.camera.updateProjectionMatrix();
    render(0);
  }

  function onPointer(e: PointerEvent) {
    if (e.pointerType !== "mouse" || motion.matches) return;
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  // Con "reducir movimiento" no hay bucle: solo se redibuja al hacer scroll.
  function onScroll() {
    if (visible && motion.matches) render(0);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });
  io.observe(container);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  resize();
  raf = requestAnimationFrame((now) => {
    last = now;
    loop(now);
  });

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
    instance.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.geometry.dispose();
      for (const m of ([] as Material[]).concat(o.material)) {
        for (const v of Object.values(m)) if (v instanceof Texture && v !== environment.texture) v.dispose();
        m.dispose();
      }
    });
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
