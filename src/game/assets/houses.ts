import * as THREE from "three";

import { BATCH_LAYER } from "../constants/assets";
import {
  BROWNSTONE,
  BUNGALOW,
  GABLE_HOUSE,
  HOUSE_STYLE,
  HOUSE_STYLE_WEIGHTS,
  MODERN_HOUSE,
  SHOP_HOUSE,
  TOWNHOUSE,
  type HouseStyle,
} from "../constants/houses";
import {
  AWNING_PALETTE,
  DOOR_PALETTE,
  HOUSE_PALETTE,
  NEON_PALETTE,
  ROOF_PALETTE,
  TRIM_PALETTE,
} from "../constants/palette";
import {
  GLOW_PROFILE,
  WINDOW_KIND,
  type WindowKind,
} from "../constants/environment/buildingsWindows";
import { MIRRORED_SIDES, QUARTER_PI } from "../constants/world";
import type { Rng } from "../types";
import { clamp } from "../util/math";
import {
  chance,
  createRng,
  pick,
  pickWeighted,
  randomIn,
} from "../util/random";
import { addCornice, addDoor, addWall, pickWallColor } from "./facade";
import {
  createStreetMeshBatch,
  toStreetModel,
  type IMeshBatch,
  type IStreetModel,
} from "./meshBatch";
import { addWindow } from "./windows";

/** Colors rolled once per house and shared by every part builder. */
interface IHouseContext {
  batch: IMeshBatch;
  random: Rng;
  wall: number;
  trim: number;
  roof: number;
  door: number;
}

interface IHouseWindowSpec {
  faceX: number;
  y: number;
  z: number;
}

interface IGableRoofSpec {
  width: number;
  wallHeight: number;
  roofHeight: number;
  depth: number;
}

type HouseBuilder = (context: IHouseContext) => IStreetModel;

const createHouseContext = (random: Rng): IHouseContext => ({
  batch: createStreetMeshBatch(),
  random,
  wall: pickWallColor(random, HOUSE_PALETTE),
  trim: pick(random, TRIM_PALETTE),
  roof: pick(random, ROOF_PALETTE),
  door: pick(random, DOOR_PALETTE),
});

const addHouseWindow = (
  context: IHouseContext,
  kind: WindowKind,
  { faceX, y, z }: IHouseWindowSpec,
) => {
  addWindow(context.batch, {
    kind,
    faceX,
    y,
    z,
    trim: context.trim,
    glow: GLOW_PROFILE.RESIDENTIAL,
    random: context.random,
  });
};

const createGablePrism = (
  width: number,
  height: number,
  depth: number,
): THREE.BufferGeometry => {
  const shape = new THREE.Shape();

  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, height);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });

  geometry.translate(0, 0, -depth / 2);

  return geometry;
};

const createHipRoof = (
  width: number,
  height: number,
  depth: number,
): THREE.BufferGeometry => {
  const geometry = new THREE.ConeGeometry(
    BUNGALOW.HIP_ROOF_RADIUS,
    1,
    BUNGALOW.HIP_ROOF_SIDES,
  );

  geometry.rotateY(QUARTER_PI);
  geometry.scale(width, height, depth);

  return geometry;
};

const buildBrownstone: HouseBuilder = (context) => {
  const { batch, random } = context;
  const width = randomIn(random, BROWNSTONE.WIDTH);
  const depth = randomIn(random, BROWNSTONE.DEPTH);
  const height = randomIn(random, BROWNSTONE.HEIGHT);
  const faceX = width / 2;

  addWall(batch, { width, height, depth, color: context.wall });

  addCornice(batch, {
    width,
    depth,
    y: height,
    overhang: BROWNSTONE.CORNICE.OVERHANG,
    height: BROWNSTONE.CORNICE.HEIGHT,
    color: context.trim,
  });

  addDoor(batch, {
    faceX,
    z: depth * BROWNSTONE.DOOR_Z_RATIO,
    trim: context.trim,
    door: context.door,
    hasSteps: true,
  });

  const firstZ = depth * BROWNSTONE.WINDOW_Z_RATIO;

  for (let floor = 0; floor < BROWNSTONE.FLOORS; floor += 1) {
    const y = BROWNSTONE.FIRST_FLOOR_Y + floor * BROWNSTONE.FLOOR_STEP;

    addHouseWindow(context, WINDOW_KIND.PUNCHED, { faceX, y, z: firstZ });
    addHouseWindow(context, WINDOW_KIND.PUNCHED, {
      faceX,
      y,
      z: firstZ + BROWNSTONE.WINDOW_PAIR_GAP,
    });
  }

  return toStreetModel(batch, width, depth);
};

