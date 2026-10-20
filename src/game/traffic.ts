import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

import { createVehicleModel, type IVehicleModel } from "./assets/vehicles";
import { BODY_KIND } from "./constants/kinds";
import {
  NPC_BODY,
  PARKING_ZONE,
  TRAFFIC,
  type ITrafficSeed,
} from "./constants/traffic";
import {
  NPC_TAIL_LAMP_STYLES,
  VEHICLE_STYLE,
  type VehicleKind,
} from "./constants/vehicles";
import { NPC_CAR_PALETTE } from "./levels/cars/palette";
import type { ICarLevelConfig, LevelSkyMode } from "./levels/types";
import { applyOutputGamma, randomDayRunningLightHex } from "./util/color";
import { PLAYER } from "./constants/player";
import { CAR_Y, LANE, VEHICLE_HITBOX } from "./constants/world";
import { VEHICLE_ACTIVE_COLLISION_TYPES } from "./physics";
import { getLaneCenterX, getNearestLaneIndex } from "./util/lane";
import { clamp, randomRange } from "./util/math";
import { createRng, pick, randomIn } from "./util/random";

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
  update(
    playerSpeed: number,
    playerWorldZ: number,
    playerWorldX: number,
    dt: number,
    allowSpawn: boolean,
  ): void;
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
  model: IVehicleModel;
  lane: number;
  cruiseSpeed: number;
  worldX: number;
  worldZ: number;
  lateralVelocity: number;
  laneChangeTarget: number | null;
  laneChangeCooldown: number;
  isActive: boolean;
}

interface INpcLampLook {
  tailLampStyleId: number;
  headLampColor: number;
  rearDayLampColor?: number;
  lampBrightness: number;
}

