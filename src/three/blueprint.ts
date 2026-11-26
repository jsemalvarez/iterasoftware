import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector3,
  type Object3D,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { UPGRADE_SPAN, upgradesAt } from "@/lib/build-stages";
import { ACCENT, cast, clamp, createPalette, mix, mold, part, pulse, ramp, segments, smooth, type Palette } from "./blueprint-kit";
import { FOOT, labelTexture, paperTexture, screenTexture, SHEET_D, SHEET_W, sheetTexture } from "./blueprint-textures";
import { botMolds, CHEST, createBot } from "./bot";
import type { SceneInstance } from "./types";

const WARM = 0xffc766;
const INK = 0xa9d1f7;
const GREEN = 0x34d399;
const BLUE = 0x6db8ff;
const FLAT = 0.004; // profundidad de las piezas cuando todavía son un dibujo
const OFF = 50; // constante de un plano de corte que no corta nada
const TOP = 4.35; // altura de toda la escena

const CYCLE = 4.2; // segundos por pedido a velocidad normal
const DELIVER = 0.8; // momento del ciclo en que el pedido queda cargado

const PAIRS = 4; // mensajes (con su respuesta) en la ventana de chat
const PAIR_STEP = 0.66;
const ROWS = 5; // pedidos en la ventana del sistema
const ROW_STEP = 0.4;
const ROW_TOP = 0.64;

type Spot = { x: number; y: number; z: number; turn: number; size: number };

/** Dónde está cada ventana en el dibujo y, ya de pie, en cada formato de pantalla. */
const spots = {
  chat: {
    flat: { x: -3.75, y: 1.95, z: 0, turn: 0, size: 1 },
    wide: { x: -3.4, y: 2, z: 0.4, turn: 0.4, size: 1 },
    tall: { x: -2.25, y: 1.5, z: 1, turn: 0.55, size: 0.76 },
  },
  system: {
    flat: { x: 3.8, y: 1.95, z: 0, turn: 0, size: 1 },
    wide: { x: 3.5, y: 2, z: 0.4, turn: -0.34, size: 1 },
    tall: { x: 2.3, y: 1.5, z: 1, turn: -0.45, size: 0.76 },
  },
} satisfies Record<string, Record<"flat" | "wide" | "tall", Spot>>;

function place(group: Group, from: Spot, to: Spot, t: number) {
  group.position.set(mix(from.x, to.x, t), mix(from.y, to.y, t), mix(from.z, to.z, t));
  group.rotation.y = mix(from.turn, to.turn, t);
  group.scale.setScalar(mix(from.size, to.size, t));
}

