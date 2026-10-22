import { BackSide, BoxGeometry, Mesh } from "three";
import { MeshBasicNodeMaterial, type UniformNode } from "three/webgpu";

import {
  Fn,
  asin,
  atan,
  clamp,
  cos,
  dot,
  float,
  floor,
  fract,
  length,
  max,
  min,
  mix,
  normalize,
  positionLocal,
  pow,
  sin,
  smoothstep,
  step,
  sub,
  uniform,
  vec2,
  vec3,
} from "three/tsl";

import { SKY } from "../constants/camera";
import type { ILevelPalette, LevelSkyMode } from "../levels/types";

const INV_TWO_PI = float(0.15915);
const INV_PI = float(0.3183);
const tau = float(6.2831853);
const starGrid = float(SKY.STAR_GRID);
const brightStarThreshold = float(SKY.BRIGHT_STAR_THRESHOLD);

export interface ISkybox {
  readonly mesh: Mesh;
  update(speed: number, dt: number): void;
  dispose(): void;
}

export interface ISkyGenerationOptions {
  seed?: number;
}

/**
 * Creates random seeds for star and cloud procedural generation.
 */
const generateSkySeeds = (seed?: number) => {
  let s = Math.abs(seed ?? Math.floor(Math.random() * 1000000)) || 74931;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return {
    starSeedX: Math.floor(rng() * 400 + 10),
    starSeedY: Math.floor(rng() * 400 + 10),
    starThreshold: SKY.STAR_THRESHOLD + (rng() - 0.5) * 0.003,
    cloudPhase1: [rng() * 6.28, rng() * 6.28] as [number, number],
    cloudPhase2: [rng() * 6.28, rng() * 6.28] as [number, number],
    cloudScale1: SKY.CLOUD_LAYER_SCALE * (0.94 + rng() * 0.12),
    cloudScale2: SKY.CLOUD_DETAIL_SCALE * (0.94 + rng() * 0.12),
  };
};

/**
 * Generates cartoon rounded-square (squircle) cloud density.
 * Blends circular wave harmonics with square min() clamping (mix factor ~0.32)
 * to produce subtle cartoonish rounded-square puffs without harsh distracting edges.
 */
const createCartoonCloudDensity = (
  uv: ReturnType<typeof vec2>,
  scale1: number,
  scale2: number,
  phase1: [number, number],
  phase2: [number, number],
) => {
  const layer1 = uv.mul(float(scale1)).add(vec2(phase1[0], phase1[1]));
  const layer2 = uv.mul(float(scale2)).add(vec2(phase2[0], phase2[1]));

  // Primary wave: blend circular (cos(x) + cos(y))*0.5 with square min(cos(x), cos(y))
  const cx1 = cos(layer1.x.mul(tau));
  const cy1 = cos(layer1.y.mul(tau.mul(0.78)));
  const circ1 = cx1.add(cy1).mul(float(0.5));
  const sq1 = min(cx1, cy1);
  const squircleWave1 = mix(circ1, sq1, float(SKY.CLOUD_SQUIRCLE_FACTOR));

  // Secondary detail wave
  const cx2 = sin(layer2.x.mul(tau.mul(0.82)));
  const cy2 = cos(layer2.y.mul(tau.mul(0.92)));
  const circ2 = cx2.add(cy2).mul(float(0.5));
  const sq2 = min(cx2, cy2);
  const squircleWave2 = mix(circ2, sq2, float(SKY.CLOUD_SQUIRCLE_FACTOR * 0.75));

  // Combined density mapped to [0, 1]
  return squircleWave1
    .mul(float(0.64))
    .add(squircleWave2.mul(float(0.36)))
    .mul(float(0.5))
    .add(float(0.5));
};

/**
 * Night sky: procedural randomized stars and subtly stylized rounded-square night clouds.
 */
