import * as THREE from "three";

import { BATCH_LAYER } from "../constants/assets";
import {
  APARTMENT_BLOCK,
  BUILDING_STYLE,
  BUILDING_STYLE_WEIGHTS,
  FACADE,
  OFFICE_TOWER,
  SETBACK_TOWER,
  SLAB_TOWER,
  WAREHOUSE,
  type BuildingStyle,
} from "../constants/environment/buildings";
import {
  APARTMENT_PALETTE,
  METAL_PALETTE,
  NEON_PALETTE,
  OFFICE_PALETTE,
  TOWER_PALETTE,
  TRIM_PALETTE,
  WAREHOUSE_PALETTE,
} from "../constants/palette";
import {
  GLOW_PROFILE,
  WINDOW_COLORS,
  WINDOW_KIND,
} from "../constants/environment/buildingsWindows";
import { MIRRORED_SIDES } from "../constants/world";
import type { Rng } from "../types";
import {
  chance,
  createRng,
  pick,
  pickWeighted,
  randomIn,
  randomIntIn,
} from "../util/random";
import {
  addCornice,
  addWall,
  addWindowRow,
  columnZ,
  pickWallColor,
} from "./facade";
import {
  createMeshBatch,
  toStreetModel,
  type MeshBatch,
  type StreetModel,
} from "./meshBatch";
import { windowGlowColor } from "./windows";

type BuildingBuilder = (random: Rng) => StreetModel;

interface CorniceSize {
  OVERHANG: number;
  HEIGHT: number;
}

const corniceSize = (cornice: CorniceSize) => ({
  overhang: cornice.OVERHANG,
  height: cornice.HEIGHT,
});

interface FireEscapeSpec {
  faceX: number;
  depth: number;
  height: number;
  color: number;
}

const addFireEscape = (
  batch: MeshBatch,
  { faceX, depth, height, color }: FireEscapeSpec,
) => {
  const escape = SLAB_TOWER.FIRE_ESCAPE;
  const x = faceX + escape.OFFSET;
  for (const zRatio of escape.RAIL_Z_RATIOS) {
    batch.addBox({
      size: [escape.RAIL_SIZE, height * escape.HEIGHT_RATIO, escape.RAIL_SIZE],
      position: [x, height * escape.Y_RATIO, depth * zRatio],
      color: WINDOW_COLORS.FRAME,
    });
  }
  for (let landing = 0; landing < escape.LANDING_COUNT; landing += 1) {
    batch.addBox({
      size: escape.LANDING_SIZE,
      position: [
        x,
        escape.FIRST_LANDING_Y + landing * height * escape.LANDING_STEP_RATIO,
        depth * escape.LANDING_Z_RATIO,
      ],
      color,
    });
  }
};

const buildSlabTower: BuildingBuilder = (random) => {
  const width = randomIn(
    random,
    chance(random, SLAB_TOWER.NARROW_CHANCE)
      ? SLAB_TOWER.WIDTH_NARROW
      : SLAB_TOWER.WIDTH_WIDE,
  );
  const depth = randomIn(random, SLAB_TOWER.DEPTH);
  const height = randomIn(
    random,
    pickWeighted(random, SLAB_TOWER.HEIGHT_CLASSES).height,
  );
  const trim = pick(random, TRIM_PALETTE);
  const faceX = width / 2;
  const batch = createMeshBatch();

  addWall(batch, {
    width,
    height,
    depth,
    color: pickWallColor(random, TOWER_PALETTE),
  });
  const roof = SLAB_TOWER.ROOF_BLOCK;
  const roofHeight = randomIn(random, roof.HEIGHT);
  batch.addBox({
    size: [width * roof.WIDTH_RATIO, roofHeight, depth * roof.DEPTH_RATIO],
    position: [0, height + roofHeight / 2, 0],
    color: roof.COLOR,
  });

  const floors = Math.max(
    SLAB_TOWER.MIN_FLOORS,
    Math.floor(height / SLAB_TOWER.FLOOR_HEIGHT),
  );
  const floorStep =
    (height - SLAB_TOWER.TOP_MARGIN - SLAB_TOWER.FIRST_FLOOR_Y) / floors;
  for (let floor = 0; floor < floors; floor += 1) {
    const isStripFloor =
      floor % SLAB_TOWER.STRIP_FLOOR_EVERY === SLAB_TOWER.STRIP_FLOOR_PHASE;
    addWindowRow(batch, {
      faceX,
      depth,
      y: SLAB_TOWER.FIRST_FLOOR_Y + floor * floorStep,
      kind: isStripFloor ? WINDOW_KIND.STRIP : WINDOW_KIND.PUNCHED,
      trim,
      glow: GLOW_PROFILE.RESIDENTIAL,
      random,
    });
  }
  if (chance(random, SLAB_TOWER.FIRE_ESCAPE.CHANCE)) {
    addFireEscape(batch, { faceX, depth, height, color: trim });
  }
  return toStreetModel(batch, width, depth);
};

