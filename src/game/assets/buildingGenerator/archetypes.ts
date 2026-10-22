import { BATCH_LAYER } from "../../constants/assets";
import { BUILDING_STYLE, type BuildingStyle } from "../../constants/environment/buildings";
import {
  GLOW_PROFILE,
  WINDOW_KIND,
} from "../../constants/environment/buildingsWindows";
import { MIRRORED_SIDES } from "../../constants/world";
import { chance } from "../../util/random";
import { addAviationBeacon } from "../buildingDetails";
import { addCornice, addWall } from "../facade";
import { addWindow } from "../windows";
import {
  addLobbyBase,
  addLoadingBayBase,
  addPorchBase,
  addStoopBase,
  addStorefrontBase,
} from "./baseModules";
import {
  addArtDecoMastCrown,
  addGableRoofCrown,
  addHipRoofCrown,
  addParapetCrown,
  addSpireCrown,
  addSunburstArchedCrown,
} from "./crownModules";
import { applyBuildingProps } from "./propsDecorator";
import {
  addBalconiesToShaft,
  addCurtainWallShaft,
  addPilasterRibbedShaft,
  addPunchedShaft,
} from "./shaftModules";
import type { IBuildingContext } from "./types";

export type ArchetypeBuilder = (ctx: IBuildingContext) => void;

/**
 * 1. Empire State Building Archetype:
 * Multi-tier Art Deco setbacks, vertical pilasters with lit channels,
 * cylindrical mooring mast with observation deck, needle spire, and red beacons.
 */
const buildEmpireArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall, trim } = ctx;
  const h1 = height * 0.22;
  const h2 = height * 0.38;
  const h3 = height * 0.25;

  // Tier 1: Base Podium
  addWall(ctx.batch, { width, height: h1, depth, color: wall, baseY: 0 });
  addCornice(ctx.batch, { width, depth, y: h1, overhang: 0.26, height: 0.36, color: trim });
  addLobbyBase(ctx, { faceX: width / 2, depth, baseHeight: Math.min(h1, 4.8) });

  // Tier 2: Mid Shaft with vertical pilasters
  const w2 = width * 0.78;
  const d2 = depth * 0.78;
  const y2 = h1;
  addWall(ctx.batch, { width: w2, height: h2, depth: d2, color: wall, baseY: y2 });
  addCornice(ctx.batch, { width: w2, depth: d2, y: y2 + h2, overhang: 0.26, height: 0.36, color: trim });
  addPilasterRibbedShaft(ctx, { faceX: w2 / 2, depth: d2, startY: y2, height: h2 });

  // Setback beacons on Tier 1
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      addAviationBeacon(ctx.batch, {
        x: sx * (width * 0.44),
        y: h1 + 0.2,
        z: sz * (depth * 0.44),
        size: 0.38,
        color: 0xff1818,
      });
    }
  }

  // Tier 3: Upper Tower
  const w3 = w2 * 0.7;
  const d3 = d2 * 0.7;
  const y3 = y2 + h2;
  addWall(ctx.batch, { width: w3, height: h3, depth: d3, color: wall, baseY: y3 });
  addCornice(ctx.batch, { width: w3, depth: d3, y: y3 + h3, overhang: 0.26, height: 0.36, color: trim });
  addPilasterRibbedShaft(ctx, { faceX: w3 / 2, depth: d3, startY: y3, height: h3, pilasterCount: 4 });

  // Mooring Mast & Spire Crown
  addArtDecoMastCrown(ctx, { width: w3, depth: d3, y: y3 + h3, height: Math.max(18, height * 0.22) });
};

/**
 * 2. Chrysler Building Archetype:
 * Stepped shaft, winged radiator ornaments, 4-tier sunburst arched crown with dormers, needle spire.
 */
const buildChryslerArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall, trim } = ctx;
  const h1 = height * 0.25;
  const h2 = height * 0.45;

  // Base Podium
  addWall(ctx.batch, { width, height: h1, depth, color: wall, baseY: 0 });
  addCornice(ctx.batch, { width, depth, y: h1, overhang: 0.28, height: 0.36, color: trim });
  addLobbyBase(ctx, { faceX: width / 2, depth, baseHeight: 4.5 });

  // Tower Shaft
  const w2 = width * 0.74;
  const d2 = depth * 0.74;
  const y2 = h1;
  addWall(ctx.batch, { width: w2, height: h2, depth: d2, color: wall, baseY: y2 });
  addCornice(ctx.batch, { width: w2, depth: d2, y: y2 + h2, overhang: 0.28, height: 0.38, color: trim });
  addPunchedShaft(ctx, {
    faceX: w2 / 2,
    depth: d2,
    startY: y2,
    height: h2,
    windowKind: WINDOW_KIND.STRIP,
    glowProfile: "OFFICE",
  });

  // Winged gargoyle ornaments at corners
  const capY = y2 + h2;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      ctx.batch.addBox({
        size: [1.2, 0.65, 1.2],
        position: [sx * (w2 * 0.52), capY - 0.2, sz * (d2 * 0.52)],
        color: 0x8898a8,
      });
    }
  }

  // Sunburst Arched Crown & Needle Spire
  addSunburstArchedCrown(ctx, { width: w2, depth: d2, y: capY, height: Math.max(22, height * 0.28) });
};

/**
 * 3. Modern Office Tower Archetype:
 * Full-height glass curtain wall, metal mullions, roof crown with antenna and chillers.
 */
const buildOfficeArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall } = ctx;
  addWall(ctx.batch, { width, height, depth, color: wall });
  addLobbyBase(ctx, { faceX: width / 2, depth, baseHeight: 4.8 });
  addCurtainWallShaft(ctx, { faceX: width / 2, depth, startY: 4.8, height: height - 4.8 });
  addParapetCrown(ctx, { width, depth, y: height, height: 1.2 });
  addSpireCrown(ctx, { y: height + 1.2, height: 8 });

  applyBuildingProps(ctx, {
    faceX: width / 2,
    width,
    depth,
    roofY: height + 1.2,
  });
};

/**
 * 4. Slab Residential Tower Archetype:
 * Wide slab with punched/strip window alternating floors, roof bulkhead, and fire escapes.
 */
const buildSlabArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall } = ctx;
  addWall(ctx.batch, { width, height, depth, color: wall });

  // Roof elevator machine block
  ctx.batch.addBox({
    size: [width * 0.45, 4.0, depth * 0.4],
    position: [0, height + 2.0, 0],
    color: ctx.trim,
  });

  const floors = addPunchedShaft(ctx, {
    faceX: width / 2,
    depth,
    startY: 2.8,
    height: height - 5.0,
    floorHeight: 3.6,
  });

  applyBuildingProps(ctx, {
    faceX: width / 2,
    width,
    depth,
    roofY: height,
    fireEscapeZ: depth * 0.35,
    fireEscapeStartY: 3.5,
    fireEscapeFloors: floors,
    fireEscapeFloorHeight: 3.6,
  });
};

/**
 * 5. Tiered Setback Tower Archetype:
 * Multi-tier classic Manhattan setbacks with spires.
 */
const buildSetbackArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, wall, trim } = ctx;
  const tiers = [
    { scale: 1.0, height: ctx.height * 0.4, window: WINDOW_KIND.PUNCHED },
    { scale: 0.72, height: ctx.height * 0.35, window: WINDOW_KIND.BAY },
    { scale: 0.45, height: ctx.height * 0.25, window: WINDOW_KIND.SLIT },
  ];

  let baseY = 0;
  for (const tier of tiers) {
    const tw = width * tier.scale;
    const td = depth * tier.scale;

    addWall(ctx.batch, { width: tw, height: tier.height, depth: td, color: wall, baseY });
    addCornice(ctx.batch, { width: tw, depth: td, y: baseY + tier.height, overhang: 0.24, height: 0.34, color: trim });
    addPunchedShaft(ctx, {
      faceX: tw / 2,
      depth: td,
      startY: baseY + 2.0,
      height: tier.height - 2.5,
      windowKind: tier.window,
    });

    baseY += tier.height;
  }

  addSpireCrown(ctx, { y: baseY, height: 7.0 });

  applyBuildingProps(ctx, {
    faceX: width * 0.72 * 0.5,
    width: width * 0.72,
    depth: depth * 0.72,
    roofY: tiers[0].height,
  });
};

