import type { Vec3Tuple } from "../../types";

export interface IPalmLeafLayer {
  readonly size: Vec3Tuple;
  readonly position: Vec3Tuple;
}

export const PALM_TREE = {
  FOOTPRINT: 0.8,
  TRUNK: {
    SIZE: [0.15, 3.5, 0.15] as const,
    Y: 1.75,
  },
  LEAVES: [
    { size: [0.8, 0.4, 0.8], position: [0, 3.6, 0] },
    { size: [1.6, 0.2, 0.4], position: [0, 3.5, 0] },
    { size: [0.4, 0.2, 1.6], position: [0, 3.5, 0] },
  ] as const satisfies readonly IPalmLeafLayer[],
  SIZE_TIERS: [0.7, 0.85, 1.0, 1.15, 1.3] as const,
  TRUNK_COLORS: [0x8b5a2b, 0x9c6631, 0x7a4e25, 0x6e4b3a] as const,
  LEAF_COLORS: [0x228b22, 0x2e8b57, 0x006400, 0x3cb371, 0x1f4d3a] as const,
} as const;
