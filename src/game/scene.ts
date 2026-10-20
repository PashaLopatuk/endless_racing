import * as THREE from "three";

import { createLevelSky } from "./assets/sky";
import type { ILevelConfig, ILevelPalette } from "./levels/types";
import { getSpeedRatio } from "./util/drive";

import { color, float, fog, rangeFogFactor, pow, smoothstep } from "three/tsl";
import {
  createCamera,
  updateCameraFov,
  updateCameraPosition,
} from "./camera/camera";
import { createGameRenderer } from "./camera/render";
import {
  createFogFactorNode,
  createPostProcessing,
} from "./camera/postProcessing";
import { createScreenShakeController } from "./camera/effect";
import { viewportSize } from "./util/viewport";
import { addGlobalLight, createFogHaze, createGround } from "./terrain";

export interface IGameScene {
  readonly objectScene: THREE.Scene;
  follow(playerX: number, speed: number, dt: number): void;
  render(): void;
  resize(): void;
  /** Compiles every shader up front so the first spawn of each object type does not hitch. */
  warmUp(): Promise<void>;
  dispose(): void;
}

const createWorldScene = (palette: ILevelPalette, groundColor: number) => {
  const scene = new THREE.Scene();
  const haze = createFogHaze(palette);

  scene.background = new THREE.Color(palette.skyColor);
  scene.fog = new THREE.Fog(haze, palette.fogNear, palette.fogFar);
  scene.fogNode = fog(color(haze), createFogFactorNode(palette));

  addGlobalLight(scene, palette);

  const sky = createLevelSky(palette);
  scene.add(sky.mesh);

  const ground = createGround(groundColor);
  scene.add(ground);

  return {
    scene,
    dispose: () => {
      sky.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
    },
  };
};

export const createGameScene = (
  container: HTMLElement,
  level: ILevelConfig,
): IGameScene => {
  const { palette, terrain } = level;
  const { width, height } = viewportSize(container);

  const world = createWorldScene(palette, terrain.groundColor);
  const camera = createCamera(width / height);
  const renderer = createGameRenderer(container, width, height);

  const postProcessing = createPostProcessing(
    renderer,
    world.scene,
    camera,
    palette,
  );

  const screenShake = createScreenShakeController(renderer.domElement);

  return {
    objectScene: world.scene,
    follow: (playerX, speed, dt) => {
      const speedRatio = getSpeedRatio(speed);

      postProcessing.updateBlur(speedRatio, dt);

      updateCameraPosition(camera, playerX, speedRatio, dt);
      updateCameraFov(camera, speedRatio, dt);

      screenShake.update(speed, dt);
    },
    render: () => {
      postProcessing.render();
    },
    resize: () => {
      const newSize = viewportSize(container);

      camera.aspect = newSize.width / newSize.height;
      camera.updateProjectionMatrix();

      renderer.setSize(newSize.width, newSize.height, false);
    },
    warmUp: async () => {
      await renderer.init();
      await renderer.compileAsync(world.scene, camera);
      postProcessing.render();
    },
    dispose: () => {
      screenShake.reset();
      world.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};
