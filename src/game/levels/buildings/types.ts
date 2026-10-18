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
 * One building the level can spawn.
 * Geometry, colors, and generation parameters are all configurable per-level.
 */
export interface IBuildingDefinition {
  id: string;
  style: BuildingStyle;
  weight: number;
  wallColors: readonly number[];
  trimColors: readonly number[];
  geometry?: IBuildingGeometry;
}

/** The set a level hands the game. The game picks one entry and builds it. */
export interface IBuildingSet {
  colorRandomize: IColorSpread;
  neonColors: readonly number[];
  metalColors: readonly number[];
  buildings: readonly IBuildingDefinition[];
}
