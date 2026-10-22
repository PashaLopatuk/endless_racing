import type { IStreetRows } from "../levels/types";
import { STREET_SIDE } from "../constants/world";
import { createRng, randomIn } from "../util/random";

export interface ITrafficConePlacement {
  z: number;
  side: number;
  xOffset: number;
  seed: number;
}

export const buildTrafficConePlacements = (
  rows: IStreetRows,
): ITrafficConePlacement[] => {
  const config = rows.TRAFFIC_CONES;

  if (!config) {
    return [];
  }

  const {
    COUNT,
    SEED,
    START_Z,
    MIN_SPACING,
    SPACING_JITTER,
    SIDEWALK_INSET,
  } = config;

  const random = createRng(SEED);
  const placements: ITrafficConePlacement[] = [];
  let z = START_Z;

  for (let index = 0; index < COUNT; index += 1) {
    const side = random() < 0.5 ? STREET_SIDE.LEFT : STREET_SIDE.RIGHT;
    const xJitter = randomIn(random, [-0.12, 0.12]);

    placements.push({
      z,
      side,
      xOffset: SIDEWALK_INSET + xJitter,
      seed: index + Math.floor(random() * 10_000),
    });

    z += MIN_SPACING + randomIn(random, [0, SPACING_JITTER]);
  }

  return placements;
};
