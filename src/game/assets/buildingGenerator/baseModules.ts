import { BATCH_LAYER } from "../../constants/assets";
import { DOOR } from "../../constants/houses";
import { GLOW_PROFILE } from "../../constants/environment/buildingsWindows";
import { addDoor } from "../facade";
import { windowGlowColor } from "../windows";
import type { IBuildingContext } from "./types";

export interface IBaseModuleOptions {
  faceX: number;
  depth: number;
  baseHeight?: number;
  z?: number;
}

/**
 * 1. Storefront Base: Ground floor retail glass, entrance, and illuminated storefront.
 */
export const addStorefrontBase = (
  ctx: IBuildingContext,
  { faceX, depth, baseHeight = 4.2, z = 0 }: IBaseModuleOptions,
): void => {
  const storeWidth = Math.min(depth * 0.75, 7.0);

  // Storefront glowing display window
  ctx.batch.addBox({
    size: [0.1, baseHeight * 0.7, storeWidth],
    position: [faceX + 0.05, baseHeight * 0.45, z],
    color: windowGlowColor(ctx.random, GLOW_PROFILE.STOREFRONT),
    layer: BATCH_LAYER.GLOW,
  });

  // Entrance door
  addDoor(ctx.batch, {
    faceX,
    z: z - storeWidth * 0.38,
    trim: ctx.trim,
    door: ctx.door,
    hasSteps: false,
  });
};

/**
 * 2. Lobby Base: High-rise commercial glass lobby with metal framing.
 */
export const addLobbyBase = (
  ctx: IBuildingContext,
  { faceX, depth, baseHeight = 4.8 }: IBaseModuleOptions,
): void => {
  const glassSpan = depth * 0.82;

  ctx.batch.addBox({
    size: [0.1, baseHeight * 0.8, glassSpan],
    position: [faceX + 0.04, baseHeight * 0.45, 0],
    color: windowGlowColor(ctx.random, GLOW_PROFILE.STOREFRONT),
    layer: BATCH_LAYER.GLOW,
  });

  // Structural entrance columns
  for (const sz of [-0.35, 0, 0.35]) {
    ctx.batch.addBox({
      size: [0.24, baseHeight, 0.28],
      position: [faceX + 0.1, baseHeight / 2, glassSpan * sz],
      color: ctx.metal,
    });
  }
};

/**
 * 3. Stoop Base: Residential townhouses and brownstones with front steps and door.
 */
export const addStoopBase = (
  ctx: IBuildingContext,
  { faceX, depth, z = -depth * 0.22 }: IBaseModuleOptions,
): void => {
  addDoor(ctx.batch, {
    faceX,
    z,
    trim: ctx.trim,
    door: ctx.door,
    hasSteps: true,
  });
};

/**
 * 4. Porch Base: Suburban covered porch with wooden deck, columns, and roof.
 */
export const addPorchBase = (
  ctx: IBuildingContext,
  { faceX, depth }: IBaseModuleOptions,
): void => {
  const deckDepth = 1.8;
  const deckHeight = 0.4;
  const length = depth * 0.75;
  const roofY = 2.8;
  const colCount = 4;

  // Deck floor
  ctx.batch.addBox({
    size: [deckDepth, deckHeight, length],
    position: [faceX + deckDepth / 2, deckHeight / 2, 0],
    color: ctx.trim,
  });

  // Columns
  const colSize = 0.16;
  for (let c = 0; c < colCount; c += 1) {
    const colZ = -length / 2 + colSize / 2 + (c * (length - colSize)) / (colCount - 1);
    ctx.batch.addBox({
      size: [colSize, roofY - deckHeight, colSize],
      position: [faceX + deckDepth - colSize / 2, (deckHeight + roofY) / 2, colZ],
      color: ctx.trim,
    });
  }

  // Porch roof
  ctx.batch.addBox({
    size: [deckDepth + 0.35, 0.18, length + 0.5],
    position: [faceX + (deckDepth + 0.35) / 2, roofY, 0],
    color: ctx.roof,
  });

  // Front entrance door
  addDoor(ctx.batch, {
    faceX,
    z: 0,
    trim: ctx.trim,
    door: ctx.door,
    hasSteps: false,
  });
};

/**
 * 5. Loading Bay Base: Industrial loading dock with roll-up bay door.
 */
export const addLoadingBayBase = (
  ctx: IBuildingContext,
  { faceX, baseHeight = 4.0 }: IBaseModuleOptions,
): void => {
  const doorHeight = baseHeight * 0.75;
  const doorWidth = 3.2;

  ctx.batch.addBox({
    size: [0.35, doorHeight, doorWidth],
    position: [faceX - 0.05, doorHeight / 2, 0],
    color: DOOR.LAMP.COLOR,
  });
};
