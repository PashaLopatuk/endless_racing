import type { ILevelPalette } from "../types";

/** Industrial district: harsh sunlight, warm tones, high contrast. */
export const INDUSTRIAL_PALETTE: ILevelPalette = {
	outputGamma: 1.15,
	skyColor: 0x5a7aa0,
	fogNear: 28,
	fogFar: 180,
	horizon: [0.35, 0.48, 0.62],
	zenith: [0.28, 0.42, 0.68],
	hemisphere: { sky: 0x6a8ab8, ground: 0x2a2418, intensity: 0.85 },
	keyLight: {
		color: 0xfff4e0,
		intensity: 1.65,
		position: [32, 48, -24],
	},
	fillLight: {
		color: 0x4a3828,
		intensity: 0.52,
		position: [-18, 16, 28],
	},
};