const addGableRoof = (
  context: IHouseContext,
  { width, wallHeight, roofHeight, depth }: IGableRoofSpec,
) => {
  const half = width / 2;
  const slope = Math.atan2(roofHeight, half);
  const slopeLength = Math.hypot(half, roofHeight) + GABLE_HOUSE.ROOF_OVERHANG;

  context.batch.addGeometry({
    geometry: createGablePrism(width, roofHeight, depth),
    position: [0, wallHeight, 0],
    color: context.wall,
    isShaded: true,
  });

  for (const side of MIRRORED_SIDES) {
    context.batch.addBox({
      size: [
        slopeLength,
        GABLE_HOUSE.ROOF_THICKNESS,
        depth + GABLE_HOUSE.ROOF_OVERHANG * 2,
      ],
      rotation: [0, 0, -side * slope],
      position: [
        (side * half) / 2,
        wallHeight + roofHeight / 2 + GABLE_HOUSE.ROOF_THICKNESS / 2,
        0,
      ],
      color: context.roof,
    });
  }
};

const buildGableHouse: HouseBuilder = (context) => {
  const { batch, random } = context;
  const width = randomIn(random, GABLE_HOUSE.WIDTH);
  const depth = randomIn(random, GABLE_HOUSE.DEPTH);
  const wallHeight = randomIn(random, GABLE_HOUSE.WALL_HEIGHT);
  const roofHeight = randomIn(random, GABLE_HOUSE.ROOF_HEIGHT);
  const faceX = width / 2;

  addWall(batch, { width, height: wallHeight, depth, color: context.wall });
  addGableRoof(context, { width, wallHeight, roofHeight, depth });

  addHouseWindow(context, WINDOW_KIND.BAY, {
    faceX,
    y: GABLE_HOUSE.BAY_Y,
    z: GABLE_HOUSE.BAY_Z,
  });

  addHouseWindow(context, WINDOW_KIND.PUNCHED, {
    faceX,
    y: GABLE_HOUSE.UPPER_WINDOW_Y,
    z: depth * GABLE_HOUSE.UPPER_WINDOW_Z_RATIO,
  });

  addDoor(batch, {
    faceX,
    z: depth * GABLE_HOUSE.DOOR_Z_RATIO,
    trim: context.trim,
    door: context.door,
    hasSteps: false,
  });

  const chimney = GABLE_HOUSE.CHIMNEY;

  batch.addBox({
    size: chimney.SIZE,
    position: [
      width * chimney.X_RATIO,
      wallHeight + roofHeight * chimney.ROOF_RATIO,
      depth * chimney.Z_RATIO,
    ],
    color: context.trim,
  });

  return toStreetModel(batch, width, depth);
};

const buildTownhouse: HouseBuilder = (context) => {
  const { batch, random } = context;
  const width = randomIn(random, TOWNHOUSE.WIDTH);
  const depth = randomIn(random, TOWNHOUSE.DEPTH);
  const height = randomIn(random, TOWNHOUSE.HEIGHT);
  const faceX = width / 2;
  const windowKind = chance(random, TOWNHOUSE.BAY_CHANCE)
    ? WINDOW_KIND.BAY
    : WINDOW_KIND.SLIT;
  const parapet = TOWNHOUSE.PARAPET;

  addWall(batch, { width, height, depth, color: context.wall });

  batch.addBox({
    size: [
      width * parapet.WIDTH_RATIO,
      parapet.HEIGHT,
      depth * parapet.DEPTH_RATIO,
    ],
    position: [0, height + parapet.HEIGHT / 2, 0],
    color: context.roof,
  });

  addDoor(batch, {
    faceX,
    z: 0,
    trim: context.trim,
    door: context.door,
    hasSteps: true,
  });

  const windowZ = depth * TOWNHOUSE.WINDOW_Z_RATIO;

  for (let floor = 0; floor < TOWNHOUSE.FLOORS; floor += 1) {
    const y = TOWNHOUSE.FIRST_FLOOR_Y + floor * TOWNHOUSE.FLOOR_STEP;

    for (const side of MIRRORED_SIDES) {
      addHouseWindow(context, windowKind, { faceX, y, z: side * windowZ });
    }
  }
  return toStreetModel(batch, width, depth);
};

