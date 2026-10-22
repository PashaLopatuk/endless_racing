import { NIGHT_CITY_LEVEL } from "./nightCity";
import { SUBURBS_LEVEL } from "./suburbs";
import type { ILevelConfig } from "./types";

export type {
  HorizonSide,
  IBaseLandscapeSpriteConfig,
  IBuildingDefinition,
  IBuildingGeometry,
  IBuildingSet,
  ICarLevelConfig,
  IEnvironmentConfig,
  IHouseColors,
  IImageLandscapeSpriteConfig,
  ILandscapeSpriteConfig,
  ILevelConfig,
  ILevelPalette,
  IModelLandscapeSpriteConfig,
  IMountainModelOptions,
  LandscapeSpriteType,
  LevelSkyMode,
  ModelSpritePreset,
  IStreetRows,
  ITerrainConfig,
} from "./types";

export const LEVELS: readonly ILevelConfig[] = [
  NIGHT_CITY_LEVEL,
  SUBURBS_LEVEL,
];

const LEVEL_BY_ID = new Map(LEVELS.map((level) => [level.id, level]));

export const DEFAULT_LEVEL = NIGHT_CITY_LEVEL;

export const getLevelConfig = (levelId: string): ILevelConfig => {
  const level = LEVEL_BY_ID.get(levelId);

  if (!level) {
    throw new Error(`Unknown level "${levelId}"`);
  }

  return level;
};
