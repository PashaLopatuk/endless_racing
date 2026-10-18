import { TRAFFIC, INITIAL_TRAFFIC } from "../../constants/traffic";
import { VEHICLE_KIND } from "../../constants/vehicles";
import type { ILevelConfig } from "../types";
import { NIGHT_CITY_BUILDINGS } from "./buildings";
import { NIGHT_CITY_ENVIRONMENT } from "./environment";
import { NIGHT_CITY_PALETTE } from "./palette";
import { NIGHT_CITY_TERRAIN } from "./terrain";

export const NIGHT_CITY_LEVEL: ILevelConfig = {
  id: "night-city",
  name: "Night City",
  palette: NIGHT_CITY_PALETTE,
  terrain: NIGHT_CITY_TERRAIN,
  environment: NIGHT_CITY_ENVIRONMENT,
  buildings: NIGHT_CITY_BUILDINGS,
  cars: {
    kinds: [VEHICLE_KIND.TAXI, VEHICLE_KIND.VAN, VEHICLE_KIND.SEDAN],
    initialTraffic: INITIAL_TRAFFIC,
    minSpeed: TRAFFIC.MIN_SPEED,
    maxSpeed: TRAFFIC.MAX_SPEED,
  },
};
