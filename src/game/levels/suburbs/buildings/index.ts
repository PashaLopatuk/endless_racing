import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import { WINDOW_KIND } from "../../../constants/environment/buildingsWindows";
import type { IBuildingDistrictConfig } from "../../buildings/types";

const SUBURBS_WALL_COLORS = [
  // California Warm Terracotta & Sunset Coral
  0xdc6e50, 0xd06446, 0xe67c5e, 0xc85a3c,
  // California Stucco Sand & Warm Cream
  0xecdcbe, 0xe0ceae, 0xf4e6ce, 0xd6c2a0,
  // California Dusty Sky Blue & Periwinkle Stucco
  0x82a4c2, 0x7296b4, 0x92b2d0, 0x688ca8,
  // Sunny Buttercream & Pastel Yellow Stucco
  0xe8c878, 0xdec06e, 0xf2d68e, 0xd4b45e,
  // Soft Dusty Rose & Salmon Stucco
  0xd68076, 0xca7268, 0xe29088, 0xbc645c,
] as const;

const SUBURBS_TRIM_COLORS = [
  // Crisp California Off-White / Ivory
  0xf6f0e6, 0xe8e0d4, 0xdad0c2,
  // Warm Dark Wood & Architectural Bronze
  0x48382e, 0x382c24, 0x584438,
] as const;

const SUBURBS_ROOF_COLORS = [
  // Spanish Terracotta Clay Tile Red/Orange
  0xb44832, 0xc4543a, 0xa63e28, 0xcc5e44,
  // Dark Shingle & Asphalt
  0x3e322e, 0x483a34,
] as const;

const SUBURBS_DOOR_COLORS = [
  0x2e2018, 0x3a2820, 0x483226, 0x1e1410,
] as const;

const SUBURBS_AWNING_COLORS = [
  0x8a3a1a, 0x1a5a3a, 0x22446a, 0xb45428,
] as const;

/**
 * Suburbs Building District:
 * - frontRow: Cozy residential homes (bungalows, pitched gable houses, and modern homes).
 * - backRow: Low-rise community buildings (walk-ups, duplexes, and corner convenience stores).
 */
export const SUBURBS_BUILDINGS: IBuildingDistrictConfig = {
  colorRandomize: {
    HUE: 0.04,
    SATURATION: 0.08,
    LIGHTNESS: 0.06,
  },
  neonColors: [0xffa834, 0x4ae0ff, 0xffd060, 0x34d490],
  metalColors: [0x5a4e46, 0x6a5e54, 0x4a3e36],

  frontRow: [
    {
      id: "suburbs-bungalow",
      style: BUILDING_STYLE.BUNGALOW,
      weight: 3,
      wallColors: SUBURBS_WALL_COLORS,
      trimColors: SUBURBS_TRIM_COLORS,
      roofColors: SUBURBS_ROOF_COLORS,
      doorColors: SUBURBS_DOOR_COLORS,
      geometry: {
        width: [7.0, 8.2],
        depth: [9.5, 12.0],
        height: [6.8, 8.2],
      },
    },
    {
      id: "suburbs-gable",
      style: BUILDING_STYLE.GABLE,
      weight: 3,
      wallColors: SUBURBS_WALL_COLORS,
      trimColors: SUBURBS_TRIM_COLORS,
      roofColors: SUBURBS_ROOF_COLORS,
      doorColors: SUBURBS_DOOR_COLORS,
      geometry: {
        width: [6.8, 8.4],
        depth: [8.0, 10.0],
        height: [6.8, 8.2],
      },
    },
    {
      id: "suburbs-modern",
      style: BUILDING_STYLE.MODERN,
      weight: 1.5,
      wallColors: SUBURBS_WALL_COLORS,
      trimColors: SUBURBS_TRIM_COLORS,
      roofColors: SUBURBS_ROOF_COLORS,
      doorColors: SUBURBS_DOOR_COLORS,
      geometry: {
        width: [6.8, 8.2],
        depth: [9.0, 12.0],
        height: [7.2, 9.5],
      },
    },
  ],

  backRow: [
    {
      id: "suburbs-walkup",
      style: BUILDING_STYLE.APARTMENT,
      weight: 4,
      wallColors: [0xecdcbe, 0xe0ceae, 0x82a4c2, 0xdc6e50, 0xd68076],
      trimColors: [0xf6f0e6, 0xe8e0d4, 0x48382e],
      geometry: {
        width: [8, 12],
        depth: [12, 16],
        height: [10, 16],
        floorHeight: 2.8,
        windowKind: WINDOW_KIND.PUNCHED,
      },
    },
    {
      id: "suburbs-duplex",
      style: BUILDING_STYLE.SLAB,
      weight: 3,
      wallColors: [0xe8c878, 0xdc6e50, 0xecdcbe, 0x7296b4],
      trimColors: [0xf6f0e6, 0x382c24],
      geometry: {
        width: [7, 11],
        depth: [9, 14],
        height: [8, 14],
        floorHeight: 3.2,
      },
    },
    {
      id: "suburbs-corner-shop",
      style: BUILDING_STYLE.WAREHOUSE,
      weight: 2,
      wallColors: [0xdc6e50, 0xecdcbe, 0x82a4c2, 0xd06446],
      trimColors: [0xf6f0e6, 0x48382e],
      awningColors: SUBURBS_AWNING_COLORS,
      geometry: {
        width: [10, 16],
        depth: [10, 14],
        height: [6, 10],
      },
    },
  ],
};
