import { VEHICLES_SIZE_RATIO } from "./vehicles";

/** Meters, seconds, and unitless ratios shared by physics, gameplay, and level layout. */

export const LANE = {
  COUNT: 4,
  WIDTH: 3.6,
} as const;

export const ROAD_WIDTH = LANE.COUNT * LANE.WIDTH;
export const ROAD_HALF_WIDTH = ROAD_WIDTH / 2;

/** Base collider half-extents at `VEHICLES_SIZE_RATIO === 1`. */
export const CAR_SIZE = {
  HALF_WIDTH: 0.8,
  HALF_HEIGHT: 0.5,
  HALF_LENGTH: 1.6,
} as const;

/** Rapier cuboids and steering math; scaled with vehicle meshes via `VEHICLES_SIZE_RATIO`. */
export const VEHICLE_HITBOX = {
  HALF_WIDTH: CAR_SIZE.HALF_WIDTH * VEHICLES_SIZE_RATIO,
  HALF_HEIGHT: CAR_SIZE.HALF_HEIGHT * VEHICLES_SIZE_RATIO,
  HALF_LENGTH: CAR_SIZE.HALF_LENGTH * VEHICLES_SIZE_RATIO,
};

export const CAR_Y = VEHICLE_HITBOX.HALF_HEIGHT;

const CURB_CLEARANCE = 0.25;

export const DRIVABLE_X = {
  MIN: -ROAD_HALF_WIDTH + VEHICLE_HITBOX.HALF_WIDTH + CURB_CLEARANCE,
  MAX: ROAD_HALF_WIDTH - VEHICLE_HITBOX.HALF_WIDTH - CURB_CLEARANCE,
} as const;

export const STREET_SIDE = {
  LEFT: -1,
  RIGHT: 1,
} as const;

export const STREET_SIDES = [STREET_SIDE.LEFT, STREET_SIDE.RIGHT] as const;

/** Signs used to mirror symmetric parts (wheels, lamps, sidewalks) around the local X axis. */
export const MIRRORED_SIDES = [-1, 1] as const;

export const UNITS = {
  KMH_PER_MPS: 3.6,
  MS_PER_SECOND: 1000,
  PERCENT: 100,
} as const;

export const HALF_PI = Math.PI / 2;
export const QUARTER_PI = Math.PI / 4;
