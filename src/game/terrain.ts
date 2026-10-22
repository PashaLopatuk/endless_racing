import * as THREE from "three";
import { GROUND } from "./constants/camera";
import { HALF_PI } from "./constants/world";
import {
  createHollywoodMountainModel,
  createLeftMountainModel,
} from "./assets/mountains";
import type {
  HorizonSide,
  IImageLandscapeSpriteConfig,
  ILandscapeSpriteConfig,
  ILevelPalette,
  IModelLandscapeSpriteConfig,
  IMountainModelOptions,
  ITerrainConfig,
} from "./levels";

export { createHollywoodMountainModel, createLeftMountainModel };

export type {
  HorizonSide,
  IImageLandscapeSpriteConfig,
  ILandscapeSpriteConfig,
  IModelLandscapeSpriteConfig,
  IMountainModelOptions,
};

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

export interface ILandscapeItem {
  readonly object: THREE.Object3D;
  dispose(): void;
}

export interface ILandscapeGroup {
  readonly group: THREE.Group;
  dispose(): void;
}

/** Default positions per horizon side (places sprites at the horizon along Z). */
const DEFAULT_HORIZON_POSITIONS: Record<HorizonSide, [number, number, number]> = {
  center: [0, -3.5, 235],
  left: [-65, -3.5, 258],
  right: [65, -3.5, 258],
};

const applyTransform = (
  object: THREE.Object3D,
  position?: [number, number, number],
  scale?: number | [number, number] | [number, number, number],
  rotation?: [number, number, number],
  defaultPosition?: [number, number, number],
  baseRotationY: number = 0,
) => {
  const targetPos = position ?? defaultPosition ?? [0, 0, 240];
  object.position.set(...targetPos);

  if (scale !== undefined) {
    if (typeof scale === "number") {
      object.scale.setScalar(scale);
    } else if (scale.length === 2) {
      object.scale.set(scale[0], scale[1], 1);
    } else if (scale.length === 3) {
      object.scale.set(...scale);
    }
  }

  object.rotation.set(
    rotation?.[0] ?? 0,
    (rotation?.[1] ?? 0) + baseRotationY,
    rotation?.[2] ?? 0,
  );
};

const disposeObjectTree = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      for (const mat of materials) {
        if (!mat) continue;
        if ("map" in mat && mat.map instanceof THREE.Texture) {
          mat.map.dispose();
        }
        mat.dispose();
      }
    }
  });
};

/**
 * Creates an image-based landscape sprite (e.g. downtown skyline backdrop).
 */
