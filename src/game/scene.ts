import * as THREE from "three";

import { createLevelSky } from "./assets/sky";
import type { ILevelConfig, ILevelPalette, ITerrainConfig } from "./levels/types";
import { getSpeedRatio } from "./util/drive";

import { color, fog } from "three/tsl";
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
import {
  addGlobalLight,
  createFogHaze,
  createGround,
  createLandscapeSprites,
} from "./terrain";

export interface IGameScene {
  readonly objectScene: THREE.Scene;
  follow(playerX: number, speed: number, dt: number): void;
  triggerImpact(severity: number): void;
  render(): void;
  resize(): void;
  /** Compiles every shader up front so the first spawn of each object type does not hitch. */
  warmUp(): Promise<void>;
  dispose(): void;
}

const createWorldScene = (palette: ILevelPalette, terrain: ITerrainConfig) => {
  const scene = new THREE.Scene();
  const haze = createFogHaze(palette);

  scene.background = new THREE.Color(palette.skyColor);
  scene.fog = new THREE.Fog(haze, palette.fogNear, palette.fogFar);
  scene.fogNode = fog(color(haze), createFogFactorNode(palette));

  addGlobalLight(scene, palette);

  const sky = createLevelSky(palette);
  scene.add(sky.mesh);

  const ground = createGround(terrain.groundColor);
  scene.add(ground);

  const landscape = createLandscapeSprites(terrain);
  scene.add(landscape.group);

  return {
    scene,
    sky,
    dispose: () => {
      landscape.dispose();
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

  const world = createWorldScene(palette, terrain);
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

      world.sky.update(speed, dt);
      world.sky.mesh.position.set(camera.position.x, camera.position.y, camera.position.z);

      screenShake.update(speed, dt);
    },
    triggerImpact: (severity) => {
      screenShake.triggerImpact(severity);
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
