import { BATCH_LAYER } from "../constants/assets";
import { ROAD_SIGN } from "../constants/environment/street";
import {
  createMeshBatch,
  toStreetModel,
  type IMeshBatch,
  type IStreetModel,
} from "./meshBatch";

type SignBuilder = (
  batch: IMeshBatch,
  faceX: number,
  y: number,
  seed: number,
) => void;

const faceOffsetX = (faceX: number) =>
  ROAD_SIGN.PANEL.FACE_OFFSET * Math.sign(faceX);

const addSpeedSign: SignBuilder = (batch, faceX, y, seed) => {
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
    position: [faceX + faceOffsetX(faceX), y, 0],
    color: SPEED.FACE_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: [SPEED.DIGIT_SIZE[0], digitHeight, SPEED.DIGIT_SIZE[2]],
    position: [faceX + faceOffsetX(faceX), y, 0],
    color: SPEED.DIGIT_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
};

const addWarningSign: SignBuilder = (batch, faceX, y, seed) => {
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
    position: [faceX + faceOffsetX(faceX), y + accent.y, 0],
    color: WARNING.STRIPE_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
};

const addInfoSign: SignBuilder = (batch, faceX, y, seed) => {
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
    position: [faceX + faceOffsetX(faceX), y + INFO.BAND_Y, 0],
    color: palette.band,
    layer: BATCH_LAYER.GLOW,
  });
};

const addRouteSign: SignBuilder = (batch, faceX, y, seed) => {
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
    position: [faceX + faceOffsetX(faceX), y + variant.arrowY, 0],
    color: variant.arrow,
    layer: BATCH_LAYER.GLOW,
  });
};

const addStopSign: SignBuilder = (batch, faceX, y) => {
  const { STOP } = ROAD_SIGN;
  const offsetX = faceOffsetX(faceX);

  batch.addBox({
    size: STOP.FACE_SIZE,
    position: [faceX, y, 0],
    color: STOP.FACE_COLOR,
    layer: BATCH_LAYER.GLOW,
    rotation: [0, 0, Math.PI / 4],
  });
  for (const barY of STOP.BAR_OFFSETS) {
    batch.addBox({
      size: STOP.BAR_SIZE,
      position: [faceX + offsetX, y + barY, 0],
      color: STOP.LETTER_COLOR,
      layer: BATCH_LAYER.GLOW,
    });
  }
};

const addNoEntrySign: SignBuilder = (batch, faceX, y) => {
  const { NO_ENTRY } = ROAD_SIGN;
  const offsetX = faceOffsetX(faceX);

  batch.addBox({
    size: NO_ENTRY.RING_SIZE,
    position: [faceX, y, 0],
    color: NO_ENTRY.RING_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: NO_ENTRY.BAR_SIZE,
    position: [faceX + offsetX, y, 0],
    color: NO_ENTRY.BAR_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
};

const addParkingSign: SignBuilder = (batch, faceX, y) => {
  const { PARKING } = ROAD_SIGN;
  const offsetX = faceOffsetX(faceX);

  batch.addBox({
    size: PARKING.FACE_SIZE,
    position: [faceX, y, 0],
    color: PARKING.FACE_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: PARKING.STEM_SIZE,
    position: [faceX + offsetX, y + PARKING.STEM_Y, 0],
    color: PARKING.SYMBOL_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  batch.addBox({
    size: PARKING.LOOP_SIZE,
    position: [faceX + offsetX, y + PARKING.LOOP_Y, 0],
    color: PARKING.SYMBOL_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
};

const addCrossingSign: SignBuilder = (batch, faceX, y, seed) => {
  const { CROSSING } = ROAD_SIGN;
  const offsetX = faceOffsetX(faceX);
  const stripeIndex = Math.abs(seed) % CROSSING.STRIPE_YS.length;

  batch.addBox({
    size: CROSSING.FACE_SIZE,
    position: [faceX, y, 0],
    color: CROSSING.FACE_COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  for (let index = 0; index <= stripeIndex; index += 1) {
    batch.addBox({
      size: CROSSING.STRIPE_SIZE,
      position: [faceX + offsetX, y + CROSSING.STRIPE_YS[index], 0],
      color: CROSSING.STRIPE_COLOR,
      layer: BATCH_LAYER.GLOW,
    });
  }
};

const SIGN_BUILDERS: readonly SignBuilder[] = [
  addSpeedSign,
  addWarningSign,
  addInfoSign,
  addRouteSign,
  addStopSign,
  addNoEntrySign,
  addParkingSign,
  addCrossingSign,
];

export const createRoadSignModel = (seed: number): IStreetModel => {
  const { POST } = ROAD_SIGN;
  const batch = createMeshBatch();
  const kind = Math.abs(seed) % SIGN_BUILDERS.length;
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

  SIGN_BUILDERS[kind](batch, faceX, signY, seed);

  return toStreetModel(batch, ROAD_SIGN.FOOTPRINT, ROAD_SIGN.FOOTPRINT);
};
