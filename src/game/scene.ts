import * as THREE from "three";

import { createStarSky } from "./assets/sky";
import { CAMERA, GROUND, RENDERER, SCENE_LIGHTING } from "./constants/camera";
import { PLAYER } from "./constants/player";
import { HALF_PI } from "./constants/world";
import { approach, clamp } from "./util/math";

export interface GameScene {
  readonly scene: THREE.Scene;
  follow(playerX: number, speed: number, dt: number): void;
  render(): void;
  resize(): void;
  /** Compiles every shader up front so the first spawn of each object type does not hitch. */
  warmUp(): void;
  dispose(): void;
}

const viewportSize = (container: HTMLElement) => ({
  width: Math.max(container.clientWidth, RENDERER.MIN_VIEWPORT_SIZE),
  height: Math.max(container.clientHeight, RENDERER.MIN_VIEWPORT_SIZE),
});

const addLights = (scene: THREE.Scene) => {
  const { HEMISPHERE, MOON, FILL } = SCENE_LIGHTING;

  scene.add(
    new THREE.HemisphereLight(
      HEMISPHERE.SKY,
      HEMISPHERE.GROUND,
      HEMISPHERE.INTENSITY,
    ),
  );

  const moon = new THREE.DirectionalLight(MOON.COLOR, MOON.INTENSITY);

  moon.position.set(...MOON.POSITION);
  scene.add(moon);

  const fill = new THREE.DirectionalLight(FILL.COLOR, FILL.INTENSITY);

  fill.position.set(...FILL.POSITION);
  scene.add(fill);
};

const createGround = (): THREE.Mesh<
  THREE.PlaneGeometry,
  THREE.MeshLambertMaterial
> => {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND.WIDTH, GROUND.LENGTH),
    new THREE.MeshLambertMaterial({ color: GROUND.COLOR, flatShading: true }),
  );
  ground.rotation.x = -HALF_PI;
  ground.position.set(0, GROUND.Y, GROUND.Z);
  return ground;
};

/** 0 at minimum speed, 1 at maximum speed. */
const getSpeedRatio = (speed: number): number => {
  return clamp(
    (speed - PLAYER.MIN_SPEED) / (PLAYER.MAX_SPEED - PLAYER.MIN_SPEED),
    0,
    1,
  );
};

export const createGameScene = (container: HTMLElement): GameScene => {
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(SCENE_LIGHTING.SKY_COLOR);

  scene.fog = new THREE.Fog(
    SCENE_LIGHTING.SKY_COLOR,
    SCENE_LIGHTING.FOG_NEAR,
    SCENE_LIGHTING.FOG_FAR,
  );

  addLights(scene);

  const sky = createStarSky();

  scene.add(sky.mesh);

  const ground = createGround();

  scene.add(ground);

  const { width, height } = viewportSize(container);

  const camera = new THREE.PerspectiveCamera(
    CAMERA.FOV,
    width / height,
    CAMERA.NEAR,
    CAMERA.FAR,
  );

  camera.position.set(0, CAMERA.HEIGHT, -CAMERA.BACK);
  camera.lookAt(0, CAMERA.LOOK_HEIGHT, CAMERA.LOOK_AHEAD);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, RENDERER.MAX_PIXEL_RATIO),
  );

  renderer.setSize(width, height, false);
  renderer.domElement.className = RENDERER.CANVAS_CLASS;
  container.appendChild(renderer.domElement);

  return {
    scene,
    follow: (playerX, speed, dt) => {
      console.log("speed: ", speed);

      const speedRatio = getSpeedRatio(speed);

      camera.position.x = approach(
        camera.position.x,
        playerX *
          CAMERA.FOLLOW_X_RATIO *
          (1 - speedRatio * CAMERA.FOLLOW_X_SPEED_RATIO),
        CAMERA.FOLLOW,
        dt,
      );

      camera.lookAt(camera.position.x, CAMERA.LOOK_HEIGHT, CAMERA.LOOK_AHEAD);

      const targetSpeedFov =
        CAMERA.FOV + (CAMERA.FOV_MAX - CAMERA.FOV) * speedRatio;

      const interpolatedCurrentFrameFov = approach(
        camera.fov,
        targetSpeedFov,
        CAMERA.FOV_RESPONSE,
        dt,
      );

      console.log("camera.position: ", camera.position);

      if (
        Math.abs(interpolatedCurrentFrameFov - camera.fov) > CAMERA.FOV_EPSILON
      ) {
        camera.fov = interpolatedCurrentFrameFov;

        camera.updateProjectionMatrix();
      }
    },
    render: () => {
      renderer.render(scene, camera);
    },
    resize: () => {
      const newWindowSize = viewportSize(container);

      camera.aspect = newWindowSize.width / newWindowSize.height;
      camera.updateProjectionMatrix();

      renderer.setSize(newWindowSize.width, newWindowSize.height, false);
    },
    warmUp: () => {
      renderer.compile(scene, camera);
    },
    dispose: () => {
      sky.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};
