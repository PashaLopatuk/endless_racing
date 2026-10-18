import * as THREE from "three";

import { GUIDE_SIGN } from "../constants/environment/street";
import { ROAD_HALF_WIDTH } from "../constants/world";
import { getLaneCenterX } from "../util/lane";
import type { IBatchedModel } from "./meshBatch";

const LABEL_FONT_MAX = 50;
const LABEL_FONT_MIN = 34;
const ARROW_FONT_SIZE = 32;
const TEXT_MAX_WIDTH = 460;

const fitLabelFontSize = (
  context: CanvasRenderingContext2D,
  label: string,
): number => {
  let size = LABEL_FONT_MAX;

  while (size > LABEL_FONT_MIN) {
    context.font = `700 ${size}px sans-serif`;

    if (context.measureText(label).width <= TEXT_MAX_WIDTH) {
      return size;
    }

    size -= 2;
  }

  return LABEL_FONT_MIN;
};

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
  context.textAlign = "center";
  context.textBaseline = "middle";

  const labelSize = fitLabelFontSize(context, label);

  context.font = `700 ${labelSize}px sans-serif`;
  context.fillText(label, canvas.width / 2, canvas.height / 2 - 6);
  context.font = `700 ${ARROW_FONT_SIZE}px sans-serif`;
  context.fillText("→", canvas.width / 2, canvas.height / 2 + 36);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
};

/** Gantry with green / blue destination panels over the inner lanes. */
export const createOverheadGuideSign = (seed: number): IBatchedModel => {
  const pairIndex =
    Math.abs(seed) % GUIDE_SIGN.DESTINATION_PAIRS.length;
  const [leftLabel, rightLabel] = GUIDE_SIGN.DESTINATION_PAIRS[pairIndex];
  const { GREEN, BLUE } = GUIDE_SIGN.COLORS;
  const panels = [
    { label: leftLabel, fill: GREEN, lane: 1 },
    { label: rightLabel, fill: BLUE, lane: 2 },
  ] as const;
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
    new THREE.BoxGeometry(
      spanHalf * 2,
      GUIDE_SIGN.BEAM_SIZE[1],
      GUIDE_SIGN.BEAM_SIZE[2],
    ),
    poleMaterial,
  );

  beam.position.y = GUIDE_SIGN.BEAM_Y;
  geometries.push(beam.geometry);
  object.add(beam);

  for (const panel of panels) {
    const texture = drawPanel(panel.label, panel.fill);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(
        GUIDE_SIGN.PANEL_WIDTH,
        GUIDE_SIGN.PANEL_HEIGHT,
      ),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
    );

    textures.push(texture);
    geometries.push(mesh.geometry);
    mesh.position.set(getLaneCenterX(panel.lane), GUIDE_SIGN.PANEL_Y, 0.12);
    object.add(mesh);

    const back = mesh.clone();

    back.position.z = -0.12;
    back.rotation.y = Math.PI;
    object.add(back);
  }

  return {
    object,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      poleMaterial.dispose();

      const materials = new Set<THREE.Material>();

      object.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.Material
        ) {
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
