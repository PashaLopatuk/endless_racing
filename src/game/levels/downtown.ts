import { BUILDING_STYLE_WEIGHTS } from "../constants/environment/buildings";
import {
  APARTMENT_PALETTE,
  BUILDING_COLOR_RANDOMIZE,
  BUILDING_TRIM_PALETTE,
  OFFICE_PALETTE,
  TOWER_PALETTE,
  WAREHOUSE_PALETTE,
} from "../constants/palette";
import { MOTION_BLUR } from "../constants/postfx";
import {
  INITIAL_TRAFFIC,
  NPC_PAINT_PALETTE,
  TRAFFIC,
} from "../constants/traffic";
import { VEHICLE_KINDS } from "../constants/vehicles";
import type { ILevelConfig } from "./types";

/** Current midtown look: mixed towers, the full traffic mix, and the live grade. */
export const DOWNTOWN_LEVEL: ILevelConfig = {
  id: "downtown",
  name: "Downtown",
  outputGamma: MOTION_BLUR.OUTPUT_GAMMA,
  buildings: {
    styleWeights: BUILDING_STYLE_WEIGHTS,
    palettes: {
      tower: TOWER_PALETTE,
      office: OFFICE_PALETTE,
      apartment: APARTMENT_PALETTE,
      warehouse: WAREHOUSE_PALETTE,
      trim: BUILDING_TRIM_PALETTE,
    },
    colorRandomize: BUILDING_COLOR_RANDOMIZE,
  },
  cars: {
    kinds: VEHICLE_KINDS,
    paintPalette: NPC_PAINT_PALETTE,
    initialTraffic: INITIAL_TRAFFIC,
    minSpeed: TRAFFIC.MIN_SPEED,
    maxSpeed: TRAFFIC.MAX_SPEED,
  },
};