export const createImageLandscapeSprite = (
  config: IImageLandscapeSpriteConfig,
): ILandscapeItem => {
  const width = config.width ?? 82;
  const height = config.height ?? 46;

  const geometry = new THREE.PlaneGeometry(width, height);
  // Bottom-center pivot so the sprite's position Y represents the base sitting on the horizon
  geometry.translate(0, height / 2, 0);

  let texture: THREE.Texture;
  let ownsTexture = false;

  if (typeof config.textureUrl === "string") {
    texture = new THREE.TextureLoader().load(config.textureUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    ownsTexture = true;
  } else {
    texture = config.textureUrl;
  }

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: config.fog ?? true,
    opacity: config.opacity ?? 1,
    alphaTest: config.alphaTest ?? 0.01,
    ...(config.tint !== undefined ? { color: config.tint } : {}),
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = config.id ?? `landscape-image-${config.side ?? "center"}`;
  mesh.renderOrder = config.renderOrder ?? 10;

  const side = config.side ?? "center";
  const defaultPos = DEFAULT_HORIZON_POSITIONS[side];

  // Face -Z (towards the camera) by default
  applyTransform(mesh, config.position, config.scale, config.rotation, defaultPos, Math.PI);

  return {
    object: mesh,
    dispose: () => {
      geometry.dispose();
      material.dispose();
      if (ownsTexture) {
        texture.dispose();
      }
    },
  };
};

/**
 * Creates a Hollywood sign mesh with crisp typography on support stilts.
 */
const createHollywoodSignMesh = (
  text: string = "HOLLYWOOD",
  signColor: number = 0xffffff,
): { object: THREE.Group; dispose(): void } => {
  const group = new THREE.Group();
  group.name = "hollywood-sign";

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 192;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `#${signColor.toString(16).padStart(6, "0")}`;
    ctx.font = "900 110px 'Impact', 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const spacedText = text.split("").join(" ");
    ctx.fillText(spacedText, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const signWidth = 18;
  const signHeight = 3.4;
  const signGeometry = new THREE.PlaneGeometry(signWidth, signHeight);
  signGeometry.translate(0, signHeight / 2, 0);

  const signMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const signMesh = new THREE.Mesh(signGeometry, signMaterial);
  group.add(signMesh);

  // Support posts behind the sign
  const postGeometry = new THREE.BoxGeometry(0.12, 2.4, 0.12);
  const postMaterial = new THREE.MeshLambertMaterial({ color: 0x5a4838 });
  const postCount = 6;
  const postStep = (signWidth - 1) / (postCount - 1);

  for (let i = 0; i < postCount; i += 1) {
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(-signWidth / 2 + 0.5 + i * postStep, 0.6, 0.1);
    group.add(post);
  }

  return {
    object: group,
    dispose: () => {
      signGeometry.dispose();
      signMaterial.dispose();
      texture.dispose();
      postGeometry.dispose();
      postMaterial.dispose();
    },
  };
};

/**
 * Procedural low-poly mountain model generator for horizon framing.
 */
export const createMountainModel = (
  options: IMountainModelOptions = {},
): ILandscapeItem => {
  const {
    width = 140,
    height = 38,
    depth = 70,
    segmentsX = 24,
    segmentsZ = 12,
    color = 0x9e6a6a,
    seed = 7919,
    side = "left",
    showHollywoodSign = false,
    signText = "HOLLYWOOD",
    signColor = 0xffffff,
  } = options;

  const group = new THREE.Group();
  group.name = `mountain-${side}`;

  const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
  geometry.rotateX(-HALF_PI);

  const pos = geometry.attributes.position;
  const isLeft = side === "left";

  let s = (Math.abs(seed) % 2147483647) || 1;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let i = 0; i < pos.count; i += 1) {
    let x = pos.getX(i);
    let z = pos.getZ(i);

    const u = (x + width / 2) / width; // 0 to 1
    const vz = z / (depth / 2); // -1 to 1

    // Road is at +X for left mountains, and -X for right mountains
    const roadDist = isLeft ? Math.max(0, 1 - u) : Math.max(0, u);
    const roadSlope = Math.pow(roadDist, 1.25);
    const edgeZ = Math.cos(Math.min(1, Math.abs(vz)) * HALF_PI);

    // Multi-harmonic ridge waves
    const wave1 = Math.sin(roadDist * 7.5 + seed * 0.1) * 0.5 + 0.5;
    const wave2 = Math.cos(vz * 3.5 + roadDist * 4.0 + seed * 0.3) * 0.3;
    const wave3 = Math.sin(roadDist * 14.0 + vz * 6.0 + seed * 0.7) * 0.15;
    const ridge = Math.max(0, wave1 + wave2 + wave3);

    let y = height * roadSlope * edgeZ * ridge;

    const isBorder = (isLeft ? u >= 0.96 : u <= 0.04) || Math.abs(vz) >= 0.96;
    if (isBorder) {
      // Pin perimeter vertices into the ground plane
      y = -4;
    } else {
      // Jitter interior vertices for stylized low-poly faceted appearance
      x += (rng() - 0.5) * (width / segmentsX) * 0.45;
      z += (rng() - 0.5) * (depth / segmentsZ) * 0.45;
    }

    pos.setXYZ(i, x, y, z);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();

  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const mountainMesh = new THREE.Mesh(geometry, material);
  group.add(mountainMesh);

  let signDisposer: (() => void) | null = null;

  if (showHollywoodSign) {
    const sign = createHollywoodSignMesh(signText, signColor);
    signDisposer = sign.dispose;

    // Position sign on hillside slope facing the road/camera
    sign.object.position.set(-22, 13.5, -6);
    sign.object.rotation.set(-0.15, -0.22, 0.05);
    group.add(sign.object);
  }

  return {
    object: group,
    dispose: () => {
      geometry.dispose();
      material.dispose();
      signDisposer?.();
    },
  };
};

/**
 * Creates a model-based landscape sprite (e.g. low-poly mountains or custom 3D model).
 */
export const createModelLandscapeSprite = (
  config: IModelLandscapeSpriteConfig,
): ILandscapeItem => {
  let modelItem: ILandscapeItem;

  if (typeof config.model === "function") {
    const object = config.model();
    modelItem = {
      object,
      dispose: () => disposeObjectTree(object),
    };
  } else if (config.model instanceof THREE.Object3D) {
    const object = config.model;
    modelItem = {
      object,
      dispose: () => disposeObjectTree(object),
    };
  } else {
    // Preset strings
    const side = config.side ?? (config.model === "hollywood_mountain" ? "right" : "left");

    if (config.model === "hollywood_mountain") {
      modelItem = createHollywoodMountainModel({
        side: "right",
        showHollywoodSign: true,
        ...config.options,
      });
    } else if (config.model === "mountain") {
      if (side === "left") {
        modelItem = createLeftMountainModel({
          side: "left",
          ...config.options,
        });
      } else {
        modelItem = createHollywoodMountainModel({
          side: "right",
          showHollywoodSign: true,
          ...config.options,
        });
      }
    } else if (config.model === "hills") {
      modelItem = createMountainModel({
        side,
        height: 22,
        depth: 55,
        ...config.options,
      });
    } else {
      modelItem = side === "left"
        ? createLeftMountainModel({ side: "left", ...config.options })
        : createHollywoodMountainModel({ side: "right", ...config.options });
    }
  }

  const side = config.side ?? "center";
  const defaultPos = DEFAULT_HORIZON_POSITIONS[side];

  applyTransform(
    modelItem.object,
    config.position,
    config.scale,
    config.rotation,
    defaultPos,
    0,
  );

  modelItem.object.renderOrder = config.renderOrder ?? 1;

  return modelItem;
};

/**
 * Creates and manages all landscape sprites configured on the terrain.
 */
export const createLandscapeSprites = (
  terrain: ITerrainConfig,
): ILandscapeGroup => {
  const group = new THREE.Group();
  group.name = "landscape-sprites-root";

  const disposables: Array<{ dispose(): void }> = [];

  const configs = terrain.landscapeSprites ?? [];

  for (const spriteConfig of configs) {
    if (spriteConfig.type === "image") {
      const item = createImageLandscapeSprite(spriteConfig);
      group.add(item.object);
      disposables.push(item);
    } else if (spriteConfig.type === "model") {
      const item = createModelLandscapeSprite(spriteConfig);
      group.add(item.object);
      disposables.push(item);
    }
  }

  return {
    group,
    dispose: () => {
      for (const item of disposables) {
        item.dispose();
      }
      disposables.length = 0;
      group.clear();
    },
  };
};
