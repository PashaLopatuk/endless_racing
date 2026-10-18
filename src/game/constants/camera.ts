export const CAMERA = {
  FOV: 52,
  FOV_MAX: 118,
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
  FOLLOW_X_SPEED_RATIO: 0.5,
  MAX_SPEED_DISTANCE: 8,
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
} as const;
