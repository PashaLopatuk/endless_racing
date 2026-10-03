import * as THREE from "three";

import { addBox, lambert } from "./mesh";

const GLASS_WARM = 0xe6c48a;
const GLASS_COOL = 0x8eb4c4;
const GLASS_DARK = 0x121820;

export const WINDOW_KIND = {
  PUNCHED: "punched",
  BAY: "bay",
  STRIP: "strip",
  SLIT: "slit",
  GRID: "grid",
} as const;

export type WindowKind = (typeof WINDOW_KIND)[keyof typeof WINDOW_KIND];

export type WindowKit = {
  frame: THREE.MeshLambertMaterial;
  recess: THREE.MeshLambertMaterial;
  trim: THREE.MeshLambertMaterial;
  glassWarm: THREE.Material;
  glassCool: THREE.Material;
  glassDark: THREE.Material;
};

const keep = (material: THREE.Material): THREE.Material => {
  material.userData.keepAlive = true;
  return material;
};

const GLASS_WARM_MATERIAL = keep(new THREE.MeshBasicMaterial({ color: GLASS_WARM }));
const GLASS_COOL_MATERIAL = keep(new THREE.MeshBasicMaterial({ color: GLASS_COOL }));
const GLASS_DARK_MATERIAL = keep(new THREE.MeshBasicMaterial({ color: GLASS_DARK }));

export const createWindowKit = (trimColor: number): WindowKit => {
  return {
    frame: lambert(0x1a1c20),
    recess: lambert(0x07080b),
    trim: lambert(trimColor),
    glassWarm: GLASS_WARM_MATERIAL,
    glassCool: GLASS_COOL_MATERIAL,
    glassDark: GLASS_DARK_MATERIAL,
  };
};

const glassFor = (kit: WindowKit, lit: boolean, warm: boolean): THREE.Material => {
  if (!lit) {
    return kit.glassDark;
  }
  return warm ? kit.glassWarm : kit.glassCool;
};

const addFrame = (
  group: THREE.Group,
  faceX: number,
  y: number,
  z: number,
  width: number,
  height: number,
  material: THREE.Material,
) => {
  const depth = 0.14;
  const bar = 0.1;
  const x = faceX + depth / 2;
  addBox(group, depth, bar, width + bar, x, y + height / 2, z, material);
  addBox(group, depth, bar, width + bar, x, y - height / 2, z, material);
  addBox(group, depth, height, bar, x, y, z - width / 2, material);
  addBox(group, depth, height, bar, x, y, z + width / 2, material);
};

const addPunchedWindow = (
  group: THREE.Group,
  faceX: number,
  y: number,
  z: number,
  kit: WindowKit,
  lit: boolean,
  warm: boolean,
) => {
  const width = 0.78;
  const height = 1.2;
  addBox(group, 0.22, height, width, faceX - 0.04, y, z, kit.recess);
  addFrame(group, faceX, y, z, width, height, kit.frame);
  addBox(group, 0.06, height - 0.22, width - 0.18, faceX + 0.02, y, z, glassFor(kit, lit, warm));
  addBox(group, 0.22, 0.08, width + 0.28, faceX + 0.1, y - height / 2 - 0.02, z, kit.trim);
};

const addBayWindow = (group: THREE.Group, faceX: number, y: number, z: number, kit: WindowKit, lit: boolean, warm: boolean) => {
  const glass = glassFor(kit, lit, warm);
  addBox(group, 0.62, 1.45, 1.45, faceX + 0.28, y, z, kit.trim);
  addBox(group, 0.08, 1.05, 1.05, faceX + 0.6, y + 0.05, z, glass);
  addBox(group, 0.4, 0.9, 0.06, faceX + 0.28, y + 0.05, z - 0.72, glass);
  addBox(group, 0.4, 0.9, 0.06, faceX + 0.28, y + 0.05, z + 0.72, glass);
  addBox(group, 0.74, 0.1, 1.65, faceX + 0.3, y + 0.78, z, kit.frame);
  addBox(group, 0.78, 0.1, 1.7, faceX + 0.32, y - 0.72, z, kit.trim);
};

const addStripWindow = (group: THREE.Group, faceX: number, y: number, z: number, kit: WindowKit, lit: boolean, warm: boolean) => {
  const width = 2.6;
  const height = 0.72;
  const panes = 4;
  addBox(group, 0.18, height, width, faceX - 0.02, y, z, kit.recess);
  addFrame(group, faceX, y, z, width, height, kit.frame);
  const paneWidth = (width - 0.2) / panes;
  for (let index = 0; index < panes; index += 1) {
    const paneZ = z - width / 2 + 0.16 + paneWidth / 2 + index * paneWidth;
    addBox(group, 0.05, height - 0.18, paneWidth - 0.08, faceX + 0.03, y, paneZ, glassFor(kit, lit, index % 2 === 0 ? warm : !warm));
  }
  for (let index = 1; index < panes; index += 1) {
    const mullionZ = z - width / 2 + 0.16 + index * paneWidth;
    addBox(group, 0.1, height - 0.08, 0.06, faceX + 0.06, y, mullionZ, kit.frame);
  }
};

const addSlitWindow = (group: THREE.Group, faceX: number, y: number, z: number, kit: WindowKit, lit: boolean, warm: boolean) => {
  const width = 0.32;
  const height = 2.15;
  addBox(group, 0.28, height, width, faceX - 0.06, y, z, kit.recess);
  addFrame(group, faceX, y, z, width + 0.16, height, kit.trim);
  addBox(group, 0.05, height - 0.28, width - 0.08, faceX + 0.02, y, z, glassFor(kit, lit, warm));
  addBox(group, 0.12, 0.08, width + 0.2, faceX + 0.08, y, z, kit.frame);
};

const addGridWindow = (group: THREE.Group, faceX: number, y: number, z: number, kit: WindowKit, lit: boolean, warm: boolean) => {
  const size = 1.15;
  addBox(group, 0.2, size, size, faceX - 0.02, y, z, kit.recess);
  addFrame(group, faceX, y, z, size, size, kit.frame);
  addBox(group, 0.05, size - 0.2, size - 0.2, faceX + 0.02, y, z, glassFor(kit, lit, warm));
  addBox(group, 0.1, size - 0.12, 0.07, faceX + 0.07, y, z, kit.frame);
  addBox(group, 0.1, 0.07, size - 0.12, faceX + 0.07, y, z, kit.frame);
};

export const addWindow = (
  group: THREE.Group,
  kind: WindowKind,
  faceX: number,
  y: number,
  z: number,
  kit: WindowKit,
  lit: boolean,
  warm: boolean,
) => {
  switch (kind) {
    case WINDOW_KIND.BAY:
      addBayWindow(group, faceX, y, z, kit, lit, warm);
      return;
    case WINDOW_KIND.STRIP:
      addStripWindow(group, faceX, y, z, kit, lit, warm);
      return;
    case WINDOW_KIND.SLIT:
      addSlitWindow(group, faceX, y, z, kit, lit, warm);
      return;
    case WINDOW_KIND.GRID:
      addGridWindow(group, faceX, y, z, kit, lit, warm);
      return;
    case WINDOW_KIND.PUNCHED:
      addPunchedWindow(group, faceX, y, z, kit, lit, warm);
      return;
  }
};
