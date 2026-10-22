import { BATCH_LAYER } from "../../constants/assets";
import {
  GLOW_PROFILE,
  WINDOW_KIND,
  type WindowKind,
} from "../../constants/environment/buildingsWindows";
import { addWindowRow, columnZ } from "../facade";
import { windowGlowColor } from "../windows";
import type { IBuildingContext } from "./types";

export interface IShaftModuleOptions {
  faceX: number;
  depth: number;
  startY: number;
  height: number;
  floorHeight?: number;
  windowKind?: WindowKind;
  glowProfile?: keyof typeof GLOW_PROFILE;
  columns?: number;
  skipChance?: number;
}

/**
 * 1. Punched Shaft: Repeating floors with punched / grid windows.
 */
export const addPunchedShaft = (
  ctx: IBuildingContext,
  {
    faceX,
    depth,
    startY,
    height,
    floorHeight = 3.2,
    windowKind = WINDOW_KIND.PUNCHED,
    glowProfile = "RESIDENTIAL",
    columns,
    skipChance = 0.05,
  }: IShaftModuleOptions,
): number => {
  const floors = Math.max(1, Math.floor(height / floorHeight));
  const actualFloorStep = height / floors;

  for (let floor = 0; floor < floors; floor += 1) {
    const y = startY + floor * actualFloorStep + actualFloorStep * 0.45;
    addWindowRow(ctx.batch, {
      faceX,
      depth,
      y,
      kind: windowKind,
      trim: ctx.trim,
      glow: GLOW_PROFILE[glowProfile],
      random: ctx.random,
      columns,
      skipChance,
    });
  }

  return floors;
};

/**
 * 2. Pilaster Ribbed Shaft: Art Deco vertical pilasters with recessed window bays.
 */
export const addPilasterRibbedShaft = (
  ctx: IBuildingContext,
  {
    faceX,
    depth,
    startY,
    height,
    pilasterCount = 5,
  }: IShaftModuleOptions & { pilasterCount?: number },
): void => {
  const span = depth * 0.72;
  const step = span / (pilasterCount - 1);

  // Vertical Art Deco pilaster piers
  for (let p = 0; p < pilasterCount; p += 1) {
    const pz = -span / 2 + p * step;
    ctx.batch.addBox({
      size: [0.36, height, 0.46],
      position: [faceX + 0.15, startY + height / 2, pz],
      color: ctx.trim,
    });
  }

  // Vertical glowing window slots
  const floors = Math.max(1, Math.floor(height / 3.2));
  for (let f = 0; f < floors; f += 1) {
    addWindowRow(ctx.batch, {
      faceX,
      depth,
      y: startY + 1.8 + f * 3.2,
      kind: WINDOW_KIND.SLIT,
      trim: ctx.trim,
      glow: GLOW_PROFILE.OFFICE,
      random: ctx.random,
      columns: pilasterCount - 1,
    });
  }
};

/**
 * 3. Curtain Wall Shaft: High-rise commercial glass facade with vertical aluminum mullions.
 */
export const addCurtainWallShaft = (
  ctx: IBuildingContext,
  { faceX, depth, startY, height, floorHeight = 3.6 }: IShaftModuleOptions,
): void => {
  const paneWidth = 2.4;
  const columns = Math.max(3, Math.floor((depth * 0.88) / paneWidth));
  const glassSpan = columns * paneWidth;
  const floors = Math.max(1, Math.floor(height / floorHeight));
  const paneHeight = floorHeight * 0.7;

  for (let floor = 0; floor < floors; floor += 1) {
    const y = startY + floor * floorHeight + floorHeight / 2;

    for (let col = 0; col < columns; col += 1) {
      ctx.batch.addBox({
        size: [0.06, paneHeight, paneWidth - 0.12],
        position: [
          faceX + 0.04,
          y,
          -glassSpan / 2 + paneWidth / 2 + col * paneWidth,
        ],
        color: windowGlowColor(ctx.random, GLOW_PROFILE.OFFICE),
        layer: BATCH_LAYER.GLOW,
      });
    }
  }

  // Mullions
  const glassHeight = floors * floorHeight;
  for (let col = 0; col <= columns; col += 1) {
    ctx.batch.addBox({
      size: [0.12, glassHeight, 0.12],
      position: [
        faceX + 0.08,
        startY + glassHeight / 2,
        -glassSpan / 2 + col * paneWidth,
      ],
      color: ctx.metal,
    });
  }
};

/**
 * 4. Balconies attached to window columns.
 */
export const addBalconiesToShaft = (
  ctx: IBuildingContext,
  {
    faceX,
    depth,
    startY,
    floors,
    floorHeight = 3.2,
    columns = 3,
  }: {
    faceX: number;
    depth: number;
    startY: number;
    floors: number;
    floorHeight?: number;
    columns?: number;
  },
): void => {
  const span = depth * 0.62;
  const bDepth = 1.0;
  const bThickness = 0.12;
  const bWidth = 1.8;
  const rHeight = 0.6;
  const rThickness = 0.05;

  for (let f = 1; f < floors; f += 1) {
    const y = startY + f * floorHeight;

    for (let c = 0; c < columns; c += 1) {
      const z = columnZ(c, columns, span);

      // Floor slab
      ctx.batch.addBox({
        size: [bDepth, bThickness, bWidth],
        position: [faceX + bDepth / 2, y, z],
        color: ctx.trim,
      });

      // Railing
      ctx.batch.addBox({
        size: [rThickness, rHeight, bWidth],
        position: [faceX + bDepth - rThickness / 2, y + rHeight / 2, z],
        color: ctx.trim,
      });
    }
  }
};
