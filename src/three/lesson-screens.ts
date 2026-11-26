import { trainingAreas } from "@/lib/training";
import { at, C, left, plain, top, type Screen } from "./screen-kit";

/* IA en el día a día */
const ask = at(0.78, 0.86, 2.9, 0.5, 0.16);
const answer = at(-0.62, -0.02, 3.22, 1, 0.16);
const check = at(-0.62, -0.92, 3.22, 0.5, 0.16);

/* Automatizar lo repetitivo */
const steps = ["Llega un correo", "Leer el adjunto", "Cargar los datos", "Avisar al equipo"];
const nodes = [at(-1.2, 0.62, 1.8, 0.6, 0.18), at(1.2, 0.62, 1.8, 0.6, 0.18), at(1.2, -0.42, 1.8, 0.6, 0.18), at(-1.2, -0.42, 1.8, 0.6, 0.18)];
const onSwitch = at(0, -1.06, 1.4, 0.34, 0.1);

/* Leer los datos */
const chart = at(-0.72, -0.02, 3.2, 2.2, 0.12);
const question = at(1.7, 0.58, 1.3, 0.9, 0.2);
const reply = at(1.7, -0.58, 1.3, 0.9, 0.2);
const bars = [0.9, 1.1, 1.02, 0.5, 1.16, 1.3];

/* Tu propio caso */
const tiles = trainingAreas.map((_, i) => at(-1.56 + (i % 3) * 1.56, 0.5 - Math.floor(i / 3) * 1.04, 1.42, 0.9, 0.16));

/** Lo que muestra el pizarrón en cada módulo, en el mismo orden que `trainingModules`. */
export const lessons: Screen[] = [
  {
    file: "asistente",
    cards: [ask, answer, check],
    face(p, c) {
      if (c === ask) {
        p.box(c.x, c.y, c.w, c.h, { fill: C.accent, r: 0.2 });
        p.text("Resumí los reclamos de marzo", c.x, c.y, 0.17, { color: C.ink, align: "center", weight: 600 });
      } else if (c === answer) {
        p.box(c.x, c.y, c.w, c.h, { fill: C.card, stroke: C.line, r: 0.16 });
        [0.9, 0.72, 0.84].forEach((w, i) => p.box(left(c) + 0.2 + (w * 2.6) / 2, top(c) - 0.24 - i * 0.2, w * 2.6, 0.08, { fill: C.line, r: 0.04 }));
        p.text("Fuente: planilla de calidad", left(c) + 0.2, top(c) - 0.84, 0.13, { color: C.blue });
      } else {
        p.box(c.x, c.y, c.w, c.h, { fill: "#12302a", stroke: C.green, r: 0.16 });
        p.text("Revisalo antes de usarlo", c.x, c.y, 0.17, { color: C.green, align: "center", weight: 600 });
      }
    },
  },
  {
    file: "automatización",
    cards: [...nodes, onSwitch],
    under(p) {
      p.line([-1.2, 0.62, 1.2, 0.62, 1.2, -0.42, -1.2, -0.42], C.muted, 0.03);
    },
    face(p, c, i) {
      if (c === onSwitch) {
        p.box(c.x, c.y, c.w, c.h, { fill: "#12302a", stroke: C.green, r: 0.17 });
        p.dot(c.x - 0.44, c.y, 0.07, C.green);
        p.text("Activo", c.x - 0.28, c.y, 0.16, { color: C.green, weight: 600 });
        return;
      }
      plain(p, c, i === 0 ? C.accent : C.line);
      p.text(String(i + 1), left(c) + 0.16, c.y, 0.17, { color: C.accent, mono: true });
      p.text(steps[i], left(c) + 0.38, c.y, 0.17, { weight: 600 });
    },
  },
  {
    file: "tablero",
    cards: [chart, question, reply],
    face(p, c) {
      if (c === chart) {
        plain(p, c);
        p.text("Entregas por día", left(c) + 0.18, top(c) - 0.24, 0.17, { weight: 600 });
        bars.forEach((h, i) => p.box(left(c) + 0.46 + i * 0.46, c.y - 0.84 + h / 2, 0.3, h, { fill: i === 3 ? C.blue : C.accent, r: 0.05 }));
        "LMXJVS".split("").forEach((d, i) => p.text(d, left(c) + 0.46 + i * 0.46, c.y - 0.96, 0.12, { color: C.muted, align: "center" }));
      } else if (c === question) {
        p.box(c.x, c.y, c.w, c.h, { fill: C.card, stroke: C.blue, r: 0.12 });
        p.text("¿Qué pasó", c.x, c.y + 0.13, 0.18, { align: "center", weight: 600 });
        p.text("el jueves?", c.x, c.y - 0.13, 0.18, { align: "center", weight: 600 });
      } else {
        plain(p, c);
        p.text("Faltó material", c.x, c.y + 0.13, 0.15, { align: "center", weight: 600 });
        p.text("Avisar a compras", c.x, c.y - 0.13, 0.13, { color: C.green, align: "center", weight: 600 });
      }
    },
  },
  {
    file: "práctica",
    cards: tiles,
    face(p, c, i) {
      plain(p, c, C.green);
      p.text(trainingAreas[i], c.x, c.y + 0.16, 0.16, { align: "center", weight: 600 });
      p.line([c.x - 0.12, c.y - 0.2, c.x - 0.02, c.y - 0.3, c.x + 0.16, c.y - 0.1], C.green, 0.05);
    },
  },
];