const buildSetbackTower: BuildingBuilder = (random) => {
  const width = randomIn(random, SETBACK_TOWER.WIDTH);
  const depth = randomIn(random, SETBACK_TOWER.DEPTH);
  const wall = pickWallColor(random, TOWER_PALETTE);
  const trim = pick(random, TRIM_PALETTE);
  const batch = createMeshBatch();
  let baseY = 0;

  for (const tier of SETBACK_TOWER.TIERS) {
    const scale = randomIn(random, tier.scale);
    const tierWidth = width * scale;
    const tierDepth = depth * scale;
    const tierHeight = randomIn(random, tier.height);
    addWall(batch, {
      width: tierWidth,
      height: tierHeight,
      depth: tierDepth,
      color: wall,
      baseY,
    });
    addCornice(batch, {
      width: tierWidth,
      depth: tierDepth,
      y: baseY + tierHeight,
      ...corniceSize(SETBACK_TOWER.CORNICE),
      color: trim,
    });

    const rows = Math.max(
      1,
      Math.floor(
        (tierHeight - SETBACK_TOWER.FIRST_ROW_Y) / SETBACK_TOWER.ROW_SPACING,
      ),
    );
    for (let row = 0; row < rows; row += 1) {
      addWindowRow(batch, {
        faceX: tierWidth / 2,
        depth: tierDepth,
        y: baseY + SETBACK_TOWER.FIRST_ROW_Y + row * SETBACK_TOWER.ROW_SPACING,
        kind: tier.window,
        trim,
        glow: GLOW_PROFILE.RESIDENTIAL,
        random,
      });
    }
    baseY += tierHeight;
  }

  const spire = SETBACK_TOWER.SPIRE;
  batch.addBox({
    size: spire.SIZE,
    position: [0, baseY + spire.SIZE[1] / 2, 0],
    color: spire.COLOR,
  });
  return toStreetModel(batch, width, depth);
};

const addRoofTank = (batch: MeshBatch, width: number, height: number) => {
  const tank = WAREHOUSE.TANK;
  const tankX = width * tank.X_RATIO;
  batch.addGeometry({
    geometry: new THREE.CylinderGeometry(
      tank.RADIUS,
      tank.RADIUS,
      tank.HEIGHT,
      tank.SEGMENTS,
    ),
    position: [tankX, height + tank.LIFT, 0],
    color: tank.COLOR,
  });
  for (const side of MIRRORED_SIDES) {
    batch.addBox({
      size: tank.LEG_SIZE,
      position: [
        tankX + side * tank.LEG_OFFSET,
        height + tank.LEG_LIFT,
        side * tank.LEG_OFFSET,
      ],
      color: WINDOW_COLORS.FRAME,
    });
  }
};

const buildWarehouse: BuildingBuilder = (random) => {
  const width = randomIn(random, WAREHOUSE.WIDTH);
  const depth = randomIn(random, WAREHOUSE.DEPTH);
  const height = randomIn(random, WAREHOUSE.HEIGHT);
  const trim = pick(random, TRIM_PALETTE);
  const faceX = width / 2;
  const batch = createMeshBatch();

  addWall(batch, {
    width,
    height,
    depth,
    color: pickWallColor(random, WAREHOUSE_PALETTE),
  });
  addCornice(batch, {
    width,
    depth,
    y: height,
    ...corniceSize(WAREHOUSE.CORNICE),
    color: WAREHOUSE.CORNICE.COLOR,
  });
  for (const rowRatio of WAREHOUSE.WINDOW_ROW_RATIOS) {
    addWindowRow(batch, {
      faceX,
      depth,
      y: height * rowRatio,
      kind: WINDOW_KIND.GRID,
      trim,
      glow: GLOW_PROFILE.OFFICE,
      random,
    });
  }

  const door = WAREHOUSE.LOADING_DOOR;
  const doorHeight = height * door.HEIGHT_RATIO;
  batch.addBox({
    size: [door.THICKNESS, doorHeight, door.WIDTH],
    position: [faceX - door.INSET, doorHeight / 2, 0],
    color: WINDOW_COLORS.RECESS,
  });

  if (chance(random, WAREHOUSE.TANK.CHANCE)) {
    addRoofTank(batch, width, height);
  }
  const sign = WAREHOUSE.NEON_SIGN;
  if (chance(random, sign.CHANCE)) {
    batch.addBox({
      size: [sign.THICKNESS, sign.HEIGHT, depth * sign.LENGTH_RATIO],
      position: [faceX + sign.OFFSET, height * sign.Y_RATIO, 0],
      color: pick(random, NEON_PALETTE),
      layer: BATCH_LAYER.GLOW,
    });
  }
  return toStreetModel(batch, width, depth);
};

