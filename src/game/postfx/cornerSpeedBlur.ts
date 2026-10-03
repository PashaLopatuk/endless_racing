import * as THREE from "three";

import { SPEED_CORNER_BLUR } from "../constants/postfx";

export interface ICornerSpeedBlurPass {
  setStrength(speedRatio: number): void;
  render(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uScene;
  uniform float uStrength;
  uniform float uCornerInner;
  uniform float uCornerOuter;
  uniform float uMaxOffset;
  uniform float uForwardMix;
  uniform float uOutputGamma;
  uniform int uSampleCount;

  varying vec2 vUv;

  vec3 liftShadows(vec3 color) {
    return pow(max(color, vec3(0.0)), vec3(uOutputGamma));
  }

  void main() {
    vec2 fromCenter = vUv - 0.5;
    vec2 chebyshev = abs(fromCenter) * 2.0;
    float cornerMask = smoothstep(uCornerInner, uCornerOuter, max(chebyshev.x, chebyshev.y));

    float amount = uStrength * cornerMask;
    if (amount < 0.0005) {
      gl_FragColor = vec4(liftShadows(texture2D(uScene, vUv).rgb), 1.0);
      return;
    }

    vec2 radialDir = length(fromCenter) > 0.0001 ? normalize(fromCenter) : vec2(0.0, 1.0);
    vec2 forwardDir = vec2(0.0, 1.0);
    vec2 blurDir = normalize(mix(radialDir, forwardDir, uForwardMix));

    vec3 accum = vec3(0.0);
    float weightSum = 0.0;
    float steps = float(max(uSampleCount, 1));

    for (int i = 0; i < 12; i++) {
      if (i >= uSampleCount) {
        break;
      }
      float t = float(i) / max(steps - 1.0, 1.0);
      float weight = 1.0 - t * 0.35;
      vec2 offset = blurDir * uMaxOffset * amount * t;
      accum += texture2D(uScene, vUv - offset).rgb * weight;
      weightSum += weight;
    }

    gl_FragColor = vec4(liftShadows(accum / weightSum), 1.0);
  }
`;

const createRenderTarget = (
  width: number,
  height: number,
): THREE.WebGLRenderTarget => {
  return new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: true,
    stencilBuffer: false,
  });
};

export const createCornerSpeedBlurPass = (
  renderer: THREE.WebGLRenderer,
): ICornerSpeedBlurPass => {
  const { width, height } = renderer.getDrawingBufferSize(
    new THREE.Vector2(),
  );
  let target = createRenderTarget(width, height);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uScene: { value: target.texture },
      uStrength: { value: 0 },
      uCornerInner: { value: SPEED_CORNER_BLUR.CORNER_INNER },
      uCornerOuter: { value: SPEED_CORNER_BLUR.CORNER_OUTER },
      uMaxOffset: { value: SPEED_CORNER_BLUR.MAX_OFFSET },
      uForwardMix: { value: SPEED_CORNER_BLUR.FORWARD_MIX },
      uOutputGamma: { value: SPEED_CORNER_BLUR.OUTPUT_GAMMA },
      uSampleCount: { value: SPEED_CORNER_BLUR.SAMPLE_COUNT },
    },
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  const postScene = new THREE.Scene();
  postScene.add(quad);
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const resize = (nextWidth: number, nextHeight: number) => {
    target.dispose();
    target = createRenderTarget(nextWidth, nextHeight);
    material.uniforms.uScene.value = target.texture;
  };

  return {
    setStrength: (speedRatio) => {
      material.uniforms.uStrength.value = Math.max(0, Math.min(1, speedRatio));
    },
    render: (activeRenderer, scene, camera) => {
      activeRenderer.setRenderTarget(target);
      activeRenderer.render(scene, camera);
      activeRenderer.setRenderTarget(null);
      material.uniforms.uScene.value = target.texture;
      activeRenderer.render(postScene, postCamera);
    },
    resize,
    dispose: () => {
      target.dispose();
      material.dispose();
      quad.geometry.dispose();
    },
  };
};
