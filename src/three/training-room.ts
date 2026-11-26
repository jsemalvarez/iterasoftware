import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  SphereGeometry,
  Vector3,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { trainingModules } from "@/lib/training";
import { ACCENT, cast, clamp, createPalette, mix, mold, pulse, ramp, segments } from "./blueprint-kit";
import { botMolds, createBot } from "./bot";
import { lessons } from "./lesson-screens";
import { createPerson, personMolds, type Look } from "./people";
import { cardsTexture, faceGeometry, frame, PLATE_H, PLATE_W, plateTexture, roundedShape } from "./screen-kit";
import type { SceneInstance } from "./types";

const WARM = 0xffc766;
const COUNT = trainingModules.length;
const TABLE = { r: 1.95, y: 0.82 };
const SEAT = 2.55; // distancia de cada persona al centro de la mesa
const BOARD = { y: 3.35, z: -3.1, size: 0.96 };

// Media ronda: de izquierda a derecha, dejando libre el frente
const angles = [192, 158, 122, 58, 22, -12].map((a) => (a * Math.PI) / 180);

const team: Look[] = [
  { shirt: 0x4f8fd0, skin: 0xe5b38a, top: 0xf5a524, head: "helmet" },
  { shirt: 0x3fae8a, skin: 0x9a6443, top: 0x2b1b14, head: "bun" },
  { shirt: 0xd9785c, skin: 0xf0c7a0, top: 0x6b4226, head: "short" },
  { shirt: 0x7d8fe0, skin: 0xc98e62, top: 0x1c1512, head: "bun" },
  { shirt: 0xd9a441, skin: 0x8a583b, top: 0x17110e, head: "short" },
  { shirt: 0x6aa8b8, skin: 0xf2d3b4, top: 0xeef2f5, head: "helmet" },
];

