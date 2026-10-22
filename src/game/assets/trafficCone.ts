import * as THREE from "three";
import { TRAFFIC_CONE } from "../constants/environment/trafficCone";
import { createMeshBatch, toStreetModel, type IStreetModel } from "./meshBatch";

/**
 * Builds low-poly American traffic cones:
 * - Square black rubber base.
 * - Fluorescent safety orange octagonal cone body.
 * - Dual reflective white bands (standard MUTCD collars).
 * - Slight natural clustering (single cone, pair, line of 3, or slightly knocked cone).
 */
export const createTrafficConeModel = (
  seed: number,
  scale: number = 1.0,
): IStreetModel => {
  const batch = createMeshBatch();
  const absSeed = Math.abs(seed);

  const orangeColor =
    absSeed % 3 === 0
      ? TRAFFIC_CONE.COLORS.ORANGE_PRIMARY
      : absSeed % 3 === 1
        ? TRAFFIC_CONE.COLORS.ORANGE_VIVID
        : TRAFFIC_CONE.COLORS.ORANGE_AMBER;

  const whiteColor = TRAFFIC_CONE.COLORS.REFLECTIVE_WHITE;
  const baseColor = TRAFFIC_CONE.COLORS.BASE_DARK;

  const height = TRAFFIC_CONE.CONE.HEIGHT * scale;
  const bottomRadius = TRAFFIC_CONE.CONE.BOTTOM_RADIUS * scale;
  const topRadius = TRAFFIC_CONE.CONE.TOP_RADIUS * scale;
  const yStart = TRAFFIC_CONE.CONE.Y_START * scale;
  const radialSegments = TRAFFIC_CONE.CONE.RADIAL_SEGMENTS;

  const baseSize: [number, number, number] = [
    TRAFFIC_CONE.BASE.SIZE[0] * scale,
    TRAFFIC_CONE.BASE.SIZE[1] * scale,
    TRAFFIC_CONE.BASE.SIZE[2] * scale,
  ];
  const baseY = TRAFFIC_CONE.BASE.Y * scale;

  const radiusAt = (y: number) =>
    bottomRadius + (topRadius - bottomRadius) * (y / height);

  // Five vertical segments: orange base -> white stripe -> orange gap -> white stripe -> orange top
  const coneSegments = [
    { y0: 0.00 * height, y1: 0.28 * height, color: orangeColor },
    { y0: 0.28 * height, y1: 0.44 * height, color: whiteColor },
    { y0: 0.44 * height, y1: 0.54 * height, color: orangeColor },
    { y0: 0.54 * height, y1: 0.78 * height, color: whiteColor },
    { y0: 0.78 * height, y1: 1.00 * height, color: orangeColor },
  ];

  const addSingleCone = (
    offsetX: number,
    offsetZ: number,
    rotY: number = 0,
    tiltZ: number = 0,
  ) => {
    // 1. Square rubber base
    batch.addBox({
      size: baseSize,
      position: [offsetX, baseY, offsetZ],
      rotation: [0, rotY, tiltZ],
      color: baseColor,
    });

    // 2. Base flange
    const flangeThickness = 0.03 * scale;
    const flangeGeom = new THREE.CylinderGeometry(
      bottomRadius * 1.05,
      bottomRadius * 1.12,
      flangeThickness,
      radialSegments,
    );
    flangeGeom.translate(0, yStart + flangeThickness / 2, 0);

    batch.addGeometry({
      geometry: flangeGeom,
      position: [offsetX, 0, offsetZ],
      rotation: [0, rotY, tiltZ],
      color: orangeColor,
    });

    // 3. Tapered conical segments
    for (const segment of coneSegments) {
      const h = segment.y1 - segment.y0;
      const rBottom = radiusAt(segment.y0);
      const rTop = radiusAt(segment.y1);

      const segmentGeom = new THREE.CylinderGeometry(
        rTop,
        rBottom,
        h,
        radialSegments,
      );
      segmentGeom.translate(0, yStart + flangeThickness + segment.y0 + h / 2, 0);

      batch.addGeometry({
        geometry: segmentGeom,
        position: [offsetX, 0, offsetZ],
        rotation: [0, rotY, tiltZ],
        color: segment.color,
      });
    }

    // 4. Dark open top rim
    const topGeom = new THREE.CylinderGeometry(
      topRadius * 0.75,
      topRadius * 0.75,
      0.015 * scale,
      radialSegments,
    );
    topGeom.translate(0, yStart + flangeThickness + height, 0);

    batch.addGeometry({
      geometry: topGeom,
      position: [offsetX, 0, offsetZ],
      rotation: [0, rotY, tiltZ],
      color: TRAFFIC_CONE.COLORS.INNER_RIM,
    });
  };

  // Determine cluster variant
  const variant = absSeed % 4;
  let extentWidth: number = TRAFFIC_CONE.FOOTPRINT * scale;
  let extentDepth: number = TRAFFIC_CONE.FOOTPRINT * scale;

  switch (variant) {
    case 0:
      // Single upright cone
      addSingleCone(0, 0, (absSeed % 8) * (Math.PI / 4));
      break;

    case 1:
      // Pair of cones along curb
      addSingleCone(-0.14 * scale, -0.48 * scale, (absSeed % 8) * (Math.PI / 4));
      addSingleCone(0.14 * scale, 0.48 * scale, ((absSeed + 3) % 8) * (Math.PI / 4));
      extentWidth = 0.95 * scale;
      extentDepth = 1.7 * scale;
      break;

    case 2:
      // Diagonal line of 3 cones (road maintenance taper)
      addSingleCone(-0.28 * scale, -0.95 * scale, (absSeed % 8) * (Math.PI / 4));
      addSingleCone(0.0, 0.0, ((absSeed + 2) % 8) * (Math.PI / 4));
      addSingleCone(0.28 * scale, 0.95 * scale, ((absSeed + 5) % 8) * (Math.PI / 4));
      extentWidth = 1.35 * scale;
      extentDepth = 2.7 * scale;
      break;

    case 3:
      // Single cone knocked slightly askew
      addSingleCone(0, 0, (absSeed % 6) * (Math.PI / 3), 0.24);
      extentWidth = 1.1 * scale;
      extentDepth = 1.1 * scale;
      break;
  }

  return toStreetModel(batch, extentWidth, extentDepth);
};
