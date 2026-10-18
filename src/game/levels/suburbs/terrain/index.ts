import type { ITerrainConfig } from "../../types";

export const SUBURBS_TERRAIN: ITerrainConfig = {
	groundColor: 0x4a6848,
	asphaltColor: 0x3a3834,
	sidewalkColor: 0xc8c0b4,
	edgeColor: 0xf4d06a,
	dashColor: 0xfaf6ec,
	park: {
		replaceBuildingChance: 0.28,
		nearInset: 5.1,
		grassColor: 0x4f8f52,
		grassAccentColor: 0x457a48,
		pathColor: 0xb8b0a4,
		borderColor: 0x8a8078,
		benchColor: 0x5a4838,
		shrubColor: 0x3a7f4c,
	},
};
