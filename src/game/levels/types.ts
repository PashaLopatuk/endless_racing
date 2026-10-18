import type { BuildingStyle } from "../constants/environment/buildings";
import type { ITrafficSeed } from "../constants/traffic";
import type { VehicleKind } from "../constants/vehicles";
import type { IBuildingSet } from "./buildings/types";

export type {
  IBuildingDefinition,
  IBuildingGeometry,
  IBuildingSet,
  IColorSpread,
} from "./buildings/types";

export interface ILevelPalette {
  outputGamma: number;
  skyColor: number;
  fogNear: number;
  fogFar: number;
  horizon: readonly [number, number, number];
  zenith: readonly [number, number, number];
  hemisphere: {
    sky: number;
    ground: number;
    intensity: number;
  };
  keyLight: {
    color: number;
    intensity: number;
    position: readonly [number, number, number];
  };
  fillLight: {
    color: number;
    intensity: number;
    position: readonly [number, number, number];
  };
}

export interface ITerrainConfig {
  groundColor: number;
  asphaltColor: number;
  sidewalkColor: number;
  edgeColor: number;
  dashColor: number;
}

export interface IStreetConfig {
  ROAD_SEGMENT_LENGTH: number;
  ROAD_SEGMENT_COUNT: number;
  ROAD_SEGMENTS_BEHIND: number;
  SIDEWALK_WIDTH: number;
  DESPAWN_Z: number;
}

export interface IStreetRows {
  BUILDINGS: {
    COUNT_PER_SIDE: number;
    SPACING: number;
    START_Z: number;
    GAP: number;
    SEED_LEFT: number;
    SEED_RIGHT: number;
  };
  HOUSES: {
    COUNT_PER_SIDE: number;
    SPACING: number;
    START_Z: number;
    ROW_DEPTH: number;
    CURB_GAP: number;
    SEED_LEFT: number;
    SEED_RIGHT: number;
  };
  TRAFFIC_LIGHTS: {
    COUNT_PER_SIDE: number;
    SPACING: number;
    START_Z: number;
    CURB_OFFSET: number;
    SEED_LEFT: number;
    SEED_RIGHT: number;
  };
  STREET_LIGHTS: {
    COUNT_PER_SIDE: number;
    SPACING: number;
    START_Z: number;
    SIDEWALK_INSET: number;
    SEED_LEFT: number;
    SEED_RIGHT: number;
  };
  CROSSWALKS: {
    COUNT: number;
    SEED: number;
    START_Z: number;
    MIN_SPACING: number;
    SPACING_JITTER: number;
  };
  ROAD_SIGNS: {
    COUNT: number;
    SEED: number;
    START_Z: number;
    MIN_SPACING: number;
    SPACING_JITTER: number;
    SIDEWALK_INSET: number;
  };
  TRASH_BINS: {
    SIDEWALK: {
      COUNT: number;
      SEED: number;
      START_Z: number;
      MIN_SPACING: number;
      SPACING_JITTER: number;
      INSET: number;
    };
    BETWEEN_HOUSES: {
      SEED: number;
      GAP_CHANCE: number;
      Z_JITTER: readonly [number, number];
      ROW_INSET: number;
    };
  };
}

export interface IHouseColors {
  wallColors: readonly number[];
  trimColors: readonly number[];
  roofColors: readonly number[];
  doorColors: readonly number[];
  awningColors: readonly number[];
  neonColors: readonly number[];
}

export interface IEnvironmentConfig {
  street: IStreetConfig;
  rows: IStreetRows;
  houses: IHouseColors;
}

export interface ICarLevelConfig {
  kinds: readonly VehicleKind[];
  initialTraffic: readonly ITrafficSeed[];
  minSpeed: number;
  maxSpeed: number;
}

/** One loadable district. Every level uses this same shape. */
export interface ILevelConfig {
  id: string;
  name: string;
  palette: ILevelPalette;
  terrain: ITerrainConfig;
  environment: IEnvironmentConfig;
  buildings: IBuildingSet;
  cars: ICarLevelConfig;
}

export type { BuildingStyle };
