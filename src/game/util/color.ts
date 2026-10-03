import * as THREE from "three";

import { COLOR_RANDOMIZE } from "../constants/palette";
import type { Rng } from "../types";
import { clamp } from "./math";

const scratch = new THREE.Color();
const target = new THREE.Color();
const hsl = { h: 0, s: 0, l: 0 };

const spread = (random: Rng, amount: number): number => {
  return (random() * 2 - 1) * amount;
};

export const randomizeHex = (hex: number, random: Rng): number => {
  scratch.setHex(hex).getHSL(hsl);

  const hue = (hsl.h + spread(random, COLOR_RANDOMIZE.HUE) + 1) % 1;
  const saturation = clamp(
    hsl.s + spread(random, COLOR_RANDOMIZE.SATURATION),
    0,
    1,
  );

  const lightness = clamp(
    hsl.l + spread(random, COLOR_RANDOMIZE.LIGHTNESS),
    0,
    1,
  );

  return scratch.setHSL(hue, saturation, lightness).getHex();
};

export const mixHex = (from: number, to: number, amount: number): number => {
  return scratch.setHex(from).lerp(target.setHex(to), amount).getHex();
};
