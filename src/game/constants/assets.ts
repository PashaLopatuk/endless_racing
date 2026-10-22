import type { ValueOf } from "../types";

export const BATCH_LAYER = {
  /** Lit by scene lights (walls, roofs, frames). */
  SOLID: "solid",
  /** Unlit, self-coloured (window glass, signs, lamps). */
  GLOW: "glow",
} as const;

export type BatchLayer = ValueOf<typeof BATCH_LAYER>;

export const BATCH_LAYERS: readonly BatchLayer[] = [
  BATCH_LAYER.SOLID,
  BATCH_LAYER.GLOW,
];

export const GEOMETRY_ATTRIBUTE = {
  POSITION: "position",
  COLOR: "color",
  UV: "uv",
} as const;

export const RGB_ITEM_SIZE = 3;

export const ASSET_KEY = {
  SEPARATOR: ":",
  BATCH_SOLID_MATERIAL: "batch-solid",
  BATCH_FACADE_MATERIAL: "batch-facade",
  BATCH_GLOW_MATERIAL: "batch-glow",
  WET_ASPHALT_MATERIAL: "wet-asphalt",
  ROUNDED_BOX_GEOMETRY: "rounded-box",
  WHEEL_GEOMETRY: "vehicle-wheel",
  WHEEL_MATERIAL: "vehicle-wheel",
  GLASS_MATERIAL: "vehicle-glass",
  TRIM_MATERIAL: "vehicle-trim",
  HEADLIGHT_CONE_GEOMETRY: "headlight-cone",
  HEADLIGHT_CONE_MATERIAL: "headlight-cone",
  HEADLIGHT_POOL_GEOMETRY: "headlight-pool",
  HEADLIGHT_POOL_MATERIAL: "headlight-pool",
} as const;

/** Cool nocturnal street ambient baked into facade vertex colors. */
export const FACADE_SHADE = {
  SPILL_COLOR: 0x8ab4d8,
  BASE_WEIGHT: 0.3,
  LOW_WEIGHT: 0.4,
  /** Kept subtle so blue, charcoal, and grey reads stay crisp and distinct under street lights. */
  STRENGTH: 0.25,
  MAX_MIX: 0.12,
  MIN_SPAN: 0.001,
} as const;
