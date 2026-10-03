import { PLAYER } from "../constants/player";
import { CAR_SIZE, DRIVABLE_X } from "../constants/world";
import { clamp } from "./math";

export interface CarPose {
  x: number;
  z: number;
  yaw: number;
}

export const resolveSteerTarget = (anchorX: number, deltaX: number): number => {
  return clamp(anchorX - deltaX * PLAYER.STEER_METERS_PER_PIXEL, DRIVABLE_X.MIN, DRIVABLE_X.MAX);
};

export const resolveSpeedTarget = (anchorSpeed: number, deltaY: number): number => {
  return clamp(anchorSpeed + deltaY * PLAYER.SPEED_PER_PIXEL, PLAYER.MIN_SPEED, PLAYER.MAX_SPEED);
};

export const steerYaw = (frontX: number, rearX: number): number => {
  return Math.atan2(frontX - rearX, PLAYER.AXLE_SPACING);
};

/** Writes the body pose for a car that pivots around its nose (front axle leads, rear follows) into `out`. */
export const frontPivotPose = (frontX: number, rearX: number, out: CarPose): CarPose => {
  const yaw = steerYaw(frontX, rearX);
  out.yaw = yaw;
  out.x = frontX - Math.sin(yaw) * CAR_SIZE.HALF_LENGTH;
  out.z = CAR_SIZE.HALF_LENGTH * (1 - Math.cos(yaw));
  return out;
};
