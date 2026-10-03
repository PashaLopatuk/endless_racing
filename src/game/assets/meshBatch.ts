import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import { ASSET_KEY, BATCH_LAYER, BATCH_LAYERS, FACADE_SHADE, GEOMETRY_ATTRIBUTE, RGB_ITEM_SIZE, type BatchLayer } from "../constants/assets";
import type { Vec3Tuple } from "../types";
import { sharedAssets } from "./sharedAssets";

const spillColor = new THREE.Color(FACADE_SHADE.SPILL_COLOR);
const baseColor = new THREE.Color();
const vertexColor = new THREE.Color();

export interface BatchPart {
  color: number;
  position?: Vec3Tuple;
  /** Euler angles applied X, then Y, then Z, before translation. */
  rotation?: Vec3Tuple;
  layer?: BatchLayer;
  /** Bakes warm street-light spill into the vertex colours (for walls that face the road). */
  isShaded?: boolean;
}

export interface BoxPart extends BatchPart {
  size: Vec3Tuple;
}

export interface GeometryPart extends BatchPart {
  /** Ownership passes to the batch; it is disposed after merging. */
  geometry: THREE.BufferGeometry;
}

export interface BatchedModel {
  readonly object: THREE.Group;
  dispose(): void;
}

export interface StreetModel extends BatchedModel {
  /** Extent across the street (local X, the road-facing axis). */
  readonly width: number;
  /** Extent along the street (local Z). */
  readonly depth: number;
}

/**
 * Collects many small vertex-coloured parts and merges them into one mesh per layer,
 * so a whole building costs at most two draw calls and two shared materials.
 */
export interface MeshBatch {
  addBox(part: BoxPart): void;
  addGeometry(part: GeometryPart): void;
  build(): BatchedModel;
}

const getLayerMaterial = (layer: BatchLayer): THREE.Material => {
  switch (layer) {
    case BATCH_LAYER.GLOW:
      return sharedAssets.material(ASSET_KEY.BATCH_GLOW_MATERIAL, () => new THREE.MeshBasicMaterial({ vertexColors: true }));
    case BATCH_LAYER.SOLID:
      return sharedAssets.material(ASSET_KEY.BATCH_SOLID_MATERIAL, () => new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  }
};

const toMergeable = (geometry: THREE.BufferGeometry): THREE.BufferGeometry => {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  if (flat !== geometry) {
    geometry.dispose();
  }
  flat.deleteAttribute(GEOMETRY_ATTRIBUTE.UV);
  return flat;
};

const writeColor = (colors: Float32Array, index: number, color: THREE.Color) => {
  const offset = index * RGB_ITEM_SIZE;
  colors[offset] = color.r;
  colors[offset + 1] = color.g;
  colors[offset + 2] = color.b;
};

const paintUniform = (geometry: THREE.BufferGeometry, hex: number) => {
  const count = geometry.getAttribute(GEOMETRY_ATTRIBUTE.POSITION).count;
  const colors = new Float32Array(count * RGB_ITEM_SIZE);
  baseColor.setHex(hex);
  for (let index = 0; index < count; index += 1) {
    writeColor(colors, index, baseColor);
  }
  geometry.setAttribute(GEOMETRY_ATTRIBUTE.COLOR, new THREE.BufferAttribute(colors, RGB_ITEM_SIZE));
};

const paintShaded = (geometry: THREE.BufferGeometry, hex: number) => {
  const position = geometry.getAttribute(GEOMETRY_ATTRIBUTE.POSITION);
  const colors = new Float32Array(position.count * RGB_ITEM_SIZE);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox ?? new THREE.Box3();
  const spanX = Math.max(bounds.max.x - bounds.min.x, FACADE_SHADE.MIN_SPAN);
  const spanY = Math.max(bounds.max.y - bounds.min.y, FACADE_SHADE.MIN_SPAN);
  baseColor.setHex(hex);

  for (let index = 0; index < position.count; index += 1) {
    const towardRoad = (position.getX(index) - bounds.min.x) / spanX;
    const nearGround = 1 - (position.getY(index) - bounds.min.y) / spanY;
    const spill = towardRoad * towardRoad * (FACADE_SHADE.BASE_WEIGHT + nearGround * FACADE_SHADE.LOW_WEIGHT);
    vertexColor.copy(baseColor).lerp(spillColor, Math.min(spill * FACADE_SHADE.STRENGTH, FACADE_SHADE.MAX_MIX));
    writeColor(colors, index, vertexColor);
  }
  geometry.setAttribute(GEOMETRY_ATTRIBUTE.COLOR, new THREE.BufferAttribute(colors, RGB_ITEM_SIZE));
};

const createLayerBuckets = (): Record<BatchLayer, THREE.BufferGeometry[]> => ({
  [BATCH_LAYER.SOLID]: [],
  [BATCH_LAYER.GLOW]: [],
});

export const createMeshBatch = (): MeshBatch => {
  let buckets = createLayerBuckets();

  const addGeometry = ({ geometry, color, position, rotation, layer = BATCH_LAYER.SOLID, isShaded = false }: GeometryPart) => {
    const prepared = toMergeable(geometry);
    if (isShaded) {
      paintShaded(prepared, color);
    } else {
      paintUniform(prepared, color);
    }
    if (rotation) {
      prepared.rotateX(rotation[0]);
      prepared.rotateY(rotation[1]);
      prepared.rotateZ(rotation[2]);
    }
    if (position) {
      prepared.translate(position[0], position[1], position[2]);
    }
    buckets[layer].push(prepared);
  };

  const addBox = ({ size, ...part }: BoxPart) => {
    addGeometry({ ...part, geometry: new THREE.BoxGeometry(size[0], size[1], size[2]) });
  };

  const build = (): BatchedModel => {
    const object = new THREE.Group();
    const merged: THREE.BufferGeometry[] = [];

    for (const layer of BATCH_LAYERS) {
      const parts = buckets[layer];
      if (parts.length === 0) {
        continue;
      }
      const geometry = mergeGeometries(parts);
      parts.forEach((part) => part.dispose());
      if (!geometry) {
        throw new Error(`MeshBatch: failed to merge ${parts.length} parts on layer "${layer}"`);
      }
      geometry.computeBoundingSphere();
      merged.push(geometry);
      object.add(new THREE.Mesh(geometry, getLayerMaterial(layer)));
    }

    buckets = createLayerBuckets();
    return {
      object,
      dispose: () => merged.forEach((geometry) => geometry.dispose()),
    };
  };

  return { addBox, addGeometry, build };
};

export const toStreetModel = (batch: MeshBatch, width: number, depth: number): StreetModel => {
  return { ...batch.build(), width, depth };
};