/** Código que se escribe: rectángulos de colores, uno por palabra. */
function codeGeometry(width: number, lines: number, step: number) {
  const palette = [0x8fa3b8, BLUE, ACCENT, GREEN, 0x8fa3b8].map((c) => new Color(c));
  const positions: number[] = [];
  const colors: number[] = [];
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const indents = [0, 1, 1, 2, 2, 1, 0, 0, 1, 2, 3, 3, 2, 1, 1, 0];
  for (let line = 0; line < lines; line++) {
    let x = indents[line % indents.length] * 0.22;
    const words = 3 + Math.floor(random() * 4);
    for (let w = 0; w < words; w++) {
      const len = 0.16 + random() * 0.5;
      if (x + len > width) break;
      const [x0, x1, y1, y0] = [x, x + len, -line * step, -line * step - 0.075];
      positions.push(x0, y0, 0, x1, y0, 0, x1, y1, 0, x0, y0, 0, x1, y1, 0, x0, y1, 0);
      const color = palette[Math.floor(random() * palette.length)];
      for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
      x += len + 0.09;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Los trazos de un grupo, para ocultarlos cuando ya no se ven. */
function linesOf(group: Group) {
  const lines: Object3D[] = [];
  group.traverse((o) => {
    if (o instanceof LineSegments2) lines.push(o);
  });
  return lines;
}

/** Punto de una curva que sale de `a`, pasa por arriba y llega a `b`. */
function arcPoint(out: Vector3, a: Vector3, b: Vector3, rise: number, t: number) {
  const u = 1 - t;
  const weight = 2 * u * t;
  return out.set(
    u * u * a.x + weight * ((a.x + b.x) / 2) + t * t * b.x,
    u * u * a.y + weight * ((a.y + b.y) / 2 + rise) + t * t * b.y,
    u * u * a.z + weight * ((a.z + b.z) / 2 + 0.6) + t * t * b.z,
  );
}

/** Plano que se dibuja, se pone de pie y termina siendo un bot en producción. */
export function createBlueprint(onStats?: (orders: number, cycleTenths: number) => void): SceneInstance {
  const scene = new Scene();
  scene.environmentIntensity = 0.4;
  const camera = new PerspectiveCamera(28, 1, 0.1, 120);

  // El trazo se revela de izquierda a derecha; el material, de abajo hacia arriba
  const sweep = new Plane(new Vector3(-1, 0, 0), 0);
  const fill = new Plane(new Vector3(0, -1, 0), 0);

  /* Hoja */
  const sheet = new Mesh(
    new BoxGeometry(SHEET_W, 0.06, SHEET_D),
    new MeshStandardMaterial({ map: paperTexture(), roughness: 0.9, envMapIntensity: 0.25 }),
  );
  sheet.position.y = -0.035;
  sheet.receiveShadow = true;
  scene.add(sheet);
  const printMaterial = new MeshBasicMaterial({ map: sheetTexture(), transparent: true, depthWrite: false, clippingPlanes: [sweep] });
  const print = new Mesh(new PlaneGeometry(SHEET_W, SHEET_D).rotateX(-Math.PI / 2), printMaterial);
  print.position.y = 0.004;
  scene.add(print);
  const pen = new Mesh(
    new BoxGeometry(0.035, 0.035, SHEET_D),
    new MeshBasicMaterial({ color: WARM, transparent: true, blending: AdditiveBlending, depthWrite: false }),
  );
  scene.add(pen);

  /* Lo dibujado está acostado en la hoja: `stand` lo pone de pie y `cell` le da profundidad */
  const m = createPalette(fill);
  const ink = new LineMaterial({ color: INK, linewidth: 1.4, transparent: true, depthWrite: false, clippingPlanes: [sweep] });
  const stand = new Group();
  stand.position.y = 0.02;
  scene.add(stand);
  const cell = new Group();
  stand.add(cell);

  const labelMaterials: MeshBasicMaterial[] = [];
  const label = (parent: Object3D, text: string, height: number, x: number, y: number, z: number) => {
    const material = new MeshBasicMaterial({ map: labelTexture(text), transparent: true, depthWrite: false });
    labelMaterials.push(material);
    const mesh = new Mesh(new PlaneGeometry(height * 8, height), material);
    mesh.position.set(x + height * 4, y, z);
    parent.add(mesh);
  };

  // Base
  part(cell, ink, m, (p) => {
    p.cyl("dark", 1.15, 0.1, 0, 0.05, 0);
    p.cyl("body", 0.95, 0.06, 0, 0.13, 0);
    p.ring("glow", 0.78, 0.03, 0, 0.16, 0);
  });

  // Ventana de código, detrás del bot
  const editor = part(cell, ink, m, (p) => {
    p.plate("dark", 4.5, 3.6, 0.1, 0.14, 0, 0, 0);
    p.plate("body", 4.5, 0.36, 0.12, 0.12, 0, 1.63, 0.01);
    p.ball("accent", 0.065, -2.06, 1.63, 0.07);
    p.ball("steel", 0.065, -1.86, 1.63, 0.07);
    p.ball("green", 0.065, -1.66, 1.63, 0.07);
  });
  label(editor, "bot-de-pedidos", 0.2, -1.45, 1.63, 0.09);
  const codeMaterial = new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  const code = new Mesh(codeGeometry(4.1, 16, 0.195), codeMaterial);
  code.position.set(-2.05, 1.26, 0.07);
  editor.add(code);
  const codeWords = code.geometry.attributes.position.count / 6;

  // Ventana de mensajes: cada uno con su respuesta
  const chat = part(cell, ink, m, (p) => {
    p.plate("dark", 1.9, 2.7, 0.1, 0.16, 0, 0, 0);
    p.plate("body", 1.9, 0.4, 0.12, 0.14, 0, 1.15, 0.01);
    p.ball("accent", 0.1, -0.7, 1.15, 0.07);
  });
  label(chat, "Mensajes", 0.2, -0.5, 1.15, 0.09);
  const ask = mold((p) => {
    p.plate("shell", 1.05, 0.27, 0.06, 0.12, 0, 0, 0);
    p.plate("steel", 0.5, 0.05, 0.02, 0.025, -0.16, 0.05, 0.035);
    p.plate("steel", 0.7, 0.05, 0.02, 0.025, -0.06, -0.05, 0.035);
  });
  const reply = mold((p) => {
    p.plate("accent", 0.8, 0.24, 0.06, 0.11, 0, 0, 0);
    p.plate("dark", 0.5, 0.05, 0.02, 0.025, 0, 0, 0.035);
  });
  const pairs = Array.from({ length: PAIRS }, () => ({ ask: cast(chat, ask, ink, m), reply: cast(chat, reply, ink, m) }));

  // Ventana del sistema: los pedidos cargados
  const system = part(cell, ink, m, (p) => {
    p.plate("dark", 2.1, 2.7, 0.1, 0.16, 0, 0, 0);
    p.plate("body", 2.1, 0.4, 0.12, 0.14, 0, 1.15, 0.01);
    for (const x of [-0.84, -0.7]) for (const y of [1.08, 1.22]) p.plate("green", 0.11, 0.11, 0.06, 0.02, x, y, 0.07);
  });
  label(system, "Pedidos", 0.2, -0.5, 1.15, 0.09);
  const row = mold((p) => {
    p.plate("body", 1.82, 0.3, 0.06, 0.08, 0, 0, 0);
    p.plate("steel", 0.5, 0.06, 0.02, 0.03, -0.5, 0, 0.035);
    p.plate("steel", 0.3, 0.06, 0.02, 0.03, 0.08, 0, 0.035);
    p.plate("green", 0.32, 0.14, 0.03, 0.07, 0.62, 0, 0.035);
  });
  const rows = Array.from({ length: ROWS }, () => cast(system, row, ink, m));

  // El bot, y lo que viaja hasta él y desde él
  const molds = botMolds();
  const bot = createBot(cell, molds, ink, m);
  const cardIn = cast(cell, ask, ink, m);
  const cardOut = cast(cell, row, ink, m);

  // Todo lo macizo arranca oculto: al principio es solo dibujo
  const solids: Mesh[] = [];
  const drawings = linesOf(cell);
  cell.traverse((o) => {
    if (o instanceof Mesh && o.material instanceof MeshStandardMaterial) solids.push(o);
  });

  const beamMaterial = new MeshBasicMaterial({ color: ACCENT, transparent: true, side: DoubleSide, depthWrite: false, blending: AdditiveBlending });
  const beam = new Mesh(new CylinderGeometry(0.3, 0.8, 0.5, 32, 1, true), beamMaterial);
  beam.position.y = 0.41;
  cell.add(beam);

  // Recorridos en el aire
  const pathMaterial = new LineMaterial({ color: WARM, linewidth: 1.6, transparent: true, depthWrite: false });
  const paths = segments([0, 0, 0, 0, 0, 0], pathMaterial);
  cell.add(paths);

  /* Frente de construcción: un plano de luz que sube con el material */
  const frontMaterial = new MeshBasicMaterial({ color: ACCENT, transparent: true, side: DoubleSide, depthWrite: false, blending: AdditiveBlending });
  const front = new Group();
  front.add(new Mesh(new PlaneGeometry(9.6, 4.2).rotateX(-Math.PI / 2), frontMaterial));
  const frontInk = new LineMaterial({ color: WARM, linewidth: 2, transparent: true, depthWrite: false });
  front.add(segments([-4.8, 0, -2.1, 4.8, 0, -2.1, 4.8, 0, -2.1, 4.8, 0, 2.1, 4.8, 0, 2.1, -4.8, 0, 2.1, -4.8, 0, 2.1, -4.8, 0, -2.1], frontInk));
  scene.add(front);

  /* Mejoras: cada una repite el recorrido completo, de dibujo a pieza */
  const upgrade = (accent: number, build: (group: Group, p: Palette, ink: LineMaterial) => void) => {
    const clip = new Plane(new Vector3(0, -1, 0), 0);
    const group = new Group();
    const body = new Group();
    group.add(body);
    scene.add(group);
    const trace = new LineMaterial({ color: WARM, linewidth: 1.8, transparent: true, depthWrite: false });
    build(body, createPalette(clip, accent), trace);
    return { group, body, clip, trace, drawings: linesOf(body) };
  };

  // Lee un documento
  const scanMaterial = new MeshBasicMaterial({ color: WARM, transparent: true, side: DoubleSide, depthWrite: false, blending: AdditiveBlending });
  const scan = new Mesh(new BoxGeometry(0.98, 0.03, 0.03), scanMaterial);
  const rayMaterial = new MeshBasicMaterial({ color: ACCENT, transparent: true, side: DoubleSide, depthWrite: false, blending: AdditiveBlending });
  const ray = new Mesh(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(new Float32Array(9), 3)), rayMaterial);
  ray.frustumCulled = false;
  cell.add(ray);
  const reader = upgrade(ACCENT, (group, p, trace) => {
    part(group, trace, p, (k) => {
      k.plate("shell", 0.92, 1.22, 0.04, 0.06, 0, 1.05, 0);
      k.plate("accent", 0.3, 0.3, 0.02, 0.04, -0.22, 1.42, 0.03);
      for (const [w, y] of [
        [0.3, 1.48],
        [0.3, 1.36],
      ])
        k.plate("body", w, 0.05, 0.02, 0.025, 0.2, y, 0.03);
      for (let i = 0; i < 5; i++) k.plate("steel", i % 2 ? 0.52 : 0.7, 0.05, 0.02, 0.025, i % 2 ? -0.09 : 0, 1.14 - i * 0.14, 0.03);
    });
    group.add(scan);
  });

  // Muestra los números
  const screenMaterial = new MeshBasicMaterial({ map: screenTexture(), transparent: true });
  const board = upgrade(ACCENT, (group, p, trace) => {
    part(group, trace, p, (k) => {
      k.plate("dark", 1.72, 1.12, 0.08, 0.1, 0, 1, 0);
      k.plate("accent", 0.4, 0.05, 0.1, 0.025, 0, 0.39, 0);
    });
    const face = new Mesh(new PlaneGeometry(1.6, 1), screenMaterial);
    face.position.set(0, 1, 0.045);
    group.add(face);
  });

  // Suma compañeros
  const crew = [BLUE, GREEN].map((accent) => {
    let mate!: ReturnType<typeof createBot>;
    const step = upgrade(accent, (group, p, trace) => {
      mate = createBot(group, molds, trace, p);
    });
    step.group.scale.setScalar(0.5);
    return { ...step, mate };
  });
  const linkMaterial = new LineMaterial({ color: INK, linewidth: 1.4, transparent: true, depthWrite: false });
  const links = segments([0, 0, 0, 0, 0, 0], linkMaterial);
  scene.add(links);
  const sparkMaterial = new MeshBasicMaterial({ color: WARM, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const sparks = crew.map(() => {
    const dot = new Mesh(new SphereGeometry(0.07, 12, 8), sparkMaterial);
    scene.add(dot);
    return dot;
  });

  const upgrades = [
    { step: reader, gain: 0, height: 2 },
    { step: board, gain: 1, height: 2 },
    { step: crew[0], gain: 2, height: 2.4 },
    { step: crew[1], gain: 2, height: 2.4 },
  ];

  /* Flechas que giran alrededor: otra vuelta */
  const loop = new Group();
  loop.position.y = 0.02;
  scene.add(loop);
  const loopMaterial = new MeshBasicMaterial({ color: ACCENT, transparent: true, depthWrite: false });
  const arrow = new Shape();
  arrow.moveTo(0, 0.22);
  arrow.lineTo(0.17, -0.12);
  arrow.lineTo(-0.17, -0.12);
  for (let i = 0; i < 3; i++) {
    const from = (i / 3) * Math.PI * 2;
    const to = from + 1.78;
    loop.add(new Mesh(new RingGeometry(4.02, 4.09, 64, 1, from, 1.72).rotateX(-Math.PI / 2), loopMaterial));
    const tip = new Mesh(new ShapeGeometry(arrow).rotateX(-Math.PI / 2), loopMaterial);
    tip.position.set(Math.cos(to) * 4.055, 0, -Math.sin(to) * 4.055);
    tip.rotation.y = to;
    loop.add(tip);
  }

  /* Luces */
  scene.add(new HemisphereLight(0xbcd0e8, 0x0b0f14, 0.7));
  const key = new DirectionalLight(0xfff1dc, 2.4);
  key.position.set(-4, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.04;
  Object.assign(key.shadow.camera, { left: -6.5, right: 6.5, top: 6, bottom: -6, near: 1, far: 22 });
  scene.add(key);
  const spark = new PointLight(ACCENT, 0, 9);
  scene.add(spark);

  /* Puntos de salida y llegada, en el espacio de `cell` */
  const chest = new Vector3(0, CHEST.y, CHEST.z);
  const sent = new Vector3();
  const landed = new Vector3();
  const point = new Vector3();
  const previous = new Vector3();
  const anchor = (out: Vector3, group: Group, x: number, y: number) => {
    group.updateMatrix();
    return out.set(x, y, 0.1).applyMatrix4(group.matrix);
  };
  const askX = -0.32;
  const askY = -0.72;

  /** Línea de guiones entre dos puntos. */
  const dashes = (a: Vector3, b: Vector3, rise: number, count: number) => {
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      arcPoint(previous, a, b, rise, (i + 0.25) / count);
      arcPoint(point, a, b, rise, (i + 0.75) / count);
      out.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
    }
    return out;
  };

  const crown = new Vector3(0, 3.1, 0);
  const mateTop = [new Vector3(), new Vector3()];
  const target = new Vector3();
  let portrait = false;
  let frameWidth = 1000;
  let fit = 1;
  let near = 1;
  let drop = 0;
  let clock = 0.11; // en ciclos: arranca con un mensaje recién llegado
  let orders = 0;
  let lastCycle = 0;
  let lastStats = "";

  return {
    scene,
    camera,
    resize(aspect) {
      portrait = aspect < 1.15;
      frameWidth = aspect * 1000;
      // En vertical manda el ancho: el plano entra entero y, ya de pie, las
      // ventanas se arriman al bot. Muy apaisado, se aleja para no pisar el título.
      fit = Math.max(1, 1.06 / aspect, aspect / 1.85);
      near = portrait ? 0.78 : 1;
      drop = clamp((aspect - 1.8) / 0.4) * 45;
      ink.linewidth = portrait ? 1.1 : 1.4;

      const pick = portrait ? "tall" : "wide";
      place(chat, spots.chat.flat, spots.chat[pick], 1);
      place(system, spots.system.flat, spots.system[pick], 1);
      anchor(sent, chat, askX, askY);
      anchor(landed, system, 0, ROW_TOP);
      paths.geometry.setPositions([...dashes(sent, chest, 0.7, 12), ...dashes(chest, landed, 0.7, 12)]);

      const [side, low] = portrait ? [1.05, 1.7] : [1.95, 1.75];
      reader.group.position.set(-side, 0.02, low);
      reader.group.rotation.y = 0.35;
      board.group.position.set(side + (portrait ? 0.15 : 0.05), 0.02, low);
      board.group.rotation.y = -0.3;
      for (const u of [reader, board]) u.group.scale.setScalar(portrait ? 0.72 : 1);
      crew.forEach((c, i) => {
        const s = i ? 1 : -1;
        c.group.position.set(s * (portrait ? 2.55 : 4.95), portrait ? 3 : 0.35, portrait ? -0.4 : 0.9);
        c.group.rotation.y = -s * 0.5;
        mateTop[i].copy(c.group.position).setY(c.group.position.y + 1.4);
      });
      links.geometry.setPositions([...dashes(crown, mateTop[0], 0.8, 16), ...dashes(crown, mateTop[1], 0.8, 16)]);
    },
    update({ time, delta, pointerX, pointerY, progress }) {
      const draw = mix(0.4, 1, ramp(progress, 0, 0.17));
      const lift = ramp(progress, 0.22, 0.4);
      const build = ramp(progress, 0.47, 0.67);
      const gains = upgradesAt.map((at) => ramp(progress, at, at + UPGRADE_SPAN));
      const again = ramp(progress, 0.74, 0.8);

      /* Del dibujo al volumen */
      const penX = mix(-SHEET_W / 2, SHEET_W / 2, draw);
      sweep.constant = draw < 1 ? penX : OFF;
      pen.visible = draw < 1;
      pen.position.set(penX, 0.03, 0);
      printMaterial.opacity = mix(1, 0.4, lift);
      stand.rotation.x = mix(-Math.PI / 2, 0, lift);
      stand.position.z = mix(FOOT, 0.1, lift);
      cell.scale.z = mix(FLAT, 1, ramp(lift, 0.25, 1));
      ink.opacity = 1 - build;
      for (const d of drawings) d.visible = build < 1;

      const pick = portrait ? "tall" : "wide";
      place(chat, spots.chat.flat, spots.chat[pick], lift);
      place(system, spots.system.flat, spots.system[pick], lift);
      chat.position.y += Math.sin(time * 1.1) * 0.03 * lift;
      system.position.y += Math.sin(time * 1.1 + 2) * 0.03 * lift;
      editor.position.set(0, 2.3, -1.35);

      const height = build * TOP;
      const rising = Math.sin(Math.PI * build);
      fill.constant = build < 1 ? height : OFF;
      for (const s of solids) s.visible = build > 0;
      front.visible = rising > 0.01;
      front.position.y = height;
      frontMaterial.opacity = rising * 0.06;
      frontInk.opacity = rising;
      for (const l of labelMaterials) l.opacity = ramp(build, 0.4, 0.9);

      /* El código se escribe durante el prototipo y suma líneas con cada mejora */
      const typed = 0.7 * clamp((progress - 0.34) / 0.3) + 0.1 * (gains[0] + gains[1] + gains[2]);
      code.geometry.setDrawRange(0, Math.floor(codeWords * typed) * 6);
      codeMaterial.opacity = lift * mix(0.75, 1, build);

      /* Ritmo: pruebas, producción y, con cada mejora, un poco más rápido */
      const speed = 0.55 * ramp(progress, 0.32, 0.42) + 0.45 * build + 0.2 * (gains[0] + gains[1] + gains[2]);
      const production = build > 0.5;
      clock += (delta * speed) / CYCLE;
      const n = Math.floor(clock);
      const phase = clock - n;
      if (n !== lastCycle) {
        if (production) orders++;
        lastCycle = n;
      }
      const tenths = production ? Math.round((CYCLE / speed) * 10) : 0;
      const stats = `${orders}/${tenths}`;
      if (stats !== lastStats) {
        lastStats = stats;
        onStats?.(orders, tenths);
      }

      /* Llega un mensaje, el bot lo resuelve, carga el pedido y responde */
      const opening = ramp(phase, 0, 0.1);
      pairs.forEach(({ ask, reply }, i) => {
        const slot = i ? i - 1 + opening : 0;
        const leaving = i === PAIRS - 1 ? 1 - opening : 1;
        const askSize = (i ? 1 : ramp(phase, 0.03, 0.11)) * leaving;
        const replySize = (i ? 1 : ramp(phase, 0.83, 0.9)) * leaving;
        ask.position.set(askX, askY + slot * PAIR_STEP, 0.09);
        reply.position.set(0.44, askY - 0.31 + slot * PAIR_STEP, 0.09);
        ask.visible = askSize > 0.01;
        reply.visible = replySize > 0.01;
        ask.scale.setScalar(Math.max(0.01, askSize));
        reply.scale.setScalar(Math.max(0.01, replySize));
      });

      const size = mix(spots.chat.flat.size, spots.chat[pick].size, lift);
      const going = ramp(phase, 0.15, 0.36);
      cardIn.visible = phase > 0.12 && phase < 0.37 && lift > 0.02;
      anchor(sent, chat, askX, askY);
      arcPoint(point, sent, chest, 0.7, going);
      cardIn.position.copy(point);
      cardIn.rotation.y = mix(chat.rotation.y, 0, going);
      cardIn.scale.setScalar(size * ramp(phase, 0.12, 0.15) * mix(1, 0.15, ramp(going, 0.75, 1)) + 0.001);

      const coming = ramp(phase, 0.58, DELIVER);
      cardOut.visible = phase > 0.56 && phase < DELIVER && lift > 0.02;
      anchor(landed, system, 0, ROW_TOP);
      arcPoint(point, chest, landed, 0.7, coming);
      cardOut.position.copy(point);
      cardOut.rotation.y = mix(0, system.rotation.y, coming);
      cardOut.scale.setScalar(size * mix(0.12, 1, ramp(coming, 0, 0.35)));

      const room = phase < DELIVER ? ramp(phase, 0.64, 0.78) : 0;
      rows.forEach((r, i) => {
        const shrink = i === ROWS - 1 ? 1 - room : 1;
        r.position.set(0, ROW_TOP - (i + room) * ROW_STEP, 0.1);
        r.visible = shrink > 0.01;
        r.scale.setScalar(Math.max(0.01, shrink));
      });

      const think = pulse(phase, 0.35, 0.6, 0.06);
      const toChat = pulse(phase, 0.04, 0.36, 0.08);
      const toSystem = pulse(phase, 0.56, 0.86, 0.08);
      const idle = 1 - Math.max(think, toChat, toSystem);
      const awake = lift;
      bot.update({
        time,
        delta,
        alive: awake,
        lookX: (toSystem - toChat) * 0.9 + idle * pointerX * 0.6,
        lookY: think * 0.8 - toChat * 0.15 - idle * pointerY * 0.5,
        think: think * awake,
        happy: pulse(phase, 0.82, 1, 0.05) * awake,
        left: toChat * awake,
        right: toSystem * awake,
      });
      beamMaterial.opacity = ramp(build, 0.1, 0.3) * (0.16 + 0.05 * Math.sin(time * 4));
      pathMaterial.opacity = ramp(lift, 0.8, 1) * 0.55;

      /* Mejoras */
      let flash = 0;
      upgrades.forEach(({ step, gain, height: h }) => {
        const k = gains[gain];
        const up = smooth(clamp(k * 2));
        const solid = clamp(k * 2 - 1);
        const base = step.group.position.y;
        step.group.visible = k > 0;
        step.body.rotation.x = mix(-Math.PI / 2, 0, up);
        step.body.scale.z = mix(FLAT, 1, up);
        step.clip.constant = solid < 1 ? base + solid * h : OFF;
        step.trace.opacity = 1 - solid;
        for (const d of step.drawings) d.visible = solid < 1;
        flash = Math.max(flash, Math.sin(Math.PI * k));
      });
      const lit = gains.map((k) => clamp(k * 4 - 3));

      const scanY = 1.05 + Math.sin(time * 1.6) * 0.52;
      scan.position.set(0, scanY, 0.06);
      scanMaterial.opacity = lit[0] * 0.95;
      rayMaterial.opacity = lit[0] * 0.1;
      ray.visible = lit[0] > 0;
      if (ray.visible) {
        const g = reader.group;
        const s = g.scale.x;
        const dx = Math.cos(g.rotation.y) * 0.46 * s;
        const dz = -Math.sin(g.rotation.y) * 0.46 * s;
        const y = g.position.y - stand.position.y + scanY * s;
        const z = g.position.z - stand.position.z;
        const corners = ray.geometry.attributes.position;
        corners.setXYZ(0, -0.1, 2.75, 0.66);
        corners.setXYZ(1, g.position.x - dx, y, z - dz + 0.05);
        corners.setXYZ(2, g.position.x + dx, y, z + dz + 0.05);
        corners.needsUpdate = true;
      }
      screenMaterial.opacity = lit[1];
      crew.forEach(({ mate }, i) => {
        const s = i ? 1 : -1;
        const t = time * 0.9 + i * 1.7;
        mate.update({
          time: time + i * 1.3,
          delta,
          alive: lit[2],
          lookX: -s * 0.35 + Math.sin(t) * 0.4,
          lookY: Math.sin(t * 0.7) * 0.4,
          think: 0,
          happy: Math.sin(t * 0.8) > 0.8 ? 1 : 0,
          left: lit[2] * Math.max(0, Math.sin(t)) * 0.6,
          right: lit[2] * Math.max(0, -Math.sin(t)) * 0.6,
        });
        arcPoint(sparks[i].position, crown, mateTop[i], 0.8, (time * 0.35 + i * 0.5) % 1);
      });
      linkMaterial.opacity = lit[2] * 0.6;
      sparkMaterial.opacity = lit[2];

      loop.visible = again > 0;
      loop.rotation.y = time * 0.25 + progress * 4;
      loopMaterial.opacity = again * (0.55 + flash * 0.4);

      spark.position.set(0, height + 0.4, 0.6);
      spark.intensity = rising * 26 + flash * 8;

      /* Cámara: desde arriba, como un tablero de dibujo, y después en perspectiva */
      const tilt = ramp(progress, 0.18, 0.44);
      const orbit = ramp(progress, 0.68, 1);
      const elevation = mix(1.5, 0.3, tilt) - pointerY * 0.05 * tilt;
      const azimuth = mix(0, 0.36, tilt) - 0.66 * orbit + pointerX * 0.08 * tilt;
      const distance = mix(26, 20 * near, tilt) * fit + orbit * 1.2;
      target.set(0, mix(0, 1.75, tilt), 0);
      camera.position.set(
        target.x + Math.sin(azimuth) * Math.cos(elevation) * distance,
        target.y + Math.sin(elevation) * distance,
        target.z + Math.cos(azimuth) * Math.cos(elevation) * distance,
      );
      camera.lookAt(target);
      camera.setViewOffset(frameWidth, 1000, portrait ? 0 : -frameWidth * 0.05, -drop, frameWidth, 1000);
    },
  };
}
