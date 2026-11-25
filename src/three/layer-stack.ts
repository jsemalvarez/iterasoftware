import {
  AdditiveBlending,
  BoxGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
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
import { softwareLayers } from "@/lib/software-layers";
import { ACCENT, clamp, mix, ramp, segments, smooth } from "./blueprint-kit";
import {
  codeCard,
  codeLineY,
  document_,
  flow,
  hub,
  neurons,
  panel,
  screens,
  systems,
  table,
  tableRowY,
  wire,
} from "./layer-screens";
import { cardsTexture, faceGeometry, frame, PLATE_H, PLATE_W, plateTexture, roundedShape, type Card } from "./screen-kit";
import type { SceneInstance } from "./types";

const WARM = 0xffc766;
const GREEN = 0x34d399;
const COUNT = softwareLayers.length;
const GAP = 0.92; // separación entre placas
const THICK = 0.09;

/** Punto a una fracción del recorrido de una línea quebrada. */
function along(points: number[], t: number, out: Vector3) {
  const lengths: number[] = [];
  let total = 0;
  for (let i = 2; i < points.length; i += 2) {
    const l = Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]);
    lengths.push(l);
    total += l;
  }
  let rest = clamp(t) * total;
  let k = 0;
  while (k < lengths.length - 1 && rest > lengths[k]) rest -= lengths[k++];
  const f = lengths[k] ? Math.min(1, rest / lengths[k]) : 0;
  out.x = mix(points[k * 2], points[k * 2 + 2], f);
  out.y = mix(points[k * 2 + 1], points[k * 2 + 3], f);
}

/** Lo que se mueve en una capa. `w`: de 0 (en la pila) a 1 (activa). `veil`: de 1 (visible) a 0 (ya pasó). */
type Life = (time: number, w: number, veil: number) => void;
type Stage = { group: Group; cards: Mesh[]; add: (object: Object3D) => void };

/** Altura a la que algo se apoya sobre una tarjeta. */
const over = (card: Card, w: number) => card.raise * w + 0.045;

const flat = (color: number) => new MeshBasicMaterial({ color, transparent: true, toneMapped: false });

const glow = (color = ACCENT) =>
  new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide });

