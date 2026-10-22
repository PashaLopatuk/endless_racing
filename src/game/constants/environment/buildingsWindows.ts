import type { Range, ValueOf, Vec3Tuple } from "../../types";

export const WINDOW_KIND = {
  PUNCHED: "punched",
  BAY: "bay",
  STRIP: "strip",
  SLIT: "slit",
  GRID: "grid",
  SHOP: "shop",
} as const;

export type WindowKind = ValueOf<typeof WINDOW_KIND>;
export type FlatWindowKind = Exclude<WindowKind, typeof WINDOW_KIND.BAY>;

export interface IWindowShape {
  width: number;
  height: number;
  panes: number;
  hasCross: boolean;
  hasTransom: boolean;
  hasSill: boolean;
  useTrimFrame: boolean;
}

export const WINDOW_SHAPES: Readonly<Record<FlatWindowKind, IWindowShape>> = {
  [WINDOW_KIND.PUNCHED]: {
    width: 1.35,
    height: 1.35,
    panes: 1,
    hasCross: true,
    hasTransom: false,
    hasSill: true,
    useTrimFrame: false,
  },
  [WINDOW_KIND.STRIP]: {
    width: 2.8,
    height: 1.35,
    panes: 2,
    hasCross: false,
    hasTransom: false,
    hasSill: false,
    useTrimFrame: false,
  },
  [WINDOW_KIND.SLIT]: {
    width: 1.1,
    height: 1.25,
    panes: 1,
    hasCross: false,
    hasTransom: false,
    hasSill: true,
    useTrimFrame: true,
  },
  [WINDOW_KIND.GRID]: {
    width: 1.45,
    height: 1.45,
    panes: 1,
    hasCross: true,
    hasTransom: false,
    hasSill: false,
    useTrimFrame: false,
  },
  [WINDOW_KIND.SHOP]: {
    width: 3.6,
    height: 2.5,
    panes: 3,
    hasCross: false,
    hasTransom: true,
    hasSill: false,
    useTrimFrame: true,
  },
};

/**
 * Depth layout along the facade normal (local +X from the wall plane):
 * the recess sinks into the wall, the glass sits just in front of it, the frame and sill stand out further.
 */
export const WINDOW_FRAME = {
  DEPTH: 0.16,
  BAR: 0.1,
  RECESS_DEPTH: 0.22,
  RECESS_PROTRUSION: 0.01,
  GLASS_THICKNESS: 0.05,
  GLASS_OFFSET: 0.05,
  GLASS_MARGIN: 0.18,
  MULLION_DEPTH: 0.1,
  MULLION_WIDTH: 0.07,
  MULLION_OFFSET: 0.06,
  SILL_DEPTH: 0.24,
  SILL_HEIGHT: 0.09,
  SILL_OVERHANG: 0.32,
  SILL_OFFSET: 0.1,
} as const;

export interface IBayWindowLayout {
  box: Vec3Tuple;
  boxOffset: number;
  frontGlass: Vec3Tuple;
  frontOffset: number;
  glassLift: number;
  sideGlass: Vec3Tuple;
  sideZ: number;
  topCap: Vec3Tuple;
  topCapOffset: Vec3Tuple;
  bottomCap: Vec3Tuple;
  bottomCapOffset: Vec3Tuple;
}

export const BAY_WINDOW: IBayWindowLayout = {
  box: [0.72, 1.6, 1.6],
  boxOffset: 0.32,
  frontGlass: [0.08, 1.25, 1.25],
  frontOffset: 0.68,
  glassLift: 0.05,
  sideGlass: [0.44, 1.05, 0.06],
  sideZ: 0.8,
  topCap: [0.84, 0.12, 1.8],
  topCapOffset: [0.34, 0.86, 0],
  bottomCap: [0.88, 0.12, 1.85],
  bottomCapOffset: [0.36, -0.8, 0],
};

export const WINDOW_COLORS = {
  FRAME: 0x1a1c20,
  RECESS: 0x07080b,
  DARK_GLASS: 0x121820,
} as const;

export interface IGlowProfile {
  litChance: number;
  intensity: Range;
  tints: readonly number[];
}

/** How likely a pane is lit and how bright it glows, per building use. */
export const GLOW_PROFILE = {
  RESIDENTIAL: {
    litChance: 0.68,
    intensity: [0.3, 1],
    tints: [0xffd4a0, 0xffc878, 0xf0e0c8, 0xc8d8f0, 0xffe8b8, 0xe8c890],
  },
  OFFICE: {
    litChance: 0.52,
    intensity: [0.25, 0.95],
    tints: [0xcfe3ff, 0x8eb4c4, 0xe8f0ff, 0xe6c48a],
  },
  STOREFRONT: {
    litChance: 0.95,
    intensity: [0.7, 1],
    tints: [0xffe2b0, 0xfff4dc, 0xd8ecff],
  },
} as const satisfies Record<string, IGlowProfile>;
