import * as THREE from "three";

import { createLevelSky } from "./assets/sky";
import { CAMERA, GROUND, RENDERER } from "./constants/camera";
import { PLAYER } from "./constants/player";
import type { ILevelConfig, ILevelPalette } from "./levels/types";
import { MOTION_BLUR } from "./constants/postfx";
import { HALF_PI } from "./constants/world";
import { getSpeedRatio } from "./util/drive";
import { clamp, smoothNumberValueExponentially } from "./util/math";

import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { motionBlur } from "three/addons/tsl/display/MotionBlur.js";

import {
  color,
  float,
  fog,
  rangeFogFactor,
  max,
  mix,
  pass,
  mrt,
  output,
  pow,
  smoothstep,
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

const addLights = (scene: THREE.Scene, palette: ILevelPalette) => {
  const { hemisphere, keyLight, fillLight } = palette;

  scene.add(
    new THREE.HemisphereLight(
      hemisphere.sky,
      hemisphere.ground,
      hemisphere.intensity,
    ),
  );

  const key = new THREE.DirectionalLight(keyLight.color, keyLight.intensity);

  key.position.set(...keyLight.position);
  scene.add(key);

  const fill = new THREE.DirectionalLight(fillLight.color, fillLight.intensity);

  fill.position.set(...fillLight.position);
  scene.add(fill);
};

const DAY_FOG_CURVE = 0.74;
const DAY_FOG_HAZE_DIM = 0.84;

const createFogHaze = (palette: ILevelPalette): THREE.Color => {
  if (palette.skyMode === "day") {
    const [hr, hg, hb] = palette.horizon;
    const [zr, zg, zb] = palette.zenith;
    const zenithMix = 0.48;

    const haze = new THREE.Color(
      hr * (1 - zenithMix) + zr * zenithMix,
      hg * (1 - zenithMix) + zg * zenithMix,
      hb * (1 - zenithMix) + zb * zenithMix,
    );

    haze.lerp(new THREE.Color(palette.skyColor), 0.28);
    haze.multiplyScalar(DAY_FOG_HAZE_DIM);

    return haze;
  }

  return new THREE.Color(palette.skyColor).lerp(
    new THREE.Color(0x7f97b8),
    0.42,
  );
};

const createFogFactorNode = (palette: ILevelPalette) => {
  const linear = rangeFogFactor(float(palette.fogNear), float(palette.fogFar));

  if (palette.skyMode === "day") {
    const eased = pow(linear, float(DAY_FOG_CURVE));

    return smoothstep(float(0), float(1), eased);
  }

  return linear;
};

const createGround = (
  groundColor: number,
): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial> => {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND.WIDTH, GROUND.LENGTH),
    new THREE.MeshLambertMaterial({ color: groundColor, flatShading: true }),
  );
  ground.rotation.x = -HALF_PI;
  ground.position.set(0, GROUND.Y, GROUND.Z);
  return ground;
};

