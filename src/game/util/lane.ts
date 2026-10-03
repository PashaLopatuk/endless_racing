import { LANE_COUNT, LANE_WIDTH } from "../const";

export const getLaneCenterX = (laneIndex: number): number => {
  return (laneIndex - (LANE_COUNT - 1) / 2) * LANE_WIDTH;
};
