import type { ILevelPalette } from "../types";

/** Night-city grade: cool moon, warm fill, and a slight crush on the frame. */
export const NIGHT_CITY_PALETTE: ILevelPalette = {
  outputGamma: 1.08,
  skyColor: 0x070910,
  fogNear: 18,
  fogFar: 128,
  horizon: [0.027, 0.035, 0.063],
  zenith: [0.035, 0.055, 0.12],
  hemisphere: { sky: 0x243044, ground: 0x0a0a0c, intensity: 0.72 },
  keyLight: {
    color: 0xb7c4d4,
    intensity: 1.25,
    position: [-28, 36, -18],
  },
  fillLight: {
    color: 0x3a2a20,
    intensity: 0.38,
    position: [16, 12, 30],
  },
};
