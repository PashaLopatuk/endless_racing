import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

import { disposeObject } from "./assets/models";
import { getVehicleModel, VEHICLE_KINDS, type VehicleKind } from "./assets/vehicles";
import { BODY_KIND } from "./type";
import {
  CAR_HALF_HEIGHT,
  CAR_HALF_LENGTH,
  CAR_HALF_WIDTH,
  CAR_Y,
  LANE_COUNT,
  MAX_ACTIVE_NPCS,
  NPC_DENSITY,
  NPC_DESPAWN_Z,
  NPC_LATERAL_DAMPING,
  NPC_MAX_SPEED,
  NPC_MIN_LANE_GAP,
  NPC_MIN_SPEED,
  NPC_POOL_SIZE,
  NPC_SPAWN_BAND,
  NPC_SPAWN_INTERVAL_MAX,
  NPC_SPAWN_INTERVAL_MIN,
  NPC_SPAWN_Z,
} from "./const";
import { getLaneCenterX } from "./util/lane";
import { randomRange } from "./util/math";

const NPC_COLORS = [0x314864, 0x3e4a34, 0x4a3b2c, 0x2c3544, 0x5a3434, 0x243e3e, 0x3a3048];

const INITIAL_TRAFFIC: ReadonlyArray<readonly [number, number, number]> = [
  [0, 32, 7],
  [2, 50, 9],
  [3, 68, 8],
  [0, 90, 10],
  [2, 112, 6.5],
];

export type NpcCar = {
  readonly id: number;
  readonly body: RAPIER.RigidBody;
  lane: number;
  cruiseSpeed: number;
  isActive: boolean;
};

export type Traffic = {
  update: (playerSpeed: number, dt: number, allowSpawn: boolean) => void;
  sync: () => void;
  findByBody: (body: RAPIER.RigidBody) => NpcCar | undefined;
  reset: () => void;
  dispose: () => void;
};

type NpcRuntime = NpcCar & {
  activate: (lane: number, z: number, cruiseSpeed: number, color: number, kind: VehicleKind, brightness: number) => void;
  deactivate: () => void;
  applyCruise: (playerSpeed: number) => void;
  syncMesh: () => void;
  dispose: () => void;
};

const createNpc = (world: RAPIER.World, scene: THREE.Scene, id: number): NpcRuntime => {
  const color = NPC_COLORS[id % NPC_COLORS.length] ?? NPC_COLORS[0];
  let mesh = getVehicleModel(VEHICLE_KINDS[id % VEHICLE_KINDS.length] ?? VEHICLE_KINDS[0], color, 0.35 + (id % 5) * 0.28);
  mesh.visible = false;
  scene.add(mesh);

  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, CAR_Y, -400 - id)
      .setGravityScale(0)
      .enabledTranslations(true, false, true)
      .lockRotations()
      .setLinearDamping(0)
      .setCanSleep(false)
      .setCcdEnabled(true)
      .setEnabled(false)
      .setUserData({ kind: BODY_KIND.NPC, id }),
  );
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(CAR_HALF_WIDTH, CAR_HALF_HEIGHT, CAR_HALF_LENGTH)
      .setDensity(NPC_DENSITY)
      .setFriction(0.15)
      .setRestitution(0.02)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
    body,
  );
  body.userData = { kind: BODY_KIND.NPC, id };

  const car: NpcRuntime = {
    id,
    body,
    lane: 0,
    cruiseSpeed: NPC_MIN_SPEED,
    isActive: false,
    activate: (lane, z, cruiseSpeed, nextColor, kind, brightness) => {
      scene.remove(mesh);
      disposeObject(mesh);
      mesh = getVehicleModel(kind, nextColor, brightness);
      scene.add(mesh);
      car.lane = lane;
      car.cruiseSpeed = cruiseSpeed;
      car.isActive = true;
      mesh.visible = true;
      body.setEnabled(true);
      body.setTranslation({ x: getLaneCenterX(lane), y: CAR_Y, z }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    },
    deactivate: () => {
      car.isActive = false;
      mesh.visible = false;
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setTranslation({ x: 0, y: CAR_Y, z: -400 - id }, true);
      body.setEnabled(false);
    },
    applyCruise: (playerSpeed) => {
      const velocity = body.linvel();
      const closing = Math.max(0.5, playerSpeed - car.cruiseSpeed);
      body.setLinvel({ x: velocity.x * NPC_LATERAL_DAMPING, y: 0, z: -closing }, true);
    },
    syncMesh: () => {
      if (!car.isActive) {
        return;
      }
      const translation = body.translation();
      mesh.position.set(translation.x, translation.y, translation.z);
    },
    dispose: () => {
      scene.remove(mesh);
      disposeObject(mesh);
    },
  };

  return car;
};

