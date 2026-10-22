import * as THREE from "three";

import { createBuildingModel } from "../assets/buildings";
import { createParkModel } from "../assets/park";
import { createHouseModel } from "../assets/houses";
import type { IBatchedModel, IStreetModel } from "../assets/meshBatch";
import { createCrosswalkModel } from "../assets/crosswalk";
import { createRoadSegment } from "../assets/road";
import { createStreetLightModel } from "../assets/streetLight";
import { createOverheadGuideSign } from "../assets/overheadGuideSign";
import { createOverheadTrafficLightModel } from "../assets/overheadTrafficLight";
import { createRoadSignModel } from "../assets/roadSign";
import { createTrashBinModel } from "../assets/trashBin";
import { createTrafficConeModel } from "../assets/trafficCone";
import { createPalmTreeModel } from "../assets/palm";
import { createTreeModel } from "../assets/tree";
import { createTrafficLightModel } from "../assets/trafficLight";
import { GUIDE_SIGN, OVERHEAD_TRAFFIC_LIGHT } from "../constants/environment/street";
import type { ILevelConfig } from "../levels/types";
import { ROAD_HALF_WIDTH, STREET_SIDE, STREET_SIDES } from "../constants/world";
import { buildCrosswalkZPositions } from "./crosswalkLayout";
import { buildRoadSignPlacements } from "./roadSignLayout";
import { buildTrafficConePlacements } from "./trafficConeLayout";
import {
  buildTrashBinPlacements,
  TRASH_BIN_ZONE,
} from "./trashBinLayout";
import { buildTreePlacements } from "./treeLayout";
import { chance, createRng } from "../util/random";

export interface IEnvironment {
  scroll(distance: number): void;
  dispose(): void;
}

interface IScrollingPiece {
  object: THREE.Object3D;
  /** Length of the loop this piece belongs to; it jumps forward by this much after leaving the view. */
  span: number;
}

interface IPlacement {
  x: number;
  z: number;
  rotationY: number;
  span: number;
}

interface IPlacedModel {
  model: IStreetModel;
  placement: IPlacement;
}

const facingRoad = (side: number): number =>
  side === STREET_SIDE.RIGHT ? Math.PI : 0;