const createNightSkyColor = (
  horizon: ILevelPalette["horizon"],
  zenith: ILevelPalette["zenith"],
  seeds: ReturnType<typeof generateSkySeeds>,
  skyDrift: UniformNode<"float", number>,
) => {
  const horizonColor = vec3(...horizon);
  const zenithColor = vec3(...zenith);
  const nightCloudColor = vec3(0.07, 0.09, 0.16);

  return Fn(() => {
    const direction = normalize(positionLocal);
    const lift = smoothstep(float(-0.08), float(0.55), direction.y);

    // Azimuth UVs with slow dynamic drift
    const baseUvX = atan(direction.z, direction.x).mul(INV_TWO_PI).add(0.5);
    const uvY = asin(clamp(direction.y, float(-1), float(1)))
      .mul(INV_PI)
      .add(0.5);

    const driftedUvX = baseUvX.add(skyDrift);
    const skyUv = vec2(driftedUvX, uvY);

    // Subtle cartoon rounded-square clouds
    const cloudDensity = createCartoonCloudDensity(
      skyUv,
      seeds.cloudScale1,
      seeds.cloudScale2,
      seeds.cloudPhase1,
      seeds.cloudPhase2,
    );

    const cloudMask = smoothstep(float(0.54), float(0.72), cloudDensity)
      .mul(smoothstep(float(0.08), float(0.56), direction.y))
      .mul(sub(float(1), smoothstep(float(0.70), float(0.96), direction.y)));

    const gradient = mix(
      mix(horizonColor, zenithColor, lift),
      nightCloudColor,
      cloudMask.mul(float(0.42)),
    );

    // Randomized stars
    const cell = floor(skyUv.mul(starGrid)).add(
      vec2(seeds.starSeedX, seeds.starSeedY),
    );
    const point = fract(skyUv.mul(starGrid)).sub(0.5);
    const mixed = fract(vec3(cell.x, cell.y, cell.x).mul(float(0.1031)));
    const scattered = mixed.add(dot(mixed, mixed.yzx.add(float(33.33))));
    const noise = fract(scattered.x.add(scattered.y).mul(scattered.z));
    const radius = mix(float(0.04), float(0.22), noise);
    const star = smoothstep(radius, float(0), length(point)).mul(
      step(float(seeds.starThreshold), noise),
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
    const starTint = mix(
      vec3(0.75, 0.84, 1.0),
      vec3(1.0, 0.94, 0.82),
      tintNoise,
    );
    const starGlow = starTint
      .mul(star)
      .mul(mix(float(0.45), float(1.15), bright))
      .mul(lift)
      .mul(sub(float(1), cloudMask.mul(float(0.94))));

    return gradient.add(starGlow);
  });
};

/**
 * Day sky: warm sun, sunny atmospheric gradient, and cartoon rounded-square clouds.
 */
const createDaySkyColor = (
  horizon: ILevelPalette["horizon"],
  zenith: ILevelPalette["zenith"],
  seeds: ReturnType<typeof generateSkySeeds>,
  skyDrift: UniformNode<"float", number>,
) => {
  const horizonColor = vec3(...horizon);
  const zenithColor = vec3(...zenith);
  const sunDirection = normalize(vec3(0.42, 0.58, -0.22));
  const sunColor = vec3(1.0, 0.96, 0.86);
  const haloColor = vec3(0.82, 0.9, 1.0);

  const cloudWhite = vec3(0.92, 0.95, 0.99);
  const cloudShadow = vec3(0.78, 0.84, 0.91);

  return Fn(() => {
    const direction = normalize(positionLocal);
    const lift = smoothstep(float(-0.05), float(0.72), direction.y);

    const baseUvX = atan(direction.z, direction.x).mul(INV_TWO_PI).add(0.5);
    const uvY = asin(clamp(direction.y, float(-1), float(1)))
      .mul(INV_PI)
      .add(0.5);

    const driftedUvX = baseUvX.add(skyDrift);
    const skyUv = vec2(driftedUvX, uvY);

    // Subtle cartoon rounded-square clouds
    const cloudDensity = createCartoonCloudDensity(
      skyUv,
      seeds.cloudScale1,
      seeds.cloudScale2,
      seeds.cloudPhase1,
      seeds.cloudPhase2,
    );

    const cloudMask = smoothstep(float(0.54), float(0.72), cloudDensity)
      .mul(smoothstep(float(0.08), float(0.56), direction.y))
      .mul(sub(float(1), smoothstep(float(0.70), float(0.96), direction.y)));

    const litClouds = mix(cloudShadow, cloudWhite, lift);
    const gradient = mix(
      mix(horizonColor, zenithColor, lift),
      litClouds,
      cloudMask.mul(float(0.82)),
    );

    const sunDot = max(dot(direction, sunDirection), float(0));
    const sunDisc = pow(sunDot, float(128)).mul(float(1.05));
    const sunHalo = pow(sunDot, float(10)).mul(float(0.2));

    return gradient.add(sunColor.mul(sunDisc)).add(haloColor.mul(sunHalo));
  });
};

const attachSkyMesh = (
  colorNodeBuilder: (
    driftUniform: UniformNode<"float", number>,
  ) => ReturnType<ReturnType<typeof createNightSkyColor>>,
): ISkybox => {
  const geometry = new BoxGeometry(1, 1, 1);
  const skyDrift = uniform(0, "float");

  const material = new MeshBasicNodeMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
  });

  material.colorNode = colorNodeBuilder(skyDrift);

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = SKY.RENDER_ORDER;
  mesh.scale.setScalar(SKY.SCALE);

  return {
    mesh,
    update: (speed: number, dt: number) => {
      // Moves very slowly as the player drives, scaling with vehicle speed and time
      const speedContribution = speed * SKY.DRIFT_SPEED_FACTOR;
      const baseContribution = SKY.DRIFT_BASE_RATE;
      skyDrift.value =
        (skyDrift.value + (speedContribution + baseContribution) * dt) % 1.0;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
};

export const createStarSky = (
  palette: Pick<ILevelPalette, "horizon" | "zenith">,
  options?: ISkyGenerationOptions,
): ISkybox => {
  const seeds = generateSkySeeds(options?.seed);
  return attachSkyMesh((skyDrift) =>
    createNightSkyColor(palette.horizon, palette.zenith, seeds, skyDrift)(),
  );
};

export const createDaySky = (
  palette: Pick<ILevelPalette, "horizon" | "zenith">,
  options?: ISkyGenerationOptions,
): ISkybox => {
  const seeds = generateSkySeeds(options?.seed);
  return attachSkyMesh((skyDrift) =>
    createDaySkyColor(palette.horizon, palette.zenith, seeds, skyDrift)(),
  );
};

export const createLevelSky = (
  palette: Pick<ILevelPalette, "horizon" | "zenith" | "skyMode">,
  options?: ISkyGenerationOptions,
): ISkybox => {
  const mode: LevelSkyMode = palette.skyMode ?? "night";

  return mode === "day"
    ? createDaySky(palette, options)
    : createStarSky(palette, options);
};