const lives: ((stage: Stage) => Life)[] = [
  // Panel: las barras crecen y un cursor recorre la pantalla
  ({ add }) => {
    const material = flat(ACCENT);
    const bars = [0.34, 0.5, 0.42, 0.66, 0.58, 0.82, 0.74, 0.98].map((h, i) => {
      const bar = new Mesh(new BoxGeometry(0.17, 1, 0.06).translate(0, 0.5, 0.03), material);
      bar.position.set(panel.chart.x - 0.92 + i * 0.263, panel.chart.y - 0.64, 0);
      add(bar);
      return { bar, h };
    });
    const arrow = new Shape();
    for (const [x, y] of [[0, 0], [0.02, -0.4], [0.12, -0.31], [0.2, -0.47], [0.28, -0.43], [0.2, -0.28], [0.33, -0.27]]) {
      if (x || y) arrow.lineTo(x, y);
      else arrow.moveTo(x, y);
    }
    const cursorMaterial = new MeshBasicMaterial({ color: 0xffffff, transparent: true, side: DoubleSide });
    const cursor = new Mesh(new ShapeGeometry(arrow), cursorMaterial);
    const clickMaterial = glow();
    const click = new Mesh(new RingGeometry(0.16, 0.19, 32), clickMaterial);
    add(cursor);
    add(click);
    const stops = [[0.5, -0.1], [1.3, -0.5], [1.5, 0.8], [-0.9, 0.8]];
    return (time, w) => {
      bars.forEach(({ bar, h }, i) => {
        bar.scale.y = Math.max(0.02, h * ramp(w, i * 0.06, 0.5 + i * 0.06) * (1 + 0.04 * Math.sin(time * 1.6 + i)));
        bar.position.z = over(panel.chart, w) - 0.02;
      });
      material.opacity = w;
      const leg = time / 1.8;
      const [from, to] = [stops[Math.floor(leg) % 4], stops[Math.floor(leg + 1) % 4]];
      const t = leg % 1;
      const go = ramp(t, 0.1, 0.75);
      cursor.position.set(mix(from[0], to[0], go), mix(from[1], to[1], go), 0.5 * w + 0.05);
      cursorMaterial.opacity = w;
      click.position.copy(cursor.position).setZ(0.44 * w + 0.04);
      click.scale.setScalar(0.4 + ramp(t, 0.78, 1) * 1.6);
      clickMaterial.opacity = w * (t > 0.78 ? 1 - ramp(t, 0.8, 1) : 0);
    };
  },

  // Lógica: un pedido recorre el diagrama y se enciende la línea de código que lo resuelve
  ({ add }) => {
    const size = flow[0].card;
    const ringMaterial = new LineMaterial({ color: WARM, linewidth: 3, transparent: true, opacity: 0 });
    const ring = segments(frame(size.w, size.h, 0.08), ringMaterial);
    const barMaterial = glow();
    const bar = new Mesh(new PlaneGeometry(codeCard.w - 0.06, 0.22), barMaterial);
    const dotMaterial = flat(WARM);
    const dot = new Mesh(new SphereGeometry(0.08, 16, 12), dotMaterial);
    add(ring);
    add(bar);
    add(dot);
    const routes = [[0, 1, 2, 4], [0, 1, 3, 4]];
    return (time, w) => {
      const lap = time / 5.2;
      const route = routes[Math.floor(lap) % 2];
      const step = (lap % 1) * route.length;
      const k = Math.floor(step);
      const here = flow[route[k]];
      const next = flow[route[Math.min(k + 1, route.length - 1)]];
      const go = ramp(step - k, 0.55, 1);
      const z = over(here.card, w);
      ring.position.set(here.card.x, here.card.y, z);
      ringMaterial.opacity = w * (1 - go);
      dot.position.set(mix(here.card.x, next.card.x, go), mix(here.card.y, next.card.y, go), z + 0.05);
      dotMaterial.opacity = w * Math.sin(Math.PI * go);
      bar.position.set(codeCard.x, codeLineY(here.line), over(codeCard, w) - 0.01);
      barMaterial.opacity = w * 0.32 * (1 - go * 0.7);
    };
  },

  // Inteligencia: lee el documento, piensa y completa los campos
  ({ cards, add }) => {
    const scanMaterial = glow();
    const scan = new Mesh(new PlaneGeometry(document_.w + 0.12, 0.05), scanMaterial);
    add(scan);
    const material = flat(ACCENT);
    const ball = new SphereGeometry(0.085, 16, 12);
    const balls = neurons.map(({ x, y, column }) => {
      const mesh = new Mesh(ball, material);
      mesh.position.set(x, y, 0);
      add(mesh);
      return { mesh, column };
    });
    return (time, w, veil) => {
      const t = (time / 6) % 1;
      const read = ramp(t, 0.02, 0.24);
      scan.position.set(document_.x, document_.y + (0.5 - read) * document_.h, over(document_, w));
      scanMaterial.opacity = w * (t < 0.26 ? 0.9 : 0);
      balls.forEach(({ mesh, column }, i) => {
        const wave = Math.max(0, Math.sin((t - 0.08 - column * 0.06) * 20 + (i % 3) * 0.5)) * (t > 0.06 && t < 0.48 ? 1 : 0);
        mesh.scale.setScalar(0.75 + wave * 0.65 * w);
        mesh.position.z = 0.1 + w * 0.1;
      });
      material.opacity = mix(0.4, 1, w) * veil;
      // Los campos aparecen de a uno y se van juntos
      cards.slice(1).forEach((card, i) => {
        const shown = ramp(t, 0.16 + i * 0.06, 0.22 + i * 0.06) * (1 - ramp(t, 0.96, 1));
        const size = mix(1, shown, smooth(clamp(w * 2 - 1)));
        card.visible = size > 0.05;
        card.scale.setScalar(Math.max(0.05, size));
      });
    };
  },

  // Datos: una consulta recorre la tabla
  ({ add }) => {
    const rowMaterial = glow();
    const row = new Mesh(new PlaneGeometry(table.w - 0.1, 0.28), rowMaterial);
    add(row);
    const body = new MeshStandardMaterial({ color: 0xdbe3ea, roughness: 0.4, transparent: true });
    const band = flat(ACCENT);
    const disks = [0, 1, 2].map((i) => {
      const disk = new Group();
      const drum = new Mesh(new CylinderGeometry(0.42, 0.42, 0.24, 40), body);
      const light = new Mesh(new CylinderGeometry(0.43, 0.43, 0.05, 40), band);
      disk.add(drum, light);
      disk.position.set(1.72, 0.16 + i * 0.3, 0.46);
      add(disk);
      return disk;
    });
    return (time, w, veil) => {
      const at = (time * 1.1) % 5;
      const k = Math.floor(at);
      row.position.set(table.x, mix(tableRowY(k), tableRowY(Math.min(4, k + 1)), ramp(at - k, 0.7, 1)), over(table, w) - 0.01);
      rowMaterial.opacity = w * 0.22 * (1 - (k === 4 ? ramp(at - k, 0.7, 1) : 0));
      disks.forEach((d, i) => {
        d.position.y = 0.16 + i * 0.3 + Math.max(0, Math.sin(time * 2.2 - i * 0.9)) * 0.05 * w;
        d.scale.setScalar(mix(0.7, 1, w));
        d.position.z = mix(0.3, 0.5, w);
      });
      body.opacity = band.opacity = mix(0.5, 1, w) * veil;
    };
  },

  // Conexión: la información va y viene por la API
  ({ add }) => {
    const ringMaterial = glow();
    const ring = new Mesh(new RingGeometry(0.72, 0.76, 48), ringMaterial);
    ring.position.set(hub.x, hub.y, 0.03);
    add(ring);
    const outMaterial = flat(WARM);
    const inMaterial = flat(GREEN);
    const ball = new SphereGeometry(0.065, 14, 10);
    const dots = systems.map((s, i) => {
      const dot = new Mesh(ball, i % 2 ? inMaterial : outMaterial);
      add(dot);
      return { dot, path: wire(s) };
    });
    return (time, w) => {
      dots.forEach(({ dot, path }, i) => {
        const t = (time * 0.42 + i * 0.29) % 1;
        along(path, i % 2 ? 1 - t : t, dot.position);
        dot.position.z = 0.1 * w + 0.04;
        dot.scale.setScalar(Math.sin(Math.PI * t) * 0.6 + 0.6);
      });
      outMaterial.opacity = inMaterial.opacity = w;
      const beat = (time * 0.6) % 1;
      ring.scale.setScalar(0.85 + beat * 0.5);
      ringMaterial.opacity = w * (1 - beat) * 0.8;
    };
  },
];

