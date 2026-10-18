import { TRAFFIC, INITIAL_TRAFFIC } from "../../constants/traffic";
import { VEHICLE_KIND } from "../../constants/vehicles";
import type { ILevelConfig } from "../types";
import { SUBURBS_BUILDINGS } from "./buildings";
import { SUBURBS_ENVIRONMENT } from "./environment";
import { SUBURBS_PALETTE } from "./palette";
import { SUBURBS_TERRAIN } from "./terrain";

export const SUBURBS_LEVEL: ILevelConfig = {
	id: "suburbs",
	name: "Suburbs",
	palette: SUBURBS_PALETTE,
	terrain: SUBURBS_TERRAIN,
	environment: SUBURBS_ENVIRONMENT,
	buildings: SUBURBS_BUILDINGS,
	cars: {
		kinds: [VEHICLE_KIND.VAN, VEHICLE_KIND.SEDAN],
		initialTraffic: INITIAL_TRAFFIC,
		minSpeed: TRAFFIC.MIN_SPEED,
		maxSpeed: TRAFFIC.MAX_SPEED,
	},
};
