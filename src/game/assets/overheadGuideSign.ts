import * as THREE from "three";

import { GUIDE_SIGN } from "../constants/environment/street";
import { ROAD_HALF_WIDTH } from "../constants/world";
import type { IBatchedModel } from "./meshBatch";

const drawPanel = (label: string, fill: string): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 168;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Guide sign canvas is unavailable");
  }

  context.fillStyle = fill;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f4fff8";
  context.font = "700 72px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, canvas.width / 2, canvas.height / 2 - 8);
  context.font = "700 48px sans-serif";
  context.fillText("→", canvas.width / 2, canvas.height / 2 + 48);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
};

/** Gantry with Downtown / Riverside panels over the lanes. */
export const createOverheadGuideSign = (): IBatchedModel => {
  const spanHalf = ROAD_HALF_WIDTH + GUIDE_SIGN.SPAN_PAST_EDGE;
  const object = new THREE.Group();
  const textures: THREE.CanvasTexture[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const poleMaterial = new THREE.MeshLambertMaterial({
    color: GUIDE_SIGN.POLE.COLOR,
  });

  for (const side of [-1, 1] as const) {
    const pole = new THREE.Mesh(
      new THREE.BoxGeometry(...GUIDE_SIGN.POLE.SIZE),
      poleMaterial,
    );

    pole.position.set(side * spanHalf, GUIDE_SIGN.POLE.Y, 0);
    geometries.push(pole.geometry);
    object.add(pole);
  }

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(spanHalf * 2, GUIDE_SIGN.BEAM_SIZE[1], GUIDE_SIGN.BEAM_SIZE[2]),
    poleMaterial,
  );

  beam.position.y = GUIDE_SIGN.BEAM_Y;
  geometries.push(beam.geometry);
  object.add(beam);

  GUIDE_SIGN.LABELS.forEach((label, index) => {
    const texture = drawPanel(label, GUIDE_SIGN.COLORS[index]);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(GUIDE_SIGN.PANEL_WIDTH, GUIDE_SIGN.PANEL_HEIGHT),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
    );
    const laneSign = index === 0 ? -1 : 1;

    textures.push(texture);
    geometries.push(panel.geometry);
    panel.position.set(laneSign * 2.1, GUIDE_SIGN.PANEL_Y, 0.12);
    object.add(panel);

    const back = panel.clone();

    back.position.z = -0.12;
    back.rotation.y = Math.PI;
    object.add(back);
  });

  return {
    object,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      poleMaterial.dispose();

      const materials = new Set<THREE.Material>();

      object.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          materials.add(child.material);
        }
      });

      materials.forEach((material) => {
        if (material !== poleMaterial) {
          material.dispose();
        }
      });
    },
  };
};
