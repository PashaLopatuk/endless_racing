import * as THREE from "three";

import { disposeObject, getBuildingModel, getHouseModel, getRoadSegmentModel, getTrafficLightModel } from "../assets/models";
import type { StreetModel } from "../assets/mesh";
import {
  BUILDING_COUNT_PER_SIDE,
  BUILDING_SPACING,
  ENVIRONMENT_DESPAWN_Z,
  HOUSE_COUNT_PER_SIDE,
  HOUSE_ROW_DEPTH,
  HOUSE_SPACING,
  ROAD_SEGMENT_COUNT,
  ROAD_SEGMENT_LENGTH,
  ROAD_WIDTH,
  SIDEWALK_WIDTH,
  TRAFFIC_LIGHT_COUNT_PER_SIDE,
  TRAFFIC_LIGHT_SPACING,
} from "../const";

const BUILDING_GAP = 1.2;
const HOUSE_CURB_GAP = 0.45;

type PooledPiece = {
  mesh: THREE.Object3D;
  span: number;
};

export type Environment = {
  scroll: (distance: number) => void;
  dispose: () => void;
};

export const createEnvironment = (scene: THREE.Scene): Environment => {
  const pieces: PooledPiece[] = [];
  const owned: THREE.Object3D[] = [];

  const addPiece = (model: StreetModel, x: number, z: number, rotationY: number, span: number) => {
    model.object.position.set(x, 0, z);
    model.object.rotation.y = rotationY;
    scene.add(model.object);
    owned.push(model.object);
    pieces.push({ mesh: model.object, span });
  };

  const roadSpan = ROAD_SEGMENT_COUNT * ROAD_SEGMENT_LENGTH;
  for (let index = 0; index < ROAD_SEGMENT_COUNT; index += 1) {
    const mesh = getRoadSegmentModel();
    mesh.position.z = (index - 1) * ROAD_SEGMENT_LENGTH;
    scene.add(mesh);
    owned.push(mesh);
    pieces.push({ mesh, span: roadSpan });
  }

  const curb = ROAD_WIDTH / 2 + SIDEWALK_WIDTH;
  const buildingSpan = BUILDING_COUNT_PER_SIDE * BUILDING_SPACING;
  const houseSpan = HOUSE_COUNT_PER_SIDE * HOUSE_SPACING;
  const lightSpan = TRAFFIC_LIGHT_COUNT_PER_SIDE * TRAFFIC_LIGHT_SPACING;

  for (const side of [-1, 1]) {
    const faceRoad = side > 0 ? Math.PI : 0;
    for (let index = 0; index < BUILDING_COUNT_PER_SIDE; index += 1) {
      const building = getBuildingModel(side > 0 ? index + 100 : index + 1);
      const x = side * (curb + HOUSE_ROW_DEPTH + building.width / 2 + BUILDING_GAP);
      addPiece(building, x, index * BUILDING_SPACING - 48, faceRoad, buildingSpan);
    }
    for (let index = 0; index < HOUSE_COUNT_PER_SIDE; index += 1) {
      const house = getHouseModel(side > 0 ? index + 500 : index + 400);
      const x = side * (curb + house.width / 2 + HOUSE_CURB_GAP);
      addPiece(house, x, index * HOUSE_SPACING - 24, faceRoad, houseSpan);
    }
    for (let index = 0; index < TRAFFIC_LIGHT_COUNT_PER_SIDE; index += 1) {
      const armSign = -side;
      const light = getTrafficLightModel(index + (side > 0 ? 20 : 0), armSign);
      const x = side * (ROAD_WIDTH / 2 + 1.15);
      addPiece(light, x, index * TRAFFIC_LIGHT_SPACING - 16, 0, lightSpan);
    }
  }

  return {
    scroll: (distance) => {
      for (const piece of pieces) {
        piece.mesh.position.z -= distance;
        if (piece.mesh.position.z < ENVIRONMENT_DESPAWN_Z) {
          piece.mesh.position.z += piece.span;
        }
      }
    },
    dispose: () => {
      for (const mesh of owned) {
        scene.remove(mesh);
        disposeObject(mesh);
      }
    },
  };
};
