import { VEHICLE_KIND } from "./vehicles";

export const PLAYER = {
  ID: 0,
  START_LANE: 1,
  Z: 0,
  MAX_HEALTH: 100,

  BASE_SPEED: 22,
  MIN_SPEED: 14,
  MAX_SPEED: 70,
  /** Visual-effects ceiling and taper onset — FOV, motion blur, camera all max out here. */
  MAX_BASE_SPEED: 46,
  SPEED_EXCEED: 24,
  SPEED_PER_PIXEL: 0.08,
  SPEED_RESPONSE: 3.5,

  /** Smoothing rate at absolute top speed — much lower than SPEED_RESPONSE. */
  SPEED_HIGH_RESPONSE: 0.15,
  GAME_OVER_DECEL: Infinity,

  STEER_METERS_PER_PIXEL: 0.038,
  STEER_RESPONSE: 12,
  STEER_SPEED_RATIO: 0.25,

  AXLE_SPACING: 2.3,
  REAR_FOLLOW: 4.6,
  MAX_AXLE_LEAD: 0.9,

  COLOR: 0xc4472d,
  HIT_FLASH_COLOR: 0xffe4d6,
  HIT_FLASH_SECONDS: 0.12,

  LAMP_BRIGHTNESS: 0.95,

  FRICTION: 0.35,
  RESTITUTION: 0,
} as const;

export const PLAYER_VEHICLE_KIND = VEHICLE_KIND.SEDAN;
