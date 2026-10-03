import { BATCH_LAYER } from "../constants/assets";
import { MIRRORED_SIDES } from "../constants/world";
import {
  BAY_WINDOW,
  WINDOW_COLORS,
  WINDOW_FRAME,
  WINDOW_KIND,
  WINDOW_SHAPES,
  type FlatWindowKind,
  type GlowProfile,
  type WindowKind,
  type WindowShape,
} from "../constants/environment/buildingsWindows";
import type { Rng } from "../types";
import { mixHex } from "../util/color";
import { chance, pick, randomIn } from "../util/random";
import type { MeshBatch } from "./meshBatch";

export interface WindowPlacement {
  kind: WindowKind;
  /** Local X of the facade plane the window sits in. */
  faceX: number;
  y: number;
  z: number;
  trim: number;
  glow: GlowProfile;
  random: Rng;
}

interface FrameSpec {
  faceX: number;
  y: number;
  z: number;
  width: number;
  height: number;
  color: number;
}

/** Each pane rolls its own light: off, or a random tint at a random brightness. */
export const windowGlowColor = (random: Rng, profile: GlowProfile): number => {
  if (!chance(random, profile.litChance)) {
    return WINDOW_COLORS.DARK_GLASS;
  }
  return mixHex(
    WINDOW_COLORS.DARK_GLASS,
    pick(random, profile.tints),
    randomIn(random, profile.intensity),
  );
};

const addFrame = (
  batch: MeshBatch,
  { faceX, y, z, width, height, color }: FrameSpec,
) => {
  const { DEPTH, BAR } = WINDOW_FRAME;
  const x = faceX + DEPTH / 2;
  batch.addBox({
    size: [DEPTH, BAR, width + BAR],
    position: [x, y + height / 2, z],
    color,
  });
  batch.addBox({
    size: [DEPTH, BAR, width + BAR],
    position: [x, y - height / 2, z],
    color,
  });
  batch.addBox({
    size: [DEPTH, height, BAR],
    position: [x, y, z - width / 2],
    color,
  });
  batch.addBox({
    size: [DEPTH, height, BAR],
    position: [x, y, z + width / 2],
    color,
  });
};

const addPanes = (
  batch: MeshBatch,
  placement: WindowPlacement,
  shape: WindowShape,
  frameColor: number,
) => {
  const { faceX, y, z, glow, random } = placement;
  const glassWidth = shape.width - WINDOW_FRAME.GLASS_MARGIN;
  const glassHeight = shape.height - WINDOW_FRAME.GLASS_MARGIN;
  const paneWidth = glassWidth / shape.panes;
  const hasMullions = shape.panes > 1;
  const firstPaneZ = z - glassWidth / 2 + paneWidth / 2;

  for (let pane = 0; pane < shape.panes; pane += 1) {
    batch.addBox({
      size: [
        WINDOW_FRAME.GLASS_THICKNESS,
        glassHeight,
        hasMullions ? paneWidth - WINDOW_FRAME.MULLION_WIDTH : paneWidth,
      ],
      position: [
        faceX + WINDOW_FRAME.GLASS_OFFSET,
        y,
        firstPaneZ + pane * paneWidth,
      ],
      color: windowGlowColor(random, glow),
      layer: BATCH_LAYER.GLOW,
    });
  }
  for (let mullion = 1; mullion < shape.panes; mullion += 1) {
    batch.addBox({
      size: [
        WINDOW_FRAME.MULLION_DEPTH,
        glassHeight,
        WINDOW_FRAME.MULLION_WIDTH,
      ],
      position: [
        faceX + WINDOW_FRAME.MULLION_OFFSET,
        y,
        z - glassWidth / 2 + mullion * paneWidth,
      ],
      color: frameColor,
    });
  }
};