export const createTraffic = (world: RAPIER.World, scene: THREE.Scene): Traffic => {
  const cars = Array.from({ length: NPC_POOL_SIZE }, (_, index) => createNpc(world, scene, index + 1));
  const byHandle = new Map<number, NpcRuntime>(cars.map((car) => [car.body.handle, car]));
  let spawnTimer = 1.2;
  let colorCursor = 0;

  const activeCars = () => cars.filter((car) => car.isActive);

  const isLaneClear = (lane: number, z: number) => {
    return !activeCars().some((car) => car.lane === lane && Math.abs(car.body.translation().z - z) < NPC_MIN_LANE_GAP);
  };

  const lanesOpenAt = (z: number) => {
    const occupied = new Set<number>();
    for (const car of activeCars()) {
      if (Math.abs(car.body.translation().z - z) < NPC_SPAWN_BAND) {
        occupied.add(car.lane);
      }
    }
    if (occupied.size >= LANE_COUNT - 1) {
      return [];
    }
    const open: number[] = [];
    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      if (!occupied.has(lane) && isLaneClear(lane, z)) {
        open.push(lane);
      }
    }
    return open;
  };

  const activateCar = (lane: number, z: number, cruiseSpeed: number) => {
    const parked = cars.find((car) => !car.isActive);
    if (!parked) {
      return;
    }
    const kind = VEHICLE_KINDS[colorCursor % VEHICLE_KINDS.length] ?? VEHICLE_KINDS[0];
    const color = kind === "taxi" ? 0xe2b13c : (NPC_COLORS[colorCursor % NPC_COLORS.length] ?? NPC_COLORS[0]);
    const brightness = 0.18 + ((colorCursor * 37) % 100) / 100 * 1.7;
    colorCursor += 1;
    parked.activate(lane, z, cruiseSpeed, color, kind, brightness);
  };

  const seedInitial = () => {
    for (const car of cars) {
      if (car.isActive) {
        car.deactivate();
      }
    }
    for (const [lane, z, cruiseSpeed] of INITIAL_TRAFFIC) {
      activateCar(lane, z, cruiseSpeed);
    }
    spawnTimer = 1.2;
  };

  seedInitial();

  return {
    update: (playerSpeed, dt, allowSpawn) => {
      for (const car of cars) {
        if (!car.isActive) {
          continue;
        }
        if (car.body.translation().z < NPC_DESPAWN_Z) {
          car.deactivate();
          continue;
        }
        car.applyCruise(playerSpeed);
      }

      if (!allowSpawn) {
        return;
      }

      spawnTimer -= dt;
      if (spawnTimer > 0) {
        return;
      }
      const spawnZ = NPC_SPAWN_Z + randomRange(0, 22);
      const openLanes = lanesOpenAt(spawnZ);
      if (activeCars().length < MAX_ACTIVE_NPCS && openLanes.length > 0) {
        const lane = openLanes[Math.floor(Math.random() * openLanes.length)] ?? 0;
        activateCar(lane, spawnZ, randomRange(NPC_MIN_SPEED, NPC_MAX_SPEED));
      }
      spawnTimer = randomRange(NPC_SPAWN_INTERVAL_MIN, NPC_SPAWN_INTERVAL_MAX);
    },
    sync: () => {
      for (const car of cars) {
        car.syncMesh();
      }
    },
    findByBody: (body) => byHandle.get(body.handle),
    reset: seedInitial,
    dispose: () => {
      for (const car of cars) {
        car.deactivate();
        car.dispose();
      }
    },
  };
};
