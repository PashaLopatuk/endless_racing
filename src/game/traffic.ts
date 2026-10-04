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
import { CAR_SIZE, CAR_Y, LANE } from "./constants/world";
import { getLaneCenterX } from "./util/lane";
import { randomRange } from "./util/math";
import { pick } from "./util/random";

export interface INpcCar {
  readonly id: number;
  readonly body: RAPIER.RigidBody;
  readonly cruiseSpeed: number;
  readonly isActive: boolean;
}

export interface ITraffic {
  update(playerSpeed: number, dt: number, allowSpawn: boolean): void;
  /** Copies physics positions onto the meshes of active cars. */
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
  isActive: boolean;
}

interface INpcPlacement extends ITrafficSeed {
  paint: number;
  lampBrightness: number;
}

const ZERO_VELOCITY: RAPIER.Vector = { x: 0, y: 0, z: 0 };

const parkingSpot = (id: number): RAPIER.Vector => ({
  x: PARKING_ZONE.X,
  y: CAR_Y,
  z: PARKING_ZONE.Z - id * PARKING_ZONE.SPACING,
});

const createNpcBody = (world: RAPIER.World, id: number): RAPIER.RigidBody => {
  const spot = parkingSpot(id);

  const rigidBodyDescription = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(spot.x, spot.y, spot.z)
    .setGravityScale(0)
    .enabledTranslations(true, false, true)
    .lockRotations()
    .setLinearDamping(0)
    .setCanSleep(false)
    .setCcdEnabled(true)
    .setEnabled(false)
    .setUserData({ kind: BODY_KIND.NPC, id });

  const body = world.createRigidBody(rigidBodyDescription);

  world.createCollider(
    RAPIER.ColliderDesc.cuboid(
      CAR_SIZE.HALF_WIDTH,
      CAR_SIZE.HALF_HEIGHT,
      CAR_SIZE.HALF_LENGTH,
    )
      .setDensity(NPC_BODY.DENSITY)
      .setFriction(NPC_BODY.FRICTION)
      .setRestitution(NPC_BODY.RESTITUTION)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
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
    isActive: false,
  };
};

const activateSlot = (
  slot: INpcSlot,
  { lane, z, cruiseSpeed, paint, lampBrightness }: INpcPlacement,
) => {
  slot.lane = lane;
  slot.cruiseSpeed = cruiseSpeed;
  slot.isActive = true;
  slot.model.setPaint(paint);
  slot.model.setLampBrightness(lampBrightness);
  slot.body.setEnabled(true);
  slot.body.setTranslation({ x: getLaneCenterX(lane), y: CAR_Y, z }, true);
  slot.body.setLinvel(ZERO_VELOCITY, true);
};

const parkSlot = (slot: INpcSlot) => {
  const spot = parkingSpot(slot.id);

  slot.isActive = false;
  slot.body.setLinvel(ZERO_VELOCITY, true);
  slot.body.setTranslation(spot, true);
  slot.body.setEnabled(false);
  slot.model.object.position.set(spot.x, spot.y, spot.z);
};

const cruise = (slot: INpcSlot, playerSpeed: number) => {
  const velocity = slot.body.linvel();
  const closing = Math.max(
    TRAFFIC.MIN_CLOSING_SPEED,
    playerSpeed - slot.cruiseSpeed,
  );

  slot.body.setLinvel(
    { x: velocity.x * TRAFFIC.LATERAL_DAMPING, y: 0, z: -closing },
    true,
  );
};

const syncSlotMesh = (slot: INpcSlot) => {
  const translation = slot.body.translation();
  slot.model.object.position.set(translation.x, translation.y, translation.z);
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

  /** Lanes where a car may appear at `z`, keeping at least `MIN_FREE_LANES` lanes clear across the band. */
  const collectOpenLanes = (z: number): readonly number[] => {
    bandLanes.fill(false);
    blockedLanes.fill(false);
    openLanesScratch.length = 0;

    for (const slot of slots) {
      if (!slot.isActive) {
        continue;
      }
      const distance = Math.abs(slot.body.translation().z - z);
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

  return {
    update: (playerSpeed, dt, allowSpawn) => {
      for (const slot of slots) {
        if (!slot.isActive) {
          continue;
        }

        if (slot.body.translation().z < TRAFFIC.DESPAWN_Z) {
          despawn(slot);

          continue;
        }
        cruise(slot, playerSpeed);
      }

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
    sync: () => {
      for (const slot of slots) {
        if (slot.isActive) {
          syncSlotMesh(slot);
        }
      }
    },
    findById: (id) => slotsById.get(id),
    reset: seedInitial,
    dispose: () => {
      slots.forEach((slot) => slot.model.dispose());
    },
  };
};
