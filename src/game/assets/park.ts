import { PARK } from "../constants/environment/park";
import { addPalmTreeToBatch } from "./palm";
import type { ITerrainParkConfig } from "../levels/types";
import { MIRRORED_SIDES } from "../constants/world";
import { createRng, randomIn } from "../util/random";
import {
  createStreetMeshBatch,
  toStreetModel,
  type IStreetModel,
} from "./meshBatch";

export const createParkModel = (
  seed: number,
  config: ITerrainParkConfig,
  nearRoad = false,
): IStreetModel => {
  const random = createRng(seed);
  const width = randomIn(
    random,
    nearRoad ? PARK.NEAR_WIDTH_RANGE : PARK.WIDTH_RANGE,
  );
  const depth = randomIn(
    random,
    nearRoad ? PARK.NEAR_DEPTH_RANGE : PARK.DEPTH_RANGE,
  );
  const batch = createStreetMeshBatch();
  const pathWidth = randomIn(random, [1.2, 1.85]);
  const pathAlongZ = random() < 0.72;

  batch.addBox({
    size: [width, PARK.GRASS_THICKNESS, depth],
    position: [0, PARK.GRASS_Y, 0],
    color: config.grassColor,
    isShaded: true,
  });

  for (let patch = 0; patch < 2 + (Math.abs(seed) % 2); patch += 1) {
    batch.addBox({
      size: [
        width * randomIn(random, [0.22, 0.38]),
        0.02,
        depth * randomIn(random, [0.18, 0.32]),
      ],
      position: [
        randomIn(random, [-width * 0.28, width * 0.28]),
        PARK.GRASS_Y + 0.02,
        randomIn(random, [-depth * 0.32, depth * 0.32]),
      ],
      color: config.grassAccentColor,
      isShaded: true,
    });
  }

  batch.addBox({
    size: pathAlongZ
      ? [pathWidth, PARK.PATH_THICKNESS, depth * 0.88]
      : [width * 0.88, PARK.PATH_THICKNESS, pathWidth],
    position: [0, PARK.PATH_Y, 0],
    color: config.pathColor,
  });

  const { BORDER } = PARK;

  for (const side of MIRRORED_SIDES) {
    batch.addBox({
      size: [width + BORDER.WIDTH, BORDER.HEIGHT, BORDER.WIDTH],
      position: [0, BORDER.Y, side * (depth / 2 - BORDER.WIDTH / 2)],
      color: config.borderColor,
    });
    batch.addBox({
      size: [BORDER.WIDTH, BORDER.HEIGHT, depth],
      position: [side * (width / 2 - BORDER.WIDTH / 2), BORDER.Y, 0],
      color: config.borderColor,
    });
  }

  const benchCount = 1 + (Math.abs(seed) % 2);

  for (let index = 0; index < benchCount; index += 1) {
    const alongPath = pathAlongZ
      ? randomIn(random, [-depth * 0.22, depth * 0.22])
      : 0;
    const acrossPath = pathAlongZ
      ? randomIn(random, [-1.1, 1.1]) * (random() < 0.5 ? 1 : -1)
      : randomIn(random, [-width * 0.22, width * 0.22]);

    const benchX = pathAlongZ ? acrossPath : alongPath;
    const benchZ = pathAlongZ ? alongPath : acrossPath;

    batch.addBox({
      size: PARK.BENCH.SEAT_SIZE,
      position: [benchX, PARK.BENCH.SEAT_Y, benchZ],
      color: config.benchColor,
    });

    for (const legSide of MIRRORED_SIDES) {
      batch.addBox({
        size: PARK.BENCH.LEG_SIZE,
        position: [
          benchX + legSide * PARK.BENCH.LEG_SPAN,
          PARK.BENCH.LEG_Y,
          benchZ,
        ],
        color: config.benchColor,
      });
    }
  }

  const shrubCount = 2 + (Math.abs(seed) % 3);

  for (let index = 0; index < shrubCount; index += 1) {
    batch.addBox({
      size: PARK.SHRUB.SIZE,
      position: [
        randomIn(random, [-width * 0.34, width * 0.34]),
        PARK.SHRUB.Y,
        randomIn(random, [-depth * 0.34, depth * 0.34]),
      ],
      color: config.shrubColor,
    });
  }

  // California park palm tree
  const palmSeed = Math.abs(seed * 37 + 19);
  const palmX = randomIn(random, [-width * 0.26, width * 0.26]);
  const palmZ = randomIn(random, [-depth * 0.26, depth * 0.26]);
  addPalmTreeToBatch(batch, palmX, palmZ, palmSeed, 0.72);

  return toStreetModel(batch, width, depth);
};
