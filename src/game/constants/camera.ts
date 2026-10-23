export const CAMERA = {
  FOV: 62,
  FOV_MAX: 128,
  FOV_INCREASE_RESPONSE: 0.7,
  FOV_DECREASE_RESPONSE: 2.8,
  FOV_EPSILON: 0.1,
  NEAR: 0.1,
  FAR: 320,
  HEIGHT: 8,
  BACK: 15,
  LOOK_AHEAD: 18,
  LOOK_HEIGHT: 1.0,
  FOLLOW: 3.2,
  FOLLOW_X_RATIO: 0.7,
  FOLLOW_X_SPEED_RATIO: 0.7,
  MAX_SPEED_DISTANCE: 10,

  /** Max lateral shake at top speed (CSS px). */
  SHAKE_MAX_PX_X: 1.6,
  /** Max vertical shake at top speed (CSS px) — dominant axis like road bumps. */
  SHAKE_MAX_PX_Y: 1.0,
  /** Low-frequency suspension sway (rad/s, ~2.7 Hz). */
  SHAKE_FREQ_LO: 7,
  /** Mid-frequency road-texture rumble (rad/s, ~5 Hz). */
  SHAKE_FREQ_MID: 15,
  /** High-frequency drivetrain buzz (rad/s, ~8.4 Hz). */
  SHAKE_FREQ_HI: 20,
  /** How quickly shake intensity ramps up / down. */
  SHAKE_SMOOTH_RATE: 2,

  /** Max horizontal impact shake in CSS px (stronger axis on hit). */
  IMPACT_SHAKE_MAX_PX_X: 24,
  /** Max vertical impact shake in CSS px (weaker axis on hit). */
  IMPACT_SHAKE_MAX_PX_Y: 7,
  /** Max angular tilt in degrees during impact shake. */
  IMPACT_SHAKE_MAX_DEG: 1.4,
  /** How quickly impact trauma decays per second. */
  IMPACT_SHAKE_DECAY: 2.8,
  /** Impact oscillation frequency (rad/s). */
  IMPACT_SHAKE_FREQ: 42,
} as const;

export const RENDERER = {
  MAX_PIXEL_RATIO: 2,
  MIN_VIEWPORT_SIZE: 1,
  CANVAS_CLASS: "game-webgl-canvas",
} as const;

export const GROUND = {
  WIDTH: 420,
  LENGTH: 900,
  Y: -0.22,
  Z: 120,
} as const;

export const SKY = {
  SCALE: 500,
  RENDER_ORDER: -1,
  STAR_GRID: 280,
  STAR_THRESHOLD: 0.993,
  BRIGHT_STAR_THRESHOLD: 0.998,
  CLOUD_LAYER_SCALE: 3.4,
  CLOUD_DETAIL_SCALE: 6.1,

  /** Base idle drift rate of the sky per second. */
  DRIFT_BASE_RATE: 0.0006,
  /** Speed-dependent drift factor (advances sky with driving speed). */
  DRIFT_SPEED_FACTOR: 0.00005,
  /** Rounded square factor (0 = round circle, 1 = sharp box). 0.32 gives subtle cartoon squircle. */
  CLOUD_SQUIRCLE_FACTOR: 0.32,
} as const;