const addFlatWindow = (
  batch: MeshBatch,
  placement: WindowPlacement,
  kind: FlatWindowKind,
) => {
  const shape = WINDOW_SHAPES[kind];
  const { faceX, y, z, trim } = placement;
  const frameColor = shape.useTrimFrame ? trim : WINDOW_COLORS.FRAME;
  const barX = faceX + WINDOW_FRAME.MULLION_OFFSET;
  const innerHeight = shape.height - WINDOW_FRAME.GLASS_MARGIN;
  const innerWidth = shape.width - WINDOW_FRAME.GLASS_MARGIN;

  batch.addBox({
    size: [WINDOW_FRAME.RECESS_DEPTH, shape.height, shape.width],
    position: [
      faceX + WINDOW_FRAME.RECESS_PROTRUSION - WINDOW_FRAME.RECESS_DEPTH / 2,
      y,
      z,
    ],
    color: WINDOW_COLORS.RECESS,
  });
  addFrame(batch, {
    faceX,
    y,
    z,
    width: shape.width,
    height: shape.height,
    color: frameColor,
  });
  addPanes(batch, placement, shape, frameColor);

  if (shape.hasCross) {
    batch.addBox({
      size: [
        WINDOW_FRAME.MULLION_DEPTH,
        innerHeight,
        WINDOW_FRAME.MULLION_WIDTH,
      ],
      position: [barX, y, z],
      color: frameColor,
    });
  }
  if (shape.hasCross || shape.hasTransom) {
    batch.addBox({
      size: [
        WINDOW_FRAME.MULLION_DEPTH,
        WINDOW_FRAME.MULLION_WIDTH,
        innerWidth,
      ],
      position: [barX, y, z],
      color: frameColor,
    });
  }
  if (shape.hasSill) {
    batch.addBox({
      size: [
        WINDOW_FRAME.SILL_DEPTH,
        WINDOW_FRAME.SILL_HEIGHT,
        shape.width + WINDOW_FRAME.SILL_OVERHANG,
      ],
      position: [
        faceX + WINDOW_FRAME.SILL_OFFSET,
        y - shape.height / 2 - WINDOW_FRAME.SILL_HEIGHT / 2,
        z,
      ],
      color: trim,
    });
  }
};

const addBayWindow = (
  batch: MeshBatch,
  { faceX, y, z, trim, glow, random }: WindowPlacement,
) => {
  const glassY = y + BAY_WINDOW.glassLift;
  batch.addBox({
    size: BAY_WINDOW.box,
    position: [faceX + BAY_WINDOW.boxOffset, y, z],
    color: trim,
  });
  batch.addBox({
    size: BAY_WINDOW.frontGlass,
    position: [faceX + BAY_WINDOW.frontOffset, glassY, z],
    color: windowGlowColor(random, glow),
    layer: BATCH_LAYER.GLOW,
  });
  for (const side of MIRRORED_SIDES) {
    batch.addBox({
      size: BAY_WINDOW.sideGlass,
      position: [
        faceX + BAY_WINDOW.boxOffset,
        glassY,
        z + side * BAY_WINDOW.sideZ,
      ],
      color: windowGlowColor(random, glow),
      layer: BATCH_LAYER.GLOW,
    });
  }
  const [topX, topY] = BAY_WINDOW.topCapOffset;
  const [bottomX, bottomY] = BAY_WINDOW.bottomCapOffset;
  batch.addBox({
    size: BAY_WINDOW.topCap,
    position: [faceX + topX, y + topY, z],
    color: WINDOW_COLORS.FRAME,
  });
  batch.addBox({
    size: BAY_WINDOW.bottomCap,
    position: [faceX + bottomX, y + bottomY, z],
    color: trim,
  });
};

export const addWindow = (
  batch: MeshBatch,
  placement: WindowPlacement,
): void => {
  if (placement.kind === WINDOW_KIND.BAY) {
    addBayWindow(batch, placement);
    return;
  }
  addFlatWindow(batch, placement, placement.kind);
};