const addPorch = (context: IHouseContext, faceX: number, depth: number) => {
  const porch = BUNGALOW.PORCH;
  const length = depth * porch.LENGTH_RATIO;
  const columnHeight = porch.ROOF_Y - porch.DECK_HEIGHT;

  context.batch.addBox({
    size: [porch.DEPTH, porch.DECK_HEIGHT, length],
    position: [faceX + porch.DEPTH / 2, porch.DECK_HEIGHT / 2, 0],
    color: context.trim,
  });

  for (let column = 0; column < porch.COLUMN_COUNT; column += 1) {
    const z =
      -length / 2 +
      porch.COLUMN_SIZE / 2 +
      (column * (length - porch.COLUMN_SIZE)) / (porch.COLUMN_COUNT - 1);

    context.batch.addBox({
      size: [porch.COLUMN_SIZE, columnHeight, porch.COLUMN_SIZE],
      position: [
        faceX + porch.DEPTH - porch.COLUMN_SIZE / 2,
        porch.DECK_HEIGHT + columnHeight / 2,
        z,
      ],
      color: context.trim,
    });
  }

  context.batch.addBox({
    size: [
      porch.DEPTH + porch.ROOF_OVERHANG,
      porch.ROOF_THICKNESS,
      length + porch.ROOF_OVERHANG * 2,
    ],
    position: [
      faceX + (porch.DEPTH + porch.ROOF_OVERHANG) / 2,
      porch.ROOF_Y,
      0,
    ],
    color: context.roof,
  });
};

const buildBungalow: HouseBuilder = (context) => {
  const { batch, random } = context;
  const bodyWidth = randomIn(random, BUNGALOW.BODY_WIDTH);
  const depth = randomIn(random, BUNGALOW.DEPTH);
  const wallHeight = randomIn(random, BUNGALOW.WALL_HEIGHT);
  const roofHeight = randomIn(random, BUNGALOW.ROOF_HEIGHT);
  const width = bodyWidth + BUNGALOW.PORCH.DEPTH;
  const bodyX = -BUNGALOW.PORCH.DEPTH / 2;
  const faceX = bodyX + bodyWidth / 2;
  const overhang = BUNGALOW.ROOF_OVERHANG * 2;

  addWall(batch, {
    width: bodyWidth,
    height: wallHeight,
    depth,
    color: context.wall,
    x: bodyX,
  });

  batch.addGeometry({
    geometry: createHipRoof(bodyWidth + overhang, roofHeight, depth + overhang),
    position: [bodyX, wallHeight + roofHeight / 2, 0],
    color: context.roof,
  });

  addPorch(context, faceX, depth);

  addDoor(batch, {
    faceX,
    z: 0,
    trim: context.trim,
    door: context.door,
    hasSteps: false,
  });

  for (const side of MIRRORED_SIDES) {
    addHouseWindow(context, WINDOW_KIND.GRID, {
      faceX,
      y: BUNGALOW.WINDOW_Y,
      z: side * depth * BUNGALOW.WINDOW_Z_RATIO,
    });
  }

  return toStreetModel(batch, width, depth);
};

const buildModernHouse: HouseBuilder = (context) => {
  const { batch, random } = context;
  const width = randomIn(random, MODERN_HOUSE.WIDTH);
  const depth = randomIn(random, MODERN_HOUSE.DEPTH);

  const baseHeight = randomIn(random, MODERN_HOUSE.BASE_HEIGHT);
  const upperWidth = width * randomIn(random, MODERN_HOUSE.UPPER_WIDTH_RATIO);
  const upperDepth = depth * randomIn(random, MODERN_HOUSE.UPPER_DEPTH_RATIO);
  const upperHeight = randomIn(random, MODERN_HOUSE.UPPER_HEIGHT);
  const maxShift = (depth - upperDepth) / 2;

  const upperZ = clamp(
    depth * randomIn(random, MODERN_HOUSE.UPPER_SHIFT_Z_RATIO),
    -maxShift,
    maxShift,
  );
  const upperX = (width - upperWidth) / 2;
  const faceX = width / 2;
  const edge = MODERN_HOUSE.ROOF_EDGE;
  const panel = MODERN_HOUSE.PANEL;

  addWall(batch, { width, height: baseHeight, depth, color: context.wall });

  addCornice(batch, {
    width,
    depth,
    y: baseHeight,
    overhang: edge.OVERHANG,
    height: edge.HEIGHT,
    color: context.roof,
  });

  addWall(batch, {
    width: upperWidth,
    height: upperHeight,
    depth: upperDepth,
    color: pickWallColor(random, HOUSE_PALETTE),
    x: upperX,
    z: upperZ,
    baseY: baseHeight,
  });

  addCornice(batch, {
    width: upperWidth,
    depth: upperDepth,
    y: baseHeight + upperHeight,
    overhang: edge.OVERHANG,
    height: edge.HEIGHT,
    color: context.roof,
    x: upperX,
    z: upperZ,
  });

  const panelDepth = upperDepth * panel.DEPTH_RATIO;

  batch.addBox({
    size: [panel.THICKNESS, upperHeight, panelDepth],
    position: [
      faceX + panel.THICKNESS / 2,
      baseHeight + upperHeight / 2,
      upperZ + upperDepth / 2 - panelDepth / 2,
    ],
    color: context.trim,
  });

  addHouseWindow(context, WINDOW_KIND.STRIP, {
    faceX,
    y: baseHeight * MODERN_HOUSE.WINDOW_Y_RATIO,
    z: depth * MODERN_HOUSE.BASE_WINDOW_Z_RATIO,
  });

  addHouseWindow(context, WINDOW_KIND.STRIP, {
    faceX,
    y: baseHeight + upperHeight * MODERN_HOUSE.WINDOW_Y_RATIO,
    z: upperZ - panelDepth / 2,
  });

  addDoor(batch, {
    faceX,
    z: depth * MODERN_HOUSE.DOOR_Z_RATIO,
    trim: context.trim,
    door: context.door,
    hasSteps: false,
  });
  return toStreetModel(batch, width, depth);
};

