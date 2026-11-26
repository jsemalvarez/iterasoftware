import {
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
  TorusGeometry,
  type BufferGeometry,
  type Object3D,
  type Plane,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const ACCENT = 0xf5a524;

export const clamp = (t: number) => Math.min(1, Math.max(0, t));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const ramp = (v: number, from: number, to: number) => smooth(clamp((v - from) / (to - from)));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Sube de 0 a 1 en `from`, se queda y vuelve a 0 en `to`. */
export const pulse = (v: number, from: number, to: number, ease = 0.05) => ramp(v, from, from + ease) - ramp(v, to - ease, to);

/** Materiales. Con `clip`, se van revelando detrás de un plano de corte. */
export function createPalette(clip?: Plane, accent = ACCENT) {
  const make = (color: number, metalness: number, roughness: number, glow = 0) =>
    new MeshStandardMaterial({
      color,
      metalness,
      roughness,
      emissive: glow ? color : 0x000000,
      emissiveIntensity: glow,
      side: DoubleSide,
      clippingPlanes: clip ? [clip] : null,
      clipShadows: Boolean(clip),
    });
  return {
    shell: make(0xe3e9ef, 0.05, 0.36),
    body: make(0x3b4b5d, 0.3, 0.5),
    dark: make(0x131a23, 0.3, 0.55),
    steel: make(0x9fb0c0, 0.5, 0.4),
    accent: make(accent, 0.1, 0.42),
    glow: make(accent, 0, 0.5, 1.6),
    green: make(0x34d399, 0, 0.5, 1.2),
  };
}

export type Palette = ReturnType<typeof createPalette>;

/** Contorno de un rectángulo redondeado, como lista de puntos. */
export function contour(w: number, h: number, radius: number) {
  const r = Math.min(radius, w / 2, h / 2);
  const steps = r < 0.06 ? 2 : 7;
  const points: [number, number][] = [];
  for (let corner = 0; corner < 4; corner++) {
    const cx = (w / 2 - r) * (corner === 0 || corner === 3 ? 1 : -1);
    const cy = (h / 2 - r) * (corner < 2 ? 1 : -1);
    for (let i = 0; i <= steps; i++) {
      const a = ((corner + i / steps) * Math.PI) / 2;
      points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return points;
}

/** Aristas de una línea de puntos. */
function trace(points: number[][], closed = true) {
  const out: number[] = [];
  for (let i = closed ? 0 : 1; i < points.length; i++) out.push(...points.at(i - 1)!, ...points[i]);
  return out;
}

const creases = (geometry: BufferGeometry) => Array.from(new EdgesGeometry(geometry, 20).attributes.position.array);

/** Acumula volúmenes por material y, aparte, los trazos de su dibujo. */
function createKit() {
  const edges: number[] = [];
  const bodies = new Map<keyof Palette, BufferGeometry[]>();
  const put = (material: keyof Palette, solid: BufferGeometry, lines: number[], x: number, y: number, z: number) => {
    for (let i = 0; i < lines.length; i += 3) edges.push(lines[i] + x, lines[i + 1] + y, lines[i + 2] + z);
    solid.translate(x, y, z);
    const list = bodies.get(material) ?? [];
    list.push(solid.index ? solid.toNonIndexed() : solid);
    bodies.set(material, list);
  };
  return {
    edges,
    bodies,
    /** Cualquier geometría, dibujada por sus aristas. */
    shape(material: keyof Palette, geometry: BufferGeometry, x: number, y: number, z: number) {
      put(material, geometry, creases(geometry), x, y, z);
    },
    /** Volumen blando: se dibuja por sus secciones. */
    pill(material: keyof Palette, w: number, h: number, d: number, r: number, x: number, y: number, z: number) {
      const depth = d / 2 - r;
      const lines = [
        ...(depth > 0.01 ? [-depth, depth] : [0]).flatMap((c) => trace(contour(w, h, r).map(([a, b]) => [a, b, c]))),
        ...trace(contour(d, h, r).map(([a, b]) => [0, b, a])),
        ...trace(contour(w, d, r).map(([a, b]) => [a, 0, b])),
      ];
      put(material, new RoundedBoxGeometry(w, h, d, 5, r), lines, x, y, z);
    },
    /** Placa de frente, con las esquinas redondeadas. */
    plate(material: keyof Palette, w: number, h: number, d: number, r: number, x: number, y: number, z: number) {
      const shape = new Shape();
      contour(w, h, r).forEach(([a, b], i) => (i ? shape.lineTo(a, b) : shape.moveTo(a, b)));
      const geometry = new ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2);
      const lines = [-d / 2, d / 2].flatMap((c) => trace(contour(w, h, r).map(([a, b]) => [a, b, c])));
      put(material, geometry, lines, x, y, z);
    },
    ball(material: keyof Palette, r: number, x: number, y: number, z: number) {
      const circle = contour(r * 2, r * 2, r);
      const lines = [
        ...trace(circle.map(([a, b]) => [a, b, 0])),
        ...trace(circle.map(([a, b]) => [0, b, a])),
        ...trace(circle.map(([a, b]) => [a, 0, b])),
      ];
      put(material, new SphereGeometry(r, r < 0.1 ? 12 : 24, r < 0.1 ? 8 : 16), lines, x, y, z);
    },
    cyl(material: keyof Palette, r: number, h: number, x: number, y: number, z: number, axis: "x" | "y" | "z" = "y") {
      const geometry = new CylinderGeometry(r, r, h, 32);
      if (axis === "z") geometry.rotateX(Math.PI / 2);
      if (axis === "x") geometry.rotateZ(Math.PI / 2);
      put(material, geometry, creases(geometry), x, y, z);
    },
    /** Anillo, o un arco suyo, acostado ("y") o de frente ("z"). */
    ring(material: keyof Palette, r: number, tube: number, x: number, y: number, z: number, axis: "y" | "z" = "y", from = 0, arc = Math.PI * 2) {
      const geometry = new TorusGeometry(r, tube, 8, 36, arc).rotateZ(from);
      const points = Array.from({ length: 33 }, (_, i) => {
        const a = from + (i / 32) * arc;
        return [Math.cos(a) * r, Math.sin(a) * r, 0];
      });
      if (axis === "y") geometry.rotateX(-Math.PI / 2);
      const lines = trace(axis === "y" ? points.map(([a, b]) => [a, 0, -b]) : points, false);
      put(material, geometry, lines, x, y, z);
    },
  };
}

export type Kit = ReturnType<typeof createKit>;

export function segments(points: number[], material: LineMaterial) {
  const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(points), material);
  mesh.frustumCulled = false;
  return mesh;
}

type Mold = { bodies: [keyof Palette, BufferGeometry][]; lines: LineSegmentsGeometry };

/** Geometría lista para repetir: una por material más un solo trazo con todo el dibujo. */
export function mold(build: (kit: Kit) => void): Mold {
  const kit = createKit();
  build(kit);
  return {
    bodies: [...kit.bodies].map(([name, list]) => [name, mergeGeometries(list)]),
    lines: new LineSegmentsGeometry().setPositions(kit.edges),
  };
}

/** Una pieza a partir de su molde, con su dibujo si hay tinta. Las chicas no hacen sombra: no se nota y cuesta. */
export function cast(parent: Object3D, { bodies, lines }: Mold, ink: LineMaterial | null, palette: Palette, shadow = false) {
  const group = new Group();
  parent.add(group);
  for (const [name, geometry] of bodies) {
    const mesh = new Mesh(geometry, palette[name]);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  if (ink) {
    const drawing = new LineSegments2(lines, ink);
    drawing.frustumCulled = false;
    group.add(drawing);
  }
  return group;
}

/** Pieza única. */
export function part(parent: Object3D, ink: LineMaterial, palette: Palette, build: (kit: Kit) => void) {
  return cast(parent, mold(build), ink, palette, true);
}
