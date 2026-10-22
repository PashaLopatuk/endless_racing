import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import type { IBuildingSet } from "../../buildings/types";

/**
 * Night City: Manhattan/NYC nocturnal architectural landscape:
 * Deep midnight and navy blues, steel and slate blues, cool charcoal,
 * concrete graphite, and cool limestone greys with vibrant neon accents.
 */
export const NIGHT_CITY_BUILDINGS: IBuildingSet = {
  colorRandomize: {
    HUE: 0.015,
    SATURATION: 0.04,
    LIGHTNESS: 0.04,
  },
  neonColors: [0x00d4ff, 0x3b82f6, 0x8b5cf6, 0xec4899, 0x06b6d4, 0x10b981],
  metalColors: [0x1a222e, 0x242e3c, 0x2e3a4a, 0x384658],
  buildings: [
    {
      id: "slab-tower",
      style: BUILDING_STYLE.SLAB,
      weight: 3,
      wallColors: [
        // NYC Deep Navy & Midnight Blues
        0x141e2c, 0x182436, 0x1c2a3e, 0x203046, 0x24364e, 0x162232,
        0x1a2638, 0x1e2e42, 0x22344a, 0x263850,
        // NYC Cool Slate & Steel Blues
        0x2a3e58, 0x304662, 0x384e6c, 0x405676, 0x283a52, 0x344a66,
        0x3a5270, 0x425a7a, 0x2e445e, 0x364c68,
        // NYC Deep Charcoal & Slate Greys
        0x1e222a, 0x242832, 0x2c323c, 0x343a46, 0x3c4450,
        0x22262e, 0x282e38, 0x303642, 0x38404e, 0x404856,
        // Cool High-Rise Concrete & Limestone
        0x485260, 0x525c6c, 0x5e6878, 0x6a7486, 0x768294,
        0x8490a4, 0x929eb4, 0xa0acc2,
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
        // NYC Classic Midnight & Sapphire
        0x121a28, 0x182234, 0x1e2a40, 0x24324c, 0x1c2638,
        0x162030, 0x1a283c, 0x203046, 0x263852,
        // NYC Dark Cold Slate
        0x222c3c, 0x283446, 0x303e52, 0x38485e, 0x42526a,
        0x2c384a, 0x344256, 0x3c4a60, 0x44546c,
        // NYC Dark Granite & Graphite
        0x20242c, 0x262c36, 0x2e3440, 0x363e4c, 0x404856,
        // Empire Limestone & Cool Slate Grey
        0x4c5666, 0x586274, 0x667284, 0x748094, 0x8490a6, 0x94a2b8,
      ],
      trimColors: [0x10141c, 0x181e28, 0x222a36, 0x2e3848, 0x3c485a, 0x4c586c, 0x606e82],
      geometry: {
        width: [14, 22],
        depth: [14, 22],
        height: [42, 88],
      },
    },
    {
      id: "warehouse",
      style: BUILDING_STYLE.WAREHOUSE,
      weight: 2,
      wallColors: [
        // Industrial NYC Dark Blue Steel
        0x182230, 0x1e2a3c, 0x243448, 0x2a3c54, 0x1a2636,
        0x202e42, 0x26364c, 0x2c3c52,
        // SoHo / DUMBO Dark Cast Iron & Slate
        0x22262e, 0x282e38, 0x303844, 0x3a424e, 0x444c5a,
        // Industrial Graphite & Weathered Cold Stone
        0x4e5866, 0x586272, 0x647080, 0x707c8e,
        // Cold Blue-Grey Mortar
        0x2e3846, 0x364252, 0x3e4a5c, 0x465264,
      ],
      trimColors: [0x141820, 0x1e2430, 0x2a3240, 0x384252, 0x485466],
      geometry: {
        width: [12, 22],
        depth: [12, 20],
        height: [12, 22],
      },
    },
    {
      id: "office",
      style: BUILDING_STYLE.OFFICE,
      weight: 2.5,
      wallColors: [
        // Modern Midtown Dark Sapphire & Glass
        0x101c2c, 0x142236, 0x182840, 0x1e304c, 0x243858,
        0x122032, 0x16263c, 0x1a2c44, 0x203450,
        // Manhattan Steel Blue
        0x2a4064, 0x304870, 0x38527c, 0x405c88, 0x263c5e,
        0x2e4466, 0x364e72, 0x3e567e, 0x466088,
        // Dark Mirror Tint
        0x141c28, 0x1a2432, 0x202c3c, 0x283648,
        // High-Rise Cold Slate & Gunmetal
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
        // NYC Pre-war & Modern Midnight Navy
        0x162030, 0x1c283c, 0x223248, 0x283a54, 0x1e2c42,
        0x182436, 0x1e2e46, 0x243650, 0x2a3e5a,
        // Cool Architectural Slates
        0x263446, 0x2e3c50, 0x36465c, 0x405268, 0x4a5c74,
        0x2a384a, 0x324256, 0x3a4c62, 0x44566e, 0x4e607a,
        // Cold Graphite & Charcoal
        0x20242c, 0x282c36, 0x303642, 0x3a4250, 0x444c5a,
        // Brooklyn Limestone & Cool Concrete
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
  ],
};
