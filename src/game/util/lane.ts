import { LANE } from "../constants/world";

export const getLaneCenterX = (laneIndex: number): number => {
  return (laneIndex - (LANE.COUNT - 1) / 2) * LANE.WIDTH;
};
