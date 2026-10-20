import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

import { createVehicleModel } from "./assets/vehicles";
import { IMPACT_DAMAGE, IMPACT_SPEED_LOSS } from "./constants/collision";
import { BODY_KIND } from "./constants/kinds";
import { PLAYER, PLAYER_VEHICLE_KIND } from "./constants/player";
import { NPC_BODY } from "./constants/traffic";
import { CAR_Y, DRIVABLE_X, VEHICLE_HITBOX } from "./constants/world";
import type { IDriveGesture } from "./input";
import type { LevelSkyMode } from "./levels/types";
import { VEHICLE_ACTIVE_COLLISION_TYPES } from "./physics";
import type { ImpactKind } from "./types";
import {
  frontPivotPose,
  getSpeedRatio,
  getEffectiveSpeedResponse,
  resolveSpeedTarget,
  resolveSteerTarget,
  type ICarPose,
} from "./util/drive";
import { getLaneCenterX } from "./util/lane";
import { smoothNumberValueExponentially, clamp } from "./util/math";

export interface IPlayer {
  readonly body: RAPIER.RigidBody;
  readonly x: number;
  readonly worldZ: number;
  readonly speed: number;
  readonly health: number;
  readonly isWrecked: boolean;
  update(gesture: IDriveGesture, dt: number, isGameOver: boolean): void;
  /** Hands the pose computed in `update` to Rapier for the next physics step. */
  commitPose(): void;
  syncMesh(): void;
  absorbImpact(kind: ImpactKind): void;
  /** Shifts the car sideways immediately (used to separate it from a car it scraped). */
  shiftAfterHit(offsetX: number): void;
  reset(): void;
  dispose(): void;
}

interface IPlayerState {
  frontX: number;
  rearX: number;
  speed: number;
  health: number;
  /** Front-axle X and speed captured when the current drag began; drag deltas are relative to them. */
  anchorX: number;
  anchorSpeed: number;
  wasTouching: boolean;
  hitFlash: number;
}

const START_X = getLaneCenterX(PLAYER.START_LANE);

const createInitialState = (): IPlayerState => ({
  frontX: START_X,
  rearX: START_X,
  speed: PLAYER.BASE_SPEED,
  health: PLAYER.MAX_HEALTH,
  anchorX: START_X,
  anchorSpeed: PLAYER.BASE_SPEED,
  wasTouching: false,
  hitFlash: 0,
});

const clampToRoad = (x: number): number =>
  clamp(x, DRIVABLE_X.MIN, DRIVABLE_X.MAX);

const createPlayerBody = (world: RAPIER.World): RAPIER.RigidBody => {
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(START_X, CAR_Y, PLAYER.Z)
      .lockRotations()
      .setCcdEnabled(true)
      .setUserData({ kind: BODY_KIND.PLAYER, id: PLAYER.ID }),
  );

  const collider = world.createCollider(
    RAPIER.ColliderDesc.cuboid(
      VEHICLE_HITBOX.HALF_WIDTH,
      VEHICLE_HITBOX.HALF_HEIGHT,
      VEHICLE_HITBOX.HALF_LENGTH,
    )
      .setFriction(PLAYER.FRICTION)
      .setRestitution(PLAYER.RESTITUTION)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
      .setActiveCollisionTypes(VEHICLE_ACTIVE_COLLISION_TYPES),
    body,
  );

  collider.setDensity(NPC_BODY.DENSITY);

  return body;
};

const HEAD_LAMP_OFF_COLOR = 0x2b2e33;

