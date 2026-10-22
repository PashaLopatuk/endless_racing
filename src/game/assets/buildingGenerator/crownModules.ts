import * as THREE from "three";
import { BATCH_LAYER } from "../../constants/assets";
import { GLOW_PROFILE } from "../../constants/environment/buildingsWindows";
import { MIRRORED_SIDES, QUARTER_PI } from "../../constants/world";
import { addAviationBeacon } from "../buildingDetails";
import { addCornice } from "../facade";
import { windowGlowColor } from "../windows";
import type { IBuildingContext } from "./types";

export interface ICrownModuleOptions {
  width: number;
  depth: number;
  y: number;
  height?: number;
}

/**
 * 1. Parapet Crown: Urban flat roof with parapet lip and cornice.
 */
export const addParapetCrown = (
  ctx: IBuildingContext,
  { width, depth, y, height = 0.4 }: ICrownModuleOptions,
): void => {
  addCornice(ctx.batch, {
    width,
    depth,
    y,
    overhang: 0.24,
    height,
    color: ctx.trim,
  });
};

/**
 * 2. Gable Roof Crown: Pitched two-sided roof for residential suburban houses.
 */
export const addGableRoofCrown = (
  ctx: IBuildingContext,
  { width, depth, y, height = 3.0 }: ICrownModuleOptions,
): void => {
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

  ctx.batch.addGeometry({
    geometry,
    position: [0, y, 0],
    color: ctx.wall,
    isShaded: true,
  });

  const half = width / 2;
  const slope = Math.atan2(height, half);
  const slopeLength = Math.hypot(half, height) + 0.35;

  for (const side of MIRRORED_SIDES) {
    ctx.batch.addBox({
      size: [slopeLength, 0.16, depth + 0.7],
      rotation: [0, 0, -side * slope],
      position: [(side * half) / 2, y + height / 2 + 0.08, 0],
      color: ctx.roof,
    });
  }
};

/**
 * 3. Hip Roof Crown: Four-sided pitched hip roof.
 */
export const addHipRoofCrown = (
  ctx: IBuildingContext,
  { width, depth, y, height = 2.6 }: ICrownModuleOptions,
): void => {
  const geometry = new THREE.ConeGeometry(0.707, 1, 4);
  geometry.rotateY(QUARTER_PI);
  geometry.scale(width + 0.7, height, depth + 0.7);

  ctx.batch.addGeometry({
    geometry,
    position: [0, y + height / 2, 0],
    color: ctx.roof,
    isShaded: true,
  });
};

/**
 * 4. Art Deco Mooring Mast & Spire Crown (Empire State landmark style).
 */
export const addArtDecoMastCrown = (
  ctx: IBuildingContext,
  { width, depth, y, height = 26 }: ICrownModuleOptions,
): void => {
  const mastRadius = Math.min(width, depth) * 0.32;
  const mastH = height * 0.55;
  const spireH = height * 0.45;

  // Deck level
  const deckGeom = new THREE.CylinderGeometry(
    mastRadius * 1.08,
    mastRadius * 1.15,
    3.0,
    10,
  );
  deckGeom.translate(0, y + 1.5, 0);
  ctx.batch.addGeometry({ geometry: deckGeom, color: ctx.trim, isShaded: true });

  // Fluted cylinder mast
  const shaftGeom = new THREE.CylinderGeometry(
    mastRadius * 0.68,
    mastRadius * 0.78,
    mastH - 3.0,
    10,
  );
  shaftGeom.translate(0, y + 3.0 + (mastH - 3.0) / 2, 0);
  ctx.batch.addGeometry({ geometry: shaftGeom, color: ctx.metal, isShaded: true });

  // Glowing observation deck band
  const bandGeom = new THREE.CylinderGeometry(
    mastRadius * 0.79,
    mastRadius * 0.79,
    1.2,
    10,
  );
  bandGeom.translate(0, y + 4.2, 0);
  ctx.batch.addGeometry({
    geometry: bandGeom,
    color: windowGlowColor(ctx.random, GLOW_PROFILE.STOREFRONT),
    layer: BATCH_LAYER.GLOW,
  });

  // Stainless steel spire
  const spireY = y + mastH;
  const spireGeom = new THREE.CylinderGeometry(0.06, 0.32, spireH, 8);
  spireGeom.translate(0, spireY + spireH / 2, 0);
  ctx.batch.addGeometry({ geometry: spireGeom, color: 0x94a4b8 });

  // High-intensity red aviation warning beacons
  addAviationBeacon(ctx.batch, {
    x: 0,
    y: spireY + spireH,
    z: 0,
    size: 0.58,
    color: 0xff1818,
  });

  addAviationBeacon(ctx.batch, {
    x: 0,
    y: spireY + spireH * 0.5,
    z: 0,
    size: 0.38,
    color: 0xff1818,
  });
};

/**
 * 5. Art Deco Sunburst Arched Crown (Chrysler landmark style).
 */
export const addSunburstArchedCrown = (
  ctx: IBuildingContext,
  { width, depth, y, height = 30 }: ICrownModuleOptions,
): void => {
  const crownH = height * 0.55;
  const needleH = height * 0.45;
  const tierCount = 4;
  const tierHeight = crownH / tierCount;
  let crownY = y;

  for (let t = 0; t < tierCount; t += 1) {
    const scaleFactor = 0.68 * (1 - t * 0.17);
    const cw = width * scaleFactor;
    const cd = depth * scaleFactor;

    ctx.batch.addBox({
      size: [cw, tierHeight * 0.95, cd],
      position: [0, crownY + (tierHeight * 0.95) / 2, 0],
      color: 0x8898a8,
      isShaded: true,
    });

    // Sunburst triangular glowing dormers
    const dormerSize: [number, number, number] = [0.08, tierHeight * 0.62, cd * 0.45];
    ctx.batch.addBox({
      size: dormerSize,
      position: [cw / 2 + 0.04, crownY + tierHeight * 0.5, 0],
      color: 0xd8eeff,
      layer: BATCH_LAYER.GLOW,
    });

    for (const sz of [-1, 1]) {
      ctx.batch.addBox({
        size: [cw * 0.45, tierHeight * 0.62, 0.08],
        position: [0, crownY + tierHeight * 0.5, sz * (cd / 2 + 0.04)],
        color: 0xd8eeff,
        layer: BATCH_LAYER.GLOW,
      });
    }

    crownY += tierHeight;
  }

  // Chrome needle spire
  const needleGeom = new THREE.CylinderGeometry(0.04, 0.32, needleH, 8);
  needleGeom.translate(0, crownY + needleH / 2, 0);
  ctx.batch.addGeometry({ geometry: needleGeom, color: 0xc8d8e8 });

  addAviationBeacon(ctx.batch, {
    x: 0,
    y: crownY + needleH,
    z: 0,
    size: 0.54,
    color: 0xff1818,
  });

  addAviationBeacon(ctx.batch, {
    x: 0,
    y: crownY,
    z: 0,
    size: 0.36,
    color: 0xff1818,
  });
};

/**
 * 6. Spire / Antenna Crown.
 */
export const addSpireCrown = (
  ctx: IBuildingContext,
  { y, height = 8 }: { y: number; height?: number },
): void => {
  ctx.batch.addBox({
    size: [0.18, height, 0.18],
    position: [0, y + height / 2, 0],
    color: ctx.metal,
  });

  addAviationBeacon(ctx.batch, {
    x: 0,
    y: y + height,
    z: 0,
    size: 0.42,
    color: 0xff1818,
  });
};
