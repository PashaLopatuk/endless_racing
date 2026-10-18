import type { IEnvironmentConfig } from "../../types";

export const NIGHT_CITY_ENVIRONMENT: IEnvironmentConfig = {
  street: {
    ROAD_SEGMENT_LENGTH: 48,
    ROAD_SEGMENT_COUNT: 8,
    ROAD_SEGMENTS_BEHIND: 1,
    SIDEWALK_WIDTH: 2.6,
    DESPAWN_Z: -72,
  },
  rows: {
    BUILDINGS: {
      COUNT_PER_SIDE: 12,
      SPACING: 28,
      START_Z: -48,
      GAP: 1.2,
      SEED_LEFT: 1,
      SEED_RIGHT: 100,
    },
    HOUSES: {
      COUNT_PER_SIDE: 12,
      SPACING: 18,
      START_Z: -24,
      ROW_DEPTH: 10,
      CURB_GAP: 0.45,
      SEED_LEFT: 400,
      SEED_RIGHT: 500,
    },
    TRAFFIC_LIGHTS: {
      COUNT_PER_SIDE: 7,
      SPACING: 48,
      START_Z: -16,
      CURB_OFFSET: 1.15,
      SEED_LEFT: 0,
      SEED_RIGHT: 20,
    },
    STREET_LIGHTS: {
      COUNT_PER_SIDE: 5,
      SPACING: 64,
      START_Z: -22,
      SIDEWALK_INSET: 2.05,
      SEED_LEFT: 60,
      SEED_RIGHT: 160,
    },
    CROSSWALKS: {
      COUNT: 4,
      SEED: 41803,
      START_Z: 24,
      MIN_SPACING: 62,
      SPACING_JITTER: 48,
    },
    ROAD_SIGNS: {
      COUNT: 20,
      SEED: 59127,
      START_Z: -6,
      MIN_SPACING: 14,
      SPACING_JITTER: 20,
      SIDEWALK_INSET: 1.55,
    },
    TRASH_BINS: {
      SIDEWALK: {
        COUNT: 5,
        SEED: 33491,
        START_Z: 4,
        MIN_SPACING: 52,
        SPACING_JITTER: 38,
        INSET: 1.25,
      },
      BETWEEN_HOUSES: {
        SEED: 8821,
        GAP_CHANCE: 0.22,
        Z_JITTER: [-1.2, 1.2],
        ROW_INSET: 6.2,
      },
    },
  },
  houses: {
    wallColors: [
      0x4a4e54, 0x44484e, 0x3c4046, 0x2c3446, 0x52565c, 0x384248, 0x464a50,
      0x565a60, 0x3e4248, 0x484c52, 0x2a2d32,
    ],
    trimColors: [
      0x6a6e74, 0x5a5e64, 0x484c52, 0x7a7e86, 0x3a3e44, 0x52565c, 0x64686e,
    ],
    roofColors: [
      0x2a2c30, 0x32363c, 0x24282c, 0x383c42, 0x2e3438, 0x1e1c22,
    ],
    doorColors: [
      0x1a120e, 0x241810, 0x140e0c, 0x1c2430, 0x301818, 0x18281e,
    ],
    awningColors: [
      0x6a1c1c, 0x1c4a2a, 0x1c2a5a, 0x6a4a14, 0x4a1c4a, 0x2a2a2a,
    ],
    neonColors: [0xff4fa0, 0x4fe0ff, 0xffb347, 0x9dff6a, 0xc77dff],
  },
};
