import { at, C, left, plain, top, type Card, type Screen } from "./screen-kit";

/* Panel */
export const panel = {
  chart: at(-0.42, -0.36, 2.42, 1.62, 0.2),
  list: at(1.59, -0.36, 1.36, 1.62, 0.32),
};

/* Lógica: cada nodo con su línea de código */
export const flow = [
  { label: "Nuevo pedido", card: at(-1.6, 0.82, 1.3, 0.48, 0.2), line: 0 },
  { label: "¿Hay stock?", card: at(-1.6, 0, 1.3, 0.48, 0.24), line: 2 },
  { label: "Reservar", card: at(-0.02, 0, 1.3, 0.48, 0.24), line: 3 },
  { label: "Pedir a compras", card: at(-1.6, -0.9, 1.3, 0.48, 0.24), line: 5 },
  { label: "Avisar al cliente", card: at(-0.02, -0.9, 1.3, 0.48, 0.24), line: 7 },
];
export const codeCard = at(1.55, -0.02, 1.62, 2.24, 0.14);
export const codeLineY = (line: number) => top(codeCard) - 0.24 - line * 0.24;
const code: [string, string][][] = [
  [["async ", C.blue], ["pedido", C.accent], ["(p) {", C.text]],
  [[" const ", C.blue], ["hay = ", C.text], ["stock", C.accent], ["(p)", C.text]],
  [[" if ", C.blue], ["(hay) {", C.text]],
  [["  reservar", C.green], ["(p)", C.text]],
  [[" } ", C.text], ["else", C.blue], [" {", C.text]],
  [["  compras", C.green], ["(p)", C.text]],
  [[" }", C.text]],
  [[" avisar", C.green], ["(p.cliente)", C.text]],
  [["}", C.text]],
];

/* Inteligencia */
export const document_ = at(-1.62, -0.02, 1.3, 2.24, 0.16);
export const neurons = [3, 4, 3].flatMap((n, k) =>
  Array.from({ length: n }, (_, i) => ({ x: -0.5 + k * 0.48, y: (i - (n - 1) / 2) * 0.56 - 0.02, column: k })),
);
const fields = [
  ["Cliente", "Nº 042"],
  ["Producto", "Buje Ø40"],
  ["Cantidad", "250 u."],
  ["Entrega", "12 de marzo"],
];

/* Datos */
export const table = at(-0.72, -0.02, 3.2, 2.24, 0.14);
export const tableRowY = (row: number) => top(table) - 0.62 - row * 0.32;
const rows: [string, string, string, string][] = [
  ["1048", "Nº 042", "Listo", C.green],
  ["1047", "Nº 017", "En curso", C.accent],
  ["1046", "Nº 088", "Listo", C.green],
  ["1045", "Nº 042", "Listo", C.green],
  ["1044", "Nº 061", "Revisar", C.blue],
];

/* Conexión */
export const hub = at(0, -0.02, 1.16, 1.16, 0.34);
export const systems = [
  { label: "ERP", card: at(-1.72, 0.84, 1.24, 0.5, 0.16) },
  { label: "Planillas", card: at(-1.72, -0.02, 1.24, 0.5, 0.16) },
  { label: "Correo", card: at(-1.72, -0.88, 1.24, 0.5, 0.16) },
  { label: "Mensajes", card: at(1.72, 0.84, 1.24, 0.5, 0.16) },
  { label: "Facturación", card: at(1.72, -0.02, 1.24, 0.5, 0.16) },
  { label: "Equipos", card: at(1.72, -0.88, 1.24, 0.5, 0.16) },
];
/** Cable de cada sistema hasta la API. */
export const wire = ({ card }: { card: Card }) => {
  const s = Math.sign(card.x);
  return [card.x - s * 0.62, card.y, s * 0.85, card.y, s * 0.85, hub.y, s * 0.58, hub.y];
};

