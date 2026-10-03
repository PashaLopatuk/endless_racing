import { AXLE_SPACING, MAX_SPEED, MIN_SPEED, PLAYER_MAX_X, PLAYER_MIN_X, SPEED_PER_PIXEL, STEER_METERS_PER_PIXEL } from "../const";
import { clamp } from "./math";

export const resolveSteerTarget = (anchorX: number, deltaX: number): number => {
  return clamp(anchorX - deltaX * STEER_METERS_PER_PIXEL, PLAYER_MIN_X, PLAYER_MAX_X);
};

export const steerYaw = (frontX: number, rearX: number): number => {
  return Math.atan2(frontX - rearX, AXLE_SPACING);
};

export const frontPivotPose = (frontX: number, rearX: number, nose: number): { x: number; z: number; yaw: number } => {
  const yaw = steerYaw(frontX, rearX);
  return {
    yaw,
    x: frontX - Math.sin(yaw) * nose,
    z: nose * (1 - Math.cos(yaw)),
  };
};

export const resolveSpeedTarget = (anchorSpeed: number, deltaY: number): number => {
  return clamp(anchorSpeed + deltaY * SPEED_PER_PIXEL, MIN_SPEED, MAX_SPEED);
};