export const createPlayer = (
  world: RAPIER.World,
  scene: THREE.Scene,
  skyMode: LevelSkyMode = "night",
): IPlayer => {
  const isDay = skyMode === "day";

  const model = createVehicleModel({
    kind: PLAYER_VEHICLE_KIND,
    paint: PLAYER.COLOR,
    lampBrightness: PLAYER.LAMP_BRIGHTNESS,
    hasSpotlights: !isDay,
    isPlayer: true,
    headLampColor: isDay ? HEAD_LAMP_OFF_COLOR : undefined,
  });

  scene.add(model.object);

  const body = createPlayerBody(world);
  const state = createInitialState();
  const pose: ICarPose = { x: START_X, z: 0, yaw: 0 };

  let isFlashing = false;

  const syncAxles = (dt: number) => {
    const followed = smoothNumberValueExponentially(
      state.rearX,
      state.frontX,
      PLAYER.REAR_FOLLOW,
      dt,
    );

    state.rearX = clampToRoad(
      clamp(
        followed,
        state.frontX - PLAYER.MAX_AXLE_LEAD,
        state.frontX + PLAYER.MAX_AXLE_LEAD,
      ),
    );

    frontPivotPose(state.frontX, state.rearX, pose);
  };

  const processGameOverMovement = (dt: number) => {
    state.speed = smoothNumberValueExponentially(
      state.speed,
      0,
      PLAYER.GAME_OVER_DECEL,
      dt,
    );

    state.wasTouching = false;
  };

  const processMovementChange = (gesture: IDriveGesture, dt: number) => {
    if (gesture.isActive && !state.wasTouching) {
      state.anchorX = state.frontX;
      state.anchorSpeed = state.speed;
    }

    state.wasTouching = gesture.isActive;

    if (!gesture.isActive) {
      return;
    }

    const targetFront = resolveSteerTarget(
      state.anchorX,
      gesture.deltaX,
      state.speed,
    );

    const targetSpeed = resolveSpeedTarget(state.anchorSpeed, gesture.deltaY);

    state.frontX = clampToRoad(
      smoothNumberValueExponentially(
        state.frontX,
        targetFront,
        PLAYER.STEER_RESPONSE,
        dt,
      ),
    );

    state.speed = smoothNumberValueExponentially(
      state.speed,
      targetSpeed,
      getEffectiveSpeedResponse(state.speed),
      dt,
    );
  };

  const updateFlash = () => {
    const shouldFlash = state.hitFlash > 0;

    if (shouldFlash === isFlashing) {
      return;
    }

    isFlashing = shouldFlash;

    model.setPaint(shouldFlash ? PLAYER.HIT_FLASH_COLOR : PLAYER.COLOR);
  };

  const pushKinematicPose = () => {
    body.setNextKinematicTranslation({
      x: pose.x,
      y: CAR_Y,
      z: PLAYER.Z + pose.z,
    });
  };

  syncAxles(0);

  pushKinematicPose();

  return {
    body,
    get x() {
      return pose.x;
    },
    get worldZ() {
      return PLAYER.Z + pose.z;
    },
    get speed() {
      return state.speed;
    },
    get health() {
      return state.health;
    },
    get isWrecked() {
      return state.health <= 0;
    },
    update: (gesture, dt, isGameOver) => {
      state.hitFlash = Math.max(0, state.hitFlash - dt);

      if (isGameOver) {
        processGameOverMovement(dt);
      } else {
        processMovementChange(gesture, dt);
      }

      syncAxles(dt);
    },
    commitPose: pushKinematicPose,
    syncMesh: () => {
      model.object.position.set(pose.x, CAR_Y, PLAYER.Z + pose.z);
      model.object.rotation.y = pose.yaw;

      updateFlash();
    },
    absorbImpact: (kind) => {
      const speedLoss = Math.ceil(
        IMPACT_SPEED_LOSS[kind] * getSpeedRatio(state.speed),
      );

      const absorbedDamage = Math.ceil(
        IMPACT_DAMAGE[kind] * getSpeedRatio(state.speed),
      );

      state.health = Math.max(0, state.health - absorbedDamage);

      state.speed = Math.max(PLAYER.MIN_SPEED, state.speed - speedLoss);

      state.anchorSpeed = Math.max(
        PLAYER.MIN_SPEED,
        state.anchorSpeed - speedLoss,
      );

      state.hitFlash = PLAYER.HIT_FLASH_SECONDS;
    },
    shiftAfterHit: (offsetX) => {
      const nextFront = clampToRoad(state.frontX + offsetX);
      const applied = nextFront - state.frontX;

      state.frontX = nextFront;
      state.rearX = clampToRoad(state.rearX + applied);
      state.anchorX += applied;

      syncAxles(0);
    },
    reset: () => {
      Object.assign(state, createInitialState());

      syncAxles(0);

      pushKinematicPose();

      updateFlash();
    },
    dispose: () => {
      model.dispose();
    },
  };
};
