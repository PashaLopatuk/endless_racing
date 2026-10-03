import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

import { disposeObject, getCarModel } from "./assets/models";
import { frontPivotPose, resolveSpeedTarget, resolveSteerTarget } from "./util/drive";
import type { DriveGesture } from "./input";
import { BODY_KIND, IMPACT_KIND, type ImpactKind } from "./type";
import {
  BASE_SPEED,
  CAR_HALF_HEIGHT,
  CAR_HALF_LENGTH,
  CAR_HALF_WIDTH,
  CAR_Y,
  COLLISION_DAMAGE_FRONT,
  COLLISION_DAMAGE_REAR,
  COLLISION_DAMAGE_SIDE,
  FRONT_SPEED_LOSS,
  GAME_OVER_DECEL,
  MAX_AXLE_LEAD,
  MAX_HEALTH,
  MIN_SPEED,
  PLAYER_COLOR,
  PLAYER_MAX_X,
  PLAYER_MIN_X,
  PLAYER_Z,
  REAR_FOLLOW,
  SPEED_RESPONSE,
  STEER_RESPONSE,
} from "./const";
import { approach, clamp } from "./util/math";
import { getLaneCenterX } from "./util/lane";

const HIT_FLASH_SECONDS = 0.12;
const HIT_FLASH_COLOR = 0xffe4d6;
const START_X = getLaneCenterX(1);

export type Player = {
  readonly body: RAPIER.RigidBody;
  x: number;
  speed: number;
  health: number;
  update: (gesture: DriveGesture, dt: number, isGameOver: boolean) => void;
  commitPose: () => void;
  syncMesh: () => void;
  applyDamage: (amount: number) => void;
  cutSpeed: (amount: number) => void;
  nudge: (offsetX: number) => void;
  reset: () => void;
  dispose: () => void;
};

const paintChassis = (mesh: THREE.Object3D, color: number) => {
  const chassis = mesh.getObjectByName("chassis");
  if (!(chassis instanceof THREE.Mesh) || Array.isArray(chassis.material)) {
    return;
  }
  if ("color" in chassis.material && chassis.material.color instanceof THREE.Color) {
    chassis.material.color.setHex(color);
  }
};

export const createPlayer = (world: RAPIER.World, scene: THREE.Scene): Player => {
  const mesh = getCarModel(PLAYER_COLOR);
  scene.add(mesh);

  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(START_X, CAR_Y, PLAYER_Z)
      .lockRotations()
      .setCcdEnabled(true)
      .setUserData({ kind: BODY_KIND.PLAYER, id: 0 }),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(CAR_HALF_WIDTH, CAR_HALF_HEIGHT, CAR_HALF_LENGTH)
      .setFriction(0.35)
      .setRestitution(0)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
    body,
  );
  body.userData = { kind: BODY_KIND.PLAYER, id: 0 };

  let frontX = START_X;
  let rearX = START_X;
  let x = START_X;
  let z = PLAYER_Z;
  let yaw = 0;
  let speed = BASE_SPEED;
  let health = MAX_HEALTH;
  let anchorX = START_X;
  let anchorSpeed = BASE_SPEED;
  let wasTouching = false;
  let hitFlash = 0;

  const syncAxles = (dt: number) => {
    rearX = approach(rearX, frontX, REAR_FOLLOW, dt);
    rearX = clamp(rearX, frontX - MAX_AXLE_LEAD, frontX + MAX_AXLE_LEAD);
    rearX = clamp(rearX, PLAYER_MIN_X, PLAYER_MAX_X);
    const pose = frontPivotPose(frontX, rearX, CAR_HALF_LENGTH);
    yaw = pose.yaw;
    x = pose.x;
    z = PLAYER_Z + pose.z;
  };

  const writePose = () => {
    body.setNextKinematicTranslation({ x, y: CAR_Y, z });
  };

  const player: Player = {
    body,
    get x() {
      return x;
    },
    set x(value: number) {
      x = value;
    },
    get speed() {
      return speed;
    },
    set speed(value: number) {
      speed = value;
    },
    get health() {
      return health;
    },
    set health(value: number) {
      health = value;
    },
    update: (gesture, dt, isGameOver) => {
      hitFlash = Math.max(0, hitFlash - dt);
      if (isGameOver) {
        speed = approach(speed, 0, GAME_OVER_DECEL, dt);
        wasTouching = false;
      } else {
        if (gesture.isActive && !wasTouching) {
          anchorX = frontX;
          anchorSpeed = speed;
        }
        wasTouching = gesture.isActive;

        const targetFront = gesture.isActive ? resolveSteerTarget(anchorX, gesture.deltaX) : frontX;
        const targetSpeed = gesture.isActive ? resolveSpeedTarget(anchorSpeed, gesture.deltaY) : speed;
        frontX = clamp(approach(frontX, targetFront, STEER_RESPONSE, dt), PLAYER_MIN_X, PLAYER_MAX_X);
        speed = approach(speed, targetSpeed, SPEED_RESPONSE, dt);
      }

      syncAxles(dt);
    },
    commitPose: writePose,
    syncMesh: () => {
      const translation = body.translation();
      mesh.position.set(translation.x, translation.y, translation.z);
      mesh.rotation.y = yaw;
      paintChassis(mesh, hitFlash > 0 ? HIT_FLASH_COLOR : PLAYER_COLOR);
    },
    applyDamage: (amount) => {
      health = Math.max(0, health - amount);
      hitFlash = HIT_FLASH_SECONDS;
    },
    cutSpeed: (amount) => {
      speed = Math.max(MIN_SPEED, speed - amount);
      anchorSpeed = Math.max(MIN_SPEED, anchorSpeed - amount);
    },
    nudge: (offsetX) => {
      const nextFront = clamp(frontX + offsetX, PLAYER_MIN_X, PLAYER_MAX_X);
      const applied = nextFront - frontX;
      frontX = nextFront;
      rearX = clamp(rearX + applied, PLAYER_MIN_X, PLAYER_MAX_X);
      anchorX += applied;
      syncAxles(0);
      body.setTranslation({ x, y: CAR_Y, z }, true);
    },
    reset: () => {
      frontX = START_X;
      rearX = START_X;
      x = START_X;
      z = PLAYER_Z;
      yaw = 0;
      speed = BASE_SPEED;
      health = MAX_HEALTH;
      anchorX = START_X;
      anchorSpeed = BASE_SPEED;
      wasTouching = false;
      hitFlash = 0;
      body.setTranslation({ x: START_X, y: CAR_Y, z: PLAYER_Z }, true);
      paintChassis(mesh, PLAYER_COLOR);
    },
    dispose: () => {
      scene.remove(mesh);
      disposeObject(mesh);
    },
  };

  writePose();
  return player;
};

export const damageForImpact = (kind: ImpactKind): number => {
  switch (kind) {
    case IMPACT_KIND.SIDE:
      return COLLISION_DAMAGE_SIDE;
    case IMPACT_KIND.REAR:
      return COLLISION_DAMAGE_REAR;
    case IMPACT_KIND.FRONT:
      return COLLISION_DAMAGE_FRONT;
    default:
      return COLLISION_DAMAGE_FRONT;
  }
};

export const speedLossForImpact = (kind: ImpactKind): number => {
  if (kind === IMPACT_KIND.SIDE) {
    return 0;
  }
  return FRONT_SPEED_LOSS;
};
