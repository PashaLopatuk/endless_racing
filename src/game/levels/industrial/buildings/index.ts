import { BUILDING_STYLE } from "../../../constants/environment/buildings";
import { WINDOW_KIND } from "../../../constants/environment/buildingsWindows";
import type { IBuildingSet } from "../../buildings/types";

/**
 * Industrial district: Massive warehouses, squat offices, utilitarian design.
 * Demonstrates custom geometry overrides for wider, shorter buildings.
 */
export const INDUSTRIAL_BUILDINGS: IBuildingSet = {
	colorRandomize: {
		HUE: 0.04,
		SATURATION: 0.08,
		LIGHTNESS: 0.05,
	},
	neonColors: [0xff6a2a, 0xffd42a, 0x2aff6a, 0x2ad4ff],
	metalColors: [0x3a3a3a, 0x4a4a4a, 0x2a2a2a],
	buildings: [
		{
			id: "industrial-warehouse",
			style: BUILDING_STYLE.WAREHOUSE,
			weight: 5,
			wallColors: [
				0x6a5040, 0x5a4030, 0x7a6050, 0x4a3020, 0x8a7060, 0x3a2010,
			],
			trimColors: [0x4a4438, 0x3a3428, 0x5a5448],
			geometry: {
				width: [14, 28],
				depth: [12, 24],
				height: [8, 16],
			},
		},
		{
			id: "industrial-office",
			style: BUILDING_STYLE.OFFICE,
			weight: 2,
			wallColors: [
				0x3a4450, 0x2a3440, 0x4a5460, 0x1a2430,
			],
			trimColors: [0x5a5448, 0x4a4438, 0x6a6458],
			geometry: {
				width: [11, 16],
				depth: [12, 16],
				height: [18, 38],
			},
		},
		{
			id: "industrial-slab",
			style: BUILDING_STYLE.SLAB,
			weight: 1,
			wallColors: [
				0xa09080, 0x8a7868, 0xb0a090, 0x7a6858,
			],
			trimColors: [0x6a5a50, 0x5a4a40, 0x7a6a60],
			geometry: {
				width: [8, 14],
				depth: [10, 16],
				height: [12, 28],
				floorHeight: 3.8,
			},
		},
		{
			id: "industrial-apartment",
			style: BUILDING_STYLE.APARTMENT,
			weight: 2,
			wallColors: [
				0x6a4838, 0x5a3828, 0x7a5848, 0x4a2818,
			],
			trimColors: [0x8a7868, 0x7a6858, 0x6a5848],
			geometry: {
				width: [9, 13],
				depth: [14, 18],
				height: [16, 24],
				floorHeight: 2.7,
				windowKind: WINDOW_KIND.GRID,
			},
		},
	],
};