/**
 * 6. Apartment Block Archetype:
 * Mid-rise block with entrance, balconies, water towers, and fire escapes.
 */
const buildApartmentArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall } = ctx;
  addWall(ctx.batch, { width, height, depth, color: wall });
  addParapetCrown(ctx, { width, depth, y: height, height: 0.65 });
  addStoopBase(ctx, { faceX: width / 2, depth, z: 0 });

  const columns = 4;
  const floors = addPunchedShaft(ctx, {
    faceX: width / 2,
    depth,
    startY: 2.8,
    height: height - 3.4,
    floorHeight: 3.2,
    columns,
  });

  const hasBalconies = chance(ctx.random, ctx.features.balconyChance);
  if (hasBalconies) {
    addBalconiesToShaft(ctx, {
      faceX: width / 2,
      depth,
      startY: 2.8,
      floors,
      floorHeight: 3.2,
      columns,
    });
  }

  applyBuildingProps(ctx, {
    faceX: width / 2,
    width,
    depth,
    roofY: height,
    fireEscapeZ: depth * 0.28,
    fireEscapeStartY: 2.8,
    fireEscapeFloors: hasBalconies ? 0 : floors,
    fireEscapeFloorHeight: 3.2,
  });
};

/**
 * 7. Industrial Warehouse Archetype:
 * Brick warehouse with loading door, cornice, water tank, and neon signage.
 */
const buildWarehouseArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall, trim } = ctx;
  addWall(ctx.batch, { width, height, depth, color: wall });
  addCornice(ctx.batch, { width, depth, y: height, overhang: 0.22, height: 0.38, color: trim });
  addLoadingBayBase(ctx, { faceX: width / 2, depth, baseHeight: height });

  addPunchedShaft(ctx, {
    faceX: width / 2,
    depth,
    startY: height * 0.35,
    height: height * 0.55,
    windowKind: WINDOW_KIND.GRID,
    glowProfile: "OFFICE",
  });

  applyBuildingProps(ctx, {
    faceX: width / 2,
    width,
    depth,
    roofY: height,
  });
};

/**
 * 8. Brooklyn Brownstone Archetype:
 * 4-story urban masonry row house with stoop, punched window pairs, fire escape, and water tower.
 */
const buildBrownstoneArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall } = ctx;
  const faceX = width / 2;
  addWall(ctx.batch, { width, height, depth, color: wall });
  addParapetCrown(ctx, { width, depth, y: height, height: 0.35 });
  addStoopBase(ctx, { faceX, depth, z: -depth * 0.22 });

  const firstZ = depth * 0.14;
  const pairGap = 2.05;
  const floors = 4;
  const floorStep = (height - 3.0) / floors;

  for (let f = 0; f < floors; f += 1) {
    const wy = 2.5 + f * floorStep;
    addWindow(ctx.batch, {
      kind: WINDOW_KIND.PUNCHED,
      faceX,
      y: wy,
      z: firstZ,
      trim: ctx.trim,
      glow: GLOW_PROFILE.RESIDENTIAL,
      random: ctx.random,
    });
    addWindow(ctx.batch, {
      kind: WINDOW_KIND.PUNCHED,
      faceX,
      y: wy,
      z: firstZ + pairGap,
      trim: ctx.trim,
      glow: GLOW_PROFILE.RESIDENTIAL,
      random: ctx.random,
    });
  }

  applyBuildingProps(ctx, {
    faceX,
    width,
    depth,
    roofY: height,
    fireEscapeZ: firstZ + pairGap / 2,
    fireEscapeStartY: 2.5,
    fireEscapeFloors: floors,
    fireEscapeFloorHeight: floorStep,
  });
};

