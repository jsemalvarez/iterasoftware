import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { SceneInstance } from "./types";

const ACCENT = 0xf5a524;
const WARM = 0xffc36b;
const NIGHT = 0x0b0f14;
const BOARD = 46;
const PITCH = 0.17; // separación entre pistas de un mismo bus

type Pt = [number, number];
type Chip = { label: string; sub: string; x: number; z: number; w: number; d: number; h: number; from?: string; lanes?: number };

// Cada sistema de la planta es un edificio. `from` indica de dónde le llega el bus.
const chips: Chip[] = [
  { label: "ITERA", sub: "", x: 0, z: 0, w: 4.2, d: 4.2, h: 0.75 },
  { label: "PLC", sub: "MÁQUINAS", x: -7, z: -1.4, w: 2.4, d: 2.4, h: 0.8, from: "ITERA" },
  { label: "SCADA", sub: "SUPERVISIÓN", x: -5.8, z: 5.2, w: 2.8, d: 2, h: 0.65, from: "ITERA" },
  { label: "IoT", sub: "SENSORES", x: -0.4, z: 7, w: 2.2, d: 1.8, h: 0.6, from: "ITERA" },
  { label: "VISIÓN", sub: "CALIDAD", x: 6, z: 5.2, w: 2.6, d: 2.2, h: 0.75, from: "ITERA" },
  { label: "IA", sub: "MODELOS", x: 7, z: -1, w: 2.8, d: 2.8, h: 1, from: "ITERA" },
  { label: "MES", sub: "PRODUCCIÓN", x: 5, z: -7, w: 2.4, d: 2.4, h: 1.2, from: "ITERA" },
  { label: "ERP", sub: "GESTIÓN", x: -0.6, z: -7.8, w: 2.8, d: 2.2, h: 1.4, from: "ITERA" },
  { label: "DATOS", sub: "HISTÓRICO", x: -6.4, z: -8, w: 2.6, d: 2.4, h: 1.1, from: "ITERA" },
  { label: "LÍNEA 1", sub: "", x: -13, z: -2.4, w: 2, d: 2.2, h: 0.7, from: "PLC", lanes: 4 },
  { label: "LÍNEA 2", sub: "", x: -12, z: 6.6, w: 2.4, d: 1.8, h: 0.6, from: "SCADA", lanes: 4 },
  { label: "OEE", sub: "", x: 13, z: -2.6, w: 2.2, d: 2.2, h: 0.9, from: "IA", lanes: 4 },
  { label: "ALERTAS", sub: "", x: 12.4, z: 6.6, w: 2.4, d: 1.8, h: 0.6, from: "VISIÓN", lanes: 4 },
  { label: "STOCK", sub: "", x: 11.4, z: -10, w: 2.2, d: 2, h: 1.2, from: "MES", lanes: 4 },
];

/** Generador pseudoaleatorio con semilla: la ciudad es siempre la misma. */
function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Recorrido con ángulos de 45° entre dos chips. */
function route(a: Chip, b: Chip): Pt[] {
  const swap = Math.abs(b.z - a.z) > Math.abs(b.x - a.x);
  const to = (u: number, v: number): Pt => (swap ? [v, u] : [u, v]);
  const [au, av, ahu, ahv] = swap ? [a.z, a.x, a.d / 2, a.w / 2] : [a.x, a.z, a.w / 2, a.d / 2];
  const [bu, bv, bhu, bhv] = swap ? [b.z, b.x, b.d / 2, b.w / 2] : [b.x, b.z, b.w / 2, b.d / 2];
  const su = Math.sign(bu - au);
  const start = au + su * ahu;
  const v0 = av + Math.max(-ahv * 0.6, Math.min(ahv * 0.6, (bv - av) * 0.35));
  const end = bu - su * bhu;
  const dv = bv - v0;
  const sv = Math.sign(dv) || 1;
  const span = Math.abs(end - start);
  if (Math.abs(dv) < span * 0.85) {
    const lead = (span - Math.abs(dv)) / 2;
    return [to(start, v0), to(start + su * lead, v0), to(end - su * lead, bv), to(end, bv)];
  }
  const endV = bv - sv * bhv;
  const cut = Math.min(Math.abs(bu - start), Math.abs(endV - v0)) * 0.75;
  return [to(start, v0), to(bu - su * cut, v0), to(bu, v0 + sv * cut), to(bu, endV)];
}

