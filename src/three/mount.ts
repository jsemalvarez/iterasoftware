import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Material,
  Mesh,
  PCFShadowMap,
  PMREMGenerator,
  Texture,
  WebGLRenderer,
  type Object3D,
  type Scene,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { scrollProgress } from "@/lib/scroll-progress";
import { createBlueprint } from "./blueprint";
import { createCircuitCity, createCityFinale } from "./circuit-city";
import { createFactoryLine } from "./factory-line";
import { createLayerStack } from "./layer-stack";
import { createTrainingRoom } from "./training-room";
import type { SceneInstance } from "./types";

const scenes = {
  city: createCircuitCity,
  factory: createFactoryLine,
  layers: createLayerStack,
  blueprint: createBlueprint,
  training: createTrainingRoom,
  finale: createCityFinale,
};

export type SceneName = keyof typeof scenes;

export type MountOptions = {
  name: SceneName;
  onStats?: (a: number, b: number) => void;
  /** Se consulta en cada cuadro (ver SceneInput.energy). */
  getEnergy?: () => number;
};

/**
 * La placa de video termina de preparar cada tipo de material recién cuando lo
 * dibuja por primera vez. Esto devuelve pasos que muestran de a un tipo, y un
 * último paso que deja la escena como estaba.
 */
function variants(scene: Scene) {
  const drawables: { object: Object3D; visible: boolean }[] = [];
  const kinds = new Map<string, Object3D>();
  scene.traverse((object) => {
    if (!("material" in object)) return;
    drawables.push({ object, visible: object.visible });
    for (const m of ([] as Material[]).concat(object.material as Material)) {
      const maps = Object.entries(m).filter(([, v]) => v instanceof Texture);
      const kind = [object.type, m.type, m.side, m.transparent, m.vertexColors, m.clippingPlanes?.length, object.castShadow, ...maps.map(([k]) => k)];
      kinds.set(kind.join(), object);
    }
  });
  const show = (only?: Object3D) => {
    for (const { object, visible } of drawables) object.visible = only ? object === only : visible;
  };
  return [
    ...[...new Set(kinds.values())].map((object) => () => show(object)),
    () => {
      show();
      // Las sombras fijas se calcularon con la escena a medio mostrar
      scene.traverse((o) => {
        if (o instanceof DirectionalLight) o.shadow.needsUpdate = true;
      });
    },
  ];
}

/** Le devuelve el control al navegador entre dos trabajos pesados. */
const breathe = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Monta una escena en el contenedor. Lanza un error si no hay WebGL.
 * La preparación va por partes, y los shaders se compilan en segundo plano,
 * para no trabar el scroll; `ready` avisa cuando se ve el primer cuadro.
 */
export function mountScene(container: HTMLElement, { name, onStats, getEnergy }: MountOptions) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  let quality = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(quality);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.className = "absolute inset-0 size-full";
  container.appendChild(renderer.domElement);

  const instance: SceneInstance = scenes[name](onStats);
  let environment: WebGLRenderTarget | undefined;
  let disposed = false;

  function light() {
    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    environment = pmrem.fromScene(room, 0.04);
    room.dispose();
    pmrem.dispose();
    instance.scene.environment = environment.texture;
  }

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

  function update(delta: number) {
    const target = scrollProgress(container);
    progress = motion.matches ? target : progress + (target - progress) * Math.min(1, delta * 7);
    pointerX += (targetX - pointerX) * Math.min(1, delta * 4);
    pointerY += (targetY - pointerY) * Math.min(1, delta * 4);
    instance.update({ time, delta, pointerX, pointerY, progress, energy: getEnergy?.() ?? 0, reduced: motion.matches });
  }

  function render(delta: number) {
    update(delta);
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

  function fit() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return false;
    renderer.setSize(w, h, false);
    instance.camera.aspect = w / h;
    instance.resize?.(w / h);
    instance.camera.updateProjectionMatrix();
    return true;
  }

  function resize() {
    if (fit()) render(0);
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
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });

  async function start() {
    await breathe();
    if (disposed) return;
    light();
    await breathe();
    if (disposed) return;
    fit();
    update(0);
    await renderer.compileAsync(instance.scene, instance.camera);
    if (disposed) return;
    for (const group of variants(instance.scene)) {
      group();
      renderer.render(instance.scene, instance.camera);
      await breathe();
      if (disposed) return;
    }
    ro.observe(container);
    io.observe(container);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    resize();
    raf = requestAnimationFrame((now) => {
      last = now;
      loop(now);
    });
  }

  const unmount = () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
    instance.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.geometry.dispose();
      for (const m of ([] as Material[]).concat(o.material)) {
        for (const v of Object.values(m)) if (v instanceof Texture && v !== environment?.texture) v.dispose();
        m.dispose();
      }
    });
    environment?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };

  return { ready: start(), unmount };
}
