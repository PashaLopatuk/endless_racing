import { BackSide, BoxGeometry, Mesh } from "three";
import { MeshBasicNodeMaterial } from "three/webgpu";

import {
  Fn,
  asin,
  atan,
  clamp,
  dot,
  float,
  floor,
  fract,
  length,
  mix,
  normalize,
  positionLocal,
  smoothstep,
  step,
  vec2,
  vec3,
} from "three/tsl";

import { SKY } from "../constants/camera";

const INV_TWO_PI = float(0.15915);
const INV_PI = float(0.3183);

const horizonColor = vec3(...SKY.HORIZON);
const zenithColor = vec3(...SKY.ZENITH);
const starGrid = float(SKY.STAR_GRID);
const starThreshold = float(SKY.STAR_THRESHOLD);
const brightStarThreshold = float(SKY.BRIGHT_STAR_THRESHOLD);

const starSkyColor = Fn(() => {
  const direction = normalize(positionLocal);
  const lift = smoothstep(float(-0.08), float(0.55), direction.y);
  const gradient = mix(horizonColor, zenithColor, lift);

  const skyUv = vec2(
    atan(direction.z, direction.x).mul(INV_TWO_PI).add(0.5),
    asin(clamp(direction.y, float(-1), float(1)))
      .mul(INV_PI)
      .add(0.5),
  );

  const cell = floor(skyUv.mul(starGrid));
  const point = fract(skyUv.mul(starGrid)).sub(0.5);
  const mixed = fract(vec3(cell.x, cell.y, cell.x).mul(float(0.1031)));
  const scattered = mixed.add(dot(mixed, mixed.yzx.add(float(33.33))));
  const noise = fract(scattered.x.add(scattered.y).mul(scattered.z));
  const radius = mix(float(0.04), float(0.22), noise);
  const star = smoothstep(radius, float(0), length(point)).mul(
    step(starThreshold, noise),
  );
  const bright = step(brightStarThreshold, noise);
  const tintCell = cell.add(vec2(8, 8));
  const tintMixed = fract(
    vec3(tintCell.x, tintCell.y, tintCell.x).mul(float(0.1031)),
  );
  const tintScattered = tintMixed.add(
    dot(tintMixed, tintMixed.yzx.add(float(33.33))),
  );
  const tintNoise = fract(
    tintScattered.x.add(tintScattered.y).mul(tintScattered.z),
  );
  const starTint = mix(vec3(0.75, 0.84, 1.0), vec3(1.0, 0.94, 0.82), tintNoise);
  const starGlow = starTint
    .mul(star)
    .mul(mix(float(0.45), float(1.15), bright))
    .mul(lift);

  return gradient.add(starGlow);
});

export interface IStarSky {
  readonly mesh: Mesh;
  dispose(): void;
}

export const createStarSky = (): IStarSky => {
  const geometry = new BoxGeometry(1, 1, 1);

  const material = new MeshBasicNodeMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
  });

  material.colorNode = starSkyColor();

  const mesh = new Mesh(geometry, material);

  mesh.frustumCulled = false;
  mesh.renderOrder = SKY.RENDER_ORDER;
  mesh.scale.setScalar(SKY.SCALE);

  return {
    mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
};
