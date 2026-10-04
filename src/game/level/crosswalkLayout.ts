import { STREET_ROW } from "../constants/environment/street";
import { createRng, randomIn } from "../util/random";

/** Stable crosswalk positions along the road loop (shared by markings and overhead signals). */
export const buildCrosswalkZPositions = (): number[] => {
  const { COUNT, SEED, START_Z, MIN_SPACING, SPACING_JITTER } =
    STREET_ROW.CROSSWALKS;
  const random = createRng(SEED);
  const positions: number[] = [];
  let z = START_Z;

  for (let index = 0; index < COUNT; index += 1) {
    positions.push(z);
    z += MIN_SPACING + randomIn(random, [0, SPACING_JITTER]);
  }

  return positions;
};