const buildOfficeTower: BuildingBuilder = (random) => {
  const width = randomIn(random, OFFICE_TOWER.WIDTH);
  const depth = randomIn(random, OFFICE_TOWER.DEPTH);
  const height = randomIn(random, OFFICE_TOWER.HEIGHT);
  const metal = pick(random, METAL_PALETTE);
  const faceX = width / 2;
  const batch = createMeshBatch();
  addWall(batch, {
    width,
    height,
    depth,
    color: pickWallColor(random, OFFICE_PALETTE),
  });

  const { PANE_WIDTH, FLOOR_HEIGHT, LOBBY_HEIGHT, MULLION, CROWN } =
    OFFICE_TOWER;
  const columns = Math.max(
    OFFICE_TOWER.MIN_COLUMNS,
    Math.floor((depth * OFFICE_TOWER.FACADE_COVERAGE) / PANE_WIDTH),
  );
  const glassSpan = columns * PANE_WIDTH;
  const floors = Math.floor(
    (height - LOBBY_HEIGHT - CROWN.HEIGHT) / FLOOR_HEIGHT,
  );
  const paneHeight = FLOOR_HEIGHT * OFFICE_TOWER.PANE_HEIGHT_RATIO;

  for (let floor = 0; floor < floors; floor += 1) {
    const y = LOBBY_HEIGHT + floor * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
    for (let column = 0; column < columns; column += 1) {
      batch.addBox({
        size: [
          OFFICE_TOWER.PANE_THICKNESS,
          paneHeight,
          PANE_WIDTH - MULLION.WIDTH,
        ],
        position: [
          faceX + OFFICE_TOWER.PANE_OFFSET,
          y,
          -glassSpan / 2 + PANE_WIDTH / 2 + column * PANE_WIDTH,
        ],
        color: windowGlowColor(random, GLOW_PROFILE.OFFICE),
        layer: BATCH_LAYER.GLOW,
      });
    }
  }

  const glassHeight = floors * FLOOR_HEIGHT;
  for (let column = 0; column <= columns; column += 1) {
    batch.addBox({
      size: [MULLION.DEPTH, glassHeight, MULLION.WIDTH],
      position: [
        faceX + MULLION.OFFSET,
        LOBBY_HEIGHT + glassHeight / 2,
        -glassSpan / 2 + column * PANE_WIDTH,
      ],
      color: metal,
    });
  }

  const lobby = OFFICE_TOWER.LOBBY_GLASS;
  batch.addBox({
    size: [OFFICE_TOWER.PANE_THICKNESS, lobby.HEIGHT, glassSpan],
    position: [
      faceX + OFFICE_TOWER.PANE_OFFSET,
      lobby.LIFT + lobby.HEIGHT / 2,
      0,
    ],
    color: windowGlowColor(random, GLOW_PROFILE.STOREFRONT),
    layer: BATCH_LAYER.GLOW,
  });
  addCornice(batch, {
    width,
    depth,
    y: height,
    overhang: CROWN.OVERHANG,
    height: CROWN.HEIGHT,
    color: metal,
  });

  const antenna = OFFICE_TOWER.ANTENNA;
  if (chance(random, antenna.CHANCE)) {
    const antennaBase = height + CROWN.HEIGHT;
    const antennaHeight = antenna.SIZE[1];
    batch.addBox({
      size: antenna.SIZE,
      position: [0, antennaBase + antennaHeight / 2, 0],
      color: metal,
    });
    batch.addBox({
      size: [antenna.BEACON_SIZE, antenna.BEACON_SIZE, antenna.BEACON_SIZE],
      position: [0, antennaBase + antennaHeight, 0],
      color: antenna.BEACON_COLOR,
      layer: BATCH_LAYER.GLOW,
    });
  }
  return toStreetModel(batch, width, depth);
};

