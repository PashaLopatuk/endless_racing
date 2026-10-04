import * as THREE from "three";

import { createStarSky } from "./assets/sky";
import { CAMERA, GROUND, RENDERER, SCENE_LIGHTING } from "./constants/camera";
import { MOTION_BLUR } from "./constants/postfx";
import { HALF_PI } from "./constants/world";
import { getSpeedRatio } from "./util/drive";
import { approach } from "./util/math";

import { motionBlur } from "three/addons/tsl/display/MotionBlur.js";

import {
  float,
  mix,
  pass,
  mrt,
  output,
  screenUV,
  velocity,
  uniform,
  vec4,
} from "three/tsl";
import { RenderPipeline, WebGPURenderer } from "three/webgpu";

export interface IGameScene {
  readonly scene: THREE.Scene;
  follow(playerX: number, speed: number, dt: number): void;
  render(): void;
  resize(): void;
  /** Compiles every shader up front so the first spawn of each object type does not hitch. */
  warmUp(): Promise<void>;
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

export const createGameScene = (container: HTMLElement): IGameScene => {
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

  const renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, RENDERER.MAX_PIXEL_RATIO),
  );

  renderer.setSize(width, height, false);
  renderer.domElement.className = RENDERER.CANVAS_CLASS;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  container.appendChild(renderer.domElement);

  const blurAmount = uniform(0);

  const scenePass = pass(scene, camera);

  scenePass.setMRT(
    mrt({
      output,
      velocity,
    }),
  );

  const beauty = scenePass.getTextureNode().toInspector("Color");

  const sideDistance = screenUV.x.sub(0.5).abs().mul(2);
  const environmentMask = sideDistance
    .remap(MOTION_BLUR.ROAD_EDGE_INNER, MOTION_BLUR.ROAD_EDGE_OUTER)
    .clamp()
    .pow(MOTION_BLUR.ENV_MASK_POWER);
  const spatialBlurScale = mix(
    float(MOTION_BLUR.ROAD_BLUR_SCALE),
    float(MOTION_BLUR.ENV_BLUR_SCALE),
    environmentMask,
  );

  const vel = scenePass
    .getTextureNode("velocity")
    .toInspector("Velocity")
    .mul(blurAmount)
    .mul(spatialBlurScale);

  const mBlur = motionBlur(beauty, vel, vec4(MOTION_BLUR.SAMPLE_COUNT));

  const vignette = screenUV
    .distance(0.5)
    .remap(0.5, 1)
    .mul(2)
    .clamp()
    .oneMinus();

  const renderPipeline = new RenderPipeline(renderer);

  renderPipeline.outputNode = vec4(mBlur.mul(vignette).rgb, mBlur.a);

  return {
    scene,
    follow: (playerX, speed, dt) => {
      const speedRatio = getSpeedRatio(speed);

      const targetBlur = speedRatio * MOTION_BLUR.MAX_AMOUNT;

      blurAmount.value = approach(
        blurAmount.value,
        targetBlur,
        MOTION_BLUR.SMOOTH_RATE,
        dt,
      );

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

      const fovResponse =
        targetSpeedFov > camera.fov
          ? CAMERA.FOV_INCREASE_RESPONSE
          : CAMERA.FOV_DECREASE_RESPONSE;

      const interpolatedCurrentFrameFov = approach(
        camera.fov,
        targetSpeedFov,
        fovResponse,
        dt,
      );

      if (
        Math.abs(interpolatedCurrentFrameFov - camera.fov) > CAMERA.FOV_EPSILON
      ) {
        camera.fov = interpolatedCurrentFrameFov;

        camera.updateProjectionMatrix();
      }
    },
    render: () => {
      renderPipeline.render();
    },
    resize: () => {
      const newWindowSize = viewportSize(container);

      camera.aspect = newWindowSize.width / newWindowSize.height;
      camera.updateProjectionMatrix();

      renderer.setSize(newWindowSize.width, newWindowSize.height, false);
    },
    warmUp: async () => {
      await renderer.init();
      await renderer.compileAsync(scene, camera);
      renderPipeline.render();
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
