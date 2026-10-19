import { PLAYER } from "../constants/player";
import { DRIVABLE_X, VEHICLE_HITBOX } from "../constants/world";
import { clamp } from "./math";

export interface ICarPose {
  x: number;
  z: number;
  yaw: number;
}

export const resolveSteerTarget = (
  anchorX: number,
  deltaX: number,
  carSpeed: number,
): number => {
  const speedRatio = getSpeedRatio(carSpeed);
  const carSpeedOffset = 1 - speedRatio * PLAYER.STEER_SPEED_RATIO;

  return clamp(
    anchorX - deltaX * PLAYER.STEER_METERS_PER_PIXEL * carSpeedOffset,
    DRIVABLE_X.MIN,
    DRIVABLE_X.MAX,
  );
};

export const resolveSpeedTarget = (
  anchorSpeed: number,
  deltaY: number,
): number => {
  const raw = anchorSpeed + deltaY * PLAYER.SPEED_PER_PIXEL;
  const clamped = clamp(raw, PLAYER.MIN_SPEED, PLAYER.MAX_SPEED);

  if (clamped <= PLAYER.MAX_BASE_SPEED) {
    return clamped;
  }

  // How far above MAX_BASE_SPEED the raw target wants to go,
  // expressed as a 0→1 fraction of the base→max range.
  const taperRange = PLAYER.MAX_SPEED - PLAYER.MAX_BASE_SPEED;
  const excess = clamped - PLAYER.MAX_BASE_SPEED; // 0 … taperRange
  const t = excess / taperRange; // 0 … 1

  // ln(1+t)/ln(2) gives a curve that starts ~linear and flattens hard:
  //   t=0 → 0,  t=0.5 → ~0.58,  t=1 → 1
  // The first few pixels past MAX_BASE_SPEED still feel responsive,
  // but reaching MAX_SPEED requires a LOT of extra drag.
  const tapered = Math.log1p(t) / Math.LN2;

  return PLAYER.MAX_BASE_SPEED + tapered * taperRange;
};

export const steerYaw = (frontX: number, rearX: number): number => {
  return Math.atan2(frontX - rearX, PLAYER.AXLE_SPACING);
};

/** Writes the body pose for a car that pivots around its nose (front axle leads, rear follows) into `out`. */
export const frontPivotPose = (
  frontX: number,
  rearX: number,
  out: ICarPose,
): ICarPose => {
  const yaw = steerYaw(frontX, rearX);

  out.yaw = yaw;
  out.x = frontX - Math.sin(yaw) * VEHICLE_HITBOX.HALF_LENGTH;
  out.z = VEHICLE_HITBOX.HALF_LENGTH * (1 - Math.cos(yaw));

  return out;
};

/** 0 at minimum speed, 1 at MAX_BASE_SPEED (visual-effects ceiling). Stays clamped at 1 above. */
export const getSpeedRatio = (speed: number): number => {
  return clamp(
    (speed - PLAYER.MIN_SPEED) / (PLAYER.MAX_BASE_SPEED - PLAYER.MIN_SPEED),
    0,
    1,
  );
};

/**
 * Returns the effective smoothing rate for speed.
 * Below MAX_BASE_SPEED → normal SPEED_RESPONSE.
 * Above it → linearly interpolates down to SPEED_HIGH_RESPONSE at MAX_SPEED.
 * The result: the closer to top speed, the more sluggish acceleration feels.
 */
export const getEffectiveSpeedResponse = (currentSpeed: number): number => {
  if (currentSpeed <= PLAYER.MAX_BASE_SPEED) {
    return PLAYER.SPEED_RESPONSE;
  }

  const taperRange = PLAYER.MAX_SPEED - PLAYER.MAX_BASE_SPEED;
  const t = clamp(
    (currentSpeed - PLAYER.MAX_BASE_SPEED) / taperRange,
    0,
    1,
  );

  // Lerp: full response at MAX_BASE_SPEED, minimal response at MAX_SPEED
  return PLAYER.SPEED_RESPONSE + t * (PLAYER.SPEED_HIGH_RESPONSE - PLAYER.SPEED_RESPONSE);
};