/** Desplaza un recorrido en paralelo manteniendo la separación en las esquinas. */
function offsetPath(path: Pt[], o: number): Pt[] {
  const normals = path.slice(1).map(([x, z], i) => {
    const dx = x - path[i][0];
    const dz = z - path[i][1];
    const l = Math.hypot(dx, dz) || 1;
    return [-dz / l, dx / l] as Pt;
  });
  return path.map(([x, z], i) => {
    const p = normals[Math.max(0, i - 1)];
    const n = normals[Math.min(normals.length - 1, i)];
    const mx = p[0] + n[0];
    const mz = p[1] + n[1];
    const k = (2 * o) / (mx * mx + mz * mz);
    return [x + mx * k, z + mz * k];
  });
}

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Máscara de la placa: verde petróleo casi negro con pistas enterradas. */
function boardTexture(rnd: () => number) {
  return canvasTexture(2048, 2048, (c) => {
    c.fillStyle = "#0a1a1b";
    c.fillRect(0, 0, 2048, 2048);
    c.lineWidth = 4;
    c.lineCap = "round";
    for (let i = 0; i < 520; i++) {
      let x = rnd() * 2048;
      let y = rnd() * 2048;
      const lanes = 1 + Math.floor(rnd() * 5);
      const dirs = [0, 1, 2].map(() => Math.floor(rnd() * 8) * (Math.PI / 4));
      const lengths = [0, 1, 2].map(() => 40 + rnd() * 150);
      c.strokeStyle = `rgba(${rnd() > 0.5 ? "52,104,94" : "30,72,70"},${0.25 + rnd() * 0.3})`;
      for (let lane = 0; lane < lanes; lane++) {
        c.beginPath();
        c.moveTo(x, y);
        let px = x;
        let py = y;
        dirs.forEach((d, k) => {
          px += Math.cos(d) * lengths[k];
          py += Math.sin(d) * lengths[k];
          c.lineTo(px, py);
        });
        c.stroke();
        x += 10;
        y += 10;
      }
    }
    for (let i = 0; i < 1600; i++) {
      c.fillStyle = `rgba(160,125,60,${0.15 + rnd() * 0.3})`;
      c.beginPath();
      c.arc(rnd() * 2048, rnd() * 2048, 2 + rnd() * 2.5, 0, Math.PI * 2);
      c.fill();
    }
  });
}