const buildShopHouse: HouseBuilder = (context) => {
  const { batch, random } = context;
  const width = randomIn(random, SHOP_HOUSE.WIDTH);
  const depth = randomIn(random, SHOP_HOUSE.DEPTH);
  const height = randomIn(random, SHOP_HOUSE.HEIGHT);
  const faceX = width / 2;
  const { AWNING, SIGN, STOREFRONT, CORNICE } = SHOP_HOUSE;

  addWall(batch, { width, height, depth, color: context.wall });

  addCornice(batch, {
    width,
    depth,
    y: height,
    overhang: CORNICE.OVERHANG,
    height: CORNICE.HEIGHT,
    color: context.trim,
  });

  addWindow(batch, {
    kind: WINDOW_KIND.SHOP,
    faceX,
    y: STOREFRONT.Y,
    z: depth * STOREFRONT.Z_RATIO,
    trim: context.trim,
    glow: GLOW_PROFILE.STOREFRONT,
    random,
  });

  addDoor(batch, {
    faceX,
    z: depth * SHOP_HOUSE.DOOR_Z_RATIO,
    trim: context.trim,
    door: context.door,
    hasSteps: false,
  });

  batch.addBox({
    size: [AWNING.DEPTH, AWNING.THICKNESS, depth * AWNING.LENGTH_RATIO],
    rotation: [0, 0, -AWNING.TILT],
    position: [
      faceX + (AWNING.DEPTH / 2) * Math.cos(AWNING.TILT),
      AWNING.Y - (AWNING.DEPTH / 2) * Math.sin(AWNING.TILT),
      0,
    ],
    color: pick(random, AWNING_PALETTE),
  });

  batch.addBox({
    size: [SIGN.DEPTH, SIGN.HEIGHT, depth * SIGN.LENGTH_RATIO],
    position: [faceX + SIGN.DEPTH / 2, SIGN.Y, 0],
    color: pick(random, NEON_PALETTE),
    layer: BATCH_LAYER.GLOW,
  });

  for (const side of MIRRORED_SIDES) {
    addHouseWindow(context, WINDOW_KIND.PUNCHED, {
      faceX,
      y: SHOP_HOUSE.UPPER_WINDOW_Y,
      z: side * depth * SHOP_HOUSE.UPPER_WINDOW_SPREAD_RATIO,
    });
  }

  return toStreetModel(batch, width, depth);
};

const BUILDERS: Readonly<Record<HouseStyle, HouseBuilder>> = {
  [HOUSE_STYLE.BROWNSTONE]: buildBrownstone,
  [HOUSE_STYLE.GABLE]: buildGableHouse,
  [HOUSE_STYLE.TOWNHOUSE]: buildTownhouse,
  [HOUSE_STYLE.BUNGALOW]: buildBungalow,
  [HOUSE_STYLE.MODERN]: buildModernHouse,
  [HOUSE_STYLE.SHOP]: buildShopHouse,
};

/** Deterministic: the same seed always yields the same house. */
export const createHouseModel = (seed: number): IStreetModel => {
  const random = createRng(seed);

  const { style } = pickWeighted(random, HOUSE_STYLE_WEIGHTS);

  return BUILDERS[style](createHouseContext(random));
};
