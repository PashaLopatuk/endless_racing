import { TRAFFIC, INITIAL_TRAFFIC } from "../../constants/traffic";
import { VEHICLE_KIND } from "../../constants/vehicles";
import type { ILevelConfig } from "../types";
import { INDUSTRIAL_BUILDINGS } from "./buildings";
import { INDUSTRIAL_ENVIRONMENT } from "./environment";
import { INDUSTRIAL_PALETTE } from "./palette";
import { INDUSTRIAL_TERRAIN } from "./terrain";

export const INDUSTRIAL_LEVEL: ILevelConfig = {
	id: "industrial",
	name: "Industrial District",
	palette: INDUSTRIAL_PALETTE,
	terrain: INDUSTRIAL_TERRAIN,
	environment: INDUSTRIAL_ENVIRONMENT,
	buildings: INDUSTRIAL_BUILDINGS,
	cars: {
		kinds: [VEHICLE_KIND.VAN, VEHICLE_KIND.SEDAN],
		initialTraffic: INITIAL_TRAFFIC,
		minSpeed: TRAFFIC.MIN_SPEED,
		maxSpeed: TRAFFIC.MAX_SPEED,
	},
};
