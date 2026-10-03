import { FACADE } from "../constants/environment/buildings";
import { DOOR } from "../constants/houses";
import { BATCH_LAYER } from "../constants/assets";
import type {
  IGlowProfile,
  WindowKind,
} from "../constants/environment/buildingsWindows";
import type { Rng } from "../types";
import { randomizeHex } from "../util/color";
import { chance, pick } from "../util/random";
import type { IMeshBatch } from "./meshBatch";
import { addWindow } from "./windows";

export interface IWindowRowSpec {
  faceX: number;
  depth: number;
  y: number;
  kind: WindowKind;
  trim: number;
  glow: IGlowProfile;
  random: Rng;
  columns?: number;
  skipChance?: number;
}

export interface IDoorSpec {
  faceX: number;
  z: number;
  trim: number;
  door: number;
  hasSteps: boolean;
}

export interface ICorniceSpec {
  width: number;
  depth: number;
  y: number;
  overhang: number;
  height: number;
  color: number;
  x?: number;
  z?: number;
}

export interface IWallSpec {
  width: number;
  height: number;
  depth: number;
  color: number;
  x?: number;
  z?: number;
  baseY?: number;
}

export const pickWallColor = (
  random: Rng,
  palette: readonly number[],
): number => {
  return randomizeHex(pick(random, palette), random);
};

export const columnsForDepth = (depth: number): number => {
  return depth > FACADE.WIDE_DEPTH
    ? FACADE.COLUMNS_WIDE
    : FACADE.COLUMNS_NARROW;
};

/** Z of column `index` when `columns` windows are spread evenly over `span`. */
export const columnZ = (
  index: number,
  columns: number,
  span: number,
): number => {
  const step = span / Math.max(columns - 1, 1);
  return (index - (columns - 1) / 2) * step;
};

/** Main shaded wall volume, standing on `baseY`. */
export const addWall = (
  batch: IMeshBatch,
  { width, height, depth, color, x = 0, z = 0, baseY = 0 }: IWallSpec,
): void => {
  batch.addBox({
    size: [width, height, depth],
    position: [x, baseY + height / 2, z],
    color,
    isShaded: true,
  });
};

export const addWindowRow = (batch: IMeshBatch, spec: IWindowRowSpec): void => {
  const columns = spec.columns ?? columnsForDepth(spec.depth);
  const span = spec.depth * FACADE.SPAN_RATIO;
  const skipChance = spec.skipChance ?? FACADE.SKIP_CHANCE;

  for (let column = 0; column < columns; column += 1) {
    if (chance(spec.random, skipChance)) {
      continue;
    }

    addWindow(batch, {
      kind: spec.kind,
      faceX: spec.faceX,
      y: spec.y,
      z: columnZ(column, columns, span),
      trim: spec.trim,
      glow: spec.glow,
      random: spec.random,
    });
  }
};

export const addCornice = (
  batch: IMeshBatch,
  { width, depth, y, overhang, height, color, x = 0, z = 0 }: ICorniceSpec,
): void => {
  batch.addBox({
    size: [width + overhang * 2, height, depth + overhang * 2],
    position: [x, y + height / 2, z],
    color,
  });
};

export const addDoor = (
  batch: IMeshBatch,
  { faceX, z, trim, door, hasSteps }: IDoorSpec,
): void => {
  batch.addBox({
    size: DOOR.FRAME,
    position: [faceX - DOOR.FRAME_INSET, DOOR.FRAME_Y, z],
    color: trim,
  });
  
  batch.addBox({
    size: DOOR.PANEL,
    position: [faceX + DOOR.PANEL_OFFSET, DOOR.PANEL_Y, z],
    color: door,
  });
  
  batch.addBox({
    size: DOOR.KNOB,
    position: [faceX + DOOR.KNOB_OFFSET, DOOR.PANEL_Y, z + DOOR.KNOB_Z],
    color: trim,
  });
  
  batch.addBox({
    size: DOOR.LAMP.SIZE,
    position: [faceX + DOOR.LAMP.OFFSET, DOOR.LAMP.Y, z + DOOR.LAMP.Z],
    color: DOOR.LAMP.COLOR,
    layer: BATCH_LAYER.GLOW,
  });
  
  if (!hasSteps) {
    return;
  }
  
  const { STEP } = DOOR;
  
  for (let step = 0; step < STEP.COUNT; step += 1) {
    const stepTop = (step + 1) * STEP.HEIGHT;
    
    batch.addBox({
      size: [STEP.DEPTH, stepTop, STEP.WIDTH - step * STEP.WIDTH_SHRINK],
      position: [
        faceX + STEP.OFFSET + (STEP.COUNT - 1 - step) * STEP.RUN,
        stepTop / 2,
        z,
      ],
      color: trim,
    });
  }
};