/** Una pantalla por capa, en el mismo orden que `softwareLayers`. */
export const screens: Screen[] = [
  {
    file: "panel",
    cards: [at(-2.06, -0.02, 0.56, 2.3, 0.1), at(-1.02, 0.82, 1.22, 0.6, 0.18), at(0.28, 0.82, 1.22, 0.6, 0.18), at(1.6, 0.82, 1.34, 0.6, 0.18), panel.chart, panel.list],
    face(p, c, i) {
      if (i === 0) {
        plain(p, c);
        for (let k = 0; k < 5; k++) p.box(c.x, top(c) - 0.3 - k * 0.42, 0.26, 0.26, { fill: k === 0 ? C.accent : C.line, r: 0.07 });
      } else if (i < 4) {
        const [label, value, color] = [
          ["Pedidos", "128", C.text],
          ["En curso", "24", C.accent],
          ["Listos", "104", C.green],
        ][i - 1];
        plain(p, c);
        p.text(label, left(c) + 0.12, c.y + 0.15, 0.135, { color: C.muted });
        p.text(value, left(c) + 0.12, c.y - 0.11, 0.28, { color, weight: 700 });
      } else if (c === panel.chart) {
        plain(p, c);
        p.text("Pedidos por semana", left(c) + 0.14, top(c) - 0.2, 0.145, { weight: 600 });
        for (let k = 0; k < 4; k++) p.line([left(c) + 0.14, c.y - 0.62 + k * 0.3, c.x + c.w / 2 - 0.14, c.y - 0.62 + k * 0.3], "#263646", 0.012);
      } else {
        plain(p, c);
        p.text("Hoy", left(c) + 0.14, top(c) - 0.2, 0.145, { weight: 600 });
        ["Preparar 1048", "Enviar 1046", "Revisar 1044", "Llamar Nº 017"].forEach((s, k) => {
          const y = top(c) - 0.52 - k * 0.29;
          p.dot(left(c) + 0.2, y, 0.05, k < 2 ? C.green : C.accent);
          p.text(s, left(c) + 0.34, y, 0.125, { color: k < 2 ? C.muted : C.text });
        });
      }
    },
  },
  {
    file: "reglas",
    cards: [...flow.map((n) => n.card), codeCard],
    under(p) {
      for (const l of [
        [-1.6, 0.82, -1.6, 0],
        [-1.6, 0, -0.02, 0],
        [-1.6, 0, -1.6, -0.9],
        [-0.02, 0, -0.02, -0.9],
        [-1.6, -0.9, -0.02, -0.9],
      ])
        p.line(l, C.muted, 0.022);
      p.text("sí", -0.8, 0.12, 0.13, { color: C.green, align: "center", weight: 600 });
      p.text("no", -1.48, -0.45, 0.13, { color: C.accent, weight: 600 });
    },
    face(p, c, i) {
      if (c === codeCard) {
        plain(p, c);
        code.forEach((parts, line) => {
          let x = left(c) + 0.1;
          for (const [s, color] of parts) {
            p.text(s, x, codeLineY(line), 0.118, { color, mono: true });
            x += s.length * 0.118 * 0.6;
          }
        });
        return;
      }
      plain(p, c, i === 1 ? C.accent : i === 2 ? C.green : C.line);
      p.text(flow[i].label, c.x, c.y, 0.145, { align: "center", weight: 600 });
    },
  },
  {
    file: "modelo-ia",
    cards: [document_, ...fields.map((_, i) => at(1.58, 0.85 - i * 0.58, 1.5, 0.48, 0.26))],
    under(p) {
      for (const a of neurons) for (const b of neurons) if (b.column === a.column + 1) p.line([a.x, a.y, b.x, b.y], "#2a3b4c", 0.014);
      for (const n of neurons) {
        if (n.column === 0) p.line([-0.97, document_.y, n.x, n.y], "#2a3b4c", 0.014);
        if (n.column === 2) p.line([n.x, n.y, 0.83, n.y], "#2a3b4c", 0.014);
      }
      fields.forEach((_, i) => p.box(1.58, 0.85 - i * 0.58, 1.5, 0.48, { stroke: "#2a3b4c" }));
    },
    face(p, c, i) {
      if (c === document_) {
        p.box(c.x, c.y, c.w, c.h, { fill: "#e3e9ef" });
        p.text("Orden de compra", left(c) + 0.12, top(c) - 0.22, 0.13, { color: C.ink, weight: 700 });
        for (let k = 0; k < 8; k++) {
          const y = top(c) - 0.52 - k * 0.2;
          const w = [0.9, 0.62, 1, 0.5, 0.84, 0.7, 0.96, 0.4][k];
          const marked = k === 1 || k === 3 || k === 5 || k === 7;
          p.box(left(c) + 0.12 + w / 2, y, w, marked ? 0.12 : 0.06, { fill: marked ? C.accent : "#b4c0cc", r: 0.03 });
        }
        return;
      }
      const [label, value] = fields[i - 1];
      plain(p, c);
      p.text(label, left(c) + 0.12, c.y + 0.1, 0.11, { color: C.muted });
      p.text(value, left(c) + 0.12, c.y - 0.08, 0.15, { weight: 600 });
      p.dot(c.x + c.w / 2 - 0.2, c.y, 0.07, C.green);
    },
  },
  {
    file: "base-de-datos",
    cards: [table, at(1.72, -0.86, 1.24, 0.56, 0.22)],
    under(p) {
      p.line([0.88, -0.02, 1.1, -0.02, 1.1, 0.5, 1.3, 0.5], C.muted, 0.022);
      p.line([1.72, 0.1, 1.72, -0.58], C.muted, 0.022);
    },
    face(p, c) {
      plain(p, c);
      if (c !== table) {
        p.text("Copia diaria", left(c) + 0.14, c.y + 0.11, 0.13, { weight: 600 });
        p.text("Al día", left(c) + 0.14, c.y - 0.11, 0.12, { color: C.green, weight: 600 });
        return;
      }
      const columns = [0.16, 0.86, 1.72, 2.62];
      p.box(c.x, top(c) - 0.26, c.w - 0.02, 0.34, { fill: C.bar, r: 0.06 });
      ["Pedido", "Cliente", "Estado", "Total"].forEach((s, k) => p.text(s, left(c) + columns[k], top(c) - 0.26, 0.13, { color: C.muted, weight: 600 }));
      rows.forEach(([id, client, state, color], r) => {
        const y = tableRowY(r);
        p.text(id, left(c) + columns[0], y, 0.14, { mono: true });
        p.text(client, left(c) + columns[1], y, 0.135, { color: C.muted });
        p.dot(left(c) + columns[2] + 0.04, y, 0.04, color);
        p.text(state, left(c) + columns[2] + 0.14, y, 0.13, { color });
        p.box(left(c) + columns[3] + 0.2, y, [0.36, 0.24, 0.4, 0.3, 0.2][r], 0.07, { fill: C.line, r: 0.035 });
        if (r) p.line([left(c) + 0.1, y + 0.16, c.x + c.w / 2 - 0.1, y + 0.16], "#263646", 0.01);
      });
    },
  },
  {
    file: "integraciones",
    cards: [hub, ...systems.map((s) => s.card)],
    under(p) {
      for (const s of systems) p.line(wire(s), C.muted, 0.022);
    },
    face(p, c, i) {
      if (c === hub) {
        p.box(c.x, c.y, c.w, c.h, { fill: C.accent, r: 0.2 });
        p.text("API", c.x, c.y, 0.4, { color: C.ink, align: "center", weight: 700 });
        return;
      }
      plain(p, c);
      p.dot(left(c) + 0.18, c.y, 0.055, C.green);
      p.text(systems[i - 1].label, left(c) + 0.32, c.y, 0.15, { weight: 600 });
    },
  },
];
