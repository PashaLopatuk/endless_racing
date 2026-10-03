import * as THREE from "three";

import { SKY } from "../constants/camera";

const vertexShader = /* glsl */ `
  varying vec3 vDirection;

  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.z = gl_Position.w;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 horizonColor;
  uniform vec3 zenithColor;
  uniform float starGrid;
  uniform float starThreshold;
  uniform float brightStarThreshold;

  varying vec3 vDirection;

  const float INV_TWO_PI = 0.15915;
  const float INV_PI = 0.3183;

  float hash(vec2 value) {
    vec3 mixed = fract(vec3(value.xyx) * 0.1031);
    mixed += dot(mixed, mixed.yzx + 33.33);
    return fract((mixed.x + mixed.y) * mixed.z);
  }

  void main() {
    vec3 direction = normalize(vDirection);
    float lift = smoothstep(-0.08, 0.55, direction.y);
    vec3 color = mix(horizonColor, zenithColor, lift);

    vec2 skyUv = vec2(
      atan(direction.z, direction.x) * INV_TWO_PI + 0.5,
      asin(clamp(direction.y, -1.0, 1.0)) * INV_PI + 0.5
    );
    vec2 cell = floor(skyUv * starGrid);
    vec2 point = fract(skyUv * starGrid) - 0.5;
    float noise = hash(cell);
    float radius = mix(0.04, 0.22, noise);
    float star = smoothstep(radius, 0.0, length(point)) * step(starThreshold, noise);
    float bright = step(brightStarThreshold, noise);
    vec3 starTint = mix(vec3(0.75, 0.84, 1.0), vec3(1.0, 0.94, 0.82), hash(cell + 8.0));
    color += starTint * star * mix(0.45, 1.15, bright) * lift;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface StarSky {
  readonly object: THREE.Mesh;
  dispose(): void;
}

export const createStarSky = (): StarSky => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      horizonColor: { value: new THREE.Vector3(...SKY.HORIZON) },
      zenithColor: { value: new THREE.Vector3(...SKY.ZENITH) },
      starGrid: { value: SKY.STAR_GRID },
      starThreshold: { value: SKY.STAR_THRESHOLD },
      brightStarThreshold: { value: SKY.BRIGHT_STAR_THRESHOLD },
    },
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const object = new THREE.Mesh(geometry, material);
  object.frustumCulled = false;
  object.renderOrder = SKY.RENDER_ORDER;
  object.scale.setScalar(SKY.SCALE);

  return {
    object,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
};
