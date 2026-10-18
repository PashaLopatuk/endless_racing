import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

import { createVehicleModel, type IVehicleModel } from "./assets/vehicles";
import { BODY_KIND } from "./constants/kinds";
import {
  INITIAL_TRAFFIC,
  NPC_BODY,
  NPC_PAINT_PALETTE,
  PARKING_ZONE,
  TRAFFIC,
  type ITrafficSeed,
} from "./constants/traffic";
import { VEHICLE_KINDS } from "./constants/vehicles";
import { CAR_Y, LANE, VEHICLE_HITBOX } from "./constants/world";
import { VEHICLE_ACTIVE_COLLISION_TYPES } from "./physics";
import { getLaneCenterX } from "./util/lane";
import { randomRange } from "./util/math";
import { pick } from "./util/random";

export interface INpcCar {
  readonly id: number;
  readonly body: RAPIER.RigidBody;
  readonly cruiseSpeed: number;
  readonly isActive: boolean;
}

export interface IWorldPosition {
  x: number;
  z: number;
}

export interface IImpulse {
  x: number;
  y: number;
  z: number;
}

export interface ITraffic {
  update(playerSpeed: number, dt: number, allowSpawn: boolean): void;
  getWorldPosition(id: number): IWorldPosition | undefined;
  queueImpulse(id: number, impulse: IImpulse): void;
  /** Pushes simulated NPC poses into Rapier for the upcoming step. */
  commitDynamics(playerSpeed: number): void;
  sync(): void;
  findById(id: number): INpcCar | undefined;
  reset(): void;
  dispose(): void;
}

/** A pooled car: built once at startup, parked out of bounds, and moved onto the road when needed. */
interface INpcSlot {
  readonly id: number;
  readonly body: RAPIER.RigidBody;
  readonly model: IVehicleModel;
  lane: number;
  cruiseSpeed: number;
  worldX: number;
  worldZ: number;
  lateralVelocity: number;
  isActive: boolean;
}

interface INpcPlacement extends ITrafficSeed {
  paint: number;
  lampBrightness: number;
}

const parkingSpot = (id: number) => ({
  x: PARKING_ZONE.X,
  y: CAR_Y,
  z: PARKING_ZONE.Z - id * PARKING_ZONE.SPACING,
});

const createNpcBody = (world: RAPIER.World, id: number): RAPIER.RigidBody => {
  const spot = parkingSpot(id);

  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(spot.x, spot.y, spot.z)
      .lockRotations()
      .setCcdEnabled(true)
      .setEnabled(false)
      .setUserData({ kind: BODY_KIND.NPC, id }),
  );

  world.createCollider(
    RAPIER.ColliderDesc.cuboid(
      VEHICLE_HITBOX.HALF_WIDTH,
      VEHICLE_HITBOX.HALF_HEIGHT,
      VEHICLE_HITBOX.HALF_LENGTH,
    )
      .setDensity(NPC_BODY.DENSITY)
      .setFriction(NPC_BODY.FRICTION)
      .setRestitution(NPC_BODY.RESTITUTION)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
      .setActiveCollisionTypes(VEHICLE_ACTIVE_COLLISION_TYPES),
    body,
  );

  return body;
};

const createNpcSlot = (
  world: RAPIER.World,
  scene: THREE.Scene,
  index: number,
): INpcSlot => {
  const id = TRAFFIC.FIRST_ID + index;

  const model = createVehicleModel({
    kind: VEHICLE_KINDS[index % VEHICLE_KINDS.length],
    paint: NPC_PAINT_PALETTE[index % NPC_PAINT_PALETTE.length],
    lampBrightness: TRAFFIC.LAMP_BRIGHTNESS_MIN,
    hasSpotlights: false,
  });

  const spot = parkingSpot(id);

  model.object.position.set(spot.x, spot.y, spot.z);
  scene.add(model.object);

  return {
    id,
    body: createNpcBody(world, id),
    model,
    lane: 0,
    cruiseSpeed: TRAFFIC.MIN_SPEED,
    worldX: spot.x,
    worldZ: spot.z,
    lateralVelocity: 0,
    isActive: false,
  };
};

