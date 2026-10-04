import { STREET_ROW } from "../constants/environment/street";
import { STREET_SIDE } from "../constants/world";
import { chance, createRng, randomIn } from "../util/random";

export const TRASH_BIN_ZONE = {
  SIDEWALK: "sidewalk",
  BETWEEN_HOUSES: "betweenHouses",
} as const;

export type TrashBinZone =
  (typeof TRASH_BIN_ZONE)[keyof typeof TRASH_BIN_ZONE];

export interface ITrashBinPlacement {
  z: number;
  side: number;
  seed: number;
  zone: TrashBinZone;
}

export const buildTrashBinPlacements = (): ITrashBinPlacement[] => {
  const placements: ITrashBinPlacement[] = [];
  const { HOUSES } = STREET_ROW;
  const { SIDEWALK, BETWEEN_HOUSES } = STREET_ROW.TRASH_BINS;
  const { COUNT, SEED, START_Z, MIN_SPACING, SPACING_JITTER } = SIDEWALK;
  const sidewalkRandom = createRng(SEED);
  let z = START_Z;
  let seedCounter = 0;

  for (let index = 0; index < COUNT; index += 1) {
    placements.push({
      z,
      side:
        sidewalkRandom() < 0.5 ? STREET_SIDE.LEFT : STREET_SIDE.RIGHT,
      seed: seedCounter + Math.floor(sidewalkRandom() * 1000),
      zone: TRASH_BIN_ZONE.SIDEWALK,
    });
    seedCounter += 1;
    z += MIN_SPACING + randomIn(sidewalkRandom, [0, SPACING_JITTER]);
  }

  const gapRandom = createRng(BETWEEN_HOUSES.SEED);

  for (const side of [STREET_SIDE.LEFT, STREET_SIDE.RIGHT]) {
    for (let index = 0; index < HOUSES.COUNT_PER_SIDE - 1; index += 1) {
      if (!chance(gapRandom, BETWEEN_HOUSES.GAP_CHANCE)) {
        continue;
      }

      const gapCenter =
        HOUSES.START_Z + (index + 1) * HOUSES.SPACING - HOUSES.SPACING / 2;

      placements.push({
        z: gapCenter + randomIn(gapRandom, BETWEEN_HOUSES.Z_JITTER),
        side,
        seed: seedCounter + Math.floor(gapRandom() * 1000),
        zone: TRASH_BIN_ZONE.BETWEEN_HOUSES,
      });
      seedCounter += 1;
    }
  }

  return placements;
};
