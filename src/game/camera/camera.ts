import * as THREE from "three";
import { CAMERA } from "../constants/camera";
import { smoothNumberValueExponentially } from "../util/math";

export const createCamera = (aspectRatio: number): THREE.PerspectiveCamera => {
  const camera = new THREE.PerspectiveCamera(
    CAMERA.FOV,
    aspectRatio,
    CAMERA.NEAR,
    CAMERA.FAR,
  );
  camera.position.set(0, CAMERA.HEIGHT, -CAMERA.BACK);
  camera.lookAt(0, CAMERA.LOOK_HEIGHT, CAMERA.LOOK_AHEAD);
  return camera;
};

export const updateCameraPosition = (
  camera: THREE.PerspectiveCamera,
  playerX: number,
  speedRatio: number,
  dt: number,
) => {
  // Lateral tracking: follows player with slight lag, dampens at top speed
  camera.position.x = smoothNumberValueExponentially(
    camera.position.x,
    playerX *
      CAMERA.FOLLOW_X_RATIO *
      (1 - speedRatio * CAMERA.FOLLOW_X_SPEED_RATIO),
    CAMERA.FOLLOW,
    dt,
  );

  // Longitudinal tracking: pulls back further at higher speeds
  camera.position.z = smoothNumberValueExponentially(
    camera.position.z,
    -CAMERA.BACK + speedRatio * CAMERA.MAX_SPEED_DISTANCE,
    1,
    dt,
  );

  camera.position.y = CAMERA.HEIGHT;
  camera.lookAt(camera.position.x, CAMERA.LOOK_HEIGHT, CAMERA.LOOK_AHEAD);
};

export const updateCameraFov = (
  camera: THREE.PerspectiveCamera,
  speedRatio: number,
  dt: number,
) => {
  const targetSpeedFov =
    CAMERA.FOV + (CAMERA.FOV_MAX - CAMERA.FOV) * speedRatio;

  const fovResponse =
    targetSpeedFov > camera.fov
      ? CAMERA.FOV_INCREASE_RESPONSE
      : CAMERA.FOV_DECREASE_RESPONSE;

  const interpolatedFov = smoothNumberValueExponentially(
    camera.fov,
    targetSpeedFov,
    fovResponse,
    dt,
  );

  if (Math.abs(interpolatedFov - camera.fov) > CAMERA.FOV_EPSILON) {
    camera.fov = interpolatedFov;
    camera.updateProjectionMatrix();
  }
};