/**
 * 9. Townhouse Archetype:
 * 4-story narrow rowhouse with bay windows and parapet.
 */
const buildTownhouseArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall, trim } = ctx;
  const faceX = width / 2;
  addWall(ctx.batch, { width, height, depth, color: wall });

  // Parapet box
  ctx.batch.addBox({
    size: [width * 0.75, 1.4, depth * 0.75],
    position: [0, height + 0.7, 0],
    color: ctx.roof,
  });

  addStoopBase(ctx, { faceX, depth, z: 0 });

  const windowZ = depth * 0.22;
  const floors = 4;
  const floorStep = (height - 3.2) / floors;

  for (let f = 0; f < floors; f += 1) {
    const wy = 2.6 + f * floorStep;
    for (const side of MIRRORED_SIDES) {
      addWindow(ctx.batch, {
        kind: WINDOW_KIND.BAY,
        faceX,
        y: wy,
        z: side * windowZ,
        trim,
        glow: GLOW_PROFILE.RESIDENTIAL,
        random: ctx.random,
      });
    }
  }

  applyBuildingProps(ctx, {
    faceX,
    width,
    depth,
    roofY: height + 1.4,
    fireEscapeZ: windowZ,
    fireEscapeStartY: 2.6,
    fireEscapeFloors: floors,
    fireEscapeFloorHeight: floorStep,
  });
};

/**
 * 10. Shop House Archetype:
 * Ground floor retail store with awning, signage, and residential apartments above.
 */
const buildShopArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall, trim } = ctx;
  const faceX = width / 2;
  addWall(ctx.batch, { width, height, depth, color: wall });
  addParapetCrown(ctx, { width, depth, y: height, height: 0.35 });
  addStorefrontBase(ctx, { faceX, depth, baseHeight: 4.2 });

  // Store awning
  const awningDepth = 1.35;
  const awningTilt = 0.26;
  ctx.batch.addBox({
    size: [awningDepth, 0.1, depth * 0.85],
    rotation: [0, 0, -awningTilt],
    position: [
      faceX + (awningDepth / 2) * Math.cos(awningTilt),
      3.2 - (awningDepth / 2) * Math.sin(awningTilt),
      0,
    ],
    color: ctx.awning,
  });

  // Store neon sign
  ctx.batch.addBox({
    size: [0.12, 0.7, depth * 0.75],
    position: [faceX + 0.08, 3.8, 0],
    color: ctx.neon,
    layer: BATCH_LAYER.GLOW,
  });

  // Upper floors
  const upperFloors = height > 10.5 ? 2 : 1;
  for (let f = 0; f < upperFloors; f += 1) {
    const wy = 4.8 + f * 2.8;
    for (const side of MIRRORED_SIDES) {
      addWindow(ctx.batch, {
        kind: WINDOW_KIND.PUNCHED,
        faceX,
        y: wy,
        z: side * depth * 0.26,
        trim,
        glow: GLOW_PROFILE.RESIDENTIAL,
        random: ctx.random,
      });
    }
  }

  applyBuildingProps(ctx, {
    faceX,
    width,
    depth,
    roofY: height,
  });
};

/**
 * 11. Suburban Bungalow Archetype:
 * Single-story home with large covered porch and hip roof.
 */
const buildBungalowArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall } = ctx;
  const bodyWidth = width - 1.8;
  const bodyX = -0.9;
  const faceX = bodyX + bodyWidth / 2;

  addWall(ctx.batch, { width: bodyWidth, height, depth, color: wall, x: bodyX });
  addHipRoofCrown(ctx, { width: bodyWidth, depth, y: height, height: 2.6 });
  addPorchBase(ctx, { faceX, depth });

  // Front windows
  for (const side of MIRRORED_SIDES) {
    addWindow(ctx.batch, {
      kind: WINDOW_KIND.GRID,
      faceX,
      y: 1.8,
      z: side * depth * 0.28,
      trim: ctx.trim,
      glow: GLOW_PROFILE.RESIDENTIAL,
      random: ctx.random,
    });
  }
};

