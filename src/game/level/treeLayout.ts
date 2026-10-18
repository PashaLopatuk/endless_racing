import type { IStreetRows } from "../levels/types";
import { STREET_SIDE } from "../constants/world";
import { chance, createRng, randomIn } from "../util/random";

export interface ITreePlacement {
  x: number;
  z: number;
  seed: number;
}

export const buildTreePlacements = (
  rows: IStreetRows,
  curbX: number,
): ITreePlacement[] => {
  const trees = rows.TREES;

  if (!trees) {
    return [];
  }

  const placements: ITreePlacement[] = [];
  const {
    COUNT_PER_SIDE,
    START_Z,
    SPACING,
    ROW_INSET,
    Z_JITTER,
    X_JITTER,
    SKIP_CHANCE,
    SEED_LEFT,
    SEED_RIGHT,
  } = trees;

  for (const side of [STREET_SIDE.LEFT, STREET_SIDE.RIGHT]) {
    const random = createRng(side === STREET_SIDE.RIGHT ? SEED_RIGHT : SEED_LEFT);
    let seedCounter = 0;

    for (let index = 0; index < COUNT_PER_SIDE; index += 1) {
      if (chance(random, SKIP_CHANCE)) {
        continue;
      }

      const z = START_Z + index * SPACING + randomIn(random, Z_JITTER);
      const xJitter = randomIn(random, X_JITTER);

      placements.push({
        x: side * (curbX + ROW_INSET) + xJitter,
        z,
        seed: seedCounter + index * 17 + Math.floor(random() * 10_000),
      });
      seedCounter += 1;
    }
  }

  return placements;
};
