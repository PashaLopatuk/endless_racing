import type { ValueOf, Vec3Tuple } from "../types";

/** Uniform scale for every vehicle built from `createVehicleModel`. */
export const VEHICLES_SIZE_RATIO = 1.2;

export const VEHICLE_KIND = {
  SEDAN: "sedan",
  HATCHBACK: "hatchback",
  WAGON: "wagon",
  CROSSOVER: "crossover",
  VAN: "van",
  PICKUP: "pickup",
  TAXI: "taxi",
  BUS: "bus",
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

export interface IRoundedShape {
  size: Vec3Tuple;
  radius: number;
}

export interface IVehiclePart extends IRoundedShape {
  role: VehiclePartRole;
  position: Vec3Tuple;
}

export interface IWheelLayout {
  frontZ: number;
  rearZ: number;
  halfTrack: number;
  extraRearZ?: number;
}

export interface ILampLayout {
  tailY: number;
  tailZ: number;
  headY: number;
  headZ: number;
  halfSpan: number;
}

export interface IVehicleBlueprint {
  parts: readonly IVehiclePart[];
  wheels: IWheelLayout;
  lamps: ILampLayout;
  /** When set, the body keeps this paint and ignores repaint requests (taxis stay yellow). */
  fixedPaint?: number;
}

const SEDAN_PARTS: readonly IVehiclePart[] = [
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

const SEDAN_WHEELS: IWheelLayout = {
  frontZ: 1.02,
  rearZ: -1.02,
  halfTrack: 0.74,
};
const SEDAN_LAMPS: ILampLayout = {
  tailY: 0.08,
  tailZ: -1.58,
  headY: 0.06,
  headZ: 1.58,
  halfSpan: 0.52,
};

export const VEHICLE_BLUEPRINTS: Readonly<
  Record<VehicleKind, IVehicleBlueprint>
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
  [VEHICLE_KIND.WAGON]: {
    parts: [
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.72, 0.5, 3.48],
        radius: 0.12,
        position: [0, -0.02, 0],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.46, 0.42, 1.48],
        radius: 0.11,
        position: [0, 0.36, 0.42],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.44, 0.36, 1.05],
        radius: 0.08,
        position: [0, 0.38, -1.12],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.5, 0.06, 3.18],
        radius: 0.03,
        position: [0, 0.52, -0.08],
      },
    ],
    wheels: SEDAN_WHEELS,
    lamps: {
      tailY: 0.1,
      tailZ: -1.72,
      headY: 0.08,
      headZ: 1.6,
      halfSpan: 0.52,
    },
  },
  [VEHICLE_KIND.CROSSOVER]: {
    parts: [
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.82, 0.58, 3.1],
        radius: 0.14,
        position: [0, 0.06, 0],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.54, 0.46, 1.72],
        radius: 0.12,
        position: [0, 0.44, -0.04],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.84, 0.2, 2.95],
        radius: 0.06,
        position: [0, -0.2, 0.02],
      },
    ],
    wheels: { frontZ: 1.08, rearZ: -1.06, halfTrack: 0.76 },
    lamps: {
      tailY: 0.14,
      tailZ: -1.54,
      headY: 0.12,
      headZ: 1.56,
      halfSpan: 0.54,
    },
  },
  [VEHICLE_KIND.VAN]: {
    parts: [
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.7, 0.48, 1.44],
        radius: 0.1,
        position: [0, 0.02, 1.24],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.46, 0.36, 0.1],
        radius: 0.04,
        position: [0, 0.36, 1.68],
      },
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.9, 1.38, 2.44],
        radius: 0.05,
        position: [0, 0.48, -0.8],
      },
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.74, 0.24, 1.08],
        radius: 0.06,
        position: [0, 0.36, 0.5],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.68, 0.12, 0.88],
        radius: 0.04,
        position: [0, 0.46, 0.32],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.76, 0.2, 0.14],
        radius: 0.04,
        position: [0, -0.1, 1.94],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.08, 0.34, 0.1],
        radius: 0.03,
        position: [0, 0.06, 1.88],
      },
    ],
    wheels: { frontZ: 1.24, rearZ: -1.4, halfTrack: 0.8 },
    lamps: {
      tailY: 0.38,
      tailZ: -2.04,
      headY: 0.12,
      headZ: 1.94,
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
  [VEHICLE_KIND.BUS]: {
    parts: [
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.88, 0.52, 4.6],
        radius: 0.1,
        position: [0, 0.06, 0],
      },
      {
        role: VEHICLE_PART_ROLE.GLASS,
        size: [1.82, 0.44, 4.46],
        radius: 0.08,
        position: [0, 0.54, 0],
      },
      {
        role: VEHICLE_PART_ROLE.PAINT,
        size: [1.88, 0.2, 4.54],
        radius: 0.08,
        position: [0, 0.84, 0],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.0, 0.12, 1.4],
        radius: 0.04,
        position: [0, 0.98, 0.2],
      },
      {
        role: VEHICLE_PART_ROLE.SIGN,
        size: [0.92, 0.14, 0.12],
        radius: 0.03,
        position: [0, 0.78, 2.24],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.84, 0.14, 0.16],
        radius: 0.04,
        position: [0, -0.12, 2.28],
      },
      {
        role: VEHICLE_PART_ROLE.TRIM,
        size: [1.84, 0.14, 0.16],
        radius: 0.04,
        position: [0, -0.12, -2.28],
      },
    ],
    wheels: { frontZ: 1.5, rearZ: -1.0, extraRearZ: -1.65, halfTrack: 0.82 },
    lamps: {
      tailY: 0.14,
      tailZ: -2.31,
      headY: 0.12,
      headZ: 2.31,
      halfSpan: 0.68,
    },
  },
};

