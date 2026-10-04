import { BATCH_LAYER } from "../constants/assets";
import {
  OVERHEAD_TRAFFIC_LIGHT,
  TRAFFIC_LIGHT,
} from "../constants/environment/street";
import { ROAD_HALF_WIDTH } from "../constants/world";
import { mixHex } from "../util/color";
import { getLaneCenterX } from "../util/lane";
import { createMeshBatch, toStreetModel, type IStreetModel } from "./meshBatch";

const addSignalHead = (
  batch: ReturnType<typeof createMeshBatch>,
  x: number,
  facingZ: number,
  litIndex: number,
) => {
  const { HEAD, LAMP } = OVERHEAD_TRAFFIC_LIGHT;
  const { LAMP_COLORS, UNLIT_GLOW } = TRAFFIC_LIGHT;
  const lampZ = facingZ * LAMP.Z;

  batch.addBox({
    size: HEAD.SIZE,
    position: [x, HEAD.Y, 0],
    color: HEAD.COLOR,
  });

  LAMP_COLORS.forEach((color, index) => {
    batch.addBox({
      size: LAMP.SIZE,
      position: [x, LAMP.TOP_Y - index * LAMP.STEP, lampZ],
      color:
        index === litIndex
          ? color
          : mixHex(HEAD.COLOR, color, UNLIT_GLOW),
      layer: BATCH_LAYER.GLOW,
    });
  });
};

/** Gantry spanning the road with signal heads over the inner lanes. */
export const createOverheadTrafficLightModel = (seed: number): IStreetModel => {
  const { POLE, BEAM } = OVERHEAD_TRAFFIC_LIGHT;
  const spanHalf = ROAD_HALF_WIDTH + OVERHEAD_TRAFFIC_LIGHT.SPAN_PAST_EDGE;
  const litIndex = Math.abs(seed) % TRAFFIC_LIGHT.LAMP_COLORS.length;
  const batch = createMeshBatch();
  const headLanes = OVERHEAD_TRAFFIC_LIGHT.HEAD_LANES;

  for (const side of [-1, 1] as const) {
    batch.addBox({
      size: POLE.SIZE,
      position: [side * spanHalf, POLE.Y, 0],
      color: POLE.COLOR,
    });
  }

  batch.addBox({
    size: [spanHalf * 2, BEAM.SIZE[1], BEAM.SIZE[2]],
    position: [0, BEAM.Y, 0],
    color: POLE.COLOR,
  });

  for (const lane of headLanes) {
    const x = getLaneCenterX(lane);

    addSignalHead(batch, x, 1, litIndex);
    addSignalHead(batch, x, -1, litIndex);
  }

  return toStreetModel(
    batch,
    spanHalf * 2,
    BEAM.SIZE[2] + Math.abs(OVERHEAD_TRAFFIC_LIGHT.LAMP.Z) * 2,
  );
};
