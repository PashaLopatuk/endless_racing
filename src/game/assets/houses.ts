import * as THREE from "three";

import { createRng } from "../util/math";
import { addBakedBox, addBox, bakeStreetFace, BAKED_FACADE, lambert, type StreetModel } from "./mesh";
import { addWindow, createWindowKit, WINDOW_KIND } from "./windows";

const HOUSE_PALETTE = [0x4a342c, 0x3e2e28, 0x52382e, 0x2f3834, 0x3a322c];

type Rng = () => number;

const pick = (random: Rng, palette: readonly number[]): number => {
  return palette[Math.floor(random() * palette.length)] ?? palette[0];
};

const addDoor = (group: THREE.Group, faceX: number, z: number, trim: THREE.Material, door: THREE.Material) => {
  addBox(group, 0.18, 2.1, 1.05, faceX - 0.02, 1.15, z, trim);
  addBox(group, 0.08, 1.85, 0.78, faceX + 0.06, 1.05, z, door);
  addBox(group, 0.06, 0.08, 0.08, faceX + 0.12, 1.05, z + 0.24, trim);
  for (let step = 0; step < 3; step += 1) {
    addBox(group, 0.28, 0.14, 1.15 - step * 0.08, faceX + 0.2 + step * 0.22, 0.14 + step * 0.14, z, trim);
  }
};

const createBrownstone = (random: Rng): StreetModel => {
  const width = 6.2;
  const depth = 8 + random() * 1.5;
  const height = 9.5 + random() * 2;
  const group = new THREE.Group();
  const wall = pick(random, HOUSE_PALETTE);
  const kit = createWindowKit(0x6a5344);
  addBakedBox(group, width, height, depth, 0, height / 2, 0, wall);
  addBox(group, width + 0.35, 0.28, depth + 0.2, 0, height, 0, kit.trim);
  addDoor(group, width / 2, -depth * 0.22, kit.trim, lambert(0x1a120e));

  for (let floor = 0; floor < 3; floor += 1) {
    const y = 2.4 + floor * 2.35;
    addWindow(group, WINDOW_KIND.PUNCHED, width / 2, y, depth * 0.16, kit, random() > 0.35, true);
    addWindow(group, WINDOW_KIND.PUNCHED, width / 2, y, depth * 0.16 + 1.35, kit, random() > 0.5, floor === 0);
  }
  return { object: group, width, depth };
};

const createGableHouse = (random: Rng): StreetModel => {
  const width = 7.4;
  const depth = 7 + random() * 1.2;
  const wallHeight = 4.6;
  const roofHeight = 2.4;
  const group = new THREE.Group();
  const wall = pick(random, HOUSE_PALETTE);
  const kit = createWindowKit(0x5c4a3c);
  const shape = new THREE.Shape();
  const half = width / 2;
  shape.moveTo(-half, 0);
  shape.lineTo(half, 0);
  shape.lineTo(half, wallHeight);
  shape.lineTo(0, wallHeight + roofHeight);
  shape.lineTo(-half, wallHeight);
  const shellGeometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  shellGeometry.translate(0, 0, -depth / 2);
  bakeStreetFace(shellGeometry, wall);
  const shell = new THREE.Mesh(shellGeometry, BAKED_FACADE);
  group.add(shell);

  addWindow(group, WINDOW_KIND.BAY, half, 1.7, 0.2, kit, random() > 0.3, true);
  addWindow(group, WINDOW_KIND.PUNCHED, half, 3.5, -depth * 0.22, kit, random() > 0.4, false);
  addDoor(group, half, depth * 0.22, kit.trim, lambert(0x241810));
  addBox(group, 0.45, 1.6, 0.45, -width * 0.18, wallHeight + roofHeight * 0.45, -depth * 0.15, lambert(0x3a3030));
  return { object: group, width, depth };
};

const createTownhouse = (random: Rng): StreetModel => {
  const width = 5.4;
  const depth = 9 + random();
  const height = 11 + random() * 1.5;
  const group = new THREE.Group();
  const wall = pick(random, HOUSE_PALETTE);
  const kit = createWindowKit(0x4e4338);
  addBakedBox(group, width, height, depth, 0, height / 2, 0, wall);
  addBox(group, width * 0.72, 1.4, depth * 0.72, 0, height + 0.6, 0, lambert(0x241c18));
  addDoor(group, width / 2, 0, kit.trim, lambert(0x140e0c));

  for (let floor = 0; floor < 3; floor += 1) {
    addWindow(group, WINDOW_KIND.SLIT, width / 2, 2.6 + floor * 2.5, -depth * 0.22, kit, random() > 0.45, floor !== 1);
    addWindow(group, WINDOW_KIND.SLIT, width / 2, 2.6 + floor * 2.5, depth * 0.22, kit, random() > 0.45, true);
  }
  return { object: group, width, depth };
};

export const getHouseModel = (seed: number): StreetModel => {
  const random = createRng(seed);
  const kind = Math.floor(random() * 3);
  switch (kind) {
    case 0:
      return createGableHouse(random);
    case 1:
      return createTownhouse(random);
    default:
      return createBrownstone(random);
  }
};
