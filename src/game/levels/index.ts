import { DOWNTOWN_LEVEL } from "./downtown";
import { INDUSTRIAL_LEVEL } from "./industrial";
import type { ILevelConfig } from "./types";

export type { IBuildingLevelConfig, ICarLevelConfig, ILevelConfig } from "./types";

export const LEVELS: readonly ILevelConfig[] = [
  DOWNTOWN_LEVEL,
  INDUSTRIAL_LEVEL,
];

const LEVEL_BY_ID = new Map(LEVELS.map((level) => [level.id, level]));

export const DEFAULT_LEVEL = DOWNTOWN_LEVEL;

export const getLevelConfig = (levelId: string): ILevelConfig => {
  const level = LEVEL_BY_ID.get(levelId);

  if (!level) {
    throw new Error(`Unknown level "${levelId}"`);
  }

  return level;
};