/**
 * 12. Suburban Gable House Archetype:
 * Two-story home with pitched gable roof and brick chimney.
 */
const buildGableArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall, trim } = ctx;
  const faceX = width / 2;

  addWall(ctx.batch, { width, height, depth, color: wall });
  addGableRoofCrown(ctx, { width, depth, y: height, height: 3.2 });
  addStoopBase(ctx, { faceX, depth, z: depth * 0.22 });

  // Chimney
  ctx.batch.addBox({
    size: [0.55, 2.2, 0.55],
    position: [-width * 0.18, height + 1.8, -depth * 0.15],
    color: trim,
  });

  addWindow(ctx.batch, {
    kind: WINDOW_KIND.BAY,
    faceX,
    y: 2.2,
    z: 0.2,
    trim,
    glow: GLOW_PROFILE.RESIDENTIAL,
    random: ctx.random,
  });

  addWindow(ctx.batch, {
    kind: WINDOW_KIND.PUNCHED,
    faceX,
    y: 4.8,
    z: -depth * 0.22,
    trim,
    glow: GLOW_PROFILE.RESIDENTIAL,
    random: ctx.random,
  });
};

/**
 * 13. Modern Modular Box House Archetype:
 * Cantilevered architectural boxes with strip windows.
 */
const buildModernArchetype: ArchetypeBuilder = (ctx) => {
  const { width, depth, height, wall, trim } = ctx;
  const baseH = height * 0.45;
  const upperH = height * 0.55;
  const upperW = width * 0.85;
  const upperD = depth * 0.85;
  const faceX = width / 2;

  addWall(ctx.batch, { width, height: baseH, depth, color: wall });
  addCornice(ctx.batch, { width, depth, y: baseH, overhang: 0.2, height: 0.2, color: ctx.roof });

  addWall(ctx.batch, {
    width: upperW,
    height: upperH,
    depth: upperD,
    color: wall,
    baseY: baseH,
  });
  addCornice(ctx.batch, {
    width: upperW,
    depth: upperD,
    y: baseH + upperH,
    overhang: 0.2,
    height: 0.2,
    color: ctx.roof,
  });

  addWindow(ctx.batch, {
    kind: WINDOW_KIND.STRIP,
    faceX,
    y: baseH * 0.45,
    z: depth * 0.2,
    trim,
    glow: GLOW_PROFILE.RESIDENTIAL,
    random: ctx.random,
  });

  addWindow(ctx.batch, {
    kind: WINDOW_KIND.STRIP,
    faceX,
    y: baseH + upperH * 0.5,
    z: -upperD * 0.2,
    trim,
    glow: GLOW_PROFILE.RESIDENTIAL,
    random: ctx.random,
  });

  addStoopBase(ctx, { faceX, depth, z: depth * 0.35 });
};

export const ARCHETYPE_BUILDERS: Readonly<Record<BuildingStyle, ArchetypeBuilder>> = {
  [BUILDING_STYLE.EMPIRE]: buildEmpireArchetype,
  [BUILDING_STYLE.CHRYSLER]: buildChryslerArchetype,
  [BUILDING_STYLE.OFFICE]: buildOfficeArchetype,
  [BUILDING_STYLE.SLAB]: buildSlabArchetype,
  [BUILDING_STYLE.SETBACK]: buildSetbackArchetype,
  [BUILDING_STYLE.APARTMENT]: buildApartmentArchetype,
  [BUILDING_STYLE.WAREHOUSE]: buildWarehouseArchetype,
  [BUILDING_STYLE.BROWNSTONE]: buildBrownstoneArchetype,
  [BUILDING_STYLE.TOWNHOUSE]: buildTownhouseArchetype,
  [BUILDING_STYLE.SHOP]: buildShopArchetype,
  [BUILDING_STYLE.BUNGALOW]: buildBungalowArchetype,
  [BUILDING_STYLE.GABLE]: buildGableArchetype,
  [BUILDING_STYLE.MODERN]: buildModernArchetype,
};
