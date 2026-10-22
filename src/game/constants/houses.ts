import type { ValueOf } from "../types";

export const HOUSE_STYLE = {
  BROWNSTONE: "brownstone",
  GABLE: "gable",
  TOWNHOUSE: "townhouse",
  BUNGALOW: "bungalow",
  MODERN: "modern",
  SHOP: "shop",
} as const;

export type HouseStyle = ValueOf<typeof HOUSE_STYLE>;

export const HOUSE_STYLE_WEIGHTS = [
  { style: HOUSE_STYLE.BROWNSTONE, weight: 2 },
  { style: HOUSE_STYLE.GABLE, weight: 2 },
  { style: HOUSE_STYLE.TOWNHOUSE, weight: 2 },
  { style: HOUSE_STYLE.BUNGALOW, weight: 1.5 },
  { style: HOUSE_STYLE.MODERN, weight: 1.5 },
  { style: HOUSE_STYLE.SHOP, weight: 1.5 },
] as const;

export const DOOR = {
  FRAME: [0.18, 2.1, 1.05],
  FRAME_Y: 1.15,
  FRAME_INSET: 0.02,
  PANEL: [0.08, 1.85, 0.78],
  PANEL_Y: 1.05,
  PANEL_OFFSET: 0.06,
  KNOB: [0.06, 0.08, 0.08],
  KNOB_OFFSET: 0.12,
  KNOB_Z: 0.24,
  LAMP: {
    SIZE: [0.1, 0.18, 0.18],
    Y: 2.45,
    OFFSET: 0.1,
    Z: 0.7,
    COLOR: 0xffd08a,
  },
  STEP: {
    COUNT: 3,
    DEPTH: 0.28,
    HEIGHT: 0.14,
    WIDTH: 1.15,
    WIDTH_SHRINK: 0.08,
    RUN: 0.22,
    OFFSET: 0.2,
  },
} as const;

export const BROWNSTONE = {
  WIDTH: [6.5, 7.8],
  DEPTH: [10, 13],
  HEIGHT: [11.5, 15.5],
  CORNICE: { OVERHANG: 0.35, HEIGHT: 0.32 },
  DOOR_Z_RATIO: -0.22,
  FLOORS: 4,
  FIRST_FLOOR_Y: 2.5,
  FLOOR_STEP: 2.65,
  WINDOW_Z_RATIO: 0.14,
  WINDOW_PAIR_GAP: 2.05,
} as const;

export const GABLE_HOUSE = {
  WIDTH: [6.8, 8.4],
  DEPTH: [8, 9.6],
  WALL_HEIGHT: [6.8, 8.2],
  ROOF_HEIGHT: [2.5, 3.5],
  ROOF_OVERHANG: 0.35,
  ROOF_THICKNESS: 0.16,
  BAY_Y: 2.2,
  BAY_Z: 0.2,
  UPPER_WINDOW_Y: 5.2,
  UPPER_WINDOW_Z_RATIO: -0.22,
  DOOR_Z_RATIO: 0.22,
  CHIMNEY: {
    SIZE: [0.45, 1.6, 0.45],
    X_RATIO: -0.18,
    Z_RATIO: -0.15,
    ROOF_RATIO: 0.45,
  },
} as const;

export const TOWNHOUSE = {
  WIDTH: [5.8, 7.2],
  DEPTH: [10, 13],
  HEIGHT: [12.0, 16.0],
  PARAPET: { WIDTH_RATIO: 0.75, DEPTH_RATIO: 0.75, HEIGHT: 1.5 },
  FLOORS: 4,
  FIRST_FLOOR_Y: 2.6,
  FLOOR_STEP: 2.75,
  WINDOW_Z_RATIO: 0.22,
  BAY_CHANCE: 0.45,
} as const;

export const BUNGALOW = {
  BODY_WIDTH: [6.8, 8.0],
  DEPTH: [9.5, 12],
  WALL_HEIGHT: [6.8, 8.2],
  ROOF_HEIGHT: [2.2, 3.0],
  ROOF_OVERHANG: 0.6,
  /** A 4-sided cone rotated by 45 degrees has a unit-square footprint at this radius. */
  HIP_ROOF_RADIUS: Math.SQRT1_2,
  HIP_ROOF_SIDES: 4,
  WINDOW_Y: 2.6,
  WINDOW_Z_RATIO: 0.3,
  PORCH: {
    DEPTH: 1.6,
    DECK_HEIGHT: 0.3,
    LENGTH_RATIO: 0.55,
    COLUMN_SIZE: 0.18,
    COLUMN_COUNT: 3,
    ROOF_THICKNESS: 0.18,
    ROOF_Y: 3.2,
    ROOF_OVERHANG: 0.2,
  },
} as const;

export const MODERN_HOUSE = {
  WIDTH: [7.5, 9.2],
  DEPTH: [9, 12],
  BASE_HEIGHT: [4.2, 5.0],
  UPPER_WIDTH_RATIO: [0.65, 0.85],
  UPPER_DEPTH_RATIO: [0.6, 0.85],
  UPPER_HEIGHT: [4.5, 5.5],
  UPPER_SHIFT_Z_RATIO: [-0.15, 0.15],
  ROOF_EDGE: { HEIGHT: 0.14, OVERHANG: 0.18 },
  PANEL: { DEPTH_RATIO: 0.35, THICKNESS: 0.06 },
  WINDOW_Y_RATIO: 0.55,
  BASE_WINDOW_Z_RATIO: 0.18,
  DOOR_Z_RATIO: -0.3,
} as const;

export const SHOP_HOUSE = {
  WIDTH: [6.8, 8.5],
  DEPTH: [9.5, 12],
  HEIGHT: [9.5, 13],
  STOREFRONT: { Y: 1.5, Z_RATIO: -0.1 },
  DOOR_Z_RATIO: 0.32,
  AWNING: {
    DEPTH: 1.5,
    THICKNESS: 0.08,
    Y: 2.9,
    TILT: 0.35,
    LENGTH_RATIO: 0.82,
  },
  SIGN: { HEIGHT: 0.6, Y: 3.5, DEPTH: 0.1, LENGTH_RATIO: 0.65 },
  UPPER_WINDOW_Y: 5.2,
  UPPER_WINDOW_SPREAD_RATIO: 0.28,
  CORNICE: { OVERHANG: 0.25, HEIGHT: 0.32 },
} as const;
