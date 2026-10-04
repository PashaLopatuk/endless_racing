import { BATCH_LAYER } from "../constants/assets";
import { STREET_LIGHT } from "../constants/environment/street";
import { mixHex } from "../util/color";
import { createMeshBatch, toStreetModel, type IStreetModel } from "./meshBatch";

/** `armSign` points the lamp arm over the road (-1 or 1). */
export const createStreetLightModel = (
  seed: number,
  armSign: number,
): IStreetModel => {
  const { POLE, BASE, ARM, HEAD, LAMPS } = STREET_LIGHT;
  const direction = Math.sign(armSign) || 1;
  const headX = direction * HEAD.X;
  const batch = createMeshBatch();

  batch.addBox({
    size: BASE.SIZE,
    position: [0, BASE.Y, 0],
    color: BASE.COLOR,
  });

  batch.addBox({
    size: POLE.SIZE,
    position: [0, POLE.Y, 0],
    color: POLE.COLOR,
  });

  batch.addBox({
    size: ARM.SIZE,
    position: [direction * ARM.X, ARM.Y, 0],
    color: POLE.COLOR,
  });

  batch.addBox({
    size: HEAD.SIZE,
    position: [headX, HEAD.Y, 0],
    color: HEAD.COLOR,
  });

  LAMPS.forEach((lamp, index) => {
    const isBright = (Math.abs(seed) + index) % 5 !== 0;

    batch.addBox({
      size: lamp.SIZE,
      position: [
        headX + direction * lamp.OFFSET_X,
        lamp.Y,
        lamp.Z,
      ],
      color: isBright
        ? lamp.COLOR
        : mixHex(HEAD.COLOR, lamp.COLOR, STREET_LIGHT.DIM_GLOW),
      layer: BATCH_LAYER.GLOW,
    });
  });

  return toStreetModel(batch, STREET_LIGHT.FOOTPRINT, STREET_LIGHT.FOOTPRINT);
};
