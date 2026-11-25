import { CanvasTexture, SRGBColorSpace } from "three";

export const SHEET_W = 13;
export const SHEET_D = 8.6;
/** Línea del piso del dibujo: la altura `y` de una pieza cae en `FOOT - y`. */
export const FOOT = 2.2;

const INK = "rgba(169,209,247,0.9)";
const AMBER = "rgba(245,165,36,0.95)";

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext("2d")!] as const;
}

/** Papel en blanco, con su cuadrícula. */
export function paperTexture() {
  const S = 96;
  const [canvas, c] = createCanvas(SHEET_W * S, Math.round(SHEET_D * S));
  c.fillStyle = "#0f2133";
  c.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 1; i < SHEET_W * 2; i++) {
    c.fillStyle = i % 4 === 1 ? "#1c3650" : "#152b41";
    c.fillRect(i * 0.5 * S - 1, 0, 2, canvas.height);
    c.fillRect(0, (i * 0.5 - 0.2) * S - 1, canvas.width, 2);
  }
  return toTexture(canvas);
}

/** Lo impreso en el plano: marco, ejes, flujo, cotas y referencias. */
export function sheetTexture() {
  const S = 160; // píxeles por unidad
  const [canvas, c] = createCanvas(SHEET_W * S, SHEET_D * S);
  const X = (x: number) => (x + SHEET_W / 2) * S;
  const Z = (z: number) => (z + SHEET_D / 2) * S;
  const path = (...pts: number[]) => {
    c.beginPath();
    for (let i = 0; i < pts.length; i += 2) c.lineTo(X(pts[i]), Z(pts[i + 1]));
    c.stroke();
  };
  const text = (s: string, x: number, z: number, size: number, align: CanvasTextAlign = "center") => {
    c.font = `500 ${size}px monospace`;
    c.textAlign = align;
    c.textBaseline = "middle";
    c.fillText(s, X(x), Z(z));
  };
  const arrow = (x: number, z: number, dx: number, dz: number) => {
    c.beginPath();
    c.moveTo(X(x), Z(z));
    c.lineTo(X(x + dx * 0.2 - dz * 0.06), Z(z + dz * 0.2 - dx * 0.06));
    c.lineTo(X(x + dx * 0.2 + dz * 0.06), Z(z + dz * 0.2 + dx * 0.06));
    c.fill();
  };

  // Marco con zonas
  c.strokeStyle = c.fillStyle = "rgba(169,209,247,0.7)";
  c.lineWidth = 4;
  c.strokeRect(X(-6.3), Z(-4.1), 12.6 * S, 8.2 * S);
  c.lineWidth = 2;
  c.strokeRect(X(-6.05), Z(-3.85), 12.1 * S, 7.7 * S);
  for (let i = 0; i < 6; i++) {
    const x = -5.04 + i * 2.016;
    for (const z of [-3.975, 3.975]) text(String(i + 1), x, z, 24);
    if (i) for (const s of [-1, 1]) path(x - 1.008, s * 3.85, x - 1.008, s * 4.1);
  }
  ["A", "B", "C", "D"].forEach((l, i) => {
    for (const x of [-6.175, 6.175]) text(l, x, -2.89 + i * 1.925, 24);
  });

  // Ejes
  c.lineWidth = 2.5;
  c.setLineDash([34, 10, 6, 10]);
  path(0, -3.1, 0, 2.6);
  path(-5.2, FOOT, 5.2, FOOT);
  c.setLineDash([14, 12]);
  c.beginPath();
  c.arc(X(0), Z(FOOT - 2.74), 1.5 * S, 0, Math.PI * 2);
  c.stroke();
  c.setLineDash([]);

  // Por dónde va la información
  c.strokeStyle = c.fillStyle = AMBER;
  c.lineWidth = 5;
  for (const [from, to] of [
    [-2.78, -2.36],
    [2.36, 2.7],
  ]) {
    path(from, 0.25, to - 0.12, 0.25);
    arrow(to, 0.25, -1, 0);
  }

  // Cotas
  c.lineWidth = 3;
  path(-4.7, -3.3, -1.75, -3.3);
  path(1.75, -3.3, 4.85, -3.3);
  for (const x of [-4.7, 4.85]) path(x, -3.65, x, -3.18);
  arrow(-4.7, -3.3, 1, 0);
  arrow(4.85, -3.3, -1, 0);
  text("DEL MENSAJE AL PEDIDO", 0, -3.3, 34);
  path(5.5, -1.9, 5.5, -0.2);
  path(5.5, 0.5, 5.5, FOOT);
  for (const z of [-1.9, FOOT]) path(5.15, z, 5.62, z);
  arrow(5.5, -1.9, 0, 1);
  arrow(5.5, FOOT, 0, -1);
  text("24/7", 5.5, 0.15, 34);

  // Referencias numeradas
  const note = (n: string, label: string, x: number, z: number, tx: number, tz: number) => {
    c.strokeStyle = INK;
    c.lineWidth = 3;
    path(x, z, tx, tz);
    c.beginPath();
    c.arc(X(tx), Z(tz), 30, 0, Math.PI * 2);
    c.fillStyle = "#0f2133";
    c.fill();
    c.stroke();
    c.fillStyle = INK;
    text(n, tx, tz, 28);
    text(label, tx + 0.28, tz, 28, "left");
  };
  note("1", "MENSAJES", -4.4, -1, -5.2, -2.3);
  note("2", "ENTIENDE", -0.75, -0.95, -1.7, -2.55);
  note("3", "DECIDE", -0.2, 0.95, -1.35, 2.75);
  note("4", "ACTÚA", 0.95, 1.4, 1.5, 2.75);
  note("5", "SISTEMA", 4.2, -0.85, 4.6, -2.3);

  // Rótulo
  c.lineWidth = 2.5;
  c.strokeRect(X(3.05), Z(2.95), 3 * S, 0.9 * S);
  path(3.05, 3.4, 6.05, 3.4);
  path(4.9, 3.4, 4.9, 3.85);
  text("BOT DE PEDIDOS", 3.2, 3.18, 30, "left");
  text("ITERA · HOJA 1/1", 3.2, 3.63, 26, "left");
  text("REV 0.0", 5.05, 3.63, 26, "left");

  return toTexture(canvas);
}

/** Título de una ventana. */
export function labelTexture(text: string) {
  const [canvas, c] = createCanvas(512, 64);
  c.fillStyle = "#e3e9ef";
  c.font = "600 42px sans-serif";
  c.textBaseline = "middle";
  c.fillText(text, 4, 34);
  return toTexture(canvas);
}

/** Tablero de la segunda mejora. */
export function screenTexture() {
  const [canvas, c] = createCanvas(512, 320);
  c.fillStyle = "#101820";
  c.fillRect(0, 0, 512, 320);
  c.fillStyle = "#e3e9ef";
  c.font = "600 34px sans-serif";
  c.fillText("Pedidos por día", 30, 56);
  c.fillStyle = "#f5a524";
  [60, 84, 72, 104, 96, 128, 120, 152, 146, 176].forEach((h, i) => {
    c.globalAlpha = 0.45 + i * 0.055;
    c.fillRect(30 + i * 46, 290 - h, 30, h);
  });
  c.globalAlpha = 1;
  c.fillStyle = "#34d399";
  for (let i = 0; i < 3; i++) c.fillRect(386 + i * 34, 32, 24, 24);
  return toTexture(canvas);
}