interface BalconySpec {
  faceX: number;
  y: number;
  z: number;
  color: number;
}

const addBalcony = (batch: MeshBatch, { faceX, y, z, color }: BalconySpec) => {
  const balcony = APARTMENT_BLOCK.BALCONY;
  batch.addBox({
    size: [balcony.DEPTH, balcony.THICKNESS, balcony.WIDTH],
    position: [faceX + balcony.DEPTH / 2, y, z],
    color,
  });
  batch.addBox({
    size: [balcony.RAIL_THICKNESS, balcony.RAIL_HEIGHT, balcony.WIDTH],
    position: [
      faceX + balcony.DEPTH - balcony.RAIL_THICKNESS / 2,
      y + balcony.RAIL_HEIGHT / 2,
      z,
    ],
    color,
  });
};

const buildApartmentBlock: BuildingBuilder = (random) => {
  const width = randomIn(random, APARTMENT_BLOCK.WIDTH);
  const depth = randomIn(random, APARTMENT_BLOCK.DEPTH);
  const height = randomIn(random, APARTMENT_BLOCK.HEIGHT);
  const trim = pick(random, TRIM_PALETTE);
  const faceX = width / 2;
  const columns = randomIntIn(random, APARTMENT_BLOCK.COLUMNS);
  const kind = pick(random, APARTMENT_BLOCK.WINDOW_KINDS);
  const hasBalconies = chance(random, APARTMENT_BLOCK.BALCONY.CHANCE);
  const floors = Math.floor(
    (height - APARTMENT_BLOCK.FIRST_FLOOR_Y) / APARTMENT_BLOCK.FLOOR_HEIGHT,
  );
  const span = depth * FACADE.SPAN_RATIO;
  const batch = createMeshBatch();

  addWall(batch, {
    width,
    height,
    depth,
    color: pickWallColor(random, APARTMENT_PALETTE),
  });
  addCornice(batch, {
    width,
    depth,
    y: height,
    ...corniceSize(APARTMENT_BLOCK.PARAPET),
    color: trim,
  });

  for (let floor = 0; floor < floors; floor += 1) {
    const y =
      APARTMENT_BLOCK.FIRST_FLOOR_Y + floor * APARTMENT_BLOCK.FLOOR_HEIGHT;
    addWindowRow(batch, {
      faceX,
      depth,
      y,
      kind,
      trim,
      glow: GLOW_PROFILE.RESIDENTIAL,
      random,
      columns,
      skipChance: APARTMENT_BLOCK.WINDOW_SKIP_CHANCE,
    });
    if (!hasBalconies || floor === 0) {
      continue;
    }
    for (let column = 0; column < columns; column += 1) {
      addBalcony(batch, {
        faceX,
        y: y - APARTMENT_BLOCK.BALCONY.Y_DROP,
        z: columnZ(column, columns, span),
        color: trim,
      });
    }
  }

  const entrance = APARTMENT_BLOCK.ENTRANCE;
  batch.addBox({
    size: entrance.SIZE,
    position: [faceX + entrance.OFFSET, entrance.Y, 0],
    color: windowGlowColor(random, GLOW_PROFILE.STOREFRONT),
    layer: BATCH_LAYER.GLOW,
  });
  return toStreetModel(batch, width, depth);
};

const BUILDERS: Readonly<Record<BuildingStyle, BuildingBuilder>> = {
  [BUILDING_STYLE.SLAB]: buildSlabTower,
  [BUILDING_STYLE.SETBACK]: buildSetbackTower,
  [BUILDING_STYLE.WAREHOUSE]: buildWarehouse,
  [BUILDING_STYLE.OFFICE]: buildOfficeTower,
  [BUILDING_STYLE.APARTMENT]: buildApartmentBlock,
};

/** Deterministic: the same seed always yields the same building. */
export const createBuildingModel = (seed: number): StreetModel => {
  const random = createRng(seed);
  const { style } = pickWeighted(random, BUILDING_STYLE_WEIGHTS);
  return BUILDERS[style](random);
};
