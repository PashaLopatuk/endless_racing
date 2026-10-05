/** Velocity MRT motion blur (`scene.ts`); strength scales with `getSpeedRatio(speed)`. */

export const MOTION_BLUR = {
  /** Multiplier on the velocity buffer at full speed (Three.js example uses ~0–3). */
  MAX_AMOUNT: 0.5,
  SMOOTH_RATE: 40,
  /**
   * Per-pixel scale on velocity (screen UV). Road strip stays sharper; facades/skyline
   * at the sides smear more. `sideDistance` is 0 at screen center, 1 at left/right edge.
   */
  ROAD_EDGE_INNER: 0.34,
  ROAD_EDGE_OUTER: 2.68,
  /** >1 keeps the road band sharp longer before env blur ramps up. */
  ENV_MASK_POWER: 2.4,
  /** Velocity scale on the road (center). */
  ROAD_BLUR_SCALE: 0.35,
  /** Velocity scale on the far left/right (environment). */
  ENV_BLUR_SCALE: 0.6,
  SAMPLE_COUNT: 8,
  /**
   * Final `pow(rgb, OUTPUT_GAMMA)` after blur + vignette. **Above 1** darkens (crushes
   * mids/shadows); **below 1** lifts shadows (brighter). **1** = unchanged.
   */
  OUTPUT_GAMMA: 1.28,
} as const;
