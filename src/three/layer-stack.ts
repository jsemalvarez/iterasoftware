import {
  AdditiveBlending,
  CanvasTexture,
  DirectionalLight,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  BoxGeometry,
} from "three";
import type { SceneInstance } from "./types";

const ACCENT = 0xf5a524;
const COUNT = 5;
const SIZE = 4;

type Draw = (c: CanvasRenderingContext2D) => void;

const line = (c: CanvasRenderingContext2D, ...pts: number[]) => {
  c.beginPath();
  for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};

const circle = (c: CanvasRenderingContext2D, x: number, y: number, r: number, fill = false) => {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) c.fill();
  else c.stroke();
};

// Un diagrama por capa, de abajo hacia arriba (lienzo de 512 × 512).
const drawings: Draw[] = [
  // Máquinas: engranajes y una línea
  (c) => {
    for (const [x, y, r] of [[160, 190, 80], [318, 250, 56], [190, 360, 48]]) {
      c.beginPath();
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const k = i % 4 < 2 ? r : r * 0.82;
        c.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k);
      }
      c.stroke();
      circle(c, x, y, r * 0.35);
    }
    c.strokeRect(270, 360, 180, 60);
    for (let i = 0; i < 4; i++) circle(c, 295 + i * 43, 390, 14);
  },
  // Conexión: pistas tipo circuito
  (c) => {
    for (let i = 0; i < 7; i++) {
      const y = 90 + i * 55;
      line(c, 60, y, 150 + i * 12, y, 205 + i * 12, 256 + (i - 3) * 16);
      line(c, 310, 256 + (i - 3) * 16, 365, y, 452, y);
      circle(c, 60, y, 8, true);
      circle(c, 452, y, 8, true);
    }
    c.strokeRect(205, 190, 105, 132);
  },
  // Datos: tabla
  (c) => {
    for (let r = 0; r < 8; r++) {
      for (let k = 0; k < 5; k++) {
        c.globalAlpha = r === 0 ? 0.9 : 0.25 + ((r * 7 + k * 5) % 6) / 10;
        c.fillRect(70 + k * 76, 80 + r * 46, 40 + ((r * 13 + k * 29) % 26), r === 0 ? 16 : 12);
      }
    }
    c.globalAlpha = 1;
    c.strokeRect(50, 56, 412, 400);
  },
  // IA: red neuronal
  (c) => {
    const cols = [3, 5, 5, 2];
    const at = (k: number, i: number) => [95 + k * 108, 256 + (i - (cols[k] - 1) / 2) * 78] as const;
    c.globalAlpha = 0.35;
    for (let k = 0; k < 3; k++)
      for (let i = 0; i < cols[k]; i++) for (let j = 0; j < cols[k + 1]; j++) line(c, ...at(k, i), ...at(k + 1, j));
    c.globalAlpha = 1;
    cols.forEach((n, k) => {
      for (let i = 0; i < n; i++) circle(c, ...at(k, i), 16, true);
    });
  },
  // Tablero: indicadores, barras y curva
  (c) => {
    for (let i = 0; i < 3; i++) {
      c.strokeRect(50 + i * 142, 60, 126, 88);
      c.fillRect(66 + i * 142, 80, 44, 10);
      c.fillRect(66 + i * 142, 106, 80, 22);
    }
    c.strokeRect(50, 170, 412, 290);
    [70, 110, 90, 150, 130, 190, 170, 220].forEach((h, i) => {
      c.globalAlpha = 0.5;
      c.fillRect(72 + i * 48, 440 - h, 28, h);
    });
    c.globalAlpha = 1;
    c.lineWidth = 6;
    line(c, 86, 350, 134, 310, 182, 330, 230, 270, 278, 285, 326, 230, 374, 245, 422, 195);
  },
];

function layerTexture(draw: Draw) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d")!;
  c.strokeStyle = c.fillStyle = "#fff";
  c.lineWidth = 4;
  c.lineJoin = "round";
  draw(c);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Capas de vidrio que se separan con el scroll; la capa activa se enciende. */
