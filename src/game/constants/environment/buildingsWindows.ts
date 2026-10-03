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

export interface WindowShape {
  width: number;
  height: number;
  panes: number;
  hasCross: boolean;
  hasTransom: boolean;
  hasSill: boolean;
  useTrimFrame: boolean;
}

export const WINDOW_SHAPES: Readonly<Record<FlatWindowKind, WindowShape>> = {
  [WINDOW_KIND.PUNCHED]: {
    width: 0.78,
    height: 1.2,
    panes: 1,
    hasCross: false,
    hasTransom: false,
    hasSill: true,
    useTrimFrame: false,
  },
  [WINDOW_KIND.STRIP]: {
    width: 2.6,
    height: 0.72,
    panes: 4,
    hasCross: false,
    hasTransom: false,
    hasSill: false,
    useTrimFrame: false,
  },
  [WINDOW_KIND.SLIT]: {
    width: 0.32,
    height: 2.15,
    panes: 1,
    hasCross: false,
    hasTransom: true,
    hasSill: false,
    useTrimFrame: true,
  },
  [WINDOW_KIND.GRID]: {
    width: 1.15,
    height: 1.15,
    panes: 1,
    hasCross: true,
    hasTransom: false,
    hasSill: false,
    useTrimFrame: false,
  },
  [WINDOW_KIND.SHOP]: {
    width: 3.2,
    height: 2.2,
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
  DEPTH: 0.14,
  BAR: 0.1,
  RECESS_DEPTH: 0.2,
  RECESS_PROTRUSION: 0.01,
  GLASS_THICKNESS: 0.05,
  GLASS_OFFSET: 0.045,
  GLASS_MARGIN: 0.2,
  MULLION_DEPTH: 0.1,
  MULLION_WIDTH: 0.06,
  MULLION_OFFSET: 0.06,
  SILL_DEPTH: 0.22,
  SILL_HEIGHT: 0.08,
  SILL_OVERHANG: 0.28,
  SILL_OFFSET: 0.1,
} as const;

export interface BayWindowLayout {
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

export const BAY_WINDOW: BayWindowLayout = {
  box: [0.62, 1.45, 1.45],
  boxOffset: 0.28,
  frontGlass: [0.08, 1.05, 1.05],
  frontOffset: 0.6,
  glassLift: 0.05,
  sideGlass: [0.4, 0.9, 0.06],
  sideZ: 0.72,
  topCap: [0.74, 0.1, 1.65],
  topCapOffset: [0.3, 0.78, 0],
  bottomCap: [0.78, 0.1, 1.7],
  bottomCapOffset: [0.32, -0.72, 0],
};

export const WINDOW_COLORS = {
  FRAME: 0x1a1c20,
  RECESS: 0x07080b,
  DARK_GLASS: 0x121820,
} as const;

export interface GlowProfile {
  litChance: number;
  intensity: Range;
  tints: readonly number[];
}

/** How likely a pane is lit and how bright it glows, per building use. */
export const GLOW_PROFILE = {
  RESIDENTIAL: {
    litChance: 0.68,
    intensity: [0.3, 1],
    tints: [0xe6c48a, 0xffb86b, 0xffd9a0, 0x8eb4c4, 0xb0c8ff, 0xffe8c0],
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
} as const satisfies Record<string, GlowProfile>;