const pushSlotPose = (slot: INpcSlot) => {
  slot.body.setNextKinematicTranslation({
    x: slot.worldX,
    y: CAR_Y,
    z: slot.worldZ,
  });
};

const activateSlot = (
  slot: INpcSlot,
  { lane, z, cruiseSpeed, paint, lampBrightness }: INpcPlacement,
) => {
  slot.lane = lane;
  slot.cruiseSpeed = cruiseSpeed;
  slot.isActive = true;
  slot.lateralVelocity = 0;
  slot.model.setPaint(paint);
  slot.model.setLampBrightness(lampBrightness);
  slot.body.setEnabled(true);
  slot.worldX = getLaneCenterX(lane);
  slot.worldZ = z;
  slot.body.setTranslation({ x: slot.worldX, y: CAR_Y, z: slot.worldZ }, true);
};

const parkSlot = (slot: INpcSlot) => {
  const spot = parkingSpot(slot.id);

  slot.isActive = false;
  slot.lateralVelocity = 0;
  slot.body.setEnabled(false);
  slot.worldX = spot.x;
  slot.worldZ = spot.z;
  slot.body.setTranslation({ x: spot.x, y: spot.y, z: spot.z }, true);
  slot.model.object.position.set(spot.x, spot.y, spot.z);
};

