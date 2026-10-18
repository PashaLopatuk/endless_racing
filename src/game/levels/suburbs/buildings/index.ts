import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import { WINDOW_KIND } from "../../../constants/environment/buildingsWindows";
import type { IBuildingSet } from "../../buildings/types";

/** Low-rise suburbs: walk-ups, duplex slabs, and corner shops only. */
export const SUBURBS_BUILDINGS: IBuildingSet = {
	colorRandomize: {
		HUE: 0.05,
		SATURATION: 0.1,
		LIGHTNESS: 0.06,
	},
	neonColors: [0xff8c42, 0x4a9eff, 0xffd966],
	metalColors: [0x5a5a5a, 0x6a6a6a, 0x4a4a4a],
	buildings: [
		{
			id: "suburbs-walkup",
			style: BUILDING_STYLE.APARTMENT,
			weight: 4,
			wallColors: [
				0xd8c8b8, 0xc8b8a8, 0xb8a898, 0xe0d0c0, 0xa89888,
			],
			trimColors: [0x8a8078, 0x7a7068, 0x6a6258],
			geometry: {
				width: [8, 12],
				depth: [12, 16],
				height: [10, 16],
				floorHeight: 2.8,
				windowKind: WINDOW_KIND.PUNCHED,
			},
		},
		{
			id: "suburbs-duplex",
			style: BUILDING_STYLE.SLAB,
			weight: 3,
			wallColors: [
				0xb0a090, 0x9a8878, 0xc4b4a4, 0x8a7868,
			],
			trimColors: [0x7a6a60, 0x6a5a50, 0x8a7a70],
			geometry: {
				width: [7, 11],
				depth: [9, 14],
				height: [8, 14],
				floorHeight: 3.2,
			},
		},
		{
			id: "suburbs-corner-shop",
			style: BUILDING_STYLE.WAREHOUSE,
			weight: 2,
			wallColors: [
				0x8a7060, 0x7a6050, 0x9a8070, 0x6a5040,
			],
			trimColors: [0x5a5448, 0x4a4438, 0x6a6458],
			geometry: {
				width: [10, 16],
				depth: [10, 14],
				height: [6, 10],
			},
		},
	],
};
