import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import type { IBuildingDistrictConfig } from "../../buildings/types";

// NYC Front-Row Street Facade Colors
const NYC_ROW_WALL_COLORS = [
  // Deep NYC Midnight & Dark Navy Blues
  0x121b28, 0x162234, 0x1a283e, 0x1e2c44, 0x22324c,
  0x142030, 0x18263a, 0x1c2a40, 0x203048, 0x243650,
  0x152236, 0x19283e, 0x1d3048, 0x233852, 0x29405e,
  // NYC Cool Slate & Steel Blues
  0x26364a, 0x2c3e54, 0x32465e, 0x384e68, 0x405672,
  0x28384a, 0x2e4056, 0x344862, 0x3c5270, 0x445a78,
  // NYC Dark Charcoal & Granite Greys
  0x1a1e24, 0x20242c, 0x262c34, 0x2e343e, 0x363e48,
  0x1e2228, 0x242830, 0x2c303a, 0x343a44, 0x3c424e,
  // Cool Limestone & Weathered Stone
  0x424854, 0x4c5462, 0x586070, 0x646c7c, 0x727a8a,
] as const;

const NYC_ROW_TRIM_COLORS = [
  0x101620, 0x18202c, 0x202a38, 0x283444, 0x344254,
  0x1e222a, 0x262c36, 0x303642, 0x3a424e,
  0x485260, 0x545e6e, 0x626c7e,
] as const;

const NYC_ROW_ROOF_COLORS = [
  0x0e141c, 0x141a22, 0x1a2028, 0x202630, 0x28303a, 0x303844,
] as const;

const NYC_ROW_DOOR_COLORS = [
  0x0c1016, 0x12161e, 0x181e26, 0x1e242c, 0x242a34,
] as const;

const NYC_ROW_AWNING_COLORS = [
  0x0e2a44, 0x1a3a5c, 0x182e44, 0x1c3852,
  0x282e38, 0x343a44, 0x1e3042, 0x243e56,
] as const;

/**
 * Night City Building District:
 * - frontRow: Manhattan streetscape (multi-story brownstones, townhouses, storefronts, and fire escapes).
 * - backRow: Towering NYC skyline (Empire State, Chrysler, slabs, setbacks, offices, and apartments).
 */