export const createTraffic = (
  world: RAPIER.World,
  scene: THREE.Scene,
): ITraffic => {
  const slots = Array.from({ length: TRAFFIC.POOL_SIZE }, (_, index) =>
    createNpcSlot(world, scene, index),
  );
  const slotsById = new Map(slots.map((slot) => [slot.id, slot]));
  const parkedScratch: INpcSlot[] = [];
  const openLanesScratch: number[] = [];
  const bandLanes = new Array<boolean>(LANE.COUNT).fill(false);
  const blockedLanes = new Array<boolean>(LANE.COUNT).fill(false);
  const pendingImpulses = new Map<number, IImpulse>();

  let activeCount = 0;
  let paintCursor = 0;
  let spawnTimer: number = TRAFFIC.INITIAL_SPAWN_DELAY;

  const takeParkedSlot = (): INpcSlot | null => {
    parkedScratch.length = 0;
    for (const slot of slots) {
      if (!slot.isActive) {
        parkedScratch.push(slot);
      }
    }
    return parkedScratch.length > 0 ? pick(Math.random, parkedScratch) : null;
  };

  const spawn = (seed: ITrafficSeed) => {
    const slot = takeParkedSlot();
    if (!slot) {
      return;
    }

    const paint = NPC_PAINT_PALETTE[paintCursor % NPC_PAINT_PALETTE.length];

    paintCursor += 1;

    activateSlot(slot, {
      ...seed,
      paint,
      lampBrightness: randomRange(
        TRAFFIC.LAMP_BRIGHTNESS_MIN,
        TRAFFIC.LAMP_BRIGHTNESS_MAX,
      ),
    });

    activeCount += 1;
  };

  const despawn = (slot: INpcSlot) => {
    parkSlot(slot);
    activeCount -= 1;
  };

  const applyPendingImpulses = (slot: INpcSlot) => {
    const impulse = pendingImpulses.get(slot.id);

    if (!impulse) {
      return;
    }

    slot.lateralVelocity += impulse.x;
    slot.worldZ += impulse.z * 0.04;
  };

  const advanceSlot = (slot: INpcSlot, playerSpeed: number, dt: number) => {
    applyPendingImpulses(slot);

    const closing = Math.max(
      TRAFFIC.MIN_CLOSING_SPEED,
      playerSpeed - slot.cruiseSpeed,
    );

    slot.worldZ -= closing * dt;
    slot.lateralVelocity *= TRAFFIC.LATERAL_DAMPING;
    slot.worldX += slot.lateralVelocity * dt;
  };

  /** Lanes where a car may appear at `z`, keeping at least `MIN_FREE_LANES` lanes clear across the band. */
  const collectOpenLanes = (z: number): readonly number[] => {
    bandLanes.fill(false);
    blockedLanes.fill(false);
    openLanesScratch.length = 0;

    for (const slot of slots) {
      if (!slot.isActive) {
        continue;
      }
      const distance = Math.abs(slot.worldZ - z);
      bandLanes[slot.lane] ||= distance < TRAFFIC.SPAWN_BAND;
      blockedLanes[slot.lane] ||= distance < TRAFFIC.MIN_LANE_GAP;
    }

    const bandCount = bandLanes.filter(Boolean).length;

    if (bandCount >= LANE.COUNT - TRAFFIC.MIN_FREE_LANES) {
      return openLanesScratch;
    }

    for (let lane = 0; lane < LANE.COUNT; lane += 1) {
      if (!bandLanes[lane] && !blockedLanes[lane]) {
        openLanesScratch.push(lane);
      }
    }

    return openLanesScratch;
  };

  const trySpawnAhead = () => {
    if (activeCount >= TRAFFIC.MAX_ACTIVE) {
      return;
    }

    const z = TRAFFIC.SPAWN_Z + randomRange(0, TRAFFIC.SPAWN_Z_RANDOMIZE);
    const openLanes = collectOpenLanes(z);

    if (openLanes.length === 0) {
      return;
    }

    spawn({
      lane: pick(Math.random, openLanes),
      z,
      cruiseSpeed: randomRange(TRAFFIC.MIN_SPEED, TRAFFIC.MAX_SPEED),
    });
  };

  const seedInitial = () => {
    slots.filter((slot) => slot.isActive).forEach(despawn);
    INITIAL_TRAFFIC.forEach(spawn);
    spawnTimer = TRAFFIC.INITIAL_SPAWN_DELAY;
  };

  seedInitial();

  const mergeImpulse = (id: number, impulse: IImpulse) => {
    const previous = pendingImpulses.get(id) ?? { x: 0, y: 0, z: 0 };

    pendingImpulses.set(id, {
      x: previous.x + impulse.x,
      y: previous.y + impulse.y,
      z: previous.z + impulse.z,
    });
  };

  return {
    update: (playerSpeed, dt, allowSpawn) => {
      for (const slot of slots) {
        if (!slot.isActive) {
          continue;
        }

        advanceSlot(slot, playerSpeed, dt);

        if (slot.worldZ < TRAFFIC.DESPAWN_Z) {
          despawn(slot);

          continue;
        }
      }

      pendingImpulses.clear();

      if (!allowSpawn) {
        return;
      }

      spawnTimer -= dt;

      if (spawnTimer > 0) {
        return;
      }

      trySpawnAhead();

      spawnTimer = randomRange(
        TRAFFIC.SPAWN_INTERVAL_MIN,
        TRAFFIC.SPAWN_INTERVAL_MAX,
      );
    },
    getWorldPosition: (id) => {
      const slot = slotsById.get(id);

      if (!slot?.isActive) {
        return undefined;
      }

      return { x: slot.worldX, z: slot.worldZ };
    },
    queueImpulse: mergeImpulse,
    commitDynamics: (_playerSpeed) => {
      for (const slot of slots) {
        if (slot.isActive) {
          pushSlotPose(slot);
        }
      }
    },
    sync: () => {
      for (const slot of slots) {
        if (!slot.isActive) {
          continue;
        }

        slot.model.object.position.set(slot.worldX, CAR_Y, slot.worldZ);
      }
    },
    findById: (id) => slotsById.get(id),
    reset: seedInitial,
    dispose: () => {
      slots.forEach((slot) => slot.model.dispose());
    },
  };
};
