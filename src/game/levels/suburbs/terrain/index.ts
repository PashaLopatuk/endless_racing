import type { ITerrainConfig } from "../../types";
import dtlaSpriteUrl from "../../../assets/textures/background-sprites/dtla_sprite.png";

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
	landscapeSprites: [
		{
			id: "dtla-skyline",
			type: "image",
			side: "center",
			textureUrl: dtlaSpriteUrl,
			position: [0, -3.5, 235],
			width: 86,
			height: 48,
			fog: true,
			renderOrder: 10,
		},
		{
			id: "left-mountain",
			type: "model",
			side: "left",
			model: "mountain",
			position: [-90, -3.5, 260],
			scale: [1.5, 1.25, 1.35],
			renderOrder: 1,
			options: {
				color: 0x6e9652,
				showHollywoodSign: false,
			},
		},
		{
			id: "right-mountain",
			type: "model",
			side: "right",
			model: "hollywood_mountain",
			position: [90, -3.5, 260],
			scale: [1.5, 1.25, 1.35],
			renderOrder: 1,
			options: {
				color: 0x6e9652,
				showHollywoodSign: true,
			},
		},
	],
};
