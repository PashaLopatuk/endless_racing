import { ROAD, STREET } from "../constants/street";
import { LANE, MIRRORED_SIDES, ROAD_HALF_WIDTH, ROAD_WIDTH } from "../constants/world";
import { getLaneCenterX } from "../util/lane";
import { createMeshBatch, type BatchedModel, type MeshBatch } from "./meshBatch";

const addLaneDashes = (batch: MeshBatch) => {
  const length = STREET.ROAD_SEGMENT_LENGTH;
  const dashCount = Math.floor(length / ROAD.DASH_STRIDE);
  const firstZ = -length / 2 + ROAD.DASH_STRIDE * ROAD.DASH_PHASE;
  for (let lane = 0; lane < LANE.COUNT - 1; lane += 1) {
    const x = getLaneCenterX(lane) + LANE.WIDTH / 2;
    for (let dash = 0; dash < dashCount; dash += 1) {
      batch.addBox({
        size: [ROAD.DASH_WIDTH, ROAD.MARK_THICKNESS, ROAD.DASH_LENGTH],
        position: [x, ROAD.MARK_Y, firstZ + dash * ROAD.DASH_STRIDE],
        color: ROAD.DASH_COLOR,
      });
    }
  }
};

/** One road tile: asphalt, sidewalks, edge lines and lane dashes merged into a single mesh. */
export const createRoadSegment = (): BatchedModel => {
  const length = STREET.ROAD_SEGMENT_LENGTH;
  const batch = createMeshBatch();
  batch.addBox({ size: [ROAD_WIDTH, ROAD.ASPHALT_THICKNESS, length], position: [0, -ROAD.ASPHALT_THICKNESS / 2, 0], color: ROAD.ASPHALT_COLOR });

  for (const side of MIRRORED_SIDES) {
    batch.addBox({
      size: [STREET.SIDEWALK_WIDTH, ROAD.SIDEWALK_HEIGHT, length],
      position: [side * (ROAD_HALF_WIDTH + STREET.SIDEWALK_WIDTH / 2), ROAD.SIDEWALK_Y, 0],
      color: ROAD.SIDEWALK_COLOR,
    });
    batch.addBox({
      size: [ROAD.EDGE_WIDTH, ROAD.MARK_THICKNESS, length],
      position: [side * (ROAD_HALF_WIDTH - ROAD.EDGE_INSET), ROAD.MARK_Y, 0],
      color: ROAD.EDGE_COLOR,
    });
  }
  addLaneDashes(batch);
  return batch.build();
};
