import { BoxGeometry, Color, CylinderGeometry, Group, SphereGeometry, type MeshStandardMaterial, type Object3D } from "three";
import { cast, createPalette, mix, mold, type Palette } from "./blueprint-kit";

export type Look = { shirt: number; skin: number; top: number; head: "helmet" | "short" | "bun" };

export type PersonMood = {
  time: number;
  /** De 0 (apagada) a 1 (a todo color). */
  lit: number;
  /** Hacia dónde gira la cabeza, en radianes. */
  look: number;
  /** Cuánto levanta cada brazo. */
  left: number;
  right: number;
  /** Cuánto escribe. */
  type: number;
  happy: number;
};

const ASLEEP = new Color(0x53626f);

const half = (r: number) => new SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);

const face = (p: Parameters<Parameters<typeof mold>[0]>[0]) => {
  p.ball("shell", 0.33, 0, 0.34, 0);
  for (const s of [-1, 1]) p.ball("dark", 0.042, s * 0.125, 0.36, 0.3);
};

/** Piezas de las personas. En la paleta, "shell" es la piel, "accent" la ropa y "steel" el casco o el pelo. */
export function personMolds() {
  return {
    torso: mold((p) => p.pill("accent", 0.74, 0.86, 0.5, 0.24, 0, 0.9, 0)),
    legs: mold((p) => {
      for (const s of [-1, 1]) p.pill("body", 0.25, 0.8, 0.28, 0.12, s * 0.17, 0.36, 0);
    }),
    helmet: mold((p) => {
      face(p);
      p.shape("steel", half(0.36), 0, 0.42, 0);
      p.shape("steel", new CylinderGeometry(0.43, 0.43, 0.04, 28), 0, 0.43, 0.05);
      p.shape("steel", new BoxGeometry(0.1, 0.04, 0.5), 0, 0.77, 0);
    }),
    short: mold((p) => {
      face(p);
      p.shape("steel", half(0.355), 0, 0.4, -0.02);
      p.shape("steel", new SphereGeometry(0.35, 20, 12, Math.PI * 1.05, Math.PI * 0.9, 0, Math.PI * 0.62), 0, 0.38, -0.015);
    }),
    bun: mold((p) => {
      face(p);
      p.shape("steel", half(0.355), 0, 0.4, -0.02);
      p.shape("steel", new SphereGeometry(0.36, 20, 12, Math.PI * 1.02, Math.PI * 0.96, 0, Math.PI * 0.78), 0, 0.36, -0.02);
      p.ball("steel", 0.16, 0, 0.74, -0.2);
    }),
    smile: mold((p) => p.ring("dark", 0.1, 0.02, 0, 0.27, 0.3, "z", Math.PI * 1.12, Math.PI * 0.76)),
    arm: mold((p) => {
      p.pill("accent", 0.2, 0.52, 0.2, 0.1, 0, -0.22, 0);
      p.ball("shell", 0.115, 0, -0.52, 0);
    }),
  };
}

export function createPerson(parent: Object3D, molds: ReturnType<typeof personMolds>, look: Look, standing = false) {
  const palette: Palette = createPalette(undefined, look.shirt);
  palette.shell.color.setHex(look.skin);
  palette.shell.roughness = 0.6;
  palette.steel.color.setHex(look.top);
  palette.steel.metalness = 0;
  palette.dark.color.setHex(0x1a1512);
  const tints = ([palette.shell, palette.accent, palette.steel, palette.body] as MeshStandardMaterial[]).map((material) => ({
    material,
    full: material.color.clone(),
  }));

  const root = new Group();
  parent.add(root);
  const body = new Group();
  root.add(body);
  cast(body, molds.torso, null, palette, true);
  if (standing) {
    cast(root, molds.legs, null, palette, true);
    body.position.y = 0.22;
  }
  const head = cast(body, molds[look.head], null, palette, true);
  head.position.y = 1.32;
  const smile = cast(head, molds.smile, null, palette);
  const arms = [-1, 1].map((s) => {
    const arm = cast(body, molds.arm, null, palette, true);
    arm.position.set(s * 0.43, 1.2, 0);
    return arm;
  });
  const base = body.position.y;

  return {
    root,
    update({ time, lit, look: turn, left, right, type, happy }: PersonMood) {
      for (const { material, full } of tints) material.color.copy(ASLEEP).lerp(full, lit);
      body.position.y = base + Math.sin(time * 1.4) * 0.012 * lit + Math.abs(Math.sin(time * 7)) * 0.12 * happy;
      head.rotation.set(type * 0.2, turn, Math.sin(time * 0.8) * 0.04 * lit);
      smile.visible = lit > 0.45;
      [left, right].forEach((up, i) => {
        const s = i ? 1 : -1;
        const tap = type * Math.sin(time * 11 + i * 2) * 0.06;
        arms[i].rotation.set(mix(-0.2 - type * 0.85 + tap, -0.25, up), 0, s * mix(0.12 - type * 0.3, 2.65 + Math.sin(time * 5 + i) * 0.12, up));
      });
    },
  };
}