/** Fachada con ventanas; la mayoría apagadas. */
function windowTexture(rnd: () => number, lit: number) {
  const t = canvasTexture(128, 256, (c) => {
    c.fillStyle = "#000";
    c.fillRect(0, 0, 128, 256);
    for (let y = 0; y < 14; y++)
      for (let x = 0; x < 6; x++) {
        if (rnd() > lit) continue;
        c.globalAlpha = 0.35 + rnd() * 0.65;
        c.fillStyle = rnd() > 0.15 ? "#ffb84d" : "#dff3ff";
        c.fillRect(10 + x * 19, 12 + y * 17, 11, 8);
      }
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

function glowTexture() {
  return canvasTexture(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
}

function chipLabel(chip: Chip) {
  return canvasTexture(512, Math.round((512 * chip.d) / chip.w), (c) => {
    const { width: w, height: h } = c.canvas;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = c.strokeStyle = "#fff";
    if (chip.label === "ITERA") {
      // Mismo trazo que components/logo.tsx (lienzo de 32 × 32)
      c.save();
      c.translate(w / 2, h * 0.42);
      c.scale(11.5, 11.5);
      c.translate(-16, -16);
      c.lineCap = c.lineJoin = "round";
      c.lineWidth = 2.6;
      c.stroke(new Path2D("M22.5 10.5A8 8 0 1 0 24 16"));
      c.stroke(new Path2D("M19.5 9.5h3.6v3.6"));
      c.fill(new Path2D("M13.6 16a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0-4.8 0"));
      c.restore();
      c.font = "600 54px sans-serif";
      c.fillText("I T E R A", w / 2, h * 0.76);
      return;
    }
    const size = Math.min(170, 800 / chip.label.length);
    c.font = `700 ${size}px sans-serif`;
    c.fillText(chip.label, w / 2, chip.sub ? h * 0.44 : h / 2);
    c.globalAlpha = 0.6;
    c.font = "500 44px monospace";
    c.fillText(chip.sub, w / 2, h * 0.7);
    c.beginPath();
    c.arc(46, 46, 14, 0, Math.PI * 2);
    c.fill();
  });
}

/** Placa de circuito como ciudad de noche: chips-edificio, pistas-calle y señales-tráfico. */
export function createCircuitCity(onStats?: (a: number, b: number) => void): SceneInstance {
  const rnd = mulberry(14);
  const scene = new Scene();
  scene.environmentIntensity = 0.16;
  const fog = new FogExp2(NIGHT, 0.028);
  scene.fog = fog;
  const camera = new PerspectiveCamera(30, 1, 0.5, 120);

  const gold = new MeshStandardMaterial({ color: 0xd9a548, metalness: 1, roughness: 0.32, emissive: ACCENT, emissiveIntensity: 0.1 });
  const tin = new MeshStandardMaterial({ color: 0xc3ccd4, metalness: 1, roughness: 0.3 });
  const epoxy = new MeshStandardMaterial({ color: 0x14181d, metalness: 0.1, roughness: 0.62 });
  const glow = glowTexture();

  const still = <T extends Mesh>(mesh: T, cast = true, receive = true) => {
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    return mesh;
  };

  const dummy = new Object3D();
  type Place = { x: number; y?: number; z: number; sx?: number; sy?: number; sz?: number; r?: number };
  const instances = (geometry: BufferGeometry, material: Material | Material[], places: Place[], cast = true) => {
    if (!places.length) return;
    const mesh = new InstancedMesh(geometry, material, places.length);
    places.forEach((p, i) => {
      dummy.position.set(p.x, p.y ?? 0, p.z);
      dummy.rotation.set(0, p.r ?? 0, 0);
      dummy.scale.set(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    still(mesh, cast);
  };

  /* Grilla de ocupación: los componentes sueltos no pisan pistas ni chips */
  const CELL = 0.25;
  const cells = Math.round(BOARD / CELL);
  const taken = new Uint8Array(cells * cells);
  const cell = (v: number) => Math.floor((v + BOARD / 2) / CELL);
  const occupy = (x: number, z: number, hw: number, hd: number) => {
    for (let i = cell(x - hw); i <= cell(x + hw); i++)
      for (let j = cell(z - hd); j <= cell(z + hd); j++) if (i >= 0 && j >= 0 && i < cells && j < cells) taken[i * cells + j] = 1;
  };
  const isFree = (x: number, z: number, hw: number, hd: number) => {
    for (let i = cell(x - hw); i <= cell(x + hw); i++)
      for (let j = cell(z - hd); j <= cell(z + hd); j++) if (i < 0 || j < 0 || i >= cells || j >= cells || taken[i * cells + j]) return false;
    return true;
  };

  /* Placa */
  const board = still(
    new Mesh(new PlaneGeometry(BOARD, BOARD).rotateX(-Math.PI / 2), new MeshStandardMaterial({ map: boardTexture(rnd), roughness: 0.42, metalness: 0.15 })),
    false,
  );
  board.renderOrder = -1;

  /* Chips */
  const pool = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const legs: Place[] = [];
  const buildings = chips.map((chip) => {
    const { x, z, w, d, h } = chip;
    const core = chip.label === "ITERA";
    occupy(x, z, w / 2 + 0.6, d / 2 + 0.6);

    const body = still(new Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.06), epoxy));
    body.position.set(x, h / 2 + 0.1, z);
    let top = h + 0.1;
    if (core) {
      // Tapa metálica del procesador
      const lid = still(new Mesh(new RoundedBoxGeometry(w * 0.8, 0.2, d * 0.8, 3, 0.08), new MeshStandardMaterial({ color: 0x2b323a, metalness: 0.9, roughness: 0.35 })));
      lid.position.set(x, top + 0.06, z);
      top += 0.16;
    }

    const labelMaterial = new MeshBasicMaterial({ map: chipLabel(chip), color: core ? ACCENT : 0xd5dde5, transparent: true, depthWrite: false });
    const label = new Mesh(new PlaneGeometry(w * 0.78, d * 0.78).rotateX(-Math.PI / 2), labelMaterial);
    label.position.set(x, top + 0.012, z);
    scene.add(label);

    // Franja de luz en la base: ilumina la "vereda"
    const strip = new MeshBasicMaterial({ color: WARM });
    const band = new Mesh(new BoxGeometry(w + 0.02, 0.035, d + 0.02), strip);
    band.position.set(x, h * 0.55, z);
    scene.add(band);

    const poolMaterial = new MeshBasicMaterial({ map: glow, color: ACCENT, transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false });
    const light = new Mesh(pool, poolMaterial);
    light.scale.set(w * 2.7, 1, d * 2.7);
    light.position.set(x, 0.03, z);
    scene.add(light);

    const step = 0.26;
    for (let o = -w / 2 + 0.25; o <= w / 2 - 0.2; o += step) for (const s of [-1, 1]) legs.push({ x: x + o, y: 0.1, z: z + s * (d / 2 + 0.12) });
    for (let o = -d / 2 + 0.25; o <= d / 2 - 0.2; o += step) for (const s of [-1, 1]) legs.push({ x: x + s * (w / 2 + 0.12), y: 0.1, z: z + o, r: Math.PI / 2 });

    return { chip, strip, poolMaterial, labelMaterial, core, energy: 0.3 };
  });
  instances(new BoxGeometry(0.11, 0.07, 0.36), tin, legs);

  /* Pistas */
  const segments: Place[] = [];
  const joints: Place[] = [];
  const streets: { points: Pt[]; lengths: number[]; total: number; a: number; b: number }[] = [];
  chips.forEach((chip, b) => {
    if (!chip.from) return;
    const a = chips.findIndex((c) => c.label === chip.from);
    const path = route(chips[a], chip);
    const lanes = chip.lanes ?? 6;
    for (let lane = 0; lane < lanes; lane++) {
      const points = offsetPath(path, (lane - (lanes - 1) / 2) * PITCH);
      const lengths: number[] = [];
      let total = 0;
      for (let i = 1; i < points.length; i++) {
        const [x0, z0] = points[i - 1];
        const [x1, z1] = points[i];
        const l = Math.hypot(x1 - x0, z1 - z0);
        lengths.push(l);
        total += l;
        segments.push({ x: (x0 + x1) / 2, y: 0.012, z: (z0 + z1) / 2, sx: l, r: -Math.atan2(z1 - z0, x1 - x0) });
        joints.push({ x: x1, y: 0.012, z: z1 });
        for (let k = 0; k <= l; k += 0.2) occupy(x0 + ((x1 - x0) * k) / l, z0 + ((z1 - z0) * k) / l, 0.2, 0.2);
      }
      streets.push({ points, lengths, total, a, b });
    }
  });
  instances(new BoxGeometry(1, 0.024, 0.075), gold, segments, false);
  instances(new CylinderGeometry(0.0375, 0.0375, 0.024, 10), gold, joints, false);

  /* Componentes: torres, condensadores y piezas chicas */
  const towers: Place[][] = [[], [], []];
  const caps: Place[] = [];
  const small: Place[] = [];
  const smallEnds: Place[] = [];
  const ceramics: Place[] = [];
  const vias: Place[] = [];
  const leds: { x: number; z: number; color: number }[] = [];
  const half = BOARD / 2 - 1;
  const spot = (): Pt => [(rnd() * 2 - 1) * half, (rnd() * 2 - 1) * half];

  for (let i = 0; i < 1500; i++) {
    const [x, z] = spot();
    // Más altas al fondo; bajas adelante, para no tapar el centro
    const back = Math.min(1, Math.max(0, (6 - z) / 22));
    const w = 0.7 + rnd() * 0.7;
    const d = 0.7 + rnd() * 0.7;
    if (!isFree(x, z, w / 2 + 0.12, d / 2 + 0.12)) continue;
    const kind = rnd();
    if (kind < 0.42) {
      const h = 0.35 + rnd() * (0.5 + back * 2.6);
      towers[Math.floor(rnd() * 3)].push({ x, y: h / 2, z, sx: w, sy: h, sz: d });
      occupy(x, z, w / 2 + 0.1, d / 2 + 0.1);
    } else if (kind < 0.66) {
      const r = 0.28 + rnd() * 0.22;
      caps.push({ x, z, sx: r, sz: r, sy: 0.5 + rnd() * (0.4 + back * 1.1) });
      occupy(x, z, r + 0.1, r + 0.1);
    } else {
      // Fila de componentes chicos
      const n = 2 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const sz = z + (k - (n - 1) / 2) * 0.26;
        (kind < 0.83 ? small : ceramics).push({ x, y: 0.07, z: sz });
        for (const s of [-1, 1]) smallEnds.push({ x: x + s * 0.17, y: 0.07, z: sz });
      }
      occupy(x, z, 0.35, n * 0.13 + 0.05);
    }
  }
  for (let i = 0; i < 1400; i++) {
    const [x, z] = spot();
    if (isFree(x, z, 0.06, 0.06)) vias.push({ x, y: 0.01, z });
  }
  for (let i = 0; i < 400 && leds.length < 46; i++) {
    const [x, z] = spot();
    if (!isFree(x, z, 0.14, 0.14)) continue;
    occupy(x, z, 0.2, 0.2);
    const tone = rnd();
    leds.push({ x, z, color: tone < 0.6 ? ACCENT : tone < 0.85 ? 0x34d399 : 0xf87171 });
  }

  const box = new BoxGeometry(1, 1, 1);
  towers.forEach((places, i) => {
    const facade = new MeshStandardMaterial({ color: 0x171c22, roughness: 0.6, metalness: 0.2, emissive: 0xffffff, emissiveMap: windowTexture(rnd, 0.16 + i * 0.1), emissiveIntensity: 0.85 });
    instances(box, [facade, facade, epoxy, epoxy, facade, facade], places);
  });
  instances(new CylinderGeometry(1, 1, 0.12, 28).translate(0, 0.06, 0), epoxy, caps.map((c) => ({ ...c, sx: c.sx! * 1.1, sz: c.sz! * 1.1, sy: 1 })));
  instances(new CylinderGeometry(1, 1, 1, 28).translate(0, 0.5, 0), new MeshStandardMaterial({ color: 0x8d98a3, metalness: 0.95, roughness: 0.36 }), caps);
  instances(new CylinderGeometry(1.005, 1.005, 0.03, 28), new MeshStandardMaterial({ color: ACCENT, roughness: 0.5 }), caps.map((c) => ({ ...c, y: c.sy! * 0.82, sy: 1 })), false);
  instances(new BoxGeometry(0.28, 0.13, 0.19), epoxy, small, false);
  instances(new BoxGeometry(0.28, 0.15, 0.19), new MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.6 }), ceramics, false);
  instances(new BoxGeometry(0.08, 0.145, 0.195), tin, smallEnds, false);
  instances(new TorusGeometry(0.05, 0.018, 6, 14).rotateX(Math.PI / 2), gold, vias, false);

  // LEDs: un solo dibujo para los bulbos y otro para los halos
  const tint = new Color();
  const bulbs = new InstancedMesh(new SphereGeometry(0.09, 12, 10), new MeshBasicMaterial(), leds.length);
  const haloPositions = new Float32Array(leds.length * 3);
  const haloColors = new BufferAttribute(new Float32Array(leds.length * 3), 3);
  leds.forEach(({ x, z, color }, i) => {
    dummy.position.set(x, 0.1, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
    bulbs.setColorAt(i, tint.setHex(color));
    haloPositions.set([x, 0.14, z], i * 3);
  });
  scene.add(bulbs);
  const haloGeometry = new BufferGeometry();
  haloGeometry.setAttribute("position", new BufferAttribute(haloPositions, 3));
  haloGeometry.setAttribute("color", haloColors);
  scene.add(
    new Points(
      haloGeometry,
      new PointsMaterial({ map: glow, size: 1.5, vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false }),
    ),
  );

  /* Serigrafía: nombres de barrio sobre la placa */
  const silk = (text: string, x: number, z: number, size: number) => {
    const map = canvasTexture(1024, 160, (c) => {
      c.fillStyle = "#e8edf2";
      c.font = "700 112px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(text.split("").join(" "), 512, 84);
    });
    const m = new Mesh(new PlaneGeometry(size, (size * 160) / 1024).rotateX(-Math.PI / 2), new MeshBasicMaterial({ map, transparent: true, opacity: 0.5, depthWrite: false }));
    m.position.set(x, 0.02, z);
    scene.add(m);
  };
  silk("PLANTA", -5.8, 6.95, 3.4);
  silk("CALIDAD", 6, 7.05, 3.8);
  silk("GESTIÓN", 3, 9.1, 3.8);

  /* Señales: tráfico con estela */
  const TRAIL = 9;
  const signals = streets.flatMap((street) =>
    Array.from({ length: 2 }, () => ({
      street,
      inbound: rnd() < 0.6,
      pos: rnd() * street.total,
      speed: 1.6 + rnd() * 1.9,
    })),
  );
  const count = signals.length * TRAIL;
  const positions = new BufferAttribute(new Float32Array(count * 3), 3);
  const colors = new BufferAttribute(new Float32Array(count * 3), 3);
  signals.forEach((s, i) => {
    for (let k = 0; k < TRAIL; k++) {
      tint.setHex(s.inbound ? WARM : 0xff7a2e).multiplyScalar((1 - k / TRAIL) ** 2 * (k ? 0.7 : 1.4));
      tint.toArray(colors.array, (i * TRAIL + k) * 3);
    }
  });
  const trafficGeometry = new BufferGeometry();
  trafficGeometry.setAttribute("position", positions);
  trafficGeometry.setAttribute("color", colors);
  const traffic = new Points(
    trafficGeometry,
    new PointsMaterial({ map: glow, size: 0.5, vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false }),
  );
  traffic.frustumCulled = false;
  scene.add(traffic);

  const place = (index: number, street: (typeof streets)[number], distance: number) => {
    let d = Math.max(0, Math.min(street.total, distance));
    let i = 0;
    while (i < street.lengths.length - 1 && d > street.lengths[i]) d -= street.lengths[i++];
    const k = d / street.lengths[i];
    const [x0, z0] = street.points[i];
    const [x1, z1] = street.points[i + 1];
    positions.setXYZ(index, x0 + (x1 - x0) * k, 0.08, z0 + (z1 - z0) * k);
  };

  /* Luces: la sombra se calcula una sola vez porque la ciudad no se mueve */
  scene.add(new HemisphereLight(0x8fb4d8, 0x0a1414, 0.35));
  const moon = new DirectionalLight(0x9fc0e6, 1.1);
  moon.position.set(-9, 14, -5);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.bias = -0.0004;
  moon.shadow.normalBias = 0.04;
  moon.shadow.autoUpdate = false;
  moon.shadow.needsUpdate = true;
  Object.assign(moon.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 45 });
  scene.add(moon);
  const heart = new PointLight(ACCENT, 60, 16);
  heart.position.set(0, 3.4, 0.5);
  scene.add(heart);
  for (const [x, z] of [[-6.4, 2], [6.5, 2.4], [2, -6]]) {
    const lamp = new PointLight(WARM, 22, 9);
    lamp.position.set(x, 1.7, z);
    scene.add(lamp);
  }

  const look = new Vector3();
  let portrait = false;
  let frameWidth = 1000;
  let distance = 25;
  let arrivals = 0;
  let reported = 0;

  return {
    scene,
    camera,
    resize(aspect) {
      portrait = aspect < 1;
      frameWidth = aspect * 1000;
      distance = portrait ? Math.min(36, 14 / aspect) : 25;
      fog.density = 0.62 / distance;
    },
    update({ time, delta, pointerX, pointerY, reduced }) {
      signals.forEach((s, i) => {
        s.pos += s.speed * delta;
        if (s.pos > s.street.total + 1.2) {
          s.pos = 0;
          arrivals++;
          buildings[s.inbound ? s.street.a : s.street.b].energy = 1;
        }
        for (let k = 0; k < TRAIL; k++) {
          const along = s.pos - k * 0.13;
          place(i * TRAIL + k, s.street, s.inbound ? s.street.total - along : along);
        }
      });
      positions.needsUpdate = true;

      buildings.forEach((b) => {
        b.energy += (0.3 - b.energy) * Math.min(1, delta * 2.2);
        const base = b.core ? 0.6 : 0.26;
        b.poolMaterial.opacity = base + b.energy * (b.core ? 0.2 : 0.32);
        b.strip.color.setHex(WARM).multiplyScalar(0.35 + b.energy * 0.9);
        if (!b.core) b.labelMaterial.opacity = 0.55 + b.energy * 0.45;
      });
      heart.intensity = 55 + Math.sin(time * 1.6) * 12;
      leds.forEach(({ color }, i) => {
        const blink = 0.25 + 0.35 * Math.max(0, Math.sin(time * (0.7 + (i % 5) * 0.35) + i * 1.7));
        tint.setHex(color).multiplyScalar(blink).toArray(haloColors.array, i * 3);
      });
      haloColors.needsUpdate = true;

      if (onStats && time - reported > 0.4) {
        reported = time;
        onStats(arrivals, signals.filter((s) => s.pos < s.street.total).length);
      }

      // Vuelo lento: arranca al ras de la calle y sube hasta ver la ciudad
      const t = reduced ? 1 : Math.min(1, time / 6);
      const rise = 1 - (1 - t) ** 3;
      const angle = 0.52 + Math.sin(time * 0.07) * 0.16 + pointerX * 0.06 + (1 - rise) * 0.35;
      const pitch = 0.3 + rise * 0.24 - pointerY * 0.03;
      const reach = distance * (0.72 + rise * 0.28);
      camera.position.set(Math.sin(angle) * Math.cos(pitch) * reach, Math.sin(pitch) * reach, Math.cos(angle) * Math.cos(pitch) * reach);
      camera.lookAt(look);
      camera.setViewOffset(frameWidth, 1000, portrait ? 0 : -frameWidth * 0.2, portrait ? -250 : -10, frameWidth, 1000);
    },
  };
}
