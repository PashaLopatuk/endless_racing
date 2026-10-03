import * as THREE from "three";

import {
  BUILDING_COLOR_RANDOMIZE,
  COLOR_RANDOMIZE,
} from "../constants/palette";
import type { Rng } from "../types";
import { clamp } from "./math";

const scratch = new THREE.Color();
const target = new THREE.Color();
const hsl = { h: 0, s: 0, l: 0 };

const spread = (random: Rng, amount: number): number => {
  return (random() * 2 - 1) * amount;
};

const randomizeWith = (
  hex: number,
  random: Rng,
  spreadConfig: { HUE: number; SATURATION: number; LIGHTNESS: number },
): number => {
  scratch.setHex(hex).getHSL(hsl);

  const hue = (hsl.h + spread(random, spreadConfig.HUE) + 1) % 1;
  const saturation = clamp(
    hsl.s + spread(random, spreadConfig.SATURATION),
    0,
    1,
  );

  const lightness = clamp(
    hsl.l + spread(random, spreadConfig.LIGHTNESS),
    0,
    1,
  );

  return scratch.setHSL(hue, saturation, lightness).getHex();
};

export const randomizeHex = (hex: number, random: Rng): number => {
  return randomizeWith(hex, random, COLOR_RANDOMIZE);
};

export const randomizeBuildingHex = (hex: number, random: Rng): number => {
  return randomizeWith(hex, random, BUILDING_COLOR_RANDOMIZE);
};

export const mixHex = (from: number, to: number, amount: number): number => {
  return scratch.setHex(from).lerp(target.setHex(to), amount).getHex();
};