export const createGameScene = (
  container: HTMLElement,
  level: ILevelConfig,
): IGameScene => {
  const { palette, terrain } = level;
  const scene = new THREE.Scene();

  const haze = createFogHaze(palette);

  scene.background = new THREE.Color(palette.skyColor);
  scene.fog = new THREE.Fog(haze, palette.fogNear, palette.fogFar);
  scene.fogNode = fog(color(haze), createFogFactorNode(palette));

  addLights(scene, palette);

  const sky = createLevelSky(palette);

  scene.add(sky.mesh);

  const ground = createGround(terrain.groundColor);

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
  const isDayLevel = palette.skyMode === "day";
  const lampBloom = bloom(
    beauty,
    isDayLevel ? 0.26 : 0.42,
    isDayLevel ? 0.34 : 0.38,
    isDayLevel ? 0.68 : 0.56,
  );

  const vignette = screenUV
    .distance(0.5)
    .remap(0.6, 1)
    .mul(2)
    .clamp()
    .oneMinus();

  const renderPipeline = new RenderPipeline(renderer);

  const composed = mBlur.add(lampBloom).mul(vignette);
  const outputGamma = float(palette.outputGamma);
  const gradedRgb = pow(max(composed.rgb, float(0)), outputGamma);

  renderPipeline.outputNode = vec4(gradedRgb, composed.a);

  // ── Screen-space shake state (applied after post-processing) ──
  let shakeElapsed = 0;
  let shakeIntensity = 0;

  // Hint the browser to GPU-accelerate transforms on the canvas.
  renderer.domElement.style.willChange = "transform";

  return {
    scene,
    follow: (playerX, speed, dt) => {
      const speedRatio = getSpeedRatio(speed);

      const targetBlur = speedRatio * MOTION_BLUR.MAX_AMOUNT;

      blurAmount.value = smoothNumberValueExponentially(
        blurAmount.value,
        targetBlur,
        MOTION_BLUR.SMOOTH_RATE,
        dt,
      );

      // ── Stable camera position (no shake here — keeps motion blur clean) ──
      camera.position.x = smoothNumberValueExponentially(
        camera.position.x,
        playerX *
          CAMERA.FOLLOW_X_RATIO *
          (1 - speedRatio * CAMERA.FOLLOW_X_SPEED_RATIO),
        CAMERA.FOLLOW,
        dt,
      );

      camera.position.z = smoothNumberValueExponentially(
        camera.position.z,
        -CAMERA.BACK + speedRatio * CAMERA.MAX_SPEED_DISTANCE,
        1,
        dt,
      );

      camera.position.y = CAMERA.HEIGHT;

      camera.lookAt(camera.position.x, CAMERA.LOOK_HEIGHT, CAMERA.LOOK_AHEAD);

      // ── Compute shake intensity (0→1, squared curve) ──
      // Shake only activates above MAX_BASE_SPEED.
      const shakeRange = PLAYER.MAX_SPEED - PLAYER.MAX_BASE_SPEED;
      const shakeT = clamp(
        (speed - PLAYER.MAX_BASE_SPEED) / shakeRange,
        0,
        1,
      );

      const targetIntensity = shakeT * shakeT;

      shakeIntensity = smoothNumberValueExponentially(
        shakeIntensity,
        targetIntensity,
        CAMERA.SHAKE_SMOOTH_RATE,
        dt,
      );

      // ── Compute screen-space shake offset (CSS pixels) ──
      if (shakeIntensity > 0.001) {
        shakeElapsed += dt;

        const t = shakeElapsed;
        const lo = CAMERA.SHAKE_FREQ_LO;
        const mid = CAMERA.SHAKE_FREQ_MID;
        const hi = CAMERA.SHAKE_FREQ_HI;

        // Three layered oscillator pairs at irrational ratios — non-repeating
        // X: mostly mid + hi, less low (lateral is secondary)
        const px =
          Math.sin(t * lo * 0.83) * 0.15 +
          Math.sin(t * mid * 1.317) * 0.45 +
          Math.sin(t * hi * 0.891) * 0.40;

        // Y: all three layers, heavy on mid + hi (road bumps dominate)
        const py =
          Math.sin(t * lo * 0.793) * 0.20 +
          Math.cos(t * mid * 1.131) * 0.40 +
          Math.sin(t * hi * 1.037) * 0.40;

        const offsetX = px * CAMERA.SHAKE_MAX_PX_X * shakeIntensity;
        const offsetY = py * CAMERA.SHAKE_MAX_PX_Y * shakeIntensity;

        renderer.domElement.style.transform = `translate3d(${offsetX.toFixed(2)}px,${offsetY.toFixed(2)}px,0)`;
      } else {
        renderer.domElement.style.transform = "";
      }

      // ── FOV ──
      const targetSpeedFov =
        CAMERA.FOV + (CAMERA.FOV_MAX - CAMERA.FOV) * speedRatio;

      const fovResponse =
        targetSpeedFov > camera.fov
          ? CAMERA.FOV_INCREASE_RESPONSE
          : CAMERA.FOV_DECREASE_RESPONSE;

      const interpolatedCurrentFrameFov = smoothNumberValueExponentially(
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
      renderer.domElement.style.willChange = "";
      renderer.domElement.style.transform = "";
      sky.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};