export const createEnvironment = (
  scene: THREE.Scene,
  level: ILevelConfig,
): IEnvironment => {
  const { street: STREET, rows: STREET_ROW, houses } = level.environment;
  const CURB_X = ROAD_HALF_WIDTH + STREET.SIDEWALK_WIDTH;
  const pieces: IScrollingPiece[] = [];
  const owned: IBatchedModel[] = [];

  const place = (
    object: THREE.Object3D,
    { x, z, rotationY, span }: IPlacement,
  ) => {
    object.position.set(x, 0, z);
    object.rotation.y = rotationY;

    scene.add(object);
    pieces.push({ object, span });
  };

  const placeModel = (model: IBatchedModel, placement: IPlacement) => {
    owned.push(model);
    place(model.object, placement);
  };

  const roadLoopSpan =
    STREET.ROAD_SEGMENT_COUNT * STREET.ROAD_SEGMENT_LENGTH;

  const layRoad = () => {
    const template = createRoadSegment(STREET, level.terrain);

    owned.push(template);

    for (let index = 0; index < STREET.ROAD_SEGMENT_COUNT; index += 1) {
      const object = index === 0 ? template.object : template.object.clone();

      place(object, {
        x: 0,
        z: (index - STREET.ROAD_SEGMENTS_BEHIND) * STREET.ROAD_SEGMENT_LENGTH,
        rotationY: 0,
        span: roadLoopSpan,
      });
    }
  };

  const layCrosswalks = () => {
    const template = createCrosswalkModel(level.terrain.dashColor);

    owned.push(template);

    buildCrosswalkZPositions(STREET_ROW).forEach((z, index) => {
      const object = index === 0 ? template.object : template.object.clone();

      place(object, {
        x: 0,
        z,
        rotationY: 0,
        span: roadLoopSpan,
      });
    });
  };

  const layOverheadTrafficLights = () => {
    buildCrosswalkZPositions(STREET_ROW).forEach((z, index) => {
      const model = createOverheadTrafficLightModel(
        index + OVERHEAD_TRAFFIC_LIGHT.SEED,
      );

      placeModel(model, {
        x: 0,
        z,
        rotationY: 0,
        span: roadLoopSpan,
      });
    });
  };

  const layGuideSigns = () => {
    for (let index = 0; index < GUIDE_SIGN.COUNT; index += 1) {
      const model = createOverheadGuideSign(index + GUIDE_SIGN.SEED);

      placeModel(model, {
        x: 0,
        z: GUIDE_SIGN.START_Z + index * GUIDE_SIGN.SPACING,
        rotationY: 0,
        span: roadLoopSpan,
      });
    }
  };

  const layRoadSigns = () => {
    const { SIDEWALK_INSET } = STREET_ROW.ROAD_SIGNS;

    buildRoadSignPlacements(STREET_ROW).forEach(({ z, side, seed }) => {
      const model = createRoadSignModel(seed);

      placeModel(model, {
        x: side * (ROAD_HALF_WIDTH + SIDEWALK_INSET),
        z,
        rotationY: facingRoad(side),
        span: roadLoopSpan,
      });
    });
  };

  const layTrees = () => {
    const trees = STREET_ROW.TREES;

    if (!trees) {
      return;
    }

    const span = trees.COUNT_PER_SIDE * trees.SPACING;
    const palmChance = trees.PALM_CHANCE ?? 0;

    buildTreePlacements(STREET_ROW, CURB_X).forEach(({ x, z, seed }) => {
      const isPalm =
        palmChance > 0 &&
        (Math.abs(seed * 7 + 13) % 100) < palmChance * 100;
      const model = isPalm ? createPalmTreeModel(seed) : createTreeModel(seed);

      placeModel(model, {
        x,
        z,
        rotationY: (Math.abs(seed) % 8) * (Math.PI / 4),
        span,
      });
    });
  };

  const layTrashBins = () => {
    const { SIDEWALK, BETWEEN_HOUSES } = STREET_ROW.TRASH_BINS;
    const { HOUSES } = STREET_ROW;
    const houseSpan = HOUSES.COUNT_PER_SIDE * HOUSES.SPACING;

    buildTrashBinPlacements(STREET_ROW).forEach(({ z, side, seed, zone }) => {
      const model = createTrashBinModel(seed);
      const isSidewalk = zone === TRASH_BIN_ZONE.SIDEWALK;
      const x = isSidewalk
        ? side * (ROAD_HALF_WIDTH + SIDEWALK.INSET)
        : side * (CURB_X + BETWEEN_HOUSES.ROW_INSET);

      placeModel(model, {
        x,
        z,
        rotationY: isSidewalk ? (Math.abs(seed) % 4) * (Math.PI / 2) : 0,
        span: isSidewalk ? roadLoopSpan : houseSpan,
      });
    });
  };

  const layTrafficCones = () => {
    const config = STREET_ROW.TRAFFIC_CONES;

    if (!config) {
      return;
    }

    buildTrafficConePlacements(STREET_ROW).forEach(
      ({ z, side, xOffset, seed }) => {
        const model = createTrafficConeModel(seed, config.SCALE ?? 1.0);
        const x = side * (ROAD_HALF_WIDTH + xOffset);

        placeModel(model, {
          x,
          z,
          rotationY: (Math.abs(seed) % 8) * (Math.PI / 4),
          span: roadLoopSpan,
        });
      },
    );
  };

  const lineRow = (count: number, createAt: (index: number) => IPlacedModel) => {
    for (let index = 0; index < count; index += 1) {
      const { model, placement } = createAt(index);

      placeModel(model, placement);
    }
  };

  const lineStreetSide = (side: number) => {
    const isRight = side === STREET_SIDE.RIGHT;
    const rotationY = facingRoad(side);
    const { BUILDINGS, HOUSES, TRAFFIC_LIGHTS, STREET_LIGHTS } = STREET_ROW;

    const buildingSetback = BUILDINGS.FAR_SETBACK ?? 0;
    const buildingSpan = BUILDINGS.COUNT_PER_SIDE * BUILDINGS.SPACING;

    for (let index = 0; index < BUILDINGS.COUNT_PER_SIDE; index += 1) {
      const seed =
        index + (isRight ? BUILDINGS.SEED_RIGHT : BUILDINGS.SEED_LEFT);
      const z = BUILDINGS.START_Z + index * BUILDINGS.SPACING;
      const building = createBuildingModel(seed, level.buildings, "back");
      const buildingX =
        side *
        (CURB_X +
          HOUSES.ROW_DEPTH +
          buildingSetback +
          building.width / 2 +
          BUILDINGS.GAP);

      placeModel(building, {
        x: buildingX,
        z,
        rotationY,
        span: buildingSpan,
      });

      const parkConfig = level.terrain.park;

      if (
        parkConfig &&
        chance(createRng(seed + 7919), parkConfig.replaceBuildingChance)
      ) {
        const park = createParkModel(seed, parkConfig, true);
        const parkX = side * (CURB_X + parkConfig.nearInset + park.width / 2);

        placeModel(park, {
          x: parkX,
          z,
          rotationY,
          span: buildingSpan,
        });
      }
    }

    lineRow(HOUSES.COUNT_PER_SIDE, (index) => {
      const seed =
        index + (isRight ? HOUSES.SEED_RIGHT : HOUSES.SEED_LEFT);
      const model = level.buildings.frontRow
        ? createBuildingModel(seed, level.buildings, "front")
        : houses
          ? createHouseModel(seed, houses)
          : createBuildingModel(seed, level.buildings, "back");

      const x = side * (CURB_X + model.width / 2 + HOUSES.CURB_GAP);

      return {
        model,
        placement: {
          x,
          z: HOUSES.START_Z + index * HOUSES.SPACING,
          rotationY,
          span: HOUSES.COUNT_PER_SIDE * HOUSES.SPACING,
        },
      };
    });

    lineRow(TRAFFIC_LIGHTS.COUNT_PER_SIDE, (index) => {
      const model = createTrafficLightModel(
        index +
          (isRight ? TRAFFIC_LIGHTS.SEED_RIGHT : TRAFFIC_LIGHTS.SEED_LEFT),
        -side,
      );

      const x = side * (ROAD_HALF_WIDTH + TRAFFIC_LIGHTS.CURB_OFFSET);

      return {
        model,
        placement: {
          x,
          z: TRAFFIC_LIGHTS.START_Z + index * TRAFFIC_LIGHTS.SPACING,
          rotationY: 0,
          span: TRAFFIC_LIGHTS.COUNT_PER_SIDE * TRAFFIC_LIGHTS.SPACING,
        },
      };
    });

    lineRow(STREET_LIGHTS.COUNT_PER_SIDE, (index) => {
      const model = createStreetLightModel(
        index +
          (isRight ? STREET_LIGHTS.SEED_RIGHT : STREET_LIGHTS.SEED_LEFT),
        -side,
      );

      const x = side * (ROAD_HALF_WIDTH + STREET_LIGHTS.SIDEWALK_INSET);

      return {
        model,
        placement: {
          x,
          z: STREET_LIGHTS.START_Z + index * STREET_LIGHTS.SPACING,
          rotationY: 0,
          span: STREET_LIGHTS.COUNT_PER_SIDE * STREET_LIGHTS.SPACING,
        },
      };
    });
  };

  layRoad();
  layCrosswalks();
  layOverheadTrafficLights();
  layGuideSigns();
  layRoadSigns();
  layTrashBins();
  layTrafficCones();
  layTrees();
  STREET_SIDES.forEach(lineStreetSide);

  return {
    scroll: (distance) => {
      for (const piece of pieces) {
        piece.object.position.z -= distance;

        if (piece.object.position.z < STREET.DESPAWN_Z) {
          piece.object.position.z += piece.span;
        }
      }
    },
    dispose: () => {
      pieces.forEach((piece) => scene.remove(piece.object));
      owned.forEach((model) => model.dispose());
      pieces.length = 0;
      owned.length = 0;
    },
  };
};
