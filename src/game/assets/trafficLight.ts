import { BATCH_LAYER } from "../constants/assets";
import { TRAFFIC_LIGHT } from "../constants/environment/street";
import { mixHex } from "../util/color";
import { createMeshBatch, toStreetModel, type StreetModel } from "./meshBatch";

/** `armSign` points the signal arm over the road (-1 or 1). The lit lamp is chosen from the seed. */
export const createTrafficLightModel = (
  seed: number,
  armSign: number,
): StreetModel => {
  const { POLE, ARM, HEAD, LAMP, LAMP_COLORS } = TRAFFIC_LIGHT;
  const direction = Math.sign(armSign) || 1;
  const litIndex = Math.abs(seed) % LAMP_COLORS.length;
  const headX = direction * HEAD.X;
  const batch = createMeshBatch();

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

  LAMP_COLORS.forEach((color, index) => {
    batch.addBox({
      size: LAMP.SIZE,
      position: [headX, LAMP.TOP_Y - index * LAMP.STEP, LAMP.Z],
      color:
        index === litIndex
          ? color
          : mixHex(HEAD.COLOR, color, TRAFFIC_LIGHT.UNLIT_GLOW),
      layer: BATCH_LAYER.GLOW,
    });
  });

  return toStreetModel(batch, TRAFFIC_LIGHT.FOOTPRINT, TRAFFIC_LIGHT.FOOTPRINT);
};
