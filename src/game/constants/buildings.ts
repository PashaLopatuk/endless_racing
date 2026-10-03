import type { ValueOf } from "../types";

import { WINDOW_KIND } from "./windows";

export const BUILDING_STYLE = {
  SLAB: "slab",
  SETBACK: "setback",
  WAREHOUSE: "warehouse",
  OFFICE: "office",
  APARTMENT: "apartment",
} as const;

export type BuildingStyle = ValueOf<typeof BUILDING_STYLE>;

export const BUILDING_STYLE_WEIGHTS = [
  { style: BUILDING_STYLE.SLAB, weight: 3 },
  { style: BUILDING_STYLE.SETBACK, weight: 2 },
  { style: BUILDING_STYLE.WAREHOUSE, weight: 2 },
  { style: BUILDING_STYLE.OFFICE, weight: 2 },
  { style: BUILDING_STYLE.APARTMENT, weight: 3 },
] as const;

/** Window rows are laid along the road-facing facade (local +X), spread over part of the building depth. */
export const FACADE = {
  WIDE_DEPTH: 12,
  COLUMNS_NARROW: 2,
  COLUMNS_WIDE: 3,
  SPAN_RATIO: 0.62,
  SKIP_CHANCE: 0.1,
} as const;

export const SLAB_TOWER = {
  NARROW_CHANCE: 0.34,
  WIDTH_NARROW: [6, 10],
  WIDTH_WIDE: [9, 17],
  DEPTH: [8, 18],
  HEIGHT_CLASSES: [
    { height: [9, 17], weight: 3 },
    { height: [18, 34], weight: 3.5 },
    { height: [38, 72], weight: 3.5 },
  ],
  ROOF_BLOCK: {
    WIDTH_RATIO: 0.45,
    DEPTH_RATIO: 0.4,
    HEIGHT: [2, 6],
    COLOR: 0x0c0e12,
  },
  FLOOR_HEIGHT: 4.2,
  MIN_FLOORS: 3,
  FIRST_FLOOR_Y: 3.2,
  TOP_MARGIN: 3,
  STRIP_FLOOR_EVERY: 3,
  STRIP_FLOOR_PHASE: 2,
  FIRE_ESCAPE: {
    CHANCE: 0.6,
    OFFSET: 0.35,
    RAIL_SIZE: 0.08,
    HEIGHT_RATIO: 0.72,
    Y_RATIO: 0.42,
    RAIL_Z_RATIOS: [0.28, 0.42],
    LANDING_SIZE: [0.7, 0.08, 0.9],
    LANDING_COUNT: 4,
    FIRST_LANDING_Y: 4,
    LANDING_STEP_RATIO: 0.14,
    LANDING_Z_RATIO: 0.35,
  },
} as const;

export const SETBACK_TOWER = {
  WIDTH: [8, 18],
  DEPTH: [8, 17],
  TIERS: [
    { scale: [1, 1], height: [6, 20], window: WINDOW_KIND.PUNCHED },
    { scale: [0.62, 0.78], height: [5, 17], window: WINDOW_KIND.BAY },
    { scale: [0.32, 0.5], height: [4, 16], window: WINDOW_KIND.SLIT },
  ],
  ROW_SPACING: 3.4,
  FIRST_ROW_Y: 2.2,
  CORNICE: { OVERHANG: 0.2, HEIGHT: 0.28 },
  SPIRE: { SIZE: [0.18, 4, 0.18], COLOR: 0x2a2e33 },
} as const;

export const WAREHOUSE = {
  WIDTH: [11, 23],
  DEPTH: [9, 19],
  HEIGHT: [6, 14],
  CORNICE: { OVERHANG: 0.15, HEIGHT: 0.35, COLOR: 0x3c342c },
  WINDOW_ROW_RATIOS: [0.62, 0.38],
  LOADING_DOOR: { THICKNESS: 0.4, HEIGHT_RATIO: 0.38, WIDTH: 2.2, INSET: 0.05 },
  TANK: {
    CHANCE: 0.55,
    RADIUS: 0.7,
    HEIGHT: 1.3,
    SEGMENTS: 6,
    X_RATIO: -0.15,
    LIFT: 1.5,
    COLOR: 0x2a3134,
    LEG_SIZE: [0.12, 1.1, 0.12],
    LEG_LIFT: 0.5,
    LEG_OFFSET: 0.4,
  },
  NEON_SIGN: {
    CHANCE: 0.45,
    THICKNESS: 0.08,
    HEIGHT: 0.6,
    LENGTH_RATIO: 0.4,
    Y_RATIO: 0.82,
    OFFSET: 0.06,
  },
} as const;

export const OFFICE_TOWER = {
  WIDTH: [9, 15],
  DEPTH: [10, 18],
  HEIGHT: [24, 60],
  FLOOR_HEIGHT: 3.6,
  LOBBY_HEIGHT: 4,
  FACADE_COVERAGE: 0.86,
  MIN_COLUMNS: 3,
  PANE_WIDTH: 1.6,
  PANE_HEIGHT_RATIO: 0.72,
  PANE_THICKNESS: 0.06,
  PANE_OFFSET: 0.04,
  MULLION: { WIDTH: 0.1, DEPTH: 0.12, OFFSET: 0.08 },
  LOBBY_GLASS: { HEIGHT: 2.8, LIFT: 0.2 },
  CROWN: { HEIGHT: 1.2, OVERHANG: 0.15 },
  ANTENNA: {
    CHANCE: 0.6,
    SIZE: [0.12, 6, 0.12],
    BEACON_SIZE: 0.3,
    BEACON_COLOR: 0xff3b30,
  },
} as const;

export const APARTMENT_BLOCK = {
  WIDTH: [8, 12],
  DEPTH: [12, 18],
  HEIGHT: [14, 26],
  FLOOR_HEIGHT: 2.9,
  FIRST_FLOOR_Y: 2.4,
  COLUMNS: [3, 5],
  WINDOW_KINDS: [WINDOW_KIND.PUNCHED, WINDOW_KIND.GRID],
  WINDOW_SKIP_CHANCE: 0.05,
  PARAPET: { OVERHANG: 0.2, HEIGHT: 0.6 },
  BALCONY: {
    CHANCE: 0.6,
    DEPTH: 0.9,
    THICKNESS: 0.12,
    WIDTH: 1.6,
    RAIL_HEIGHT: 0.55,
    RAIL_THICKNESS: 0.05,
    Y_DROP: 0.75,
  },
  ENTRANCE: { SIZE: [0.06, 2.2, 1.6], Y: 1.1, OFFSET: 0.04 },
} as const;
