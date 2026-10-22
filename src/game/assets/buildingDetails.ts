import * as THREE from "three";
import { BATCH_LAYER } from "../constants/assets";
import { WINDOW_COLORS } from "../constants/environment/buildingsWindows";
import type { IMeshBatch } from "./meshBatch";

/**
 * Shared architectural details for New York City style buildings:
 * - Iconic wooden rooftop water towers on steel stilts with conical roof caps.
 * - Zigzagging cast iron fire escapes with platforms, railings, and ladders.
 * - Rooftop elevator/stair bulkheads (penthouse enclosures).
 * - Rooftop HVAC chillers / compressor fan units.
 * - Vertical projecting neon blade signs (Broadway / Times Square style).
 * - Red aviation obstruction warning beacons for spires and high-rise corners.
 */

export interface INycWaterTowerOptions {
  roofX: number;
  roofY: number;
  roofZ: number;
  scale?: number;
}

/**
 * Builds the quintessential NYC wooden rooftop water tower:
 * 4 steel stilt legs, cross-bracing deck, cylindrical cedar plank barrel with steel hoops,
 * and a conical wooden roof cap.
 */
export const addNycWaterTower = (
  batch: IMeshBatch,
  { roofX, roofY, roofZ, scale = 1.0 }: INycWaterTowerOptions,
): void => {
  const metalColor = 0x22262e;
  const woodColor = 0x544032; // Weathered NYC cedar water tank wood
  const roofColor = 0x3e3026; // Conical wood roof
  const steelRingColor = 0x2a3038;

  const legHeight = 1.5 * scale;
  const legSpread = 0.72 * scale;
  const tankRadius = 0.92 * scale;
  const tankHeight = 1.65 * scale;
  const coneHeight = 0.85 * scale;

  // 1. Steel stilt legs (4 legs)
  const legSize: [number, number, number] = [
    0.09 * scale,
    legHeight,
    0.09 * scale,
  ];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      batch.addBox({
        size: legSize,
        position: [
          roofX + sx * legSpread,
          roofY + legHeight / 2,
          roofZ + sz * legSpread,
        ],
        color: metalColor,
      });
    }
  }

  // Horizontal support beams
  batch.addBox({
    size: [legSpread * 2.3, 0.08 * scale, legSpread * 2.3],
    position: [roofX, roofY + legHeight, roofZ],
    color: metalColor,
  });

  // 2. Wooden Barrel Tank Body (Cylinder with 10 facets)
  const barrelGeom = new THREE.CylinderGeometry(
    tankRadius,
    tankRadius,
    tankHeight,
    10,
  );
  barrelGeom.translate(
    roofX,
    roofY + legHeight + 0.04 * scale + tankHeight / 2,
    roofZ,
  );
  batch.addGeometry({
    geometry: barrelGeom,
    color: woodColor,
    isShaded: true,
  });

  // Iron hoops around barrel
  for (const hoopOffset of [0.32, 0.82, 1.32]) {
    const hoopGeom = new THREE.CylinderGeometry(
      tankRadius * 1.025,
      tankRadius * 1.025,
      0.04 * scale,
      10,
    );
    hoopGeom.translate(roofX, roofY + legHeight + hoopOffset * scale, roofZ);
    batch.addGeometry({
      geometry: hoopGeom,
      color: steelRingColor,
    });
  }

  // 3. Conical Wooden Roof Cap
  const coneGeom = new THREE.ConeGeometry(tankRadius * 1.08, coneHeight, 10);
  coneGeom.translate(
    roofX,
    roofY + legHeight + tankHeight + coneHeight / 2,
    roofZ,
  );
  batch.addGeometry({
    geometry: coneGeom,
    color: roofColor,
    isShaded: true,
  });
};

export interface INycFireEscapeOptions {
  faceX: number;
  z: number;
  startY: number;
  floors: number;
  floorHeight: number;
  color?: number;
  width?: number;
  depth?: number;
}

/**
 * Builds classic New York cast iron fire escapes:
 * Sturdy platforms on each floor, safety railings on 3 sides,
 * and angled connecting ladders between floors.
 */
export const addNycFireEscape = (
  batch: IMeshBatch,
  {
    faceX,
    z,
    startY,
    floors,
    floorHeight,
    color = WINDOW_COLORS.FRAME,
    width = 1.0,
    depth = 2.1,
  }: INycFireEscapeOptions,
): void => {
  const platformThickness = 0.08;
  const railHeight = 0.68;
  const railThickness = 0.05;
  const platformX = faceX + width / 2;

  for (let floor = 0; floor < floors; floor += 1) {
    const floorY = startY + floor * floorHeight;

    // Platform floor grating
    batch.addBox({
      size: [width, platformThickness, depth],
      position: [platformX, floorY, z],
      color,
    });

    // Outer railing (facing street)
    batch.addBox({
      size: [railThickness, railHeight, depth],
      position: [faceX + width - railThickness / 2, floorY + railHeight / 2, z],
      color,
    });

    // Side railings (left and right)
    for (const sz of [-1, 1]) {
      batch.addBox({
        size: [width, railHeight, railThickness],
        position: [platformX, floorY + railHeight / 2, z + (sz * depth) / 2],
        color,
      });
    }

    // Angled connecting ladder/stairs to next floor below
    if (floor > 0) {
      const prevFloorY = startY + (floor - 1) * floorHeight;
      const midY = (floorY + prevFloorY) / 2;
      const ladderZ = z + ((floor % 2 === 0 ? 1 : -1) * depth) / 4;

      batch.addBox({
        size: [railThickness * 1.5, floorHeight * 0.92, 0.45],
        position: [faceX + width * 0.65, midY, ladderZ],
        color,
      });
    }
  }

  // Drop ladder on ground floor
  batch.addBox({
    size: [railThickness * 1.5, floorHeight * 0.65, 0.35],
    position: [faceX + width * 0.7, startY - floorHeight * 0.35, z],
    color,
  });
};

