import * as THREE from "three";

import { addBox, lambert, type StreetModel } from "./mesh";

const POLE = lambert(0x2c3036);
const HOUSING = lambert(0x17191d);
POLE.userData.keepAlive = true;
HOUSING.userData.keepAlive = true;
const LAMPS = [0xff3b30, 0xffb020, 0x3ddc6a].map((color) => {
  const material = new THREE.MeshBasicMaterial({ color });
  material.userData.keepAlive = true;
  return material;
});

export const getTrafficLightModel = (seed: number, armSign: number): StreetModel => {
  const group = new THREE.Group();
  const direction = armSign < 0 ? -1 : 1;
  const litIndex = Math.abs(seed) % LAMPS.length;
  const headX = direction * 1.15;

  addBox(group, 0.14, 4.4, 0.14, 0, 2.2, 0, POLE);
  addBox(group, 1.15, 0.1, 0.1, direction * 0.58, 4.35, 0, POLE);
  addBox(group, 0.26, 0.62, 0.2, headX, 4.2, 0, HOUSING);
  addBox(group, 0.14, 0.14, 0.05, headX, 4.38 - litIndex * 0.18, -0.12, LAMPS[litIndex] ?? LAMPS[0]);

  return { object: group, width: 0.4, depth: 0.4 };
};
