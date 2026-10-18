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
  max,
  mix,
  normalize,
  positionLocal,
  pow,
  sin,
  cos,
  smoothstep,
  step,
  sub,
  vec2,
  vec3,
} from "three/tsl";

import { SKY } from "../constants/camera";
import type { ILevelPalette, LevelSkyMode } from "../levels/types";

const INV_TWO_PI = float(0.15915);
const INV_PI = float(0.3183);
const starGrid = float(SKY.STAR_GRID);
const starThreshold = float(SKY.STAR_THRESHOLD);
const brightStarThreshold = float(SKY.BRIGHT_STAR_THRESHOLD);
const cloudLayerScale = float(SKY.CLOUD_LAYER_SCALE);
const cloudDetailScale = float(SKY.CLOUD_DETAIL_SCALE);
const tau = float(6.2831853);

const createSkyColor = (
  horizon: ILevelPalette["horizon"],
  zenith: ILevelPalette["zenith"],
) => {
  const horizonColor = vec3(...horizon);
  const zenithColor = vec3(...zenith);

  return Fn(() => {
  const direction = normalize(positionLocal);
  const lift = smoothstep(float(-0.08), float(0.55), direction.y);
  const skyUv = vec2(
    atan(direction.z, direction.x).mul(INV_TWO_PI).add(0.5),
    asin(clamp(direction.y, float(-1), float(1)))
      .mul(INV_PI)
      .add(0.5),
  );
  const cloudLayer1 = skyUv.mul(cloudLayerScale);
  const cloudLayer2 = skyUv.mul(cloudDetailScale).add(vec2(0.27, 0.53));
  const cloudWave1 = sin(cloudLayer1.x.mul(tau)).mul(
    cos(cloudLayer1.y.mul(tau.mul(0.76))),
  );
  const cloudWave2 = sin(cloudLayer2.x.mul(tau.mul(0.68)).add(float(1.2))).mul(
    sin(cloudLayer2.y.mul(tau.mul(0.94)).add(float(0.8))),
  );
  const cloudDensity = cloudWave1
    .mul(float(0.58))
    .add(cloudWave2.mul(float(0.42)))
    .mul(float(0.5))
    .add(float(0.5));
  const cloudMask = smoothstep(float(0.5), float(0.74), cloudDensity)
    .mul(smoothstep(float(0.1), float(0.58), direction.y))
    .mul(
      sub(float(1), smoothstep(float(0.72), float(0.98), direction.y)),
    );
  const nightCloud = vec3(0.07, 0.09, 0.15);
  const gradient = mix(
    mix(horizonColor, zenithColor, lift),
    nightCloud,
    cloudMask.mul(float(0.42)),
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
    .mul(lift)
    .mul(sub(float(1), cloudMask.mul(float(0.94))));

  return gradient.add(starGlow);
  });
};

export interface ISkybox {
  readonly mesh: Mesh;
  dispose(): void;
}

const attachSkyMesh = (
  colorNode: ReturnType<typeof createSkyColor> | ReturnType<typeof createDaySkyColor>,
): ISkybox => {
  const geometry = new BoxGeometry(1, 1, 1);

  const material = new MeshBasicNodeMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
  });

  material.colorNode = colorNode();

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

const createDaySkyColor = (
  horizon: ILevelPalette["horizon"],
  zenith: ILevelPalette["zenith"],
) => {
  const horizonColor = vec3(...horizon);
  const zenithColor = vec3(...zenith);
  const sunDirection = normalize(vec3(0.42, 0.58, -0.22));
  const sunColor = vec3(1.0, 0.96, 0.86);
  const haloColor = vec3(0.82, 0.9, 1.0);

  const cloudWhite = vec3(0.9, 0.93, 0.98);
  const cloudShadow = vec3(0.76, 0.82, 0.9);

  return Fn(() => {
    const direction = normalize(positionLocal);
    const lift = smoothstep(float(-0.05), float(0.72), direction.y);
    const skyUv = vec2(
      atan(direction.z, direction.x).mul(INV_TWO_PI).add(0.5),
      asin(clamp(direction.y, float(-1), float(1)))
        .mul(INV_PI)
        .add(0.5),
    );
    const cloudLayer1 = skyUv.mul(cloudLayerScale);
    const cloudLayer2 = skyUv.mul(cloudDetailScale).add(vec2(0.27, 0.53));
    const cloudWave1 = sin(cloudLayer1.x.mul(tau)).mul(
      cos(cloudLayer1.y.mul(tau.mul(0.76))),
    );
    const cloudWave2 = sin(cloudLayer2.x.mul(tau.mul(0.68)).add(float(1.2))).mul(
      sin(cloudLayer2.y.mul(tau.mul(0.94)).add(float(0.8))),
    );
    const cloudDensity = cloudWave1
      .mul(float(0.58))
      .add(cloudWave2.mul(float(0.42)))
      .mul(float(0.5))
      .add(float(0.5));
    const cloudMask = smoothstep(float(0.5), float(0.74), cloudDensity)
      .mul(smoothstep(float(0.1), float(0.58), direction.y))
      .mul(
        sub(float(1), smoothstep(float(0.72), float(0.98), direction.y)),
      );
    const litClouds = mix(cloudShadow, cloudWhite, lift);
    const gradient = mix(
      mix(horizonColor, zenithColor, lift),
      litClouds,
      cloudMask.mul(float(0.92)),
    );

    const sunDot = max(dot(direction, sunDirection), float(0));
    const sunDisc = pow(sunDot, float(128)).mul(float(1.05));
    const sunHalo = pow(sunDot, float(10)).mul(float(0.2));

    return gradient
      .add(sunColor.mul(sunDisc))
      .add(haloColor.mul(sunHalo));
  });
};

export const createStarSky = (
  palette: Pick<ILevelPalette, "horizon" | "zenith">,
): ISkybox =>
  attachSkyMesh(createSkyColor(palette.horizon, palette.zenith));

export const createDaySky = (
  palette: Pick<ILevelPalette, "horizon" | "zenith">,
): ISkybox =>
  attachSkyMesh(createDaySkyColor(palette.horizon, palette.zenith));

export const createLevelSky = (
  palette: Pick<ILevelPalette, "horizon" | "zenith" | "skyMode">,
): ISkybox => {
  const mode: LevelSkyMode = palette.skyMode ?? "night";

  return mode === "day" ? createDaySky(palette) : createStarSky(palette);
};