export const TAIL_LAMP_SHAPE: IRoundedShape = {
  size: [0.24, 0.14, 0.08],
  radius: 0.03,
};
export const HEAD_LAMP_SHAPE: IRoundedShape = {
  size: [0.32, 0.16, 0.1],
  radius: 0.04,
};

/** Rear amber / DRL segment under each red tail lamp (emissive skin only). */
export const REAR_DAY_LAMP_SHAPE: IRoundedShape = {
  size: [0.2, 0.1, 0.09],
  radius: 0.028,
};

export const REAR_DAY_LAMP_LAYOUT = {
  Y_OFFSET: -0.11,
  Z_OFFSET: -0.025,
} as const;

/** Emissive tail meshes only — no extra lights. One style is picked per NPC spawn. */
export interface INpcTailLampStyle {
  readonly primary: IRoundedShape;
  readonly accent?: {
    readonly shape: IRoundedShape;
    readonly offset: Vec3Tuple;
  };
  readonly color: number;
}

export const NPC_TAIL_LAMP_STYLES: readonly INpcTailLampStyle[] = [
  {
    primary: TAIL_LAMP_SHAPE,
    color: 0xff2d2d,
  },
  {
    primary: { size: [0.36, 0.11, 0.07], radius: 0.025 },
    color: 0xff1f1f,
  },
  {
    primary: { size: [0.2, 0.18, 0.08], radius: 0.03 },
    color: 0xff3344,
  },
  {
    primary: { size: [0.16, 0.12, 0.07], radius: 0.022 },
    accent: {
      shape: { size: [0.16, 0.12, 0.07], radius: 0.022 },
      offset: [0, 0.1, 0],
    },
    color: 0xff2525,
  },
  {
    primary: { size: [0.22, 0.1, 0.08], radius: 0.024 },
    accent: {
      shape: { size: [0.14, 0.08, 0.06], radius: 0.018 },
      offset: [0, -0.09, 0.01],
    },
    color: 0xff4020,
  },
  {
    primary: { size: [0.28, 0.08, 0.06], radius: 0.02 },
    color: 0xff5555,
  },
] as const;

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
  REAR_AMBER_BRIGHTNESS: { MIN: 1.45, RATIO: 1.2 },
  SIGN_BRIGHTNESS_MIN: 0.8,
} as const;

/** Real light that illuminates the road; only the player car pays for it. */
export const HEADLIGHT_SPOT = {
  COLOR: 0xfff4d2,
  INTENSITY: 2.5,
  DISTANCE: 18,
  ANGLE: 0.32,
  PENUMBRA: 0.55,
  DECAY: 1.4,
  TARGET_DROP: 0.85,
  TARGET_DISTANCE: 11,
} as const;

/** Short pool under each headlamp so the wet road shows two separate glints. */
export const HEADLIGHT_POOL = {
  COLOR: 0xfff4d2,
  INTENSITY: 2.5,
  DISTANCE: 2.0,
  DECAY: 2,
  Y: -0.32,
  Z_OFFSET: 0.7,
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
