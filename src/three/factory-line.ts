import {
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Fog,
  GridHelper,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { SceneInstance } from "./types";

const ACCENT = 0xf5a524;
const GOOD = 0x34d399;
const BAD = 0xf87171;

const SLOTS = 9;
const SPACING = 1.55;
const START = -6.2;
const CYCLE = 1.9;
const MOVE = 0.5; // fracción del ciclo en la que la cinta avanza
const PRESS = 2;
const CAMERA = 4;
const EJECT = 6;
const BELT_Y = 1;

const slotX = (slot: number) => START + slot * SPACING;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (t: number) => Math.min(1, Math.max(0, t));
const isDefect = (serial: number) => ((serial % 4) + 4) % 4 === 1;

function gearGeometry() {
  const shape = new Shape();
  const teeth = 12;
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? 0.46 : 0.37;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const hole = new Path();
  hole.absarc(0, 0, 0.14, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return new ExtrudeGeometry(shape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 2,
  })
    .rotateX(-Math.PI / 2)
    .translate(0, 0.025, 0);
}

/** Línea de producción en miniatura: prensa, inspección por visión y rechazo. */
export function createFactoryLine(onStats?: (inspected: number, rejected: number) => void): SceneInstance {
  const scene = new Scene();
  scene.environmentIntensity = 0.45;
  const fog = new Fog(0x0b0f14, 15, 32);
  scene.fog = fog;
  const camera = new PerspectiveCamera(30, 1, 0.1, 80);

  const body = new MeshStandardMaterial({ color: 0x27323f, metalness: 0.35, roughness: 0.45 });
  const dark = new MeshStandardMaterial({ color: 0x12181f, metalness: 0.4, roughness: 0.6 });
  const steel = new MeshStandardMaterial({ color: 0xb9c4cf, metalness: 0.95, roughness: 0.25 });
  const amber = new MeshStandardMaterial({ color: ACCENT, metalness: 0.2, roughness: 0.4 });
  const glow = new MeshStandardMaterial({ color: 0x000000, emissive: ACCENT, emissiveIntensity: 2 });

  const add = (geometry: BufferGeometry, material: Material, x: number, y: number, z: number, parent: Group | Scene = scene) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (w: number, h: number, d: number, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, r);

  /* Piso */
  const floor = add(new PlaneGeometry(80, 80), new MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.9, envMapIntensity: 0.2 }), 0, 0, 0);
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;
  const grid = new GridHelper(60, 60, 0x2a3644, 0x18212b);
  grid.position.y = 0.01;
  scene.add(grid);

  /* Cinta */
  add(box(18, 0.22, 1.5), dark, 0, BELT_Y - 0.11, 0);
  for (const z of [-0.82, 0.82]) {
    add(box(18.2, 0.3, 0.12, 0.04), body, 0, BELT_Y - 0.1, z);
    add(box(18.2, 0.04, 0.02, 0.01), glow, 0, BELT_Y - 0.02, z + Math.sign(z) * 0.065);
  }
  for (let x = -8; x <= 8; x += 4) for (const z of [-0.7, 0.7]) add(box(0.16, 0.9, 0.16, 0.03), body, x, 0.42, z);

  // Listones: dan la sensación de avance de la cinta
  const slats: Mesh[] = [];
  for (let i = 0; i < 24; i++) slats.push(add(box(0.05, 0.02, 1.44, 0.01), body, 0, BELT_Y + 0.005, 0));

  /* Prensa */
  const press = new Group();
  press.position.x = slotX(PRESS);
  scene.add(press);
  for (const x of [-0.45, 0.45]) add(box(0.32, 3.4, 0.4), body, x, 1.7, -1.15, press);
  add(box(1.4, 0.8, 2), body, 0, 3.3, -0.4, press);
  add(box(1.44, 0.14, 2.04, 0.04), amber, 0, 2.95, -0.4, press);
  const ram = new Group();
  press.add(ram);
  add(new CylinderGeometry(0.16, 0.16, 1.3, 24), steel, 0, 0.75, 0, ram);
  add(new CylinderGeometry(0.52, 0.52, 0.28, 32), amber, 0, 0.14, 0, ram);
  const pressLamp = add(new SphereGeometry(0.1, 16, 16), glow.clone(), 0, 3.78, 0.3, press);

  /* Inspección por visión */
  const vision = new Group();
  vision.position.x = slotX(CAMERA);
  scene.add(vision);
  add(box(0.3, 3, 0.3), body, 0, 1.5, -1.15, vision);
  add(box(0.3, 0.3, 1.5), body, 0, 3, -0.55, vision);
  add(box(0.62, 0.7, 0.62), body, 0, 2.75, 0, vision);
  add(new CylinderGeometry(0.2, 0.24, 0.3, 32), steel, 0, 2.3, 0, vision);
  const ringMaterial = glow.clone();
  const ringLight = add(new TorusGeometry(0.3, 0.045, 12, 40), ringMaterial, 0, 2.2, 0, vision);
  ringLight.rotation.x = Math.PI / 2;
  const coneMaterial = new MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false });
  const cone = add(new CylinderGeometry(0.24, 0.68, 1.2, 40, 1, true), coneMaterial, 0, 1.6, 0, vision);
  cone.castShadow = cone.receiveShadow = false;
  const visionLight = new PointLight(ACCENT, 0, 5);
  visionLight.position.set(0, 1.9, 0);
  vision.add(visionLight);

  /* Rechazo */
  const pusher = add(box(0.7, 0.3, 0.8), amber, slotX(EJECT), BELT_Y + 0.22, -1.5);
  add(box(0.9, 1.5, 0.8), body, slotX(EJECT), 0.75, -1.65);
  // Cajón abierto: cuatro paredes con borde rojo
  const rimRed = new MeshStandardMaterial({ color: 0xb91c1c, emissive: BAD, emissiveIntensity: 0.35, roughness: 0.5 });
  const bin = new Group();
  bin.position.set(slotX(EJECT), 0, 1.75);
  scene.add(bin);
  for (const side of [-1, 1]) {
    add(box(1.5, 0.75, 0.08, 0.03), body, 0, 0.38, side * 0.65, bin);
    add(box(0.08, 0.75, 1.3, 0.03), body, side * 0.72, 0.38, 0, bin);
    add(box(1.54, 0.06, 0.1, 0.02), rimRed, 0, 0.76, side * 0.65, bin);
    add(box(0.1, 0.06, 1.36, 0.02), rimRed, side * 0.72, 0.76, 0, bin);
  }

  /* Piezas */
  const gear = gearGeometry();
  const blank = new CylinderGeometry(0.42, 0.42, 0.22, 40).translate(0, 0.11, 0);
  const halo = new TorusGeometry(0.6, 0.025, 10, 48).rotateX(Math.PI / 2).translate(0, 0.03, 0);
  const crack = new CircleGeometry(0.1, 3).rotateX(-Math.PI / 2).translate(0.25, 0.22, 0);
  const pieces = Array.from({ length: SLOTS }, () => {
    const group = new Group();
    scene.add(group);
    const gearMaterial = steel.clone();
    const haloMaterial = new MeshBasicMaterial({ color: GOOD, transparent: true, depthWrite: false });
    const flaw = add(crack, new MeshBasicMaterial({ color: 0x401010 }), 0, 0, 0, group);
    const ring = add(halo, haloMaterial, 0, 0, 0, group);
    ring.castShadow = false;
    return {
      group,
      raw: add(blank, steel, 0, 0, 0, group),
      gear: add(gear, gearMaterial, 0, 0, 0, group),
      gearMaterial,
      haloMaterial,
      ring,
      flaw,
    };
  });

  /* Luces */
  scene.add(new HemisphereLight(0xbcd0e8, 0x0b0f14, 0.5));
  const key = new DirectionalLight(0xfff1dc, 2.4);
  key.position.set(-5, 10, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 9, bottom: -9, near: 1, far: 30 });
  scene.add(key);
  const rim = new PointLight(ACCENT, 45, 20);
  rim.position.set(6, 4, -5);
  scene.add(rim);

  const base = new Vector3();
  const look = new Vector3();
  let portrait = false;
  let frameWidth = 1000;
  let lastStep = NaN;
  const black = new Color(0x000000);
  const green = new Color(GOOD);
  const red = new Color(BAD);

  return {
    scene,
    camera,
    resize(aspect) {
      portrait = aspect < 1;
      frameWidth = aspect * 1000;
      look.set(0.2, 1.3, 0);
      // La línea queda a la derecha (o abajo, en vertical) para despejar el texto
      const distance = portrait ? Math.min(38, 16 / aspect) : 18.5;
      base.set(0.42, 0.4, 0.82).normalize().multiplyScalar(distance).add(look);
      fog.near = distance;
      fog.far = distance + 17;
    },
    update({ time, pointerX, pointerY }) {
      const cycle = time / CYCLE + 100.75;
      const step = Math.floor(cycle);
      const phase = cycle - step;
      const advance = smooth(clamp(phase / MOVE)); // la cinta avanza y después se detiene
      const dwell = clamp((phase - MOVE) / (1 - MOVE));

      if (step !== lastStep) {
        lastStep = step;
        const inspected = step - 100;
        onStats?.(inspected, Math.floor((inspected + 1) / 4));
      }

      slats.forEach((s, i) => {
        s.position.x = -9 + ((i * 0.775 + (step + advance) * SPACING) % 18.6) - 0.3;
      });

      const stroke = Math.sin(dwell * Math.PI) ** 4;
      ram.position.y = BELT_Y + 1.2 - stroke * 0.98;
      (pressLamp.material as MeshStandardMaterial).emissiveIntensity = 0.4 + stroke * 5;

      const scan = Math.sin(dwell * Math.PI);
      let ejecting = false;

      pieces.forEach((p, i) => {
        // Cada pieza ocupa un lugar y vuelve a entrar con otro número de serie
        const slot = (i + step) % SLOTS;
        const serial = step - slot;
        const defect = isDefect(serial);
        const pos = slot - 1 + advance;
        const pressed = slot > PRESS || (slot === PRESS && dwell > 0.5);
        const checked = slot > CAMERA || (slot === CAMERA && dwell > 0.55);
        p.raw.visible = !pressed;
        p.gear.visible = pressed;
        p.flaw.visible = pressed && defect;

        let y = BELT_Y + 0.02;
        let z = 0;
        let tilt = 0;
        p.group.visible = true;
        if (defect && slot === EJECT) {
          ejecting = true;
          const push = smooth(clamp(dwell * 1.7));
          z = push * 1.75;
          const fall = clamp((z - 0.95) / 0.8);
          y -= fall * fall * 0.75;
          tilt = fall * 0.6;
        } else if (defect && slot > EJECT) {
          p.group.visible = false;
        }
        p.group.position.set(slotX(pos), y, z);
        p.group.rotation.set(tilt, serial * 0.7, 0);
        p.group.scale.setScalar(slot === 0 ? advance || 0.001 : slot === SLOTS - 1 ? Math.max(0.001, 1 - dwell) : 1);

        p.ring.visible = checked;
        p.haloMaterial.color.copy(defect ? red : green);
        p.haloMaterial.opacity = 0.9;
        p.gearMaterial.emissive.copy(checked ? (defect ? red : green) : black);
        p.gearMaterial.emissiveIntensity = defect ? 0.55 : 0.12;
        if (slot === CAMERA) {
          const tone = checked ? (defect ? BAD : GOOD) : ACCENT;
          coneMaterial.color.set(tone);
          ringMaterial.emissive.set(tone);
          visionLight.color.set(tone);
        }
      });

      coneMaterial.opacity = scan * 0.22;
      ringMaterial.emissiveIntensity = 0.8 + scan * 3;
      visionLight.intensity = scan * 14;
      pusher.position.z = -1.5 + (ejecting ? Math.sin(clamp(dwell * 1.1) * Math.PI) * 1.25 : 0);

      camera.position.set(base.x + pointerX * 0.9, base.y - pointerY * 0.5, base.z);
      camera.lookAt(look);
      camera.setViewOffset(frameWidth, 1000, portrait ? 0 : -frameWidth * 0.22, portrait ? -265 : -60, frameWidth, 1000);
    },
  };
}
