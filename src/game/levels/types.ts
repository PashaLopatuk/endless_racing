import type { BuildingStyle } from "../constants/environment/buildings";
import type { ITrafficSeed } from "../constants/traffic";
import type { VehicleKind } from "../constants/vehicles";

export interface IColorSpread {
  HUE: number;
  SATURATION: number;
  LIGHTNESS: number;
}

export interface IBuildingPalettes {
  tower: readonly number[];
  office: readonly number[];
  apartment: readonly number[];
  warehouse: readonly number[];
  trim: readonly number[];
}

export interface IBuildingLevelConfig {
  styleWeights: readonly { style: BuildingStyle; weight: number }[];
  palettes: IBuildingPalettes;
  colorRandomize: IColorSpread;
}

export interface ICarLevelConfig {
  kinds: readonly VehicleKind[];
  paintPalette: readonly number[];
  initialTraffic: readonly ITrafficSeed[];
  minSpeed: number;
  maxSpeed: number;
}

/** Visual and traffic identity for one endless stretch of city. */
export interface ILevelConfig {
  id: string;
  name: string;
  outputGamma: number;
  buildings: IBuildingLevelConfig;
  cars: ICarLevelConfig;
}
