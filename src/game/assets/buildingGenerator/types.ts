import type { IMeshBatch } from "../meshBatch";
import type {
  IBuildingDefinition,
  IBuildingDistrictConfig,
  IBuildingFeatures,
} from "../../levels/buildings/types";
import type { Rng } from "../../types";

export interface IBuildingContext {
  batch: IMeshBatch;
  random: Rng;
  building: IBuildingDefinition;
  set: IBuildingDistrictConfig;
  width: number;
  depth: number;
  height: number;
  wall: number;
  trim: number;
  roof: number;
  door: number;
  awning: number;
  metal: number;
  neon: number;
  features: Required<IBuildingFeatures>;
}
