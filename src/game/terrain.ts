import * as THREE from "three";
import { GROUND } from "./constants/camera";
import { HALF_PI } from "./constants/world";
import type { ILevelPalette } from "./levels";

export const createGround = (
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

export const addGlobalLight = (scene: THREE.Scene, palette: ILevelPalette) => {
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

const DAY_FOG_HAZE_DIM = 0.84;

export const createFogHaze = (palette: ILevelPalette): THREE.Color => {
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

const DAY_FOG_CURVE = 0.74;


