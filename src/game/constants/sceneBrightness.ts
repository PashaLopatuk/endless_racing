/** Per-category brightness (material / vertex color), not post-processing. */

export const SCENE_BRIGHTNESS = {
  /** Baked into building and house mesh vertex colors. Road batches stay at 1. */
  BUILDING_VERTEX: 0.58,
  VEHICLE: {
    /** MeshStandard emissive on NPC paint. */
    NPC_PAINT_EMISSIVE: 0.06,
    /** Player read as the hero car under street lights. */
    PLAYER_PAINT_EMISSIVE: 0.24,
  },
} as const;
