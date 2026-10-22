import type { ILevelPalette } from "../types";

/** Night-city grade: cool moon, warm fill, and a slight crush on the frame. */
export const NIGHT_CITY_PALETTE: ILevelPalette = {
  skyMode: "night",
  outputGamma: 1.08,
  skyColor: 0x070910,
  fogNear: 18,
  fogFar: 128,
  horizon: [0.027, 0.035, 0.063],
  zenith: [0.035, 0.055, 0.12],
  hemisphere: { sky: 0x243652, ground: 0x0c1016, intensity: 0.76 },
  keyLight: {
    color: 0xc8d8ec,
    intensity: 1.35,
    position: [-28, 36, -18],
  },
  fillLight: {
    color: 0x1c2e46,
    intensity: 0.44,
    position: [16, 12, 30],
  },
};