/** Un equipo alrededor de una mesa: cada módulo le suma color, hasta que trabaja solo. */
export function createTrainingRoom(): SceneInstance {
  const scene = new Scene();
  scene.environmentIntensity = 0.45;
  const camera = new PerspectiveCamera(28, 1, 0.1, 80);
  const room = new Group();
  scene.add(room);
  const base = createPalette();

  /* Piso */
  const floor = new Mesh(new CylinderGeometry(3.75, 3.75, 0.12, 72), new MeshStandardMaterial({ color: 0x121a23, roughness: 0.75, metalness: 0.2 }));
  floor.position.y = -0.06;
  floor.receiveShadow = true;
  room.add(floor);
  const rim = new Mesh(new RingGeometry(3.63, 3.69, 96).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: 0x2c3b4b, transparent: true }));
  rim.position.y = 0.006;
  room.add(rim);

  /* Mesa, sillas y computadoras */
  cast(
    room,
    mold((p) => {
      p.cyl("body", TABLE.r, 0.1, 0, TABLE.y, 0);
      p.cyl("dark", 0.55, TABLE.y, 0, TABLE.y / 2, 0);
      p.cyl("dark", 1, 0.06, 0, 0.04, 0);
    }),
    null,
    base,
    true,
  );
  const laptop = mold((p) => {
    p.shape("steel", new BoxGeometry(0.66, 0.035, 0.42), 0, TABLE.y + 0.07, 0.86);
    p.shape("dark", new BoxGeometry(0.66, 0.44, 0.03).rotateX(0.28), 0, TABLE.y + 0.28, 1.12);
  });
  const stool = mold((p) => {
    p.cyl("dark", 0.34, 0.1, 0, 0.46, 0);
    p.cyl("body", 0.07, 0.42, 0, 0.22, 0);
    p.cyl("dark", 0.26, 0.04, 0, 0.03, 0);
  });
  const screenMaterial = new MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, side: DoubleSide, toneMapped: false });
  const logoMaterial = new MeshBasicMaterial({ color: ACCENT, transparent: true, toneMapped: false });
  const screenGeometry = new PlaneGeometry(0.58, 0.36).rotateY(Math.PI).rotateX(0.28);
  const logoGeometry = new RingGeometry(0.05, 0.08, 24, 1, 0, 5.2).rotateX(0.28);

  /* Equipo */
  const molds = personMolds();
  const people = angles.map((a, i) => {
    const seat = new Group();
    seat.position.set(Math.cos(a) * SEAT, 0, -Math.sin(a) * SEAT);
    seat.rotation.y = Math.atan2(-Math.cos(a), Math.sin(a));
    room.add(seat);
    cast(seat, stool, null, base, true);
    cast(seat, laptop, null, base, true);
    const screen = new Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, TABLE.y + 0.28, 1.1);
    const logo = new Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, TABLE.y + 0.29, 1.142);
    seat.add(screen, logo);

    return { seat, person: createPerson(seat, molds, team[i]), lit: 0 };
  });

  // Nivel de cada persona: una luz por módulo aprendido, flotando sobre la cabeza
  const pips = new InstancedMesh(new SphereGeometry(0.055, 12, 10), new MeshBasicMaterial({ toneMapped: false }), people.length * COUNT);
  const off = new Color(0x2c3b4b);
  const on = new Color(ACCENT);
  const tint = new Color();
  const matrix = new Matrix4();
  const above = new Vector3();
  people.forEach(({ seat }, i) => {
    for (let k = 0; k < COUNT; k++) {
      above.set((k - (COUNT - 1) / 2) * 0.17, 2.42, 0).applyAxisAngle(new Vector3(0, 1, 0), seat.rotation.y * 0.35).add(seat.position);
      pips.setMatrixAt(i * COUNT + k, matrix.makeTranslation(above));
      pips.setColorAt(i * COUNT + k, off);
    }
  });
  room.add(pips);

  // Quien enseña, parado junto al pizarrón
  const teacher = createPerson(room, molds, { shirt: ACCENT, skin: 0xd9a27a, top: 0x2a1a12, head: "short" }, true);
  teacher.root.position.set(-2.75, 0, -2.4);
  teacher.root.rotation.y = 0.35;

  // El bot, en el centro de la mesa
  const helper = new Group();
  helper.position.set(0, TABLE.y + 0.02, 0);
  helper.scale.setScalar(0.4);
  room.add(helper);
  const bot = createBot(helper, botMolds(), null, base);
  const beamMaterial = new MeshBasicMaterial({ color: ACCENT, transparent: true, depthWrite: false, side: DoubleSide, blending: AdditiveBlending });
  const beam = new Mesh(new CylinderGeometry(0.3, 0.85, 0.56, 32, 1, true), beamMaterial);
  beam.position.y = 0.34;
  helper.add(beam);

  // Avance del grupo: un anillo en la mesa, en cuatro tramos
  const arcs = trainingModules.map((_, k) => {
    const material = new MeshBasicMaterial({ color: ACCENT, transparent: true, toneMapped: false });
    const arc = new Mesh(new RingGeometry(0.62, 0.7, 32, 1, (k / COUNT) * Math.PI * 2 + 0.06, (Math.PI * 2) / COUNT - 0.12).rotateX(-Math.PI / 2), material);
    arc.position.y = TABLE.y + 0.056;
    room.add(arc);
    return material;
  });

  /* Pizarrón */
  const board = new Group();
  board.position.set(0, BOARD.y, BOARD.z);
  board.scale.setScalar(BOARD.size);
  room.add(board);
  const slab = new Mesh(
    new ExtrudeGeometry(roundedShape(PLATE_W + 0.16, PLATE_H + 0.16, 0.22), { depth: 0.12, bevelEnabled: false }).translate(0, 0, -0.13),
    new MeshStandardMaterial({ color: 0x1d2936, metalness: 0.3, roughness: 0.45 }),
  );
  slab.castShadow = true;
  board.add(slab);
  const legs = cast(
    room,
    mold((p) => {
      for (const s of [-1, 1]) p.cyl("body", 0.06, 1.9, s * 1.7, 0.95, BOARD.z - 0.06);
    }),
    null,
    base,
    true,
  );
  legs.position.y = 0;
  const edge = new LineMaterial({ color: ACCENT, linewidth: 2, transparent: true, opacity: 0.8, depthWrite: false });
  const outline = segments(frame(PLATE_W + 0.16, PLATE_H + 0.16, 0.22), edge);
  outline.position.z = 0.012;
  board.add(outline);

  const plateGeometry = faceGeometry(0, 0, PLATE_W, PLATE_H, 0.16);
  const slides = lessons.map((lesson, i) => {
    const paint = new MeshBasicMaterial({ map: plateTexture(lesson, i, trainingModules[i].title), transparent: true, toneMapped: false });
    const ink = new MeshBasicMaterial({ map: cardsTexture(lesson), transparent: true, toneMapped: false });
    const group = new Group();
    board.add(group);
    const back = new Mesh(plateGeometry, paint);
    back.position.z = 0.006 + i * 0.001;
    back.renderOrder = 2;
    group.add(back);
    const cards = lesson.cards.map((card) => {
      const mesh = new Mesh(faceGeometry(card.x, card.y, card.w, card.h, 0.12), ink);
      mesh.position.set(card.x, card.y, 0.03);
      mesh.renderOrder = 3;
      group.add(mesh);
      return mesh;
    });
    return { group, paint, ink, cards, lesson, weight: i ? 0 : 1 };
  });

  // Lo que se aprende viaja del pizarrón a cada computadora
  const sparkMaterial = new MeshBasicMaterial({ color: WARM, transparent: true, blending: AdditiveBlending, depthWrite: false });
  const sparkGeometry = new SphereGeometry(0.06, 12, 8);
  const from = new Vector3(0, BOARD.y - 1.5, BOARD.z + 0.3);
  const sparks = people.map(({ seat }) => {
    const mesh = new Mesh(sparkGeometry, sparkMaterial);
    room.add(mesh);
    return { mesh, to: new Vector3(0, TABLE.y + 0.4, 1.1).applyAxisAngle(new Vector3(0, 1, 0), seat.rotation.y).add(seat.position) };
  });

  /* Luces */
  scene.add(new HemisphereLight(0xbcd0e8, 0x0b0f14, 0.8));
  const key = new DirectionalLight(0xfff1dc, 2.3);
  key.position.set(-4, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.04;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 22 });
  scene.add(key);
  const glow = new PointLight(ACCENT, 5, 7);
  glow.position.set(0, 2.6, -1.4);
  room.add(glow);

  const target = new Vector3();
  let distance = 17.8;
  let level = 0;

  return {
    scene,
    camera,
    resize(aspect) {
      // Que entren el piso y el pizarrón enteros: en alto, o en ancho si es angosto
      distance = Math.max(17.8, 17.4 / aspect);
    },
    update({ time, delta, pointerX, pointerY, progress }) {
      const active = Math.min(COUNT - 1, Math.floor(progress * COUNT));
      const ease = delta ? Math.min(1, delta * 5) : 1;
      // Cuántos módulos lleva aprendidos el grupo, de 0 a COUNT
      level += (progress * COUNT - level) * ease;
      const learned = clamp(level / (COUNT - 0.25));
      const finale = ramp(level, COUNT - 0.45, COUNT - 0.1);

      /* Pizarrón */
      slides.forEach((s, i) => {
        s.weight += ((i === active ? 1 : 0) - s.weight) * ease;
        const w = s.weight;
        s.group.visible = w > 0.01;
        s.paint.opacity = w;
        s.ink.opacity = w;
        s.cards.forEach((card, k) => {
          const shown = ramp(w, 0.1 + k * 0.1, 0.5 + k * 0.1);
          card.visible = shown > 0.03;
          card.scale.setScalar(Math.max(0.03, shown));
          card.position.z = 0.03 + s.lesson.cards[k].raise * shown + Math.sin(time * 1.6 + k) * 0.012;
        });
      });

      /* Equipo */
      const asking = Math.floor(time / 3.2) % people.length;
      const raise = pulse((time / 3.2) % 1, 0.2, 0.8, 0.14) * (1 - finale);
      people.forEach((p, i) => {
        const goal = mix(0.06, 1, clamp(learned * 1.15 - (i % 3) * 0.04));
        p.lit += (goal - p.lit) * ease;
        // Cada módulo que se completa se festeja con un saltito, de a uno
        const done = level - Math.floor(level + 0.0001);
        const cheer = level > 0.9 ? pulse(done, 0.02 + i * 0.03, 0.2 + i * 0.03, 0.06) : 0;
        p.person.update({
          time: time + i * 1.7,
          lit: p.lit,
          look: Math.sin(time * 0.45 + i * 1.3) * 0.35,
          left: finale * (i % 2 ? 1 : 0.15),
          right: Math.max(asking === i ? raise : 0, finale * (i % 2 ? 0.15 : 1)),
          type: (1 - finale) * (asking === i ? 1 - raise : 1) * clamp(learned * 3),
          happy: Math.max(cheer, finale * 0.5),
        });
        for (let k = 0; k < COUNT; k++) {
          const full = ramp(level, k + 0.62 + i * 0.03, k + 0.82 + i * 0.03);
          pips.setColorAt(i * COUNT + k, tint.copy(off).lerp(on, full));
        }
      });
      if (pips.instanceColor) pips.instanceColor.needsUpdate = true;
      screenMaterial.opacity = mix(0.15, 0.9, learned);
      logoMaterial.opacity = mix(0.15, 1, learned);
      arcs.forEach((material, k) => {
        const full = ramp(level, k + 0.6, k + 0.9);
        material.opacity = mix(0.14, 1, full);
      });

      const point = Math.sin(time * 0.7) * 0.5 + 0.5;
      teacher.update({ time, lit: 1, look: mix(0.1, 0.7, point), left: finale, right: mix(mix(0.46, 0.6, point), 1, finale), type: 0, happy: finale * 0.5 });

      const toBoard = Math.sin(time * 0.5);
      bot.update({
        time,
        delta,
        alive: 1,
        lookX: toBoard,
        lookY: 0.15,
        think: active === 0 ? pulse((time / 4) % 1, 0.1, 0.5, 0.08) : 0,
        happy: Math.max(finale, pulse((time / 6) % 1, 0.7, 0.9, 0.05)),
        left: Math.max(0, toBoard) * 0.5 + finale * 0.5,
        right: Math.max(0, -toBoard) * 0.5 + finale * 0.5,
      });
      beamMaterial.opacity = 0.16 + 0.05 * Math.sin(time * 4);

      sparks.forEach(({ mesh, to }, i) => {
        const t = (time * 0.42 + i / sparks.length) % 1;
        mesh.position.lerpVectors(from, to, t);
        mesh.position.y += Math.sin(Math.PI * t) * 0.7;
        mesh.scale.setScalar(Math.sin(Math.PI * t) + 0.01);
      });
      sparkMaterial.opacity = 1 - finale;
      edge.opacity = 0.55 + 0.35 * finale;
      glow.intensity = 5 + finale * 8;

      /* Cámara: rodea la mesa despacio y al final se acerca */
      const azimuth = mix(-0.34, 0.3, progress) + pointerX * 0.08;
      const elevation = mix(0.36, 0.26, progress) - pointerY * 0.04;
      const d = distance - finale * 0.8;
      target.set(0, 1.9, -0.5);
      camera.position.set(
        target.x + Math.sin(azimuth) * Math.cos(elevation) * d,
        target.y + Math.sin(elevation) * d,
        target.z + Math.cos(azimuth) * Math.cos(elevation) * d,
      );
      camera.lookAt(target);
    },
  };
}
