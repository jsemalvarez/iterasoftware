import { CanvasTexture, Shape, ShapeGeometry, SRGBColorSpace } from "three";
import { contour } from "./blueprint-kit";

export const PLATE_W = 5;
export const PLATE_H = 3.4;

export const C = {
  base: "#111922",
  bar: "#1a2531",
  card: "#1c2835",
  line: "#33465a",
  text: "#e8edf2",
  muted: "#8fa3b8",
  accent: "#f5a524",
  green: "#34d399",
  blue: "#6db8ff",
  ink: "#0b0f14",
};

type TextStyle = { color?: string; align?: CanvasTextAlign; weight?: number; mono?: boolean };
type BoxStyle = { fill?: string; stroke?: string; r?: number };

/** Lienzo en las unidades de la placa: origen en el centro, `y` hacia arriba. */
function createPen(scale: number) {
  const canvas = document.createElement("canvas");
  canvas.width = PLATE_W * scale;
  canvas.height = PLATE_H * scale;
  const c = canvas.getContext("2d")!;
  const sans = getComputedStyle(document.body).fontFamily;
  const mono = `${getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono") || "ui-monospace"}, monospace`;
  const X = (x: number) => (x + PLATE_W / 2) * scale;
  const Y = (y: number) => (PLATE_H / 2 - y) * scale;
  return {
    canvas,
    /** Rectángulo redondeado, por su centro. */
    box(x: number, y: number, w: number, h: number, { fill, stroke, r = 0.08 }: BoxStyle) {
      c.beginPath();
      c.roundRect(X(x - w / 2), Y(y + h / 2), w * scale, h * scale, r * scale);
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = 0.018 * scale;
        c.stroke();
      }
    },
    text(s: string, x: number, y: number, size: number, { color = C.text, align = "left", weight = 500, mono: code }: TextStyle = {}) {
      c.font = `${weight} ${size * scale}px ${code ? mono : sans}`;
      c.textAlign = align;
      c.textBaseline = "middle";
      c.fillStyle = color;
      c.fillText(s, X(x), Y(y));
    },
    line(points: number[], color = C.line, width = 0.025) {
      c.beginPath();
      for (let i = 0; i < points.length; i += 2) c.lineTo(X(points[i]), Y(points[i + 1]));
      c.strokeStyle = color;
      c.lineWidth = width * scale;
      c.lineJoin = "round";
      c.stroke();
    },
    dot(x: number, y: number, r: number, fill: string) {
      c.beginPath();
      c.arc(X(x), Y(y), r * scale, 0, Math.PI * 2);
      c.fillStyle = fill;
      c.fill();
    },
    texture() {
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 8;
      return texture;
    },
  };
}

export type Pen = ReturnType<typeof createPen>;

/** Tarjeta que se despega de la placa cuando su capa está activa. */
export type Card = { x: number; y: number; w: number; h: number; raise: number };

export type Screen = {
  file: string;
  cards: Card[];
  /** Lo que queda impreso en la placa, debajo de las tarjetas. */
  under?: (p: Pen) => void;
  /** Lo que va dibujado en cada tarjeta. */
  face: (p: Pen, card: Card, i: number) => void;
};

export const at = (x: number, y: number, w: number, h: number, raise: number): Card => ({ x, y, w, h, raise });
export const left = (c: Card) => c.x - c.w / 2;
export const top = (c: Card) => c.y + c.h / 2;

/** Tarjeta lisa. */
export const plain = (p: Pen, c: Card, stroke = C.line) => p.box(c.x, c.y, c.w, c.h, { fill: C.card, stroke });

export function roundedShape(w: number, h: number, r: number) {
  const shape = new Shape();
  contour(w, h, r).forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  return shape;
}

/** Rectángulo redondeado cuyas UV coinciden con su lugar en la pantalla. */
export function faceGeometry(x: number, y: number, w: number, h: number, r: number) {
  const geometry = new ShapeGeometry(roundedShape(w, h, r));
  const { position, uv } = geometry.attributes;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) + x) / PLATE_W + 0.5, (position.getY(i) + y) / PLATE_H + 0.5);
  }
  return geometry;
}

/** Aristas del contorno de un rectángulo redondeado. */
export const frame = (w: number, h: number, r: number) => {
  const points = contour(w, h, r);
  return points.flatMap(([x, y], i) => {
    const [px, py] = points.at(i - 1)!;
    return [px, py, 0, x, y, 0];
  });
};

/** Marco de ventana con su nombre, y lo impreso debajo de las tarjetas. */
export function plateTexture({ file, under }: Screen, n: number, title: string) {
  const p = createPen(150);
  p.box(0, 0, PLATE_W, PLATE_H, { fill: C.base, r: 0.16 });
  p.box(0, PLATE_H / 2 - 0.17, PLATE_W, 0.34, { fill: C.bar, r: 0 });
  [C.accent, C.muted, C.green].forEach((color, i) => p.dot(-2.3 + i * 0.16, PLATE_H / 2 - 0.17, 0.05, color));
  p.text(file, 0, PLATE_H / 2 - 0.17, 0.14, { color: C.muted, align: "center", mono: true });
  p.box(0, -PLATE_H / 2 + 0.15, PLATE_W, 0.3, { fill: C.bar, r: 0 });
  p.text(`0${n + 1}`, -2.34, -PLATE_H / 2 + 0.15, 0.15, { color: C.accent, mono: true });
  p.text(title, -2.06, -PLATE_H / 2 + 0.15, 0.17, { weight: 600 });
  under?.(p);
  return p.texture();
}

/** Las tarjetas, cada una dibujada en su lugar. */
export function cardsTexture({ cards, face }: Screen) {
  const p = createPen(220);
  cards.forEach((card, i) => face(p, card, i));
  return p.texture();
}
