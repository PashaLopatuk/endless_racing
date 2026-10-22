import * as THREE from "three";
import { GUIDE_SIGN } from "../constants/environment/street";
import { ROAD_HALF_WIDTH } from "../constants/world";
import { getLaneCenterX } from "../util/lane";
import type { IBatchedModel } from "./meshBatch";

const LABEL_FONT_MAX = 42;
const LABEL_FONT_MIN = 28;
const ARROW_FONT_SIZE = 28;
const TEXT_MAX_WIDTH = 420;

const fitLabelFontSize = (
  context: CanvasRenderingContext2D,
  label: string,
): number => {
  let size = LABEL_FONT_MAX;
  while (size > LABEL_FONT_MIN) {
    context.font = `700 ${size}px sans-serif`;
    if (context.measureText(label).width <= TEXT_MAX_WIDTH) return size;
    size -= 2;
  }
  return LABEL_FONT_MIN;
};

const drawPanel = (label: string, fill: string): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 200;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Guide sign canvas is unavailable");

  context.clearRect(0, 0, canvas.width, canvas.height);

  const radius = 24;
  const border = 12;
  const offset = border / 2;

  context.beginPath();
  context.roundRect(
    offset,
    offset,
    canvas.width - border,
    canvas.height - border,
    radius,
  );

  context.fillStyle = fill;
  context.fill();

  context.strokeStyle = "#ffffff";
  context.lineWidth = border;
  context.stroke();

  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const labelSize = fitLabelFontSize(context, label);
  context.font = `700 ${labelSize}px sans-serif`;
  context.fillText(label, canvas.width / 2, canvas.height / 2 - 10);

  context.font = `700 ${ARROW_FONT_SIZE}px sans-serif`;
  context.fillText("↓", canvas.width / 2, canvas.height / 2 + 35);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
};

export const createOverheadGuideSign = (seed: number): IBatchedModel => {
  const pairIndex = Math.abs(seed) % GUIDE_SIGN.DESTINATIONS.length;
  const labels = GUIDE_SIGN.DESTINATIONS[pairIndex];

  const panels = [
    { label: labels[0], lane: 0.5 },
    { label: labels[1], lane: 1.5 },
    { label: labels[2], lane: 2.5 },
  ] as const;

  const spanHalf = ROAD_HALF_WIDTH + GUIDE_SIGN.SPAN_PAST_EDGE;
  const fullSpan = spanHalf * 2;

  const object = new THREE.Group();
  const textures: THREE.CanvasTexture[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const metalMaterial = new THREE.MeshLambertMaterial({
    color: GUIDE_SIGN.POLE.COLOR,
  });

  for (const side of [-1, 1] as const) {
    const pole = new THREE.Mesh(
      new THREE.BoxGeometry(...GUIDE_SIGN.POLE.SIZE),
      metalMaterial,
    );
    pole.position.set(side * spanHalf, GUIDE_SIGN.POLE.Y, 0);
    geometries.push(pole.geometry);
    object.add(pole);
  }

  const trussHeight = GUIDE_SIGN.TRUSS.TOP_Y - GUIDE_SIGN.TRUSS.BOTTOM_Y;
  const centerY = GUIDE_SIGN.TRUSS.BOTTOM_Y + trussHeight / 2;

  const upperBeam = new THREE.Mesh(
    new THREE.BoxGeometry(
      fullSpan,
      ...(GUIDE_SIGN.TRUSS.BEAM_SIZE.slice(1) as [number, number]),
    ),
    metalMaterial,
  );
  upperBeam.position.y = GUIDE_SIGN.TRUSS.TOP_Y;
  geometries.push(upperBeam.geometry);
  object.add(upperBeam);

  const lowerBeam = new THREE.Mesh(
    new THREE.BoxGeometry(
      fullSpan,
      ...(GUIDE_SIGN.TRUSS.BEAM_SIZE.slice(1) as [number, number]),
    ),
    metalMaterial,
  );
  lowerBeam.position.y = GUIDE_SIGN.TRUSS.BOTTOM_Y;
  geometries.push(lowerBeam.geometry);
  object.add(lowerBeam);

  const sectionWidth = fullSpan / GUIDE_SIGN.TRUSS.SECTIONS;
  const startX = -spanHalf;

  for (let i = 0; i <= GUIDE_SIGN.TRUSS.SECTIONS; i++) {
    const currentX = startX + i * sectionWidth;

    const vertical = new THREE.Mesh(
      new THREE.BoxGeometry(
        GUIDE_SIGN.TRUSS.STRUT_SIZE[0],
        trussHeight,
        GUIDE_SIGN.TRUSS.STRUT_SIZE[2],
      ),
      metalMaterial,
    );
    vertical.position.set(currentX, centerY, 0);
    geometries.push(vertical.geometry);
    object.add(vertical);

    if (i < GUIDE_SIGN.TRUSS.SECTIONS) {
      const diagLength = Math.hypot(sectionWidth, trussHeight);
      const diagonal = new THREE.Mesh(
        new THREE.BoxGeometry(
          GUIDE_SIGN.TRUSS.STRUT_SIZE[0],
          diagLength,
          GUIDE_SIGN.TRUSS.STRUT_SIZE[2],
        ),
        metalMaterial,
      );

      const diagCenterX = currentX + sectionWidth / 2;
      diagonal.position.set(diagCenterX, centerY, 0);

      const angle = Math.atan2(sectionWidth, trussHeight);
      diagonal.rotation.z = i % 2 === 0 ? -angle : angle;

      geometries.push(diagonal.geometry);
      object.add(diagonal);
    }
  }

  for (const panel of panels) {
    const texture = drawPanel(panel.label, GUIDE_SIGN.COLORS.NYC_GREEN);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(GUIDE_SIGN.PANEL_WIDTH, GUIDE_SIGN.PANEL_HEIGHT),
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
      }),
    );

    textures.push(texture);
    geometries.push(mesh.geometry);

    mesh.position.set(getLaneCenterX(panel.lane), GUIDE_SIGN.PANEL_Y, 0.15);
    object.add(mesh);

    const back = mesh.clone();
    back.position.z = -0.15;
    back.rotation.y = Math.PI;
    object.add(back);
  }

  return {
    object,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      metalMaterial.dispose();

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
        if (material !== metalMaterial) material.dispose();
      });
    },
  };
};
