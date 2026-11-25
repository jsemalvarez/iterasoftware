import type { PerspectiveCamera, Scene } from "three";

export type SceneInput = {
  /** Segundos animados (se pausan fuera de pantalla). */
  time: number;
  delta: number;
  /** Cursor suavizado, de -1 a 1. */
  pointerX: number;
  pointerY: number;
  /** El usuario pidió reducir movimiento. */
  reduced: boolean;
  /** Avance del scroll dentro de [data-scene-track], de 0 a 1. */
  progress: number;
};

export type SceneInstance = {
  scene: Scene;
  camera: PerspectiveCamera;
  update: (input: SceneInput) => void;
  /** Reencuadra según la proporción del contenedor. */
  resize?: (aspect: number) => void;
};
