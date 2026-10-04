import { BATCH_LAYER } from "../constants/assets";
import { ROAD_SIGN } from "../constants/environment/street";
import {
  createMeshBatch,
  toStreetModel,
  type IMeshBatch,
  type IStreetModel,
} from "./meshBatch";

const KIND_COUNT = ROAD_SIGN.KINDS.length;

const addSpeedSign = (
  batch: IMeshBatch,
  faceX: number,
  y: number,
  seed: number,
) => {
  const { PANEL, SPEED } = ROAD_SIGN;
  const limitIndex = Math.abs(seed) % SPEED.LIMITS.length;
  const digitHeight = 0.16 + limitIndex * 0.04;

  batch.addBox({
    size: PANEL.FRAME_SIZE,
    position: [faceX, y, 0],
    color: SPEED.FRAME_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: PANEL.INNER_SIZE,
    position: [faceX + PANEL.FACE_OFFSET * Math.sign(faceX), y, 0],
    color: SPEED.FACE_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: [SPEED.DIGIT_SIZE[0], digitHeight, SPEED.DIGIT_SIZE[2]],
    position: [faceX + PANEL.FACE_OFFSET * Math.sign(faceX), y, 0],
    color: SPEED.DIGIT_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
};

const addWarningSign = (
  batch: IMeshBatch,
  faceX: number,
  y: number,
  seed: number,
) => {
  const { PANEL, WARNING } = ROAD_SIGN;
  const accent = WARNING.ACCENTS[Math.abs(seed) % WARNING.ACCENTS.length];

  batch.addBox({
    size: PANEL.RECT_SIZE,
    position: [faceX, y, 0],
    color: WARNING.FACE_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: WARNING.STRIPE_SIZE,
    position: [faceX + PANEL.FACE_OFFSET * Math.sign(faceX), y + accent.y, 0],
    color: WARNING.STRIPE_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
};

const addInfoSign = (
  batch: IMeshBatch,
  faceX: number,
  y: number,
  seed: number,
) => {
  const { PANEL, INFO } = ROAD_SIGN;
  const palette = INFO.COLORS[Math.abs(seed) % INFO.COLORS.length];

  batch.addBox({
    size: PANEL.RECT_SIZE,
    position: [faceX, y, 0],
    color: palette.face,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: INFO.BAND_SIZE,
    position: [faceX + PANEL.FACE_OFFSET * Math.sign(faceX), y + INFO.BAND_Y, 0],
    color: palette.band,
    layer: BATCH_LAYER.GLOW,
  });
};

const addRouteSign = (
  batch: IMeshBatch,
  faceX: number,
  y: number,
  seed: number,
) => {
  const { PANEL, ROUTE } = ROAD_SIGN;
  const variant = ROUTE.COLORS[Math.abs(seed) % ROUTE.COLORS.length];

  batch.addBox({
    size: PANEL.WIDE_SIZE,
    position: [faceX, y, 0],
    color: variant.face,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: ROUTE.ARROW_SIZE,
    position: [
      faceX + PANEL.FACE_OFFSET * Math.sign(faceX),
      y + variant.arrowY,
      0,
    ],
    color: variant.arrow,
    layer: BATCH_LAYER.GLOW,
  });
};

export const createRoadSignModel = (seed: number): IStreetModel => {
  const { POST } = ROAD_SIGN;
  const batch = createMeshBatch();
  const kind = Math.abs(seed) % KIND_COUNT;
  const faceX = POST.SIGN_FACE_X;
  const signY = POST.SIGN_Y;

  batch.addBox({
    size: POST.BASE_SIZE,
    position: [0, POST.BASE_Y, 0],
    color: POST.COLOR,
  });
  batch.addBox({
    size: POST.POLE_SIZE,
    position: [0, POST.POLE_Y, 0],
    color: POST.COLOR,
  });

  switch (kind) {
    case 0:
      addSpeedSign(batch, faceX, signY, seed);
      break;
    case 1:
      addWarningSign(batch, faceX, signY, seed);
      break;
    case 2:
      addInfoSign(batch, faceX, signY, seed);
      break;
    default:
      addRouteSign(batch, faceX, signY, seed);
      break;
  }

  return toStreetModel(batch, ROAD_SIGN.FOOTPRINT, ROAD_SIGN.FOOTPRINT);
};
