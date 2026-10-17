import { BUILDING_STYLE } from "../constants/environment/buildings";
import { VEHICLE_KIND } from "../constants/vehicles";
import type { ILevelConfig } from "./types";

/** Warehouses, work trucks, and a darker grade. */
export const INDUSTRIAL_LEVEL: ILevelConfig = {
  id: "industrial",
  name: "Industrial",
  outputGamma: 1.28,
  buildings: {
    styleWeights: [
      { style: BUILDING_STYLE.WAREHOUSE, weight: 6 },
      { style: BUILDING_STYLE.SLAB, weight: 2 },
      { style: BUILDING_STYLE.OFFICE, weight: 1 },
      { style: BUILDING_STYLE.APARTMENT, weight: 1 },
      { style: BUILDING_STYLE.SETBACK, weight: 1 },
    ],
    palettes: {
      tower: [0x4a4038, 0x3a342e, 0x5a4a40, 0x2e2a28, 0x64584c],
      office: [0x2a3034, 0x343c40, 0x1e2428, 0x3e484c],
      apartment: [0x5c4034, 0x4a3428, 0x3a3028, 0x6a5040],
      warehouse: [0x6a4030, 0x4a3024, 0x7a5840, 0x3a2820, 0x554438, 0x2a2420],
      trim: [0x3a342c, 0x2a2622, 0x4a4038, 0x1e1c1a],
    },
    colorRandomize: {
      HUE: 0.02,
      SATURATION: 0.06,
      LIGHTNESS: 0.04,
    },
  },
  cars: {
    kinds: [VEHICLE_KIND.VAN, VEHICLE_KIND.PICKUP, VEHICLE_KIND.BUS],
    paintPalette: [0x2a2e28, 0x3a3428, 0x4a4034, 0x1e2220, 0x5a4030, 0x243028],
    initialTraffic: [
      { lane: 1, z: 28, cruiseSpeed: 6 },
      { lane: 3, z: 48, cruiseSpeed: 8 },
      { lane: 0, z: 70, cruiseSpeed: 5.5 },
      { lane: 2, z: 96, cruiseSpeed: 9 },
    ],
    minSpeed: 5,
    maxSpeed: 12,
  },
};