export function createLayerStack(): SceneInstance {
  const scene = new Scene();
  scene.environmentIntensity = 0.5;
  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  const root = new Group();
  scene.add(root);

  const layers = drawings.map((draw) => {
    const group = new Group();
    root.add(group);
    const geometry = new BoxGeometry(SIZE, 0.12, SIZE);
    const glass = new MeshStandardMaterial({
      color: 0x18222d,
      metalness: 0.1,
      roughness: 0.15,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    group.add(new Mesh(geometry, glass));
    const edge = new LineBasicMaterial({ color: ACCENT, transparent: true });
    group.add(new LineSegments(new EdgesGeometry(geometry), edge));
    const print = new MeshBasicMaterial({ map: layerTexture(draw), color: ACCENT, transparent: true, depthWrite: false });
    const plane = new Mesh(new PlaneGeometry(SIZE * 0.92, SIZE * 0.92).rotateX(-Math.PI / 2), print);
    plane.position.y = 0.07;
    group.add(plane);
    return { group, glass, edge, print, weight: 0 };
  });

  // Pulsos de datos que suben por las capas
  const pulseGeometry = new SphereGeometry(0.045, 10, 10);
  const pulseMaterial = new MeshBasicMaterial({ color: 0xffc766, transparent: true, blending: AdditiveBlending });
  const pulses = Array.from({ length: 18 }, (_, i) => {
    const mesh = new Mesh(pulseGeometry, pulseMaterial);
    mesh.position.x = (((i * 37) % 17) / 17 - 0.5) * SIZE * 0.8;
    mesh.position.z = (((i * 53) % 19) / 19 - 0.5) * SIZE * 0.8;
    root.add(mesh);
    return mesh;
  });

  // Pedestal
  const pedestal = new Mesh(new BoxGeometry(SIZE * 1.12, 0.3, SIZE * 1.12), new MeshStandardMaterial({ color: 0x151c24, metalness: 0.6, roughness: 0.4 }));
  root.add(pedestal);

  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 8, 5);
  scene.add(key);
  const lamp = new PointLight(ACCENT, 20, 9);
  root.add(lamp);

  let distance = 17;

  return {
    scene,
    camera,
    resize(aspect) {
      distance = Math.max(17, 15 / Math.min(aspect, 1));
    },
    update({ time, delta, pointerX, pointerY, progress }) {
      const active = Math.min(COUNT - 1, Math.floor(progress * COUNT));
      const open = Math.min(1, progress * 4);
      const gap = 0.55 + (open * (2 - open)) * 0.5;
      const ease = delta ? Math.min(1, delta * 6) : 1;

      let y = 0;
      const heights: number[] = [];
      layers.forEach((l, i) => {
        l.weight += ((i === active ? 1 : 0) - l.weight) * ease;
        y += i ? gap : 0;
        heights.push(y);
        l.group.position.set(l.weight * 0.35, y + Math.sin(time * 0.9 + i) * 0.03, l.weight * 0.35);
        l.glass.opacity = 0.35 + l.weight * 0.35;
        l.glass.emissive.setHex(ACCENT).multiplyScalar(l.weight * 0.12);
        l.edge.opacity = 0.25 + l.weight * 0.75;
        l.print.opacity = 0.16 + l.weight * 0.84;
      });
      root.position.y = -y / 2;
      pedestal.position.y = -0.5;
      lamp.position.set(0, heights[active] + 0.5, 0);

      pulses.forEach((p, i) => {
        const k = (time * 0.22 + i / pulses.length) % 1;
        p.position.y = -0.2 + k * (y + 0.6);
        p.scale.setScalar(Math.sin(k * Math.PI) + 0.01);
      });

      root.rotation.y = Math.PI / 4 + (progress - 0.5) * 0.5 + pointerX * 0.12;
      camera.position.set(0, distance * 0.46 - pointerY * 0.5, distance * 0.88);
      camera.lookAt(0, 0, 0);
    },
  };
}
