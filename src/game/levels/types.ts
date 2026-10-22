import type { BuildingStyle } from "../constants/environment/buildings";
import type { HouseStyle } from "../constants/houses";
import type { VehicleKind } from "../constants/vehicles";
import type { IBuildingSet } from "./buildings/types";
import type { Object3D, Texture } from "three";

export type {
  IBuildingDefinition,
  IBuildingGeometry,
  IBuildingSet,
  IColorSpread,
} from "./buildings/types";

export type LevelSkyMode = "day" | "night";

export type LandscapeSpriteType = "image" | "model";
export type HorizonSide = "left" | "center" | "right";

export interface IBaseLandscapeSpriteConfig {
  id?: string;
  side?: HorizonSide;
  position?: [number, number, number];
  scale?: number | [number, number] | [number, number, number];
  rotation?: [number, number, number];
  fog?: boolean;
  renderOrder?: number;
  opacity?: number;
}

export interface IImageLandscapeSpriteConfig extends IBaseLandscapeSpriteConfig {
  type: "image";
  textureUrl: string | Texture;
  width?: number;
  height?: number;
  tint?: number;
  billboard?: boolean;
  alphaTest?: number;
}

export type ModelSpritePreset = "mountain" | "hills" | "hollywood_mountain";

export interface IMountainModelOptions {
  color?: number;
  accentColor?: number;
  ridgeColor?: number;
  width?: number;
  height?: number;
  heightScale?: number;
  depth?: number;
  segmentsX?: number;
  segmentsZ?: number;
  seed?: number;
  showHollywoodSign?: boolean;
  signText?: string;
  signColor?: number;
  side?: HorizonSide;
  showTrees?: boolean;
}

export interface IModelLandscapeSpriteConfig extends IBaseLandscapeSpriteConfig {
  type: "model";
  /**
   * Predefined model preset ("mountain", "hills", "hollywood_mountain"),
   * a THREE.Object3D instance, or a factory function returning a THREE.Object3D.
   */
  model: ModelSpritePreset | Object3D | (() => Object3D);
  options?: IMountainModelOptions;
}

export type ILandscapeSpriteConfig =
  | IImageLandscapeSpriteConfig
  | IModelLandscapeSpriteConfig;

export interface ILevelPalette {
  outputGamma: number;
  /** `night` adds stars; `day` is a bright sun sky without stars. */
  skyMode?: LevelSkyMode;
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

export interface ITerrainParkConfig {
  /** Per building slot: near-road grass strip in front of the far building row. */
  replaceBuildingChance: number;
  /** Meters from the curb line to the park lot center (world |X|). */
  nearInset: number;
  grassColor: number;
  grassAccentColor: number;
  pathColor: number;
  borderColor: number;
  benchColor: number;
  shrubColor: number;
}

export interface ITerrainConfig {
  groundColor: number;
  asphaltColor: number;
  sidewalkColor: number;
  edgeColor: number;
  dashColor: number;
  park?: ITerrainParkConfig;
  landscapeSprites?: readonly ILandscapeSpriteConfig[];
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
    /** Extra offset from the house row so the skyline sits behind near-road parks. */
    FAR_SETBACK?: number;
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
  /** Lawn / verge trees (optional per level). */
  TREES?: {
    COUNT_PER_SIDE: number;
    SPACING: number;
    START_Z: number;
    ROW_INSET: number;
    Z_JITTER: readonly [number, number];
    X_JITTER: readonly [number, number];
    SKIP_CHANCE: number;
    SEED_LEFT: number;
    SEED_RIGHT: number;
    PALM_CHANCE?: number;
  };
  /** Orange highway traffic cones along curb/sidewalk (optional per level). */
  TRAFFIC_CONES?: {
    COUNT: number;
    SEED: number;
    START_Z: number;
    MIN_SPACING: number;
    SPACING_JITTER: number;
    SIDEWALK_INSET: number;
    SCALE?: number;
  };
}

export interface IHouseColors {
  wallColors: readonly number[];
  trimColors: readonly number[];
  roofColors: readonly number[];
  doorColors: readonly number[];
  awningColors: readonly number[];
  neonColors: readonly number[];
  styles?: readonly { style: HouseStyle; weight: number }[];
}

export interface IEnvironmentConfig {
  street: IStreetConfig;
  rows: IStreetRows;
  houses?: IHouseColors;
}

export interface ICarLevelConfig {
  kinds: readonly VehicleKind[];
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
