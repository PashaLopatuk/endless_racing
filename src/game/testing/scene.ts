import * as THREE from "three";

import type { IGameScene } from "../scene";
import { createLevelSky } from "../assets/sky";
import { SUBURBS_PALETTE } from "../levels/suburbs/palette";

export const createTestScene = (): IGameScene => {
  const objectScene = new THREE.Scene();

  const sky = createLevelSky(SUBURBS_PALETTE);

  objectScene.add(sky.mesh);

  return {
    objectScene,
    dispose() {},
    follow(playerX, speed, dt) {},
    render() {},
    resize() {},
    warmUp() {},
  };
};
