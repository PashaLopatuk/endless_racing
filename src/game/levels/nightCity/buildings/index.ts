import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import type { IBuildingSet } from "../../buildings/types";

/** Current night street: mixed towers, brick walk-ups, and cool offices. */
export const NIGHT_CITY_BUILDINGS: IBuildingSet = {
  colorRandomize: {
    HUE: 0.055,
    SATURATION: 0.12,
    LIGHTNESS: 0.06,
  },
  neonColors: [0xff4fa0, 0x4fe0ff, 0xffb347, 0x9dff6a, 0xc77dff],
  metalColors: [0x2a2e33, 0x3a3f46, 0x1e2226],
  buildings: [
    {
      id: "slab-tower",
      style: BUILDING_STYLE.SLAB,
      weight: 3,
      wallColors: [
        0xc8bfb0, 0xb5a898, 0xa09080, 0x9a8878, 0x3e444c, 0x343a42, 0x4a525a,
        0x8a5048, 0x7a4438, 0x5c6068, 0xc4b4a0, 0x6a5a50, 0x2e3438,
      ],
      trimColors: [
        0xb0a698, 0x8a8078, 0x5a544c, 0x3a3834, 0x9a9088, 0x6a6258, 0x484440,
      ],
    },
    {
      id: "setback-tower",
      style: BUILDING_STYLE.SETBACK,
      weight: 2,
      wallColors: [
        0xc8bfb0, 0xb5a898, 0xa09080, 0x9a8878, 0x3e444c, 0x343a42, 0x4a525a,
        0x5c6068, 0xc4b4a0, 0x2e3438,
      ],
      trimColors: [0xb0a698, 0x8a8078, 0x5a544c, 0x3a3834, 0x484440],
    },
    {
      id: "warehouse",
      style: BUILDING_STYLE.WAREHOUSE,
      weight: 2,
      wallColors: [
        0x5c4030, 0x4a3428, 0x6a5040, 0x3a3028, 0x554438, 0x2a2624, 0x483830,
        0x645040,
      ],
      trimColors: [0x5a544c, 0x3a3834, 0x6a6258, 0x484440],
    },
    {
      id: "office",
      style: BUILDING_STYLE.OFFICE,
      weight: 2,
      wallColors: [
        0x2a3440, 0x384858, 0x1e2830, 0x455260, 0x323c48, 0x4a5868, 0x283238,
        0x3c4854,
      ],
      trimColors: [0x8a8078, 0x5a544c, 0x3a3834, 0x6a6258],
    },
    {
      id: "apartment",
      style: BUILDING_STYLE.APARTMENT,
      weight: 3,
      wallColors: [
        0x7a4838, 0x6b3c30, 0x8c5840, 0x5c4840, 0x9a7860, 0x684838, 0x4a5a58,
        0x886850, 0x543830, 0x706058,
      ],
      trimColors: [0xb0a698, 0x8a8078, 0x6a6258, 0x484440, 0x9a9088],
    },
  ],
};