interface INpcPlacement extends ITrafficSeed, INpcLampLook {
  kind: VehicleKind;
  paint: number;
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

const pickNpcPaint = (outputGamma: number): number =>
  applyOutputGamma(pick(Math.random, [...NPC_CAR_PALETTE]), outputGamma);

const pickNpcKind = (kinds: readonly VehicleKind[]): VehicleKind =>
  pick(Math.random, [...kinds]);

const pickNpcCruiseSpeed = (cars: ICarLevelConfig, seed: number): number => {
  const random = createRng(seed ^ 0x5a5a);
  const mid = (cars.minSpeed + cars.maxSpeed) * 0.5;

  return clamp(
    mid + randomIn(random, [-TRAFFIC.CRUISE_JITTER, TRAFFIC.CRUISE_JITTER]),
    cars.minSpeed,
    cars.maxSpeed,
  );
};

const isFarAheadSpawnZ = (playerWorldZ: number, z: number): boolean =>
  z >= playerWorldZ + TRAFFIC.SPAWN_AHEAD_MIN &&
  z <= playerWorldZ + TRAFFIC.FILL_AHEAD_MAX;

const gridZForBin = (playerWorldZ: number, lane: number, bin: number): number =>
  playerWorldZ +
  TRAFFIC.SPAWN_AHEAD_MIN +
  lane * TRAFFIC.LANE_GRID_OFFSET +
  bin * TRAFFIC.TARGET_GRID_SPACING;

const pickNpcTailLampStyleId = (): number =>
  Math.floor(Math.random() * NPC_TAIL_LAMP_STYLES.length);

const pickNpcLampLook = (skyMode: LevelSkyMode): INpcLampLook => {
  const isDay = skyMode === "day";
  const rearYellow = randomDayRunningLightHex(Math.random);

  return {
    tailLampStyleId: pickNpcTailLampStyleId(),
    headLampColor: isDay ? rearYellow : VEHICLE_STYLE.LAMP_COLOR.HEAD,
    rearDayLampColor: rearYellow,
    lampBrightness: isDay
      ? randomRange(
          TRAFFIC.DAY_LAMP_BRIGHTNESS_MIN,
          TRAFFIC.DAY_LAMP_BRIGHTNESS_MAX,
        )
      : randomRange(TRAFFIC.LAMP_BRIGHTNESS_MIN, TRAFFIC.LAMP_BRIGHTNESS_MAX),
  };
};

const lampLookFromPlacement = (look: INpcLampLook) => ({
  tailLampStyle: NPC_TAIL_LAMP_STYLES[look.tailLampStyleId],
  headLampColor: look.headLampColor,
  rearDayLampColor: look.rearDayLampColor,
  tailLampStyleId: look.tailLampStyleId,
  lampBrightness: look.lampBrightness,
});

const createNpcSlot = (
  world: RAPIER.World,
  scene: THREE.Scene,
  index: number,
  cars: ICarLevelConfig,
  outputGamma: number,
  skyMode: LevelSkyMode,
): INpcSlot => {
  const id = TRAFFIC.FIRST_ID + index;

  const lampLook = pickNpcLampLook(skyMode);

  const model = createVehicleModel({
    kind: pickNpcKind(cars.kinds),
    paint: pickNpcPaint(outputGamma),
    hasSpotlights: false,
    hasBeams: skyMode !== "day",
    ...lampLookFromPlacement(lampLook),
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
    laneChangeTarget: null,
    laneChangeCooldown: 0,
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

const replaceSlotModel = (
  slot: INpcSlot,
  scene: THREE.Scene,
  placement: Pick<
    INpcPlacement,
    | "kind"
    | "paint"
    | "tailLampStyleId"
    | "headLampColor"
    | "rearDayLampColor"
    | "lampBrightness"
  >,
  skyMode: LevelSkyMode,
) => {
  const previousPosition = slot.model.object.position.clone();

  slot.model.dispose();

  slot.model = createVehicleModel({
    kind: placement.kind,
    paint: placement.paint,
    hasSpotlights: false,
    hasBeams: skyMode !== "day",
    ...lampLookFromPlacement(placement),
  });

  slot.model.object.position.copy(previousPosition);
  scene.add(slot.model.object);
};

const applySlotAppearance = (
  slot: INpcSlot,
  scene: THREE.Scene,
  placement: Pick<
    INpcPlacement,
    | "kind"
    | "paint"
    | "tailLampStyleId"
    | "headLampColor"
    | "rearDayLampColor"
    | "lampBrightness"
  >,
  skyMode: LevelSkyMode,
) => {
  const tailStyle = NPC_TAIL_LAMP_STYLES[placement.tailLampStyleId];
  const wantsRearDayLamps = placement.rearDayLampColor !== undefined;

  if (
    slot.model.kind !== placement.kind ||
    slot.model.tailLampStyleId !== placement.tailLampStyleId ||
    slot.model.hasRearDayLamps !== wantsRearDayLamps
  ) {
    replaceSlotModel(slot, scene, placement, skyMode);

    return;
  }

  slot.model.setPaint(placement.paint);
  slot.model.setLampColors(
    tailStyle.color,
    placement.headLampColor,
    placement.rearDayLampColor,
  );
  slot.model.setLampBrightness(placement.lampBrightness);
};

const activateSlot = (
  slot: INpcSlot,
  scene: THREE.Scene,
  placement: INpcPlacement,
  skyMode: LevelSkyMode,
) => {
  const { lane, z, cruiseSpeed } = placement;

  applySlotAppearance(slot, scene, placement, skyMode);

  slot.lane = lane;
  slot.cruiseSpeed = cruiseSpeed;
  slot.isActive = true;
  slot.lateralVelocity = 0;
  slot.laneChangeTarget = null;
  slot.laneChangeCooldown = 0;
  slot.body.setEnabled(true);
  slot.worldX = getLaneCenterX(lane);
  slot.worldZ = z;
  slot.body.setTranslation({ x: slot.worldX, y: CAR_Y, z: slot.worldZ }, true);
};

const isLaneZFreeInPlacements = (
  placements: readonly ITrafficSeed[],
  lane: number,
  candidateZ: number,
  isClear: (lane: number, z: number) => boolean,
): boolean => {
  if (!isClear(lane, candidateZ)) {
    return false;
  }

  return placements.every(
    (placement) =>
      placement.lane !== lane ||
      Math.abs(placement.z - candidateZ) >= TRAFFIC.MIN_LANE_GAP,
  );
};

const countLanesAtSliceInPlacements = (
  placements: readonly ITrafficSeed[],
  z: number,
): number => {
  const occupied = new Set<number>();

  for (const placement of placements) {
    if (Math.abs(placement.z - z) < TRAFFIC.Z_SLICE_HALF) {
      occupied.add(placement.lane);
    }
  }

  return occupied.size;
};

/** Fill the ahead window on a staggered per-lane grid. */
const buildGridInitialTraffic = (
  cars: ICarLevelConfig,
  isClear: (lane: number, z: number) => boolean,
  playerWorldZ: number,
): ITrafficSeed[] => {
  const placements: ITrafficSeed[] = [];
  const zMax = playerWorldZ + TRAFFIC.FILL_AHEAD_MAX;
  const binCount = Math.max(
    1,
    Math.ceil(
      (TRAFFIC.FILL_AHEAD_MAX - TRAFFIC.SPAWN_AHEAD_MIN) /
        TRAFFIC.TARGET_GRID_SPACING,
    ),
  );

  for (let lane = 0; lane < LANE.COUNT; lane += 1) {
    for (let bin = 0; bin < binCount; bin += 1) {
      const z = gridZForBin(playerWorldZ, lane, bin);

      if (z > zMax || !isFarAheadSpawnZ(playerWorldZ, z)) {
        continue;
      }

      const initialFillRoll = ((lane * 7919 + bin * 104729) % 1000) / 1000;

      if (initialFillRoll > TRAFFIC.INITIAL_GRID_FILL_RATIO) {
        continue;
      }

      if (
        countLanesAtSliceInPlacements(placements, z) >=
        LANE.COUNT - TRAFFIC.MIN_FREE_LANES
      ) {
        continue;
      }

      if (!isLaneZFreeInPlacements(placements, lane, z, isClear)) {
        continue;
      }

      placements.push({
        lane,
        z,
        cruiseSpeed: pickNpcCruiseSpeed(cars, lane * 997 + Math.floor(z)),
      });
    }
  }

  return placements;
};

const NPC_LENGTH = VEHICLE_HITBOX.HALF_LENGTH * 2;

const getNpcClosingSpeed = (cruiseSpeed: number, playerSpeed: number): number =>
  Math.max(TRAFFIC.MIN_CLOSING_SPEED, playerSpeed - cruiseSpeed);

/** Positive when the follower is catching a lead car ahead (+Z). */
const getCatchUpSpeed = (
  followerCruise: number,
  leadCruise: number,
  playerSpeed: number,
): number => {
  const followerZRate = -getNpcClosingSpeed(followerCruise, playerSpeed);
  const leadZRate = -getNpcClosingSpeed(leadCruise, playerSpeed);

  return followerZRate - leadZRate;
};

const blendFollowCruise = (
  cruiseSpeed: number,
  bumperGap: number,
  leadCruise: number,
): number => {
  const { FOLLOW_LOOKAHEAD, FOLLOW_MIN_GAP, FOLLOW_BACKOFF, MIN_SPEED } =
    TRAFFIC;

  if (bumperGap >= FOLLOW_LOOKAHEAD) {
    return cruiseSpeed;
  }

  let target = Math.min(cruiseSpeed, leadCruise);

  if (bumperGap < FOLLOW_MIN_GAP) {
    target = Math.max(MIN_SPEED, leadCruise - FOLLOW_BACKOFF);
  }

  const blend = clamp(1 - bumperGap / FOLLOW_LOOKAHEAD, 0, 1);

  return cruiseSpeed + (target - cruiseSpeed) * blend;
};

const resolveFollowCruiseSpeed = (
  slot: INpcSlot,
  slots: readonly INpcSlot[],
): number => {
  const lead = findLeadNpcIn(slot, slots);

  if (!lead) {
    return slot.cruiseSpeed;
  }

  const bumperGap = lead.worldZ - slot.worldZ - NPC_LENGTH;

  return blendFollowCruise(slot.cruiseSpeed, bumperGap, lead.cruiseSpeed);
};

const findLeadNpcIn = (
  slot: INpcSlot,
  slots: readonly INpcSlot[],
): INpcSlot | null => {
  let lead: INpcSlot | null = null;
  let leadGap = Number.POSITIVE_INFINITY;

  for (const other of slots) {
    if (!other.isActive || other.id === slot.id) {
      continue;
    }

    if (other.lane !== slot.lane) {
      continue;
    }

    const gap = other.worldZ - slot.worldZ;

    if (gap <= 0.5 || gap >= leadGap) {
      continue;
    }

    lead = other;
    leadGap = gap;
  }

  return lead;
};

const getPlayerSpeedRatio = (playerSpeed: number): number =>
  clamp(
    (playerSpeed - PLAYER.MIN_SPEED) /
      (PLAYER.MAX_BASE_SPEED - PLAYER.MIN_SPEED),
    0,
    1,
  );

const getMaxActiveForPlayerSpeed = (playerSpeed: number): number => {
  const ratio = getPlayerSpeedRatio(playerSpeed);

  return Math.round(
    TRAFFIC.MAX_ACTIVE_SLOW +
      ratio * (TRAFFIC.MAX_ACTIVE - TRAFFIC.MAX_ACTIVE_SLOW),
  );
};

const getSpawnIntervalScale = (playerSpeed: number): number => {
  const ratio = getPlayerSpeedRatio(playerSpeed);

  return (
    TRAFFIC.SPAWN_INTERVAL_SLOW_SCALE -
    ratio * (TRAFFIC.SPAWN_INTERVAL_SLOW_SCALE - 1)
  );
};

const parkSlot = (slot: INpcSlot) => {
  const spot = parkingSpot(slot.id);

  slot.isActive = false;
  slot.lateralVelocity = 0;
  slot.laneChangeTarget = null;
  slot.laneChangeCooldown = 0;
  slot.body.setEnabled(false);
  slot.worldX = spot.x;
  slot.worldZ = spot.z;
  slot.body.setTranslation({ x: spot.x, y: spot.y, z: spot.z }, true);
  slot.model.object.position.set(spot.x, spot.y, spot.z);
};

export const createTraffic = (
  world: RAPIER.World,
  scene: THREE.Scene,
  cars: ICarLevelConfig,
  outputGamma: number,
  skyMode: LevelSkyMode = "night",
): ITraffic => {
  const slots = Array.from({ length: TRAFFIC.POOL_SIZE }, (_, index) =>
    createNpcSlot(world, scene, index, cars, outputGamma, skyMode),
  );
  const slotsById = new Map(slots.map((slot) => [slot.id, slot]));
  const parkedScratch: INpcSlot[] = [];
  const pendingImpulses = new Map<number, IImpulse>();

  let activeCount = 0;
  let spawnTimer: number = TRAFFIC.INITIAL_SPAWN_DELAY;
  let gapFillCursor = 0;

  const isSpawnPositionClear = (lane: number, z: number): boolean => {
    for (const slot of slots) {
      if (!slot.isActive) {
        continue;
      }

      if (slot.lane !== lane) {
        continue;
      }

      if (Math.abs(slot.worldZ - z) < TRAFFIC.MIN_LANE_GAP) {
        return false;
      }
    }

    return true;
  };

  const takeParkedSlot = (): INpcSlot | null => {
    parkedScratch.length = 0;
    for (const slot of slots) {
      if (!slot.isActive) {
        parkedScratch.push(slot);
      }
    }
    return parkedScratch.length > 0 ? pick(Math.random, parkedScratch) : null;
  };

  const spawn = (seed: ITrafficSeed): boolean => {
    if (!isFarAheadSpawnZ(playerWorldZ, seed.z)) {
      return false;
    }

    if (!isSpawnPositionClear(seed.lane, seed.z)) {
      return false;
    }

    const slot = takeParkedSlot();

    if (!slot) {
      return false;
    }

    activateSlot(
      slot,
      scene,
      {
        ...seed,
        kind: pickNpcKind(cars.kinds),
        paint: pickNpcPaint(outputGamma),
        ...pickNpcLampLook(skyMode),
      },
      skyMode,
    );

    activeCount += 1;

    return true;
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

  const isLaneOpenAt = (lane: number, z: number, ignoreId: number): boolean => {
    for (const other of slots) {
      if (!other.isActive || other.id === ignoreId) {
        continue;
      }

      if (other.lane !== lane) {
        continue;
      }

      if (Math.abs(other.worldZ - z) < TRAFFIC.MIN_LANE_GAP) {
        return false;
      }
    }

    return true;
  };

  const findLeadNpc = (slot: INpcSlot): INpcSlot | null =>
    findLeadNpcIn(slot, slots);

  let playerWorldZ = 0;
  let playerWorldX = getLaneCenterX(PLAYER.START_LANE);
  let playerLane = PLAYER.START_LANE as number;

  const pickEscapeLane = (slot: INpcSlot): number | null => {
    const candidates: number[] = [];

    for (const offset of [-1, 1]) {
      const lane = slot.lane + offset;

      if (lane < 0 || lane >= LANE.COUNT) {
        continue;
      }

      if (isLaneOpenAt(lane, slot.worldZ, slot.id)) {
        candidates.push(lane);
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    return pick(Math.random, candidates);
  };

  const considerLaneChange = (slot: INpcSlot, playerSpeed: number) => {
    if (slot.laneChangeTarget !== null || slot.laneChangeCooldown > 0) {
      return;
    }

    const lead = findLeadNpc(slot);

    if (!lead) {
      return;
    }

    const followCruise = resolveFollowCruiseSpeed(slot, slots);
    const catchUp = getCatchUpSpeed(
      followCruise,
      lead.cruiseSpeed,
      playerSpeed,
    );

    if (catchUp <= 0.05) {
      return;
    }

    const bumperGap = lead.worldZ - slot.worldZ - NPC_LENGTH;

    if (bumperGap > TRAFFIC.LANE_CHANGE_LOOKAHEAD) {
      return;
    }

    const timeToContact = bumperGap / catchUp;

    if (
      bumperGap > TRAFFIC.MIN_LANE_GAP &&
      timeToContact > TRAFFIC.LANE_CHANGE_REACTION_TIME
    ) {
      return;
    }

    if (Math.random() > TRAFFIC.LANE_CHANGE_CHANCE) {
      return;
    }

    const escapeLane = pickEscapeLane(slot);

    if (escapeLane === null) {
      return;
    }

    slot.laneChangeTarget = escapeLane;
  };

  const applyLaneChangeMotion = (slot: INpcSlot, dt: number) => {
    if (slot.laneChangeTarget === null) {
      return;
    }

    const targetX = getLaneCenterX(slot.laneChangeTarget);
    const deltaX = targetX - slot.worldX;
    const step = TRAFFIC.LANE_CHANGE_SPEED * dt;

    if (Math.abs(deltaX) <= step) {
      slot.worldX = targetX;
      slot.lane = slot.laneChangeTarget;
      slot.laneChangeTarget = null;
      slot.laneChangeCooldown = TRAFFIC.LANE_CHANGE_COOLDOWN;
      slot.lateralVelocity = 0;

      return;
    }

    slot.worldX += Math.sign(deltaX) * step;
    slot.lateralVelocity = 0;
  };

  const advanceSlot = (slot: INpcSlot, playerSpeed: number, dt: number) => {
    applyPendingImpulses(slot);

    if (slot.laneChangeCooldown > 0) {
      slot.laneChangeCooldown = Math.max(0, slot.laneChangeCooldown - dt);
    }

    considerLaneChange(slot, playerSpeed);
    applyLaneChangeMotion(slot, dt);

    const followCruise = resolveFollowCruiseSpeed(slot, slots);
    const closing = getNpcClosingSpeed(followCruise, playerSpeed);

    slot.worldZ -= closing * dt;

    if (slot.laneChangeTarget === null) {
      slot.lateralVelocity *= TRAFFIC.LATERAL_DAMPING;
      slot.worldX += slot.lateralVelocity * dt;
    }
  };

  const countLanesAtSlice = (z: number): number => {
    const occupied = new Set<number>();

    for (const slot of slots) {
      if (!slot.isActive) {
        continue;
      }

      if (Math.abs(slot.worldZ - z) < TRAFFIC.Z_SLICE_HALF) {
        occupied.add(slot.lane);
      }
    }

    return occupied.size;
  };

  const isGridCellOpen = (lane: number, z: number): boolean => {
    for (const slot of slots) {
      if (!slot.isActive || slot.lane !== lane) {
        continue;
      }

      if (Math.abs(slot.worldZ - z) < TRAFFIC.GRID_OCCUPY_RADIUS) {
        return false;
      }
    }

    return isSpawnPositionClear(lane, z);
  };

  const canSpawnOnGrid = (lane: number, z: number): boolean => {
    if (!isFarAheadSpawnZ(playerWorldZ, z)) {
      return false;
    }

    if (!isGridCellOpen(lane, z)) {
      return false;
    }

    if (countLanesAtSlice(z) >= LANE.COUNT - TRAFFIC.MIN_FREE_LANES) {
      return false;
    }

    const nearPlayer =
      z <= playerWorldZ + TRAFFIC.PLAYER_CLEARANCE_AHEAD &&
      z >= playerWorldZ - TRAFFIC.PLAYER_CLEARANCE_BEHIND;

    if (
      nearPlayer &&
      lane === playerLane &&
      countLanesAtSlice(z) >= LANE.COUNT - 2
    ) {
      return false;
    }

    return true;
  };

  const getGapFillSlotCount = (): number => {
    const binCount = Math.max(
      1,
      Math.ceil(
        (TRAFFIC.FILL_AHEAD_MAX - TRAFFIC.SPAWN_AHEAD_MIN) /
          TRAFFIC.TARGET_GRID_SPACING,
      ),
    );

    return binCount * LANE.COUNT;
  };

  const findGapFillPlacement = (): Omit<
    INpcPlacement,
    | "paint"
    | "tailLampStyleId"
    | "headLampColor"
    | "rearDayLampColor"
    | "lampBrightness"
  > | null => {
    const slotCount = getGapFillSlotCount();
    const zMax = playerWorldZ + TRAFFIC.FILL_AHEAD_MAX;

    for (let attempt = 0; attempt < slotCount; attempt += 1) {
      const slotIndex = (gapFillCursor + attempt) % slotCount;
      const lane = slotIndex % LANE.COUNT;
      const bin = Math.floor(slotIndex / LANE.COUNT);
      const z = gridZForBin(playerWorldZ, lane, bin);

      if (z > zMax || !isFarAheadSpawnZ(playerWorldZ, z)) {
        continue;
      }

      if (!canSpawnOnGrid(lane, z)) {
        continue;
      }

      gapFillCursor = (slotIndex + 1) % slotCount;

      return {
        kind: pickNpcKind(cars.kinds),
        lane,
        z,
        cruiseSpeed: pickNpcCruiseSpeed(cars, slotIndex + Math.floor(z)),
      };
    }

    return null;
  };

  const trySpawnAhead = (playerSpeed: number) => {
    const maxActive = getMaxActiveForPlayerSpeed(playerSpeed);

    for (
      let spawnAttempt = 0;
      spawnAttempt < TRAFFIC.SPAWNS_PER_TICK && activeCount < maxActive;
      spawnAttempt += 1
    ) {
      const placement = findGapFillPlacement();

      if (!placement) {
        break;
      }

      spawn(placement);
    }
  };

  const seedInitial = () => {
    slots.filter((slot) => slot.isActive).forEach(despawn);

    gapFillCursor = 0;

    const initialPlacements = buildGridInitialTraffic(
      cars,
      isSpawnPositionClear,
      playerWorldZ,
    );

    for (const seed of initialPlacements) {
      if (!spawn(seed)) {
        spawn({
          ...seed,
          z: seed.z + TRAFFIC.MIN_LANE_GAP,
        });
      }
    }

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
    update: (
      playerSpeed,
      nextPlayerWorldZ,
      nextPlayerWorldX,
      dt,
      allowSpawn,
    ) => {
      playerWorldZ = nextPlayerWorldZ;
      playerWorldX = nextPlayerWorldX;
      playerLane = getNearestLaneIndex(playerWorldX);

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

      trySpawnAhead(playerSpeed);

      const intervalScale = getSpawnIntervalScale(playerSpeed);

      spawnTimer = randomRange(
        TRAFFIC.SPAWN_INTERVAL_MIN * intervalScale,
        TRAFFIC.SPAWN_INTERVAL_MAX * intervalScale,
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
    commitDynamics: () => {
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