/** Las pantallas de un software, apiladas: el scroll las va pasando y la activa cobra vida. */
export function createLayerStack(): SceneInstance {
  const scene = new Scene();
  scene.environmentIntensity = 0.35;
  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  const root = new Group();
  scene.add(root);

  const slab = new ExtrudeGeometry(roundedShape(PLATE_W, PLATE_H, 0.16), { depth: THICK, bevelEnabled: false }).translate(0, 0, -THICK);
  const plateFace = faceGeometry(0, 0, PLATE_W, PLATE_H, 0.16);
  const outline = frame(PLATE_W, PLATE_H, 0.16);

  const layers = screens.map((screen, i) => {
    const group = new Group();
    root.add(group);
    // De atrás hacia adelante, para que las transparencias se apilen bien
    const base = (COUNT - i) * 10;
    let order = base;
    const add = (object: Object3D) => {
      order++;
      object.traverse((o) => (o.renderOrder = Math.min(base + 9, order)));
      group.add(object);
    };

    const body = new MeshStandardMaterial({ color: 0x1d2936, metalness: 0.3, roughness: 0.45, transparent: true });
    const paint = new MeshBasicMaterial({ map: plateTexture(screen, i, softwareLayers[i].title), transparent: true, toneMapped: false });
    const ink = new MeshBasicMaterial({ map: cardsTexture(screen), transparent: true, toneMapped: false });
    const edge = new LineMaterial({ color: ACCENT, linewidth: 2, transparent: true, depthWrite: false });
    add(new Mesh(slab, body));
    const face = new Mesh(plateFace, paint);
    face.position.z = 0.006;
    add(face);
    const line = segments(outline, edge);
    line.position.z = 0.012;
    add(line);

    const cards = screen.cards.map((card: Card) => {
      const mesh = new Mesh(faceGeometry(card.x, card.y, card.w, card.h, card === hub ? 0.2 : 0.08), ink);
      mesh.position.set(card.x, card.y, 0.02);
      group.add(mesh);
      mesh.renderOrder = base + 3;
      return mesh;
    });
    order = base + 4;
    const live = lives[i]({ group, cards, add });
    return { group, body, paint, ink, edge, cards, screen, live, weight: i ? 0 : 1 };
  });

  const key = new DirectionalLight(0xffffff, 1.8);
  key.position.set(-3, 6, 8);
  scene.add(key);
  const lamp = new PointLight(ACCENT, 14, 8);
  lamp.position.set(0, 0, 1.6);
  root.add(lamp);

  let distance = 14.4;
  let focus = 0;

  return {
    scene,
    camera,
    resize(aspect) {
      distance = 14.4 * Math.max(1, 0.86 / aspect);
    },
    update({ time, delta, pointerX, pointerY, progress }) {
      const active = Math.min(COUNT - 1, Math.floor(progress * COUNT));
      const ease = delta ? Math.min(1, delta * 5) : 1;
      focus += (active - focus) * ease;

      layers.forEach((l, i) => {
        l.weight += ((i === active ? 1 : 0) - l.weight) * ease;
        const w = l.weight;
        const behind = Math.max(0, i - focus);
        const passed = Math.max(0, focus - i);
        // Las que siguen esperan debajo; la que termina se levanta, se desvanece y
        // reaparece guardada atrás, asomando por arriba
        const stored = ramp(passed, 0.5, 1);
        const away = Math.min(passed, 0.5) * (1 - stored);
        l.group.position.set(
          0,
          away * 1.5 + stored * (0.36 + passed * 0.5) + Math.sin(time * 0.8 + i) * 0.02,
          away * 1.6 - stored * (0.36 + passed * 0.2) - behind * GAP,
        );
        l.group.rotation.set(w * 0.2, w * 0.06, -w * 0.1);
        const veil = passed < 0.5 ? 1 - passed * 2 : stored;
        const solid = veil > 0.5;
        l.body.opacity = veil;
        l.paint.opacity = veil;
        l.ink.opacity = veil;
        l.body.depthWrite = l.paint.depthWrite = l.ink.depthWrite = solid;
        l.paint.color.setScalar(mix(Math.max(0.3, 0.62 - (behind + passed) * 0.1), 1, w));
        l.ink.color.setScalar(mix(0.42, 1, w));
        l.edge.opacity = Math.max(w, 0.22) * veil;
        l.cards.forEach((card, k) => (card.position.z = 0.02 + l.screen.cards[k].raise * w));
        const front = passed < 0.5 ? veil : 0;
        l.live(time, Math.min(w, front), front);
      });

      const t = focus / (COUNT - 1);
      root.rotation.set(-0.86 - pointerY * 0.05, 0, 0.36 - t * 0.12 + pointerX * 0.06);
      root.position.set(0, mix(1.05, -0.55, t), 0);
      camera.position.set(0, distance * 0.13, distance * 0.99);
      camera.lookAt(0, 0, 0);
    },
  };
}
