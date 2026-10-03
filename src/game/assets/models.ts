import * as THREE from "three";

import { LANE_COUNT, LANE_WIDTH, ROAD_SEGMENT_LENGTH, ROAD_WIDTH, SIDEWALK_WIDTH } from "../const";
import { getLaneCenterX } from "../util/lane";

import { getBuildingModel } from "./buildings";
import { getHouseModel } from "./houses";
import type { StreetModel } from "./mesh";
import { getTrafficLightModel } from "./trafficLight";
import { getCarModel, getVehicleModel } from "./vehicles";

export { getBuildingModel, getCarModel, getHouseModel, getTrafficLightModel, getVehicleModel };
export type { StreetModel };
export type { VehicleKind } from "./vehicles";

const ASPHALT_COLOR = 0x171a20;
const SIDEWALK_COLOR = 0x2a2c31;
const LANE_EDGE_COLOR = 0xc6b15a;
const LANE_DASH_COLOR = 0xd5d0c4;

export const getRoadSegmentModel = (): THREE.Group => {
  const group = new THREE.Group();
  const asphalt = new THREE.Mesh(
    new THREE.BoxGeometry(ROAD_WIDTH, 0.2, ROAD_SEGMENT_LENGTH),
    new THREE.MeshLambertMaterial({ color: ASPHALT_COLOR, flatShading: true }),
  );
  asphalt.position.y = -0.1;
  group.add(asphalt);

  const sidewalkMaterial = new THREE.MeshLambertMaterial({ color: SIDEWALK_COLOR, flatShading: true });
  const sidewalkGeometry = new THREE.BoxGeometry(SIDEWALK_WIDTH, 0.28, ROAD_SEGMENT_LENGTH);
  for (const side of [-1, 1]) {
    const sidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalk.position.set(side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), 0.04, 0);
    group.add(sidewalk);
  }

  const edgeMaterial = new THREE.MeshLambertMaterial({ color: LANE_EDGE_COLOR, flatShading: true });
  const edgeGeometry = new THREE.BoxGeometry(0.09, 0.025, ROAD_SEGMENT_LENGTH);
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.set(side * (ROAD_WIDTH / 2 - 0.16), 0.02, 0);
    group.add(edge);
  }

  const dashMaterial = new THREE.MeshLambertMaterial({ color: LANE_DASH_COLOR, flatShading: true });
  const dashGeometry = new THREE.BoxGeometry(0.1, 0.025, 2.4);
  const dashStride = 8;
  const dashCount = Math.floor(ROAD_SEGMENT_LENGTH / dashStride);
  for (let lane = 0; lane < LANE_COUNT - 1; lane += 1) {
    const x = getLaneCenterX(lane) + LANE_WIDTH / 2;
    for (let index = 0; index < dashCount; index += 1) {
      const dash = new THREE.Mesh(dashGeometry, dashMaterial);
      const z = -ROAD_SEGMENT_LENGTH / 2 + dashStride * 0.35 + index * dashStride;
      dash.position.set(x, 0.02, z);
      group.add(dash);
    }
  }

  return group;
};

export const disposeObject = (root: THREE.Object3D): void => {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    geometries.add(child.geometry);
    if (Array.isArray(child.material)) {
      for (const material of child.material) {
        materials.add(material);
      }
      return;
    }
    materials.add(child.material);
  });

  for (const geometry of geometries) {
    geometry.dispose();
  }
  for (const material of materials) {
    if (material.userData.keepAlive === true) {
      continue;
    }
    material.dispose();
  }
};
