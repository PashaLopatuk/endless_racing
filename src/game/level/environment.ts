import * as THREE from "three";

import { createBuildingModel } from "../assets/buildings";
import { createHouseModel } from "../assets/houses";
import type { IBatchedModel, IStreetModel } from "../assets/meshBatch";
import { createCrosswalkModel } from "../assets/crosswalk";
import { createRoadSegment } from "../assets/road";
import { createStreetLightModel } from "../assets/streetLight";
import { createOverheadTrafficLightModel } from "../assets/overheadTrafficLight";
import { createRoadSignModel } from "../assets/roadSign";
import { createTrashBinModel } from "../assets/trashBin";
import { createTrafficLightModel } from "../assets/trafficLight";
import { OVERHEAD_TRAFFIC_LIGHT, STREET, STREET_ROW } from "../constants/environment/street";
import { ROAD_HALF_WIDTH, STREET_SIDE, STREET_SIDES } from "../constants/world";
import { buildCrosswalkZPositions } from "./crosswalkLayout";
import { buildRoadSignPlacements } from "./roadSignLayout";
import {
  buildTrashBinPlacements,
  TRASH_BIN_ZONE,
} from "./trashBinLayout";

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

const CURB_X = ROAD_HALF_WIDTH + STREET.SIDEWALK_WIDTH;

const facingRoad = (side: number): number =>
  side === STREET_SIDE.RIGHT ? Math.PI : 0;

export const createEnvironment = (scene: THREE.Scene): IEnvironment => {
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
    const template = createRoadSegment();

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
    const template = createCrosswalkModel();

    owned.push(template);

    buildCrosswalkZPositions().forEach((z, index) => {
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
    buildCrosswalkZPositions().forEach((z, index) => {
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

  const layRoadSigns = () => {
    const { SIDEWALK_INSET } = STREET_ROW.ROAD_SIGNS;

    buildRoadSignPlacements().forEach(({ z, side, seed }) => {
      const model = createRoadSignModel(seed);

      placeModel(model, {
        x: side * (ROAD_HALF_WIDTH + SIDEWALK_INSET),
        z,
        rotationY: facingRoad(side),
        span: roadLoopSpan,
      });
    });
  };

  const layTrashBins = () => {
    const { SIDEWALK, BETWEEN_HOUSES } = STREET_ROW.TRASH_BINS;
    const { HOUSES } = STREET_ROW;
    const houseSpan = HOUSES.COUNT_PER_SIDE * HOUSES.SPACING;

    buildTrashBinPlacements().forEach(({ z, side, seed, zone }) => {
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

    lineRow(BUILDINGS.COUNT_PER_SIDE, (index) => {
      const model = createBuildingModel(
        index + (isRight ? BUILDINGS.SEED_RIGHT : BUILDINGS.SEED_LEFT),
      );

      const x =
        side * (CURB_X + HOUSES.ROW_DEPTH + model.width / 2 + BUILDINGS.GAP);

      return {
        model,
        placement: {
          x,
          z: BUILDINGS.START_Z + index * BUILDINGS.SPACING,
          rotationY,
          span: BUILDINGS.COUNT_PER_SIDE * BUILDINGS.SPACING,
        },
      };
    });

    lineRow(HOUSES.COUNT_PER_SIDE, (index) => {
      const model = createHouseModel(
        index + (isRight ? HOUSES.SEED_RIGHT : HOUSES.SEED_LEFT),
      );

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
  layRoadSigns();
  layTrashBins();
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
