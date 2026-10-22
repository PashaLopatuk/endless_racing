import type { ValueOf } from "../../types";

import { WINDOW_KIND } from "./buildingsWindows";

export const BUILDING_STYLE = {
  SLAB: "slab",
  SETBACK: "setback",
  WAREHOUSE: "warehouse",
  OFFICE: "office",
  APARTMENT: "apartment",
} as const;

export type BuildingStyle = ValueOf<typeof BUILDING_STYLE>;

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
  WIDTH_NARROW: [8, 12],
  WIDTH_WIDE: [12, 20],
  DEPTH: [10, 22],
  HEIGHT_CLASSES: [
    { height: [22, 38], weight: 2.5 },
    { height: [42, 75], weight: 4.0 },
    { height: [80, 115], weight: 3.5 },
  ],
  ROOF_BLOCK: {
    WIDTH_RATIO: 0.45,
    DEPTH_RATIO: 0.4,
    HEIGHT: [2.5, 6.5],
    COLOR: 0x0c0e12,
  },
  FLOOR_HEIGHT: 3.8,
  MIN_FLOORS: 4,
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
  WIDTH: [12, 22],
  DEPTH: [12, 22],
  TIERS: [
    { scale: [1, 1], height: [16, 30], window: WINDOW_KIND.PUNCHED },
    { scale: [0.62, 0.78], height: [14, 26], window: WINDOW_KIND.BAY },
    { scale: [0.32, 0.5], height: [12, 24], window: WINDOW_KIND.SLIT },
  ],
  ROW_SPACING: 3.2,
  FIRST_ROW_Y: 2.4,
  CORNICE: { OVERHANG: 0.22, HEIGHT: 0.32 },
  SPIRE: { SIZE: [0.22, 6, 0.22], COLOR: 0x2a2e33 },
} as const;

export const WAREHOUSE = {
  WIDTH: [12, 24],
  DEPTH: [10, 20],
  HEIGHT: [11, 22],
  CORNICE: { OVERHANG: 0.18, HEIGHT: 0.38, COLOR: 0x262c36 },
  WINDOW_ROW_RATIOS: [0.74, 0.52, 0.3],
  LOADING_DOOR: { THICKNESS: 0.4, HEIGHT_RATIO: 0.26, WIDTH: 2.6, INSET: 0.05 },
  TANK: {
    CHANCE: 0.55,
    RADIUS: 0.8,
    HEIGHT: 1.5,
    SEGMENTS: 6,
    X_RATIO: -0.15,
    LIFT: 1.6,
    COLOR: 0x1f2730,
    LEG_SIZE: [0.12, 1.2, 0.12],
    LEG_LIFT: 0.55,
    LEG_OFFSET: 0.45,
  },
  NEON_SIGN: {
    CHANCE: 0.5,
    THICKNESS: 0.08,
    HEIGHT: 0.7,
    LENGTH_RATIO: 0.45,
    Y_RATIO: 0.85,
    OFFSET: 0.06,
  },
} as const;

export const OFFICE_TOWER = {
  WIDTH: [12, 20],
  DEPTH: [12, 22],
  HEIGHT: [45, 110],
  FLOOR_HEIGHT: 3.6,
  LOBBY_HEIGHT: 4.8,
  FACADE_COVERAGE: 0.88,
  MIN_COLUMNS: 3,
  PANE_WIDTH: 2.4,
  PANE_HEIGHT_RATIO: 0.68,
  PANE_THICKNESS: 0.06,
  PANE_OFFSET: 0.04,
  MULLION: { WIDTH: 0.12, DEPTH: 0.12, OFFSET: 0.08 },
  LOBBY_GLASS: { HEIGHT: 3.2, LIFT: 0.2 },
  CROWN: { HEIGHT: 1.4, OVERHANG: 0.18 },
  ANTENNA: {
    CHANCE: 0.7,
    SIZE: [0.14, 8, 0.14],
    BEACON_SIZE: 0.35,
    BEACON_COLOR: 0xff3b30,
  },
} as const;

export const APARTMENT_BLOCK = {
  WIDTH: [10, 16],
  DEPTH: [14, 22],
  HEIGHT: [20, 52],
  FLOOR_HEIGHT: 3.4,
  FIRST_FLOOR_Y: 2.8,
  COLUMNS: [3, 5],
  WINDOW_KINDS: [WINDOW_KIND.PUNCHED, WINDOW_KIND.GRID],
  WINDOW_SKIP_CHANCE: 0.05,
  PARAPET: { OVERHANG: 0.2, HEIGHT: 0.65 },
  BALCONY: {
    CHANCE: 0.6,
    DEPTH: 1.0,
    THICKNESS: 0.12,
    WIDTH: 1.8,
    RAIL_HEIGHT: 0.6,
    RAIL_THICKNESS: 0.05,
    Y_DROP: 0.8,
  },
  ENTRANCE: { SIZE: [0.06, 2.4, 1.8], Y: 1.2, OFFSET: 0.04 },
} as const;
