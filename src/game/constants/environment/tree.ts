import type { Vec3Tuple } from "../../types";

export interface ITreeFoliageLayer {
  readonly size: Vec3Tuple;
  readonly y: number;
}

export const TREE = {
  FOOTPRINT: 1.15,
  TRUNK: {
    SIZE: [0.26, 1.05, 0.26] as const,
    Y: 0.52,
  },
  /** Stacked canopies; scaled per size tier at build time. */
  FOLIAGE_LAYERS: [
    { size: [1.05, 0.62, 1.05], y: 1.28 },
    { size: [0.88, 0.58, 0.88], y: 1.82 },
    { size: [0.62, 0.48, 0.62], y: 2.28 },
  ] as const satisfies readonly ITreeFoliageLayer[],
  /** Broad single-canopy variant for alternate silhouettes. */
  FOLIAGE_ROUND: {
    SIZE: [1.18, 1.05, 1.18] as const,
    Y: 1.72,
  },
  SIZE_TIERS: [0.68, 0.88, 1.05, 1.32] as const,
  TRUNK_COLORS: [0x4a3828, 0x5a4838, 0x3a2818, 0x6a5848] as const,
  LEAF_COLORS: [0x2d6b4f, 0x3a7f4c, 0x1f4d3a, 0x4a8f5a, 0x356b42] as const,
} as const;
