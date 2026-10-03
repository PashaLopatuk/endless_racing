/** Meters, seconds, and unitless ratios shared by physics and gameplay. */

export const LANE_COUNT = 4;
export const LANE_WIDTH = 3.6;
export const ROAD_WIDTH = LANE_COUNT * LANE_WIDTH;

export const CAR_HALF_WIDTH = 0.8;
export const CAR_HALF_HEIGHT = 0.5;
export const CAR_HALF_LENGTH = 1.6;
export const CAR_Y = CAR_HALF_HEIGHT;
export const PLAYER_Z = 0;
export const PLAYER_MIN_X = -ROAD_WIDTH / 2 + CAR_HALF_WIDTH + 0.25;
export const PLAYER_MAX_X = ROAD_WIDTH / 2 - CAR_HALF_WIDTH - 0.25;

export const MAX_HEALTH = 100;
export const BASE_SPEED = 22;
export const MIN_SPEED = 14;
export const MAX_SPEED = 36;
export const SPEED_PER_PIXEL = 0.08;
export const STEER_METERS_PER_PIXEL = 0.038;
export const STEER_RESPONSE = 12;
export const SPEED_RESPONSE = 3.5;
export const AXLE_SPACING = 2.3;
export const REAR_FOLLOW = 4.6;
export const MAX_AXLE_LEAD = 0.9;
export const GAME_OVER_DECEL = 2.4;
export const KMH_PER_MPS = 3.6;

export const COLLISION_DAMAGE_SIDE = 4;
export const COLLISION_DAMAGE_FRONT = 26;
export const COLLISION_DAMAGE_REAR = 20;
export const COLLISION_COOLDOWN_SECONDS = 0.45;
export const LOW_CLOSING_SPEED = 3;
export const SIDE_PUSH_IMPULSE = 95;
export const SIDE_SEPARATION = 0.42;
export const BUMPER_PUSH_IMPULSE = 150;
export const FRONT_SPEED_LOSS = 6;

export const NPC_MIN_SPEED = 6;
export const NPC_MAX_SPEED = 11;
export const NPC_POOL_SIZE = 12;
export const NPC_SPAWN_Z = 100;
export const NPC_DESPAWN_Z = -20;
export const NPC_MIN_LANE_GAP = 18;
export const NPC_SPAWN_BAND = 14;
export const NPC_SPAWN_INTERVAL_MIN = 0.75;
export const NPC_SPAWN_INTERVAL_MAX = 1.45;
export const NPC_LATERAL_DAMPING = 0.986;
export const MAX_ACTIVE_NPCS = 7;

export const GRAVITY = -9.81;
export const FIXED_TIMESTEP = 1 / 60;
export const MAX_FRAME_DELTA = 0.05;
export const MAX_PHYSICS_STEPS = 4;
export const NPC_DENSITY = 6;

export const ROAD_SEGMENT_LENGTH = 48;
export const ROAD_SEGMENT_COUNT = 8;
export const BUILDING_COUNT_PER_SIDE = 12;
export const BUILDING_SPACING = 28;
export const HOUSE_COUNT_PER_SIDE = 12;
export const HOUSE_SPACING = 18;
export const HOUSE_ROW_DEPTH = 10;
export const TRAFFIC_LIGHT_COUNT_PER_SIDE = 7;
export const TRAFFIC_LIGHT_SPACING = 48;
export const SIDEWALK_WIDTH = 2.6;
export const ENVIRONMENT_DESPAWN_Z = -72;

export const INPUT_ZONE_START = 0.5;

export const CAMERA_FOV = 62;
export const CAMERA_FOV_MAX = 78;
export const CAMERA_FOV_RESPONSE = 2.8;
export const CAMERA_HEIGHT = 5.4;
export const CAMERA_BACK = 11.5;
export const CAMERA_LOOK_AHEAD = 18;
export const CAMERA_FOLLOW = 3.2;

export const PLAYER_COLOR = 0xc4472d;
