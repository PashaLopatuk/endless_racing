import * as THREE from "three";
import { PALM_TREE } from "../constants/environment/palm";
import { createRng, pick, randomIn } from "../util/random";
import {
  createStreetMeshBatch,
  toStreetModel,
  type IMeshBatch,
  type IStreetModel,
} from "./meshBatch";

/**
 * Builds a continuous, seamless, low-poly curved trunk geometry.
 */
const buildCurvedTrunkGeometry = (
  segments: number,
  totalHeight: number,
  baseRadius: number,
  topRadius: number,
  curveMagnitude: number,
  curveAngle: number,
): { geometry: THREE.BufferGeometry; apex: THREE.Vector3 } => {
  const facets = 7;
  const rings = segments + 1;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r < rings; r += 1) {
    const t = r / (rings - 1);
    const y = t * totalHeight;
    const curve = Math.pow(t, 1.35) * curveMagnitude;
    const cx = Math.cos(curveAngle) * curve;
    const cz = Math.sin(curveAngle) * curve;
    const radius = baseRadius + (topRadius - baseRadius) * t;

    for (let f = 0; f < facets; f += 1) {
      const phi = (f * Math.PI * 2) / facets;
      positions.push(
        cx + Math.cos(phi) * radius,
        y,
        cz + Math.sin(phi) * radius,
      );
    }
  }

  for (let r = 0; r < rings - 1; r += 1) {
    const ringStart = r * facets;
    const nextRingStart = (r + 1) * facets;

    for (let f = 0; f < facets; f += 1) {
      const nextF = (f + 1) % facets;
      const v00 = ringStart + f;
      const v10 = ringStart + nextF;
      const v01 = nextRingStart + f;
      const v11 = nextRingStart + nextF;

      indices.push(v00, v10, v11);
      indices.push(v00, v11, v01);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const finalCurve = Math.pow(1.0, 1.35) * curveMagnitude;
  const apex = new THREE.Vector3(
    Math.cos(curveAngle) * finalCurve,
    totalHeight,
    Math.sin(curveAngle) * finalCurve,
  );

  return { geometry, apex };
};

/**
 * Builds the fan palm radiating crown fronds as connected low-poly blades.
 */
const buildFrondsGeometry = (
  apex: THREE.Vector3,
  frondCount: number,
  scale: number,
  random: () => number,
): THREE.BufferGeometry => {
  const positions: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  const root = new THREE.Vector3(apex.x, apex.y + 0.25 * scale, apex.z);

  for (let f = 0; f < frondCount; f += 1) {
    const angle = (f * Math.PI * 2) / frondCount + (random() - 0.5) * 0.22;
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);
    const perpX = -dirZ;
    const perpZ = dirX;

    const innerDist = 1.9 * scale;
    const innerLift = 0.45 * scale;
    const outerDist = 1.8 * scale;
    const outerDrop = 0.95 * scale;
    const tipExtra = 0.55 * scale;
    const tipExtraDrop = 0.4 * scale;

    const s0 = root;
    const s1 = new THREE.Vector3(
      root.x + dirX * innerDist,
      root.y + innerLift,
      root.z + dirZ * innerDist,
    );
    const s2 = new THREE.Vector3(
      s1.x + dirX * outerDist,
      s1.y - outerDrop,
      s1.z + dirZ * outerDist,
    );
    const s3 = new THREE.Vector3(
      s2.x + dirX * tipExtra,
      s2.y - tipExtraDrop,
      s2.z + dirZ * tipExtra,
    );

    const widths = [0.08 * scale, 0.42 * scale, 0.62 * scale, 0.04 * scale];
    const spines = [s0, s1, s2, s3];

    const baseVertex = vertexIndex;
    for (let i = 0; i < 4; i += 1) {
      const sp = spines[i];
      const hw = widths[i] * 0.5;
      positions.push(sp.x - perpX * hw, sp.y, sp.z - perpZ * hw);
      positions.push(sp.x + perpX * hw, sp.y, sp.z + perpZ * hw);
      vertexIndex += 2;
    }

    for (let i = 0; i < 3; i += 1) {
      const l0 = baseVertex + i * 2;
      const r0 = baseVertex + i * 2 + 1;
      const l1 = baseVertex + (i + 1) * 2;
      const r1 = baseVertex + (i + 1) * 2 + 1;

      // Front face
      indices.push(l0, r0, r1);
      indices.push(l0, r1, l1);
      // Back face
      indices.push(l0, r1, r0);
      indices.push(l0, l1, r1);
    }
  }

  // Central upward-pointing young crest fronds (4 fronds)
  for (let c = 0; c < 4; c += 1) {
    const cAngle = (c * Math.PI * 2) / 4 + 0.35;
    const dirX = Math.cos(cAngle);
    const dirZ = Math.sin(cAngle);
    const perpX = -dirZ;
    const perpZ = dirX;

    const s0 = root;
    const s1 = new THREE.Vector3(
      root.x + dirX * (0.35 * scale),
      root.y + 1.45 * scale,
      root.z + dirZ * (0.35 * scale),
    );

    const baseVertex = vertexIndex;
    positions.push(
      s0.x - perpX * 0.06 * scale,
      s0.y,
      s0.z - perpZ * 0.06 * scale,
    );
    positions.push(
      s0.x + perpX * 0.06 * scale,
      s0.y,
      s0.z + perpZ * 0.06 * scale,
    );
    positions.push(
      s1.x - perpX * 0.16 * scale,
      s1.y,
      s1.z - perpZ * 0.16 * scale,
    );
    positions.push(
      s1.x + perpX * 0.16 * scale,
      s1.y,
      s1.z + perpZ * 0.16 * scale,
    );
    vertexIndex += 4;

    indices.push(baseVertex, baseVertex + 1, baseVertex + 3);
    indices.push(baseVertex, baseVertex + 3, baseVertex + 2);
    indices.push(baseVertex, baseVertex + 3, baseVertex + 1);
    indices.push(baseVertex, baseVertex + 2, baseVertex + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
};

/**
 * Adds an authentic tall, curved/bowed California Mexican Fan Palm (Washingtonia robusta) directly into a mesh batch:
 * - Majestic height (16.5 - 23.5m), towering above suburban 1-2 story homes.
 * - Slender, tapered trunk that bows gracefully as it climbs towards the sky.
 * - Dried thatch frond collar (skirt) under the crown.
 * - Lush, radiating fan-shaped fronds that arch outward and droop down at the ends.
 */
export const addPalmTreeToBatch = (
  batch: IMeshBatch,
  posX: number,
  posZ: number,
  seed: number,
  scale = 1.0,
): void => {
  const random = createRng(seed);

  const totalHeight = randomIn(random, PALM_TREE.HEIGHT_RANGE) * scale;
  const trunkColor = pick(random, PALM_TREE.TRUNK_COLORS);
  const leafColor = pick(random, PALM_TREE.LEAF_COLORS);
  const thatchColor = PALM_TREE.THATCH_COLOR;

  // Natural bow / curve orientation and magnitude
  const curveAngle = random() * Math.PI * 2;
  const curveMagnitude = randomIn(random, PALM_TREE.CURVE_OFFSET_RANGE) * scale;

  // 1. Curved seamless low-poly trunk
  const { geometry: trunkGeom, apex } = buildCurvedTrunkGeometry(
    PALM_TREE.TRUNK_SEGMENTS,
    totalHeight,
    PALM_TREE.BASE_RADIUS * scale,
    PALM_TREE.TOP_RADIUS * scale,
    curveMagnitude,
    curveAngle,
  );
  trunkGeom.translate(posX, 0, posZ);
  batch.addGeometry({
    geometry: trunkGeom,
    color: trunkColor,
    isShaded: true,
  });

  const worldApex = new THREE.Vector3(
    posX + apex.x,
    apex.y,
    posZ + apex.z,
  );

  // 2. Dried Thatch Frond Skirt (Collar right under crown)
  const collarHeight = 1.25 * scale;
  const collarGeom = new THREE.CylinderGeometry(
    0.36 * scale,
    0.68 * scale,
    collarHeight,
    7,
  );
  collarGeom.translate(
    worldApex.x,
    worldApex.y - 0.45 * scale,
    worldApex.z,
  );
  batch.addGeometry({
    geometry: collarGeom,
    color: thatchColor,
    isShaded: true,
  });

  // 3. Central Crown Core
  batch.addBox({
    size: [0.55 * scale, 0.55 * scale, 0.55 * scale],
    position: [worldApex.x, worldApex.y + 0.2 * scale, worldApex.z],
    color: leafColor,
  });

  // 4. Radiating Arching Fan Fronds
  const frondsGeom = buildFrondsGeometry(
    worldApex,
    PALM_TREE.FROND_COUNT,
    scale,
    random,
  );
  batch.addGeometry({
    geometry: frondsGeom,
    color: leafColor,
    isShaded: true,
  });
};

export const createPalmTreeModel = (seed: number): IStreetModel => {
  const batch = createStreetMeshBatch();
  addPalmTreeToBatch(batch, 0, 0, seed, 1.0);

  const footprint = PALM_TREE.FOOTPRINT;
  return toStreetModel(batch, footprint, footprint);
};
