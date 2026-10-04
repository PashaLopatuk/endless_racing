import { CROSSWALK, ROAD } from "../constants/environment/street";
import { ROAD_WIDTH } from "../constants/world";
import { createMeshBatch, type IBatchedModel } from "./meshBatch";

const fitParallelStripes = (
  availableWidth: number,
  stripeWidth: number,
  preferredGap: number,
): { count: number; gap: number } => {
  const span = stripeWidth + preferredGap;
  const count = Math.max(1, Math.floor((availableWidth + preferredGap) / span));
  const gap =
    count > 1
      ? (availableWidth - count * stripeWidth) / (count - 1)
      : 0;

  return { count, gap };
};

/** Zebra crossing merged into one mesh; local origin is the strip center on the road. */
export const createCrosswalkModel = (): IBatchedModel => {
  const { STRIPE, STOP_BAR, ROAD_INSET } = CROSSWALK;
  const batch = createMeshBatch();
  const markWidth = ROAD_WIDTH - ROAD_INSET * 2;
  const { count, gap } = fitParallelStripes(
    markWidth,
    STRIPE.WIDTH,
    STRIPE.GAP,
  );
  const stripeSpanX = STRIPE.WIDTH + gap;
  const startX = -markWidth / 2 + STRIPE.WIDTH / 2;
  const stopInset = STOP_BAR.INSET;
  const halfLength = STRIPE.LENGTH / 2;

  for (let index = 0; index < count; index += 1) {
    batch.addBox({
      size: [STRIPE.WIDTH, ROAD.MARK_THICKNESS, STRIPE.LENGTH],
      position: [startX + index * stripeSpanX, ROAD.MARK_Y, 0],
      color: CROSSWALK.STRIPE_COLOR,
    });
  }

  const stopZ = halfLength - STOP_BAR.WIDTH / 2;

  for (const z of [-stopZ, stopZ]) {
    batch.addBox({
      size: [markWidth - stopInset * 2, ROAD.MARK_THICKNESS, STOP_BAR.WIDTH],
      position: [0, ROAD.MARK_Y, z],
      color: CROSSWALK.STOP_BAR_COLOR,
    });
  }

  return batch.build();
};
