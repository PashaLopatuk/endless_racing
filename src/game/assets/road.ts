import * as THREE from "three";

import { ASSET_KEY } from "../constants/assets";
import { ROAD } from "../constants/environment/street";
import type { IStreetConfig, ITerrainConfig } from "../levels/types";
import { sharedAssets } from "./sharedAssets";
import {
  LANE,
  MIRRORED_SIDES,
  ROAD_HALF_WIDTH,
  ROAD_WIDTH,
} from "../constants/world";
import { getLaneCenterX } from "../util/lane";
import {
  createMeshBatch,
  type IBatchedModel,
  type IMeshBatch,
} from "./meshBatch";

const addLaneDashes = (
  batch: IMeshBatch,
  length: number,
  dashColor: number,
) => {
  const dashCount = Math.floor(length / ROAD.DASH_STRIDE);
  const firstZ = -length / 2 + ROAD.DASH_STRIDE * ROAD.DASH_PHASE;

  for (let lane = 0; lane < LANE.COUNT - 1; lane += 1) {
    const x = getLaneCenterX(lane) + LANE.WIDTH / 2;

    for (let dash = 0; dash < dashCount; dash += 1) {
      batch.addBox({
        size: [ROAD.DASH_WIDTH, ROAD.MARK_THICKNESS, ROAD.DASH_LENGTH],
        position: [x, ROAD.MARK_Y, firstZ + dash * ROAD.DASH_STRIDE],
        color: dashColor,
      });
    }
  }
};

const wetAsphaltMaterial = (color: number): THREE.Material =>
  sharedAssets.material(ASSET_KEY.WET_ASPHALT_MATERIAL, () => {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0.0,
    });
  });

/** One road tile: wet asphalt plus sidewalks, edge lines and lane dashes. */
export const createRoadSegment = (
  street: IStreetConfig,
  terrain: ITerrainConfig,
): IBatchedModel => {
  const length = street.ROAD_SEGMENT_LENGTH;
  const batch = createMeshBatch();

  for (const side of MIRRORED_SIDES) {
    batch.addBox({
      size: [street.SIDEWALK_WIDTH, ROAD.SIDEWALK_HEIGHT, length],
      position: [
        side * (ROAD_HALF_WIDTH + street.SIDEWALK_WIDTH / 2),
        ROAD.SIDEWALK_Y,
        0,
      ],
      color: terrain.sidewalkColor,
    });

    batch.addBox({
      size: [ROAD.EDGE_WIDTH, ROAD.MARK_THICKNESS, length],
      position: [side * (ROAD_HALF_WIDTH - ROAD.EDGE_INSET), ROAD.MARK_Y, 0],
      color: terrain.edgeColor,
    });
  }

  addLaneDashes(batch, length, terrain.dashColor);

  const model = batch.build();
  const asphalt = new THREE.Mesh(
    new THREE.BoxGeometry(ROAD_WIDTH, ROAD.ASPHALT_THICKNESS, length),
    wetAsphaltMaterial(terrain.asphaltColor),
  );

  asphalt.position.y = -ROAD.ASPHALT_THICKNESS / 2;
  model.object.add(asphalt);

  const disposeModel = model.dispose;

  return {
    object: model.object,
    dispose: () => {
      disposeModel();
      asphalt.geometry.dispose();
    },
  };
};
