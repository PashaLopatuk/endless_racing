import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import type { IBuildingSet } from "../../buildings/types";

/** Night street: concrete towers and cool gray facades with neon accents. */
export const NIGHT_CITY_BUILDINGS: IBuildingSet = {
  colorRandomize: {
    HUE: 0.02,
    SATURATION: 0.06,
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
        0xb8bcc4, 0xa8acb4, 0x989ca4, 0x888c94, 0x3e444c, 0x343a42, 0x4a525a,
        0x6a7078, 0x5c6068, 0x787e86, 0x949aa2, 0x2e3438,
      ],
      trimColors: [
        0x9a9ea6, 0x7a7e86, 0x5a5e64, 0x3a3e44, 0x8a8e96, 0x6a6e74, 0x484c52,
      ],
    },
    {
      id: "setback-tower",
      style: BUILDING_STYLE.SETBACK,
      weight: 2,
      wallColors: [
        0xb8bcc4, 0xa8acb4, 0x989ca4, 0x888c94, 0x3e444c, 0x343a42, 0x4a525a,
        0x5c6068, 0x949aa2, 0x2e3438,
      ],
      trimColors: [0x9a9ea6, 0x7a7e86, 0x5a5e64, 0x3a3e44, 0x484c52],
    },
    {
      id: "warehouse",
      style: BUILDING_STYLE.WAREHOUSE,
      weight: 2,
      wallColors: [
        0x4a4e54, 0x3a3e44, 0x5a5e64, 0x32363c, 0x484c52, 0x2a2e34, 0x42464c,
        0x565a60,
      ],
      trimColors: [0x5a5e64, 0x3a3e44, 0x6a6e74, 0x484c52],
    },
    {
      id: "office",
      style: BUILDING_STYLE.OFFICE,
      weight: 2,
      wallColors: [
        0x2a3440, 0x384858, 0x1e2830, 0x455260, 0x323c48, 0x4a5868, 0x283238,
        0x3c4854,
      ],
      trimColors: [0x8a8e96, 0x5a5e64, 0x3a3e44, 0x6a6e74],
    },
    {
      id: "apartment",
      style: BUILDING_STYLE.APARTMENT,
      weight: 3,
      wallColors: [
        0x6a6e74, 0x5a5e64, 0x7a7e86, 0x4a4e54, 0x8a8e96, 0x585c62, 0x4a5258,
        0x72767c, 0x44484e, 0x64686e,
      ],
      trimColors: [0x9a9ea6, 0x7a7e86, 0x6a6e74, 0x484c52, 0x8a8e96],
    },
  ],
};
