import * as THREE from "three";

import { createRng } from "../util/math";
import { addBakedBox, addBox, lambert, type StreetModel } from "./mesh";
import { addWindow, createWindowKit, WINDOW_KIND, type WindowKind } from "./windows";

const TOWER_PALETTE = [0x141820, 0x1c1b18, 0x10141c, 0x171b24, 0x12161a];
const WAREHOUSE_PALETTE = [0x2a2420, 0x312821, 0x241e1c, 0x1e2428];
const TRIM = 0x3a342c;

type Rng = () => number;

const pick = (random: Rng, palette: readonly number[]): number => {
  return palette[Math.floor(random() * palette.length)] ?? palette[0];
};

const fillFacade = (
  group: THREE.Group,
  faceX: number,
  depth: number,
  floorY: readonly number[],
  kind: WindowKind,
  kit: ReturnType<typeof createWindowKit>,
  random: Rng,
) => {
  const columns = depth > 12 ? 3 : 2;
  const span = depth * 0.62;
  for (const y of floorY) {
    for (let column = 0; column < columns; column += 1) {
      if (random() > 0.9) {
        continue;
      }
      const z = (column - (columns - 1) / 2) * (span / Math.max(columns - 1, 1));
      addWindow(group, kind, faceX, y, z, kit, random() > 0.22, random() > 0.35);
    }
  }
};

const createSlab = (random: Rng): StreetModel => {
  const roll = random();
  const width = roll > 0.66 ? 6 + random() * 4 : 9 + random() * 8;
  const depth = 8 + random() * 10;
  const height = roll < 0.3 ? 9 + random() * 8 : roll < 0.65 ? 18 + random() * 16 : 38 + random() * 34;
  const group = new THREE.Group();
  const wall = pick(random, TOWER_PALETTE);
  addBakedBox(group, width, height, depth, 0, height / 2, 0, wall);
  addBox(group, width * 0.45, 3 + random() * 5, depth * 0.4, 0, height + 2, 0, lambert(0x0c0e12));

  const kit = createWindowKit(TRIM);
  const floors = Math.max(3, Math.floor(height / 6));
  for (let floor = 0; floor < floors; floor += 1) {
    const y = 3.2 + floor * ((height - 5) / floors);
    const kind = floor % 3 === 2 ? WINDOW_KIND.STRIP : WINDOW_KIND.PUNCHED;
    fillFacade(group, width / 2, depth, [y], kind, kit, random);
  }

  const railX = width / 2 + 0.35;
  addBox(group, 0.08, height * 0.72, 0.08, railX, height * 0.42, depth * 0.28, kit.frame);
  addBox(group, 0.08, height * 0.72, 0.08, railX, height * 0.42, depth * 0.42, kit.frame);
  for (let step = 0; step < 4; step += 1) {
    addBox(group, 0.7, 0.08, 0.9, railX, 4 + step * (height * 0.14), depth * 0.35, kit.trim);
  }
  return { object: group, width, depth };
};

const createSetback = (random: Rng): StreetModel => {
  const width = 8 + random() * 10;
  const depth = 8 + random() * 9;
  const group = new THREE.Group();
  const wall = pick(random, TOWER_PALETTE);
  const tiers = [
    { scale: 1, height: 6 + random() * 14 },
    { scale: 0.62 + random() * 0.16, height: 5 + random() * 12 },
    { scale: 0.32 + random() * 0.18, height: 4 + random() * 16 },
  ];
  const kit = createWindowKit(0x4a453c);
  let floor = 0;

  for (const tier of tiers) {
    const tierWidth = width * tier.scale;
    const tierDepth = depth * tier.scale;
    const y = floor + tier.height / 2;
    addBakedBox(group, tierWidth, tier.height, tierDepth, 0, y, 0, wall);
    addBox(group, tierWidth + 0.4, 0.28, tierDepth + 0.4, 0, floor + tier.height, 0, kit.trim);
    const faceX = tierWidth / 2;
    const kind = tier.scale < 0.5 ? WINDOW_KIND.SLIT : tier.scale < 0.8 ? WINDOW_KIND.BAY : WINDOW_KIND.PUNCHED;
    const rowY = floor + tier.height * 0.55;
    fillFacade(group, faceX, tierDepth, [rowY], kind, kit, random);
    floor += tier.height;
  }

  addBox(group, 0.18, 4, 0.18, 0, floor + 2, 0, lambert(0x2a2e33));
  return { object: group, width, depth };
};

const createWarehouse = (random: Rng): StreetModel => {
  const width = 11 + random() * 12;
  const depth = 9 + random() * 10;
  const height = 6 + random() * 14;
  const group = new THREE.Group();
  const wall = pick(random, WAREHOUSE_PALETTE);
  addBakedBox(group, width, height, depth, 0, height / 2, 0, wall);
  addBox(group, width + 0.3, 0.35, depth + 0.3, 0, height, 0, lambert(0x3c342c));

  const kit = createWindowKit(0x5c4636);
  fillFacade(group, width / 2, depth, [height * 0.62, height * 0.38], WINDOW_KIND.GRID, kit, random);
  addBox(group, 0.4, height * 0.38, 2.2, width / 2 - 0.05, height * 0.2, 0, kit.recess);

  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.3, 6), lambert(0x2a3134));
  tank.position.set(-width * 0.15, height + 1.5, 0);
  group.add(tank);
  addBox(group, 0.12, 1.1, 0.12, -width * 0.15 - 0.4, height + 0.5, -0.4, kit.frame);
  addBox(group, 0.12, 1.1, 0.12, -width * 0.15 + 0.4, height + 0.5, 0.4, kit.frame);
  return { object: group, width, depth };
};

export const getBuildingModel = (seed: number): StreetModel => {
  const random = createRng(seed);
  const kind = Math.floor(random() * 3);
  switch (kind) {
    case 0:
      return createSetback(random);
    case 1:
      return createWarehouse(random);
    default:
      return createSlab(random);
  }
};
