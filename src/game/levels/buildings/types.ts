import type { BuildingStyle } from "../../constants/environment/buildings";
import type { WindowKind } from "../../constants/environment/buildingsWindows";

export interface IColorSpread {
  HUE: number;
  SATURATION: number;
  LIGHTNESS: number;
}

/**
 * Dimensional parameters for one building archetype.
 * Each level can override these to customize building proportions.
 */
export interface IBuildingGeometry {
  width: readonly [number, number];
  depth: readonly [number, number];
  height: readonly [number, number];
  floorHeight?: number;
  windowKind?: WindowKind;
  customParams?: Record<string, unknown>;
}

/**
 * Optional architectural feature overrides for a building definition.
 */
export interface IBuildingFeatures {
  waterTowerChance?: number;
  fireEscapeChance?: number;
  roofBulkheadChance?: number;
  roofAcUnitChance?: number;
  neonBladeSignChance?: number;
  balconyChance?: number;
  aviationBeacons?: boolean;
}

/**
 * One building the level can spawn.
 * Geometry, colors, and generation parameters are all configurable per-level.
 */
export interface IBuildingDefinition {
  id: string;
  style: BuildingStyle;
  weight: number;
  wallColors: readonly number[];
  trimColors: readonly number[];
  roofColors?: readonly number[];
  doorColors?: readonly number[];
  awningColors?: readonly number[];
  geometry?: IBuildingGeometry;
  features?: IBuildingFeatures;
}

/**
 * Unified building configuration for a level district:
 * Configures both the front-row (street-level) and back-row (skyline) structures.
 */
export interface IBuildingDistrictConfig {
  colorRandomize: IColorSpread;
  neonColors: readonly number[];
  metalColors: readonly number[];
  frontRow?: readonly IBuildingDefinition[];
  backRow?: readonly IBuildingDefinition[];
  /** Legacy fallback for backRow */
  buildings?: readonly IBuildingDefinition[];
}

export type IBuildingSet = IBuildingDistrictConfig;
