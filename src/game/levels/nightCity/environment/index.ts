import { HOUSE_STYLE } from "../../../constants/houses";
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
    TRAFFIC_CONES: {
      COUNT: 16,
      SEED: 7391,
      START_Z: -12,
      MIN_SPACING: 22,
      SPACING_JITTER: 28,
      SIDEWALK_INSET: 0.65,
      SCALE: 1.1,
    },
  },
  houses: {
    styles: [
      { style: HOUSE_STYLE.BROWNSTONE, weight: 3.5 },
      { style: HOUSE_STYLE.TOWNHOUSE, weight: 3.5 },
      { style: HOUSE_STYLE.SHOP, weight: 3.0 },
      { style: HOUSE_STYLE.MODERN, weight: 1.5 },
    ],
    wallColors: [
      // Deep NYC Midnight & Dark Navy Blues
      0x121b28, 0x162234, 0x1a283e, 0x1e2c44, 0x22324c,
      0x142030, 0x18263a, 0x1c2a40, 0x203048, 0x243650,
      0x152236, 0x19283e, 0x1d3048, 0x233852, 0x29405e,

      // NYC Cool Slate & Steel Blues
      0x283a54, 0x2c405c, 0x324666, 0x384e70, 0x263850,
      0x2e425a, 0x344a64, 0x3a506e, 0x405878, 0x2a3e56,
      0x30445e, 0x364c6a, 0x3e5474, 0x445c7e, 0x4c6486,

      // NYC Deep Charcoal & Gunmetal Greys
      0x1c2026, 0x22262e, 0x282c36, 0x2e3440,
      0x343a46, 0x3a424e, 0x404856, 0x465060,

      // Cool Brooklyn Stone & Architectural Slate Greys
      0x4c5666, 0x545e70, 0x5c687a, 0x647084,
      0x6e7a90, 0x78869c, 0x8290a8, 0x8ea0b8,

      // Cold Bluestone & Graphite Accents
      0x202834, 0x26303e, 0x2c3848, 0x323e50, 0x38465a, 0x3e4e62,
    ],
    trimColors: [
      0x101620, 0x161e2a, 0x1e2634, 0x263040, 0x303a4c,
      0x3c485a, 0x4a566a, 0x5a667c, 0x6c7a90, 0x7e8ea6,
    ],
    roofColors: [
      0x0e141c, 0x141a24, 0x1a222e, 0x222a38, 0x2a3442,
    ],
    doorColors: [
      // Cool NYC Metropolitan Door Colors
      0x101c2a, 0x142436, 0x1a2e44, 0x162230,
      0x18202a, 0x222c38, 0x2a3442, 0x1c2630,
      0x122420, 0x162e28, 0x281a24, 0x341e2a,
    ],
    awningColors: [
      // Bodega & Storefront Awnings: Navy, Steel, Forest, Crimson, Charcoal
      0x12243a, 0x18304c, 0x1c3858, 0x142c44,
      0x142e22, 0x1a382a, 0x202632, 0x283040,
      0x381822, 0x441c28, 0x483416, 0x5c421a,
    ],
    neonColors: [
      0x00d4ff, 0x3b82f6, 0x8b5cf6, 0xec4899, 0x06b6d4, 0x10b981, 0xffaa00,
    ],
  },
};
