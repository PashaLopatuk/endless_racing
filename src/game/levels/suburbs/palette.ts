import type { ILevelPalette } from "../types";

/** Suburbs: bright daytime sky, warm sun, soft haze. */
export const SUBURBS_PALETTE: ILevelPalette = {
	skyMode: "day",
	outputGamma: 1.08,
	skyColor: 0x7eb8e8,
	fogNear: 98,
	fogFar: 395,
	horizon: [0.48, 0.64, 0.86],
	zenith: [0.22, 0.48, 0.88],
	hemisphere: { sky: 0xb8d4f0, ground: 0x6a5a48, intensity: 0.92 },
	keyLight: {
		color: 0xfff8eb,
		intensity: 1.55,
		position: [28, 52, -18],
	},
	fillLight: {
		color: 0x8ab4d8,
		intensity: 0.48,
		position: [-22, 18, 32],
	},
};
