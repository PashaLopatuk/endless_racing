import { STREET_ROW } from "../constants/environment/street";
import { STREET_SIDE } from "../constants/world";
import { createRng, randomIn } from "../util/random";

export interface IRoadSignPlacement {
  z: number;
  side: number;
  seed: number;
}

export const buildRoadSignPlacements = (): IRoadSignPlacement[] => {
  const { COUNT, SEED, START_Z, MIN_SPACING, SPACING_JITTER } =
    STREET_ROW.ROAD_SIGNS;
  const random = createRng(SEED);
  const placements: IRoadSignPlacement[] = [];
  let z = START_Z;

  for (let index = 0; index < COUNT; index += 1) {
    placements.push({
      z,
      side: random() < 0.5 ? STREET_SIDE.LEFT : STREET_SIDE.RIGHT,
      seed: index + Math.floor(random() * 10_000),
    });
    z += MIN_SPACING + randomIn(random, [0, SPACING_JITTER]);
  }

  return placements;
};
