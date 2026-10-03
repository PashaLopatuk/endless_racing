import type { ValueOf, Vec3Tuple } from "../types";

export const VEHICLE_KIND = {
  SEDAN: "sedan",
  HATCHBACK: "hatchback",
  VAN: "van",
  PICKUP: "pickup",
  TAXI: "taxi",
} as const;

export type VehicleKind = ValueOf<typeof VEHICLE_KIND>;

export const VEHICLE_KINDS: readonly VehicleKind[] =
  Object.values(VEHICLE_KIND);

export const VEHICLE_PART_ROLE = {
  PAINT: "paint",
  GLASS: "glass",
  TRIM: "trim",
  SIGN: "sign",
} as const;

export type VehiclePartRole = ValueOf<typeof VEHICLE_PART_ROLE>;

export interface RoundedShape {
  size: Vec3Tuple;
  radius: number;
}

export interface VehiclePart extends RoundedShape {
  role: VehiclePartRole;
  position: Vec3Tuple;
}

export interface WheelLayout {
  frontZ: number;
  rearZ: number;
  halfTrack: number;
}

export interface LampLayout {
  tailY: number;
  tailZ: number;
  headY: number;
  headZ: number;
  halfSpan: number;
}

export interface VehicleBlueprint {
  parts: readonly VehiclePart[];
  wheels: WheelLayout;
  lamps: LampLayout;
  /** When set, the body keeps this paint and ignores repaint requests (taxis stay yellow). */
  fixedPaint?: number;
}

const SEDAN_PARTS: readonly VehiclePart[] = [
  {
    role: VEHICLE_PART_ROLE.PAINT,
    size: [1.68, 0.46, 3.2],
    radius: 0.14,
    position: [0, -0.02, 0],
  },
  {
    role: VEHICLE_PART_ROLE.GLASS,
    size: [1.42, 0.4, 1.55],
    radius: 0.12,
    position: [0, 0.34, -0.12],
  },
];

const SEDAN_WHEELS: WheelLayout = {
  frontZ: 1.02,
  rearZ: -1.02,
  halfTrack: 0.74,
};
const SEDAN_LAMPS: LampLayout = {
  tailY: 0.08,
  tailZ: -1.58,
  headY: 0.06,
  headZ: 1.58,
  halfSpan: 0.52,
};

export const VEHICLE_BLUEPRINTS: Readonly<
  Record<VehicleKind, VehicleBlueprint>
> = {
  [VEHICLE_KIND.SEDAN]: {
    parts: SEDAN_PARTS,
    wheels: SEDAN_WHEELS,
    lamps: SEDAN_LAMPS,
  },
  [VEHICLE_KIND.TAXI]: {
    parts: [
      ...SEDAN_PARTS,
      {
        role: VEHICLE_PART_ROLE.SIGN,
        size: [0.46, 0.12, 0.16],
        radius: 0.03,
        position: [0, 0.62, -0.05],
      },
    ],
    wheels: SEDAN_WHEELS,
    lamps: SEDAN_LAMPS,
    fixedPaint: 0xe2b13c,
  },
  [VEHICLE_KIND.HATCHBACK]: {
    parts: [
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.62, 0.5, 2.75],
        radius: 0.16,
        position: [0, 0, -0.05],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.4, 0.46, 1.35],
        radius: 0.14,
        position: [0, 0.4, -0.28],
      },
    ],
    wheels: { frontZ: 0.82, rearZ: -0.9, halfTrack: 0.72 },
    lamps: {
      tailY: 0.12,
      tailZ: -1.38,
      headY: 0.1,
      headZ: 1.32,
      halfSpan: 0.5,
    },
  },
  [VEHICLE_KIND.VAN]: {
    parts: [
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.78, 0.92, 3.25],
        radius: 0.12,
        position: [0, 0.22, 0],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.5, 0.42, 0.1],
        radius: 0.03,
        position: [0, 0.48, 1.56],
      },
    ],
    wheels: { frontZ: 1.05, rearZ: -1.05, halfTrack: 0.78 },
    lamps: {
      tailY: 0.28,
      tailZ: -1.6,
      headY: 0.22,
      headZ: 1.62,
      halfSpan: 0.58,
    },
  },
  [VEHICLE_KIND.PICKUP]: {
    parts: [
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.7, 0.4, 3.3],
        radius: 0.1,
        position: [0, -0.06, 0.05],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.55, 0.48, 1.15],
        radius: 0.1,
        position: [0, 0.32, 0.72],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.62, 0.28, 1.35],
        radius: 0.06,
        position: [0, 0.08, -0.85],
      },
    ],
    wheels: { frontZ: 1.05, rearZ: -1.08, halfTrack: 0.76 },
    lamps: {
      tailY: 0.08,
      tailZ: -1.62,
      headY: 0.1,
      headZ: 1.64,
      halfSpan: 0.54,
    },
  },
};

export const TAIL_LAMP_SHAPE: RoundedShape = {
  size: [0.24, 0.14, 0.08],
  radius: 0.03,
};
export const HEAD_LAMP_SHAPE: RoundedShape = {
  size: [0.32, 0.16, 0.1],
  radius: 0.04,
};

export const VEHICLE_STYLE = {
  ROUNDED_SEGMENTS: 3,
  WHEEL: {
    RADIUS: 0.3,
    WIDTH: 0.22,
    SEGMENTS: 20,
    Y: -0.2,
    COLOR: 0x1a1c20,
    ROUGHNESS: 0.7,
    METALNESS: 0.05,
  },
  PAINT: { ROUGHNESS: 0.46, METALNESS: 0.12 },
  GLASS: { COLOR: 0x24303a, ROUGHNESS: 0.18, METALNESS: 0.04 },
  TRIM: { COLOR: 0x2a241e, ROUGHNESS: 0.46, METALNESS: 0.12 },
  LAMP: { ROUGHNESS: 0.32, METALNESS: 0 },
  LAMP_COLOR: { TAIL: 0xff2d2d, HEAD: 0xfff3cf, SIGN: 0xfff6d8 },
  HEAD_BRIGHTNESS: { MIN: 2.2, RATIO: 2.4 },
  SIGN_BRIGHTNESS_MIN: 0.8,
} as const;

/** Real light that illuminates the road; only the player car pays for it. */
export const HEADLIGHT_SPOT = {
  COLOR: 0xfff4d2,
  INTENSITY: 7,
  DISTANCE: 32,
  ANGLE: 0.38,
  PENUMBRA: 0.45,
  DECAY: 1.15,
  TARGET_DROP: 0.35,
  TARGET_DISTANCE: 16,
} as const;

/** Fake volumetric beam: an open cone, additively blended, fading along its length and toward its silhouette. */
export const HEADLIGHT_CONE = {
  ORIGIN_OFFSET_Z: 0.12,
  LENGTH: 12,
  RADIUS: 1.7,
  RADIAL_SEGMENTS: 24,
  LENGTH_SEGMENTS: 10,
  PITCH: 0.07,
  COLOR: 0xfff1c8,
  INTENSITY: 0.34,
  FALLOFF: 2,
  /** Higher values fade surfaces seen edge-on faster, hiding the cone outline. */
  EDGE_SOFTNESS: 0.7,
} as const;
