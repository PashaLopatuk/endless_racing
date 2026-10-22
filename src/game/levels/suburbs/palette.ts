import type { ILevelPalette } from "../types";

/** Suburbs: warm California sunset golden hour, peach/apricot horizon, dusty mauve zenith, and soft purple shadows. */
export const SUBURBS_PALETTE: ILevelPalette = {
  skyMode: "day",
  outputGamma: 1.14,
  skyColor: 0xca6854,
  fogNear: 95,
  fogFar: 420,
  horizon: [0.84, 0.52, 0.42],
  zenith: [0.34, 0.22, 0.32],
  hemisphere: { sky: 0x784a64, ground: 0x4e362c, intensity: 0.75 },
  keyLight: {
    color: 0xffd2aa,
    intensity: 1.25,
    position: [-26, 42, -18],
  },
  fillLight: {
    color: 0x845474,
    intensity: 0.42,
    position: [22, 16, 26],
  },
};
