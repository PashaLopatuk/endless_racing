import * as THREE from "three";

/**
 * Process-wide cache for geometries and materials that many meshes reuse.
 * Meshes built from it must not dispose these resources themselves; the game session
 * calls `sharedAssets.dispose()` once on teardown, and the cache refills lazily on the next run.
 */
export interface SharedAssets {
  geometry<T extends THREE.BufferGeometry>(key: string, create: () => T): T;
  material<T extends THREE.Material>(key: string, create: () => T): T;
  dispose(): void;
}

const getOrCreate = <Base, T extends Base>(cache: Map<string, Base>, key: string, create: () => T): T => {
  const cached = cache.get(key);
  if (cached) {
    return cached as T;
  }
  const created = create();
  cache.set(key, created);
  return created;
};

const createSharedAssets = (): SharedAssets => {
  const geometries = new Map<string, THREE.BufferGeometry>();
  const materials = new Map<string, THREE.Material>();

  return {
    geometry: (key, create) => getOrCreate(geometries, key, create),
    material: (key, create) => getOrCreate(materials, key, create),
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      geometries.clear();
      materials.clear();
    },
  };
};

export const sharedAssets = createSharedAssets();
