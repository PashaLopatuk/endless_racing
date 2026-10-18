import { LANE } from "../constants/world";

export const getLaneCenterX = (laneIndex: number): number => {
  return (laneIndex - (LANE.COUNT - 1) / 2) * LANE.WIDTH;
};

export const getNearestLaneIndex = (worldX: number): number => {
  let nearestLane = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let lane = 0; lane < LANE.COUNT; lane += 1) {
    const distance = Math.abs(getLaneCenterX(lane) - worldX);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestLane = lane;
    }
  }

  return nearestLane;
};
