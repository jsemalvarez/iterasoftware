import { ConeGeometry, Group, type Object3D } from "three";
import type { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { cast, clamp, mix, mold, type Palette } from "./blueprint-kit";

export type BotMood = {
  time: number;
  delta: number;
  /** De 0 (quieto) a 1 (flota, parpadea y mira). */
  alive: number;
  /** Hacia dónde mira, de -1 a 1. */
  lookX: number;
  lookY: number;
  think: number;
  happy: number;
  /** Cuánto levanta cada brazo, visto de frente. */
  left: number;
  right: number;
};

/** Centro del pecho, por donde entran los mensajes y salen los resultados. */
export const CHEST = { y: 1.38, z: 0.72 };

/** Piezas de un bot que flota: sin piernas, con cara de pantalla y el logo en el pecho. */
export function botMolds() {
  return {
    body: mold((p) => {
      p.pill("shell", 1.4, 1.14, 1.04, 0.48, 0, 1.34, 0);
      p.cyl("dark", 0.36, 0.14, 0, 0.75, 0);
      p.ring("glow", 0.3, 0.045, 0, 0.67, 0);
      p.cyl("dark", 0.22, 0.26, 0, 1.98, 0);
      p.cyl("dark", 0.37, 0.08, 0, CHEST.y, 0.5, "z");
    }),
    // El logo: gira despacio, y rápido cuando piensa
    emblem: mold((p) => {
      const end = 5.1;
      p.ring("glow", 0.2, 0.035, 0, 0, 0, "z", 0, end);
      p.shape("glow", new ConeGeometry(0.1, 0.16, 12).rotateZ(end + 0.12), Math.cos(end + 0.2) * 0.2, Math.sin(end + 0.2) * 0.2, 0);
      p.ball("shell", 0.06, 0, 0, 0);
    }),
    head: mold((p) => {
      p.pill("shell", 2, 1.32, 1.2, 0.5, 0, 0.68, 0);
      p.plate("dark", 1.56, 0.88, 0.12, 0.34, 0, 0.66, 0.56);
      for (const s of [-1, 1]) {
        p.cyl("accent", 0.31, 0.18, s * 1.03, 0.68, 0, "x");
        p.cyl("dark", 0.17, 0.26, s * 1.04, 0.68, 0, "x");
      }
      p.cyl("steel", 0.035, 0.34, 0, 1.48, 0);
    }),
    tip: mold((p) => p.ball("glow", 0.12, 0, 0, 0)),
    open: mold((p) => {
      for (const s of [-1, 1]) p.plate("glow", 0.2, 0.36, 0.03, 0.1, s * 0.33, 0.02, 0);
    }),
    smiling: mold((p) => {
      for (const s of [-1, 1]) p.ring("glow", 0.14, 0.04, s * 0.33, -0.04, 0, "z", 0, Math.PI);
    }),
    mouth: mold((p) => p.ring("glow", 0.13, 0.022, 0, -0.1, 0, "z", Math.PI * 1.15, Math.PI * 0.7)),
    arm: mold((p) => {
      p.ball("accent", 0.19, 0, 0, 0);
      p.pill("shell", 0.28, 0.66, 0.28, 0.14, 0, -0.42, 0);
      p.ball("dark", 0.2, 0, -0.84, 0);
    }),
    // Los tres puntos de "está escribiendo"
    bubble: mold((p) => {
      p.plate("shell", 0.78, 0.4, 0.1, 0.2, 0, 0, 0);
      p.ball("shell", 0.08, -0.32, -0.26, 0);
    }),
    dot: mold((p) => p.ball("accent", 0.075, 0, 0, 0)),
  };
}

export function createBot(parent: Object3D, molds: ReturnType<typeof botMolds>, ink: LineMaterial | null, palette: Palette) {
  const put = (to: Object3D, name: keyof typeof molds, x = 0, y = 0, z = 0, shadow = false) => {
    const piece = cast(to, molds[name], ink, palette, shadow);
    piece.position.set(x, y, z);
    return piece;
  };

  const float = new Group();
  parent.add(float);
  put(float, "body", 0, 0, 0, true);
  const emblem = put(float, "emblem", 0, CHEST.y, 0.56);

  const head = put(float, "head", 0, 2.06, 0, true);
  const tip = put(head, "tip", 0, 1.72);
  const face = new Group();
  face.position.set(0, 0.7, 0.64);
  head.add(face);
  const open = put(face, "open");
  const smiling = put(face, "smiling");
  put(face, "mouth");

  const arms = [-1, 1].map((s) => put(float, "arm", s * 0.78, 1.62, 0, true));

  const bubble = put(float, "bubble", 1.42, 3.52, 0.2);
  const dots = [-1, 0, 1].map((i) => put(bubble, "dot", i * 0.21, 0, 0.06));

  return {
    update({ time, delta, alive, lookX, lookY, think, happy, left, right }: BotMood) {
      float.position.y = alive * (0.05 + 0.06 * Math.sin(time * 1.7));
      head.rotation.set(-lookY * 0.14 * alive, lookX * 0.45 * alive, Math.sin(time * 0.9) * 0.03 * alive + think * 0.09);
      face.position.x = lookX * 0.12 * alive;
      face.position.y = 0.7 + lookY * 0.07 * alive;
      const blink = alive > 0.9 && time % 3.7 < 0.13;
      const cheer = happy > 0.5;
      open.visible = !cheer;
      smiling.visible = cheer;
      open.scale.y = blink ? 0.12 : mix(1, 0.55, think);
      tip.scale.setScalar(1 + think * 0.3 * Math.sin(time * 13));
      emblem.rotation.z -= delta * (0.5 * alive + think * 7);
      [left, right].forEach((lift, i) => {
        const s = i ? 1 : -1;
        const sway = Math.sin(time * 1.7 + i) * 0.04 * alive;
        arms[i].rotation.set(-lift * 0.45, 0, s * (0.2 + sway + lift * 1.2));
      });
      bubble.visible = think > 0.01;
      bubble.scale.setScalar(clamp(think));
      dots.forEach((d, i) => (d.position.y = Math.max(0, Math.sin(time * 8 - i * 0.9)) * 0.06));
    },
  };
}
