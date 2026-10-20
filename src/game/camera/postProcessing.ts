import * as THREE from "three";
import { RenderPipeline, type WebGPURenderer } from "three/webgpu";
import type { ILevelPalette } from "../levels";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { motionBlur } from "three/addons/tsl/display/MotionBlur.js";

import {
  float,
  max,
  mix,
  pass,
  mrt,
  output,
  pow,
  screenUV,
  velocity,
  uniform,
  vec4,
  rangeFogFactor,
  smoothstep,
} from "three/tsl";
import { MOTION_BLUR } from "../constants/postfx";
import { smoothNumberValueExponentially } from "../util/math";

interface IPostProcessingPipeline {
  readonly pipeline: RenderPipeline;
  updateBlur(speedRatio: number, dt: number): void;
  render(): void;
}

export const createPostProcessing = (
  renderer: WebGPURenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  palette: ILevelPalette,
): IPostProcessingPipeline => {
  const blurAmount = uniform(0);

  const scenePass = pass(scene, camera);
  scenePass.setMRT(
    mrt({
      output,
      velocity,
    }),
  );

  const beauty = scenePass.getTextureNode().toInspector("Color");

  // Environmental motion blur mask (stronger blur near road edges)
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

  const composed = mBlur.add(lampBloom).mul(vignette);
  const outputGamma = float(palette.outputGamma);
  const gradedRgb = pow(max(composed.rgb, float(0)), outputGamma);

  const renderPipeline = new RenderPipeline(renderer);
  renderPipeline.outputNode = vec4(gradedRgb, composed.a);

  return {
    pipeline: renderPipeline,
    updateBlur: (speedRatio, dt) => {
      const targetBlur = speedRatio * MOTION_BLUR.MAX_AMOUNT;
      blurAmount.value = smoothNumberValueExponentially(
        blurAmount.value,
        targetBlur,
        MOTION_BLUR.SMOOTH_RATE,
        dt,
      );
    },
    render: () => {
      renderPipeline.render();
    },
  };
};

const DAY_FOG_CURVE = 0.74;

export const createFogFactorNode = (palette: ILevelPalette) => {
  const linear = rangeFogFactor(float(palette.fogNear), float(palette.fogFar));

  if (palette.skyMode === "day") {
    const eased = pow(linear, float(DAY_FOG_CURVE));
    return smoothstep(float(0), float(1), eased);
  }

  return linear;
};