export const NIGHT_CITY_BUILDINGS: IBuildingDistrictConfig = {
  colorRandomize: {
    HUE: 0.015,
    SATURATION: 0.04,
    LIGHTNESS: 0.04,
  },
  neonColors: [0x00d4ff, 0x3b82f6, 0x8b5cf6, 0xec4899, 0x06b6d4, 0x10b981],
  metalColors: [0x1a222e, 0x242e3c, 0x2e3a4a, 0x384658],

  frontRow: [
    {
      id: "nyc-brownstone",
      style: BUILDING_STYLE.BROWNSTONE,
      weight: 3.5,
      wallColors: NYC_ROW_WALL_COLORS,
      trimColors: NYC_ROW_TRIM_COLORS,
      roofColors: NYC_ROW_ROOF_COLORS,
      doorColors: NYC_ROW_DOOR_COLORS,
      geometry: {
        width: [6.5, 7.8],
        depth: [10, 13],
        height: [11.5, 15.5],
      },
      features: {
        waterTowerChance: 0.65,
        fireEscapeChance: 0.7,
        roofBulkheadChance: 0.6,
        roofAcUnitChance: 0.5,
        neonBladeSignChance: 0.35,
      },
    },
    {
      id: "nyc-townhouse",
      style: BUILDING_STYLE.TOWNHOUSE,
      weight: 3.5,
      wallColors: NYC_ROW_WALL_COLORS,
      trimColors: NYC_ROW_TRIM_COLORS,
      roofColors: NYC_ROW_ROOF_COLORS,
      doorColors: NYC_ROW_DOOR_COLORS,
      geometry: {
        width: [5.8, 7.2],
        depth: [10, 13],
        height: [12.0, 16.0],
      },
      features: {
        waterTowerChance: 0.55,
        fireEscapeChance: 0.55,
        roofBulkheadChance: 0.5,
        roofAcUnitChance: 0.45,
        neonBladeSignChance: 0.3,
      },
    },
    {
      id: "nyc-shop-house",
      style: BUILDING_STYLE.SHOP,
      weight: 3.0,
      wallColors: NYC_ROW_WALL_COLORS,
      trimColors: NYC_ROW_TRIM_COLORS,
      roofColors: NYC_ROW_ROOF_COLORS,
      doorColors: NYC_ROW_DOOR_COLORS,
      awningColors: NYC_ROW_AWNING_COLORS,
      geometry: {
        width: [6.2, 7.8],
        depth: [9.5, 13.0],
        height: [9.0, 14.0],
      },
      features: {
        waterTowerChance: 0.6,
        roofAcUnitChance: 0.5,
        neonBladeSignChance: 0.45,
      },
    },
    {
      id: "nyc-modern-row",
      style: BUILDING_STYLE.MODERN,
      weight: 1.5,
      wallColors: NYC_ROW_WALL_COLORS,
      trimColors: NYC_ROW_TRIM_COLORS,
      roofColors: NYC_ROW_ROOF_COLORS,
      doorColors: NYC_ROW_DOOR_COLORS,
      geometry: {
        width: [6.8, 8.2],
        depth: [9.0, 12.0],
        height: [8.5, 12.5],
      },
    },
  ],

  backRow: [
    {
      id: "empire-tower",
      style: BUILDING_STYLE.EMPIRE,
      weight: 2.5,
      wallColors: [
        0x141e2e, 0x182436, 0x1c2b3e, 0x223248, 0x283a52, 0x1a2638,
        0x3c4656, 0x485262, 0x545e70, 0x626e82, 0x727e94, 0x828ea6,
        0x1e242c, 0x262e38, 0x2e3642,
      ],
      trimColors: [
        0x10141c, 0x18202c, 0x242e3e, 0x323e52, 0x445268, 0x586880, 0x70829c,
      ],
      geometry: {
        width: [18, 24],
        depth: [18, 24],
        height: [85, 130],
      },
      features: {
        aviationBeacons: true,
      },
    },
    {
      id: "chrysler-tower",
      style: BUILDING_STYLE.CHRYSLER,
      weight: 2.5,
      wallColors: [
        0x121c2c, 0x162234, 0x1a283c, 0x203046, 0x263852, 0x1c2636,
        0x2c3e56, 0x344862, 0x3e5472, 0x486082, 0x546e92,
        0x303844, 0x3c4654, 0x4a5666, 0x5a6878,
      ],
      trimColors: [
        0x1e2634, 0x2a3444, 0x384456, 0x4c5a6e, 0x64748a, 0x7e90a6, 0x94a6bc,
      ],
      geometry: {
        width: [16, 22],
        depth: [16, 22],
        height: [80, 125],
      },
      features: {
        aviationBeacons: true,
      },
    },
    {
      id: "slab-tower",
      style: BUILDING_STYLE.SLAB,
      weight: 3,
      wallColors: [
        0x141e2c, 0x182436, 0x1c2a3e, 0x203046, 0x24364e, 0x162232,
        0x2a3e58, 0x304662, 0x384e6c, 0x405676, 0x283a52, 0x344a66,
        0x1e222a, 0x242832, 0x2c323c, 0x343a46, 0x3c4450,
        0x485260, 0x525c6c, 0x5e6878, 0x6a7486, 0x768294,
      ],
      trimColors: [
        0x121620, 0x18202c, 0x222a38, 0x2e3848, 0x3c485a, 0x4c586c, 0x606e82, 0x748298,
      ],
      geometry: {
        width: [12, 20],
        depth: [12, 22],
        height: [32, 85],
        floorHeight: 3.8,
      },
    },
    {
      id: "setback-tower",
      style: BUILDING_STYLE.SETBACK,
      weight: 2.5,
      wallColors: [
        0x121a28, 0x182234, 0x1e2a40, 0x24324c, 0x1c2638,
        0x222c3c, 0x283446, 0x303e52, 0x38485e, 0x42526a,
        0x20242c, 0x262c36, 0x2e3440, 0x363e4c, 0x404856,
        0x4c5666, 0x586274, 0x667284, 0x748094, 0x8490a6,
      ],
      trimColors: [0x10141c, 0x181e28, 0x222a36, 0x2e3848, 0x3c485a, 0x4c586c, 0x606e82],
      geometry: {
        width: [14, 22],
        depth: [14, 22],
        height: [42, 88],
      },
    },
    {
      id: "office",
      style: BUILDING_STYLE.OFFICE,
      weight: 2.5,
      wallColors: [
        0x101c2c, 0x142236, 0x182840, 0x1e304c, 0x243858,
        0x2a4064, 0x304870, 0x38527c, 0x405c88, 0x263c5e,
        0x141c28, 0x1a2432, 0x202c3c, 0x283648,
        0x2e3c4e, 0x38485c, 0x42546a, 0x50647c,
      ],
      trimColors: [0x344458, 0x44566e, 0x566a84, 0x6a7e9a, 0x8094b0, 0x1e2a3a],
      geometry: {
        width: [12, 20],
        depth: [14, 24],
        height: [48, 105],
        floorHeight: 3.6,
      },
    },
    {
      id: "apartment",
      style: BUILDING_STYLE.APARTMENT,
      weight: 3,
      wallColors: [
        0x162030, 0x1c283c, 0x223248, 0x283a54, 0x1e2c42,
        0x263446, 0x2e3c50, 0x36465c, 0x405268, 0x4a5c74,
        0x20242c, 0x282c36, 0x303642, 0x3a4250, 0x444c5a,
        0x505a6a, 0x5c687a, 0x6a7688, 0x788498, 0x8894a8,
      ],
      trimColors: [0x141822, 0x1c222e, 0x26303e, 0x323e4e, 0x425062, 0x546276, 0x68788e],
      geometry: {
        width: [10, 16],
        depth: [14, 22],
        height: [22, 54],
        floorHeight: 3.2,
      },
    },
    {
      id: "warehouse",
      style: BUILDING_STYLE.WAREHOUSE,
      weight: 2,
      wallColors: [
        0x182230, 0x1e2a3c, 0x243448, 0x2a3c54, 0x1a2636,
        0x22262e, 0x282e38, 0x303844, 0x3a424e, 0x444c5a,
        0x4e5866, 0x586272, 0x647080, 0x707c8e,
      ],
      trimColors: [0x141820, 0x1e2430, 0x2a3240, 0x384252, 0x485466],
      geometry: {
        width: [12, 22],
        depth: [12, 20],
        height: [12, 22],
      },
    },
  ],
};
