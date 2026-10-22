import { BUILDING_STYLE, type BuildingStyle } from "../../constants/environment/buildings";
import type {
  IBuildingDistrictConfig,
  IBuildingFeatures,
} from "../../levels/buildings/types";
import {
  createRng,
  pick,
  pickWeighted,
  randomIn,
} from "../../util/random";
import { pickBuildingWallColor } from "../facade";
import {
  createStreetMeshBatch,
  toStreetModel,
  type IStreetModel,
} from "../meshBatch";
import { ARCHETYPE_BUILDERS } from "./archetypes";
import type { IBuildingContext } from "./types";

interface IDefaultDimensions {
  width: readonly [number, number];
  depth: readonly [number, number];
  height: readonly [number, number];
}

const DEFAULT_DIMENSIONS: Readonly<Record<BuildingStyle, IDefaultDimensions>> = {
  [BUILDING_STYLE.EMPIRE]: { width: [18, 24], depth: [18, 24], height: [85, 130] },
  [BUILDING_STYLE.CHRYSLER]: { width: [16, 22], depth: [16, 22], height: [80, 125] },
  [BUILDING_STYLE.OFFICE]: { width: [14, 20], depth: [14, 22], height: [45, 105] },
  [BUILDING_STYLE.SLAB]: { width: [12, 20], depth: [10, 20], height: [28, 75] },
  [BUILDING_STYLE.SETBACK]: { width: [14, 22], depth: [14, 22], height: [36, 85] },
  [BUILDING_STYLE.APARTMENT]: { width: [10, 16], depth: [14, 22], height: [20, 52] },
  [BUILDING_STYLE.WAREHOUSE]: { width: [12, 22], depth: [12, 20], height: [11, 20] },
  [BUILDING_STYLE.BROWNSTONE]: { width: [6.5, 7.8], depth: [10, 13], height: [11.5, 15.5] },
  [BUILDING_STYLE.TOWNHOUSE]: { width: [5.8, 7.2], depth: [10, 13], height: [12.0, 16.0] },
  [BUILDING_STYLE.SHOP]: { width: [6.2, 7.8], depth: [9.5, 13.0], height: [9.0, 14.0] },
  [BUILDING_STYLE.BUNGALOW]: { width: [7.0, 8.2], depth: [9.5, 12.0], height: [6.8, 8.2] },
  [BUILDING_STYLE.GABLE]: { width: [6.8, 8.4], depth: [8.0, 10.0], height: [6.8, 8.2] },
  [BUILDING_STYLE.MODERN]: { width: [6.8, 8.2], depth: [9.0, 12.0], height: [7.2, 9.5] },
};

const resolveFeatures = (
  style: BuildingStyle,
  height: number,
  overrides?: IBuildingFeatures,
): Required<IBuildingFeatures> => {
  const isHighRise =
    height > 50 ||
    style === BUILDING_STYLE.EMPIRE ||
    style === BUILDING_STYLE.CHRYSLER ||
    style === BUILDING_STYLE.OFFICE;

  const isUrbanTown =
    style === BUILDING_STYLE.BROWNSTONE ||
    style === BUILDING_STYLE.TOWNHOUSE ||
    style === BUILDING_STYLE.SHOP;

  return {
    waterTowerChance: overrides?.waterTowerChance ?? (isUrbanTown ? 0.65 : isHighRise ? 0.45 : 0),
    fireEscapeChance: overrides?.fireEscapeChance ?? (isUrbanTown ? 0.7 : isHighRise ? 0.5 : 0),
    roofBulkheadChance: overrides?.roofBulkheadChance ?? (isUrbanTown || isHighRise ? 0.65 : 0),
    roofAcUnitChance: overrides?.roofAcUnitChance ?? (isUrbanTown || isHighRise ? 0.55 : 0),
    neonBladeSignChance: overrides?.neonBladeSignChance ?? (isUrbanTown ? 0.35 : 0),
    balconyChance: overrides?.balconyChance ?? (style === BUILDING_STYLE.APARTMENT ? 0.6 : 0),
    aviationBeacons: overrides?.aviationBeacons ?? isHighRise,
  };
};

/**
 * Creates a procedurally generated street model using the unified modular building generator.
 * Works symmetrically for both the front-row (street level) and back-row (skyline).
 */
export const createBuildingModel = (
  seed: number,
  set: IBuildingDistrictConfig,
  rowType: "front" | "back" = "back",
): IStreetModel => {
  const random = createRng(seed);

  // 1. Pick pool: frontRow or backRow or legacy buildings
  let pool =
    rowType === "front"
      ? set.frontRow ?? set.buildings ?? []
      : set.backRow ?? set.buildings ?? [];

  if (pool.length === 0) {
    pool = set.buildings ?? [];
  }

  const building = pickWeighted(random, pool);
  const dims = building.geometry ?? DEFAULT_DIMENSIONS[building.style] ?? {
    width: [12, 20],
    depth: [12, 20],
    height: [20, 45],
  };

  const width = randomIn(random, dims.width);
  const depth = randomIn(random, dims.depth);
  const height = randomIn(random, dims.height);

  const wall = pickBuildingWallColor(random, building.wallColors, set.colorRandomize);
  const trim = pick(random, building.trimColors);
  const roof = building.roofColors ? pick(random, building.roofColors) : trim;
  const door = building.doorColors ? pick(random, building.doorColors) : trim;
  const awning = building.awningColors ? pick(random, building.awningColors) : trim;
  const metal = set.metalColors.length > 0 ? pick(random, set.metalColors) : trim;
  const neon = set.neonColors.length > 0 ? pick(random, set.neonColors) : 0x00d4ff;

  const features = resolveFeatures(building.style, height, building.features);
  const batch = createStreetMeshBatch();

  const ctx: IBuildingContext = {
    batch,
    random,
    building,
    set,
    width,
    depth,
    height,
    wall,
    trim,
    roof,
    door,
    awning,
    metal,
    neon,
    features,
  };

  const builder = ARCHETYPE_BUILDERS[building.style] ?? ARCHETYPE_BUILDERS[BUILDING_STYLE.SLAB];
  builder(ctx);

  return toStreetModel(batch, width, depth);
};