export interface IRoofBulkheadOptions {
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
  depth?: number;
  color?: number;
  doorFaceX?: number;
}

/**
 * Builds a rooftop elevator/stair access penthouse box with door and coping.
 */
export const addRoofBulkhead = (
  batch: IMeshBatch,
  {
    x,
    y,
    z,
    width = 2.4,
    height = 2.0,
    depth = 3.0,
    color = 0x2c3440,
  }: IRoofBulkheadOptions,
): void => {
  // Main bulkhead enclosure
  batch.addBox({
    size: [width, height, depth],
    position: [x, y + height / 2, z],
    color,
    isShaded: true,
  });

  // Roof coping lip
  batch.addBox({
    size: [width + 0.25, 0.12, depth + 0.25],
    position: [x, y + height + 0.06, z],
    color: 0x1e242c,
  });

  // Access door on +X face
  batch.addBox({
    size: [0.06, 1.45, 0.75],
    position: [x + width / 2 + 0.02, y + 0.75, z],
    color: 0x161c24,
  });
};

export interface IRoofACUnitOptions {
  x: number;
  y: number;
  z: number;
  scale?: number;
}

/**
 * Builds a rooftop mechanical HVAC compressor unit with fan cowl.
 */
export const addRoofACUnit = (
  batch: IMeshBatch,
  { x, y, z, scale = 1.0 }: IRoofACUnitOptions,
): void => {
  const metalColor = 0x485260;
  const darkColor = 0x28303a;

  // Compressor box
  batch.addBox({
    size: [1.2 * scale, 0.85 * scale, 1.4 * scale],
    position: [x, y + 0.425 * scale, z],
    color: metalColor,
  });

  // Fan cowl on top
  const fanGeom = new THREE.CylinderGeometry(
    0.38 * scale,
    0.38 * scale,
    0.1 * scale,
    8,
  );
  fanGeom.translate(x, y + 0.85 * scale + 0.05 * scale, z);
  batch.addGeometry({
    geometry: fanGeom,
    color: darkColor,
  });
};

export interface INeonBladeSignOptions {
  faceX: number;
  y: number;
  z: number;
  height?: number;
  width?: number;
  thickness?: number;
  color: number;
}

/**
 * Builds an authentic Broadway / Times Square vertical projecting neon blade sign.
 */
export const addNeonBladeSign = (
  batch: IMeshBatch,
  {
    faceX,
    y,
    z,
    height = 4.8,
    width = 0.55,
    thickness = 0.14,
    color,
  }: INeonBladeSignOptions,
): void => {
  const mountColor = 0x1e222a;
  const signX = faceX + width / 2 + 0.2;

  // Metal mounting bracket arms
  for (const sy of [-1, 1]) {
    batch.addBox({
      size: [width + 0.22, 0.08, 0.08],
      position: [faceX + (width + 0.22) / 2, y + (sy * height * 0.38), z],
      color: mountColor,
    });
  }

  // Dark sign casing
  batch.addBox({
    size: [width + 0.06, height + 0.12, thickness + 0.06],
    position: [signX, y, z],
    color: mountColor,
  });

  // Glowing neon face
  batch.addBox({
    size: [width, height, thickness],
    position: [signX, y, z],
    color,
    layer: BATCH_LAYER.GLOW,
  });
};

export interface IAviationBeaconOptions {
  x: number;
  y: number;
  z: number;
  size?: number;
  color?: number;
}

/**
 * Builds a glowing red aircraft obstruction warning beacon for spires and high-rise corners.
 */
export const addAviationBeacon = (
  batch: IMeshBatch,
  {
    x,
    y,
    z,
    size = 0.42,
    color = 0xff1818, // Intense aviation red
  }: IAviationBeaconOptions,
): void => {
  // Mounting base
  batch.addBox({
    size: [size * 0.7, size * 0.5, size * 0.7],
    position: [x, y - size * 0.25, z],
    color: 0x22262e,
  });

  // Glowing red beacon lamp
  batch.addBox({
    size: [size, size, size],
    position: [x, y + size / 2, z],
    color,
    layer: BATCH_LAYER.GLOW,
  });
};
