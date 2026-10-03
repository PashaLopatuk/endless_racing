import * as THREE from "three";

const vertexShader = `
  varying vec3 vDirection;

  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.z = gl_Position.w;
  }
`;

const fragmentShader = `
  varying vec3 vDirection;

  float hash(vec2 value) {
    vec3 mixed = fract(vec3(value.xyx) * 0.1031);
    mixed += dot(mixed, mixed.yzx + 33.33);
    return fract((mixed.x + mixed.y) * mixed.z);
  }

  void main() {
    vec3 direction = normalize(vDirection);
    float lift = smoothstep(-0.08, 0.55, direction.y);
    vec3 horizon = vec3(0.027, 0.035, 0.063);
    vec3 zenith = vec3(0.035, 0.055, 0.12);
    vec3 color = mix(horizon, zenith, lift);

    vec2 skyUv = vec2(
      atan(direction.z, direction.x) * 0.15915 + 0.5,
      asin(clamp(direction.y, -1.0, 1.0)) * 0.3183 + 0.5
    );
    vec2 cell = floor(skyUv * 280.0);
    vec2 point = fract(skyUv * 280.0) - 0.5;
    float noise = hash(cell);
    float radius = mix(0.04, 0.22, noise);
    float star = smoothstep(radius, 0.0, length(point)) * step(0.993, noise);
    float bright = step(0.998, noise);
    vec3 starTint = mix(vec3(0.75, 0.84, 1.0), vec3(1.0, 0.94, 0.82), hash(cell + 8.0));
    color += starTint * star * mix(0.45, 1.15, bright) * lift;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export type StarSky = {
  object: THREE.Mesh;
  dispose: () => void;
};

export const createStarSky = (): StarSky => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const object = new THREE.Mesh(geometry, material);
  object.frustumCulled = false;
  object.renderOrder = -1;
  object.scale.setScalar(500);

  return {
    object,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
};
