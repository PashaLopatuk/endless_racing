import { chance } from "../../util/random";
import {
  addAviationBeacon,
  addNeonBladeSign,
  addNycFireEscape,
  addNycWaterTower,
  addRoofACUnit,
  addRoofBulkhead,
} from "../buildingDetails";
import type { IBuildingContext } from "./types";

export interface IPropsDecoratorOptions {
  faceX: number;
  width: number;
  depth: number;
  roofY: number;
  fireEscapeZ?: number;
  fireEscapeStartY?: number;
  fireEscapeFloors?: number;
  fireEscapeFloorHeight?: number;
}

/**
 * Applies modular architectural details based on context feature flags and chances.
 */
export const applyBuildingProps = (
  ctx: IBuildingContext,
  {
    faceX,
    width,
    depth,
    roofY,
    fireEscapeZ = 0,
    fireEscapeStartY = 2.5,
    fireEscapeFloors = 4,
    fireEscapeFloorHeight = 3.0,
  }: IPropsDecoratorOptions,
): void => {
  const { features, random, batch } = ctx;

  // 1. NYC Cedar Water Tower on rooftop
  if (chance(random, features.waterTowerChance)) {
    addNycWaterTower(batch, {
      roofX: -width * 0.14,
      roofY,
      roofZ: depth * 0.18,
      scale: Math.min(1.0, width * 0.08),
    });
  }

  // 2. Rooftop Bulkhead (stair/elevator penthouse enclosure)
  if (chance(random, features.roofBulkheadChance)) {
    addRoofBulkhead(batch, {
      x: -width * 0.1,
      y: roofY,
      z: -depth * 0.22,
      width: Math.min(2.4, width * 0.25),
      height: 2.0,
      depth: Math.min(3.0, depth * 0.25),
      color: ctx.trim,
    });
  }

  // 3. Rooftop AC Unit / Chiller
  if (chance(random, features.roofAcUnitChance)) {
    addRoofACUnit(batch, {
      x: width * 0.14,
      y: roofY,
      z: depth * 0.12,
      scale: 0.9,
    });
  }

  // 4. Cast-Iron Fire Escapes
  if (chance(random, features.fireEscapeChance) && fireEscapeFloors > 1) {
    addNycFireEscape(batch, {
      faceX,
      z: fireEscapeZ,
      startY: fireEscapeStartY,
      floors: fireEscapeFloors,
      floorHeight: fireEscapeFloorHeight,
      color: ctx.trim,
      width: 0.95,
      depth: 2.2,
    });
  }

  // 5. Vertical Projecting Neon Blade Sign
  if (chance(random, features.neonBladeSignChance) && ctx.neon) {
    addNeonBladeSign(batch, {
      faceX,
      y: fireEscapeStartY + fireEscapeFloorHeight * 1.4,
      z: -depth * 0.35,
      height: 4.2,
      width: 0.45,
      color: ctx.neon,
    });
  }

  // 6. Corner Aviation Obstruction Beacons
  if (features.aviationBeacons && roofY > 50) {
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        addAviationBeacon(batch, {
          x: sx * (width * 0.44),
          y: roofY + 0.2,
          z: sz * (depth * 0.44),
          size: 0.36,
          color: 0xff1818,
        });
      }
    }
  }
};
