import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { ASSET_KEY } from "../constants/assets";
import {
  HEAD_LAMP_SHAPE,
  HEADLIGHT_CONE,
  HEADLIGHT_SPOT,
  TAIL_LAMP_SHAPE,
  VEHICLE_BLUEPRINTS,
  VEHICLE_PART_ROLE,
  VEHICLE_STYLE,
  type LampLayout,
  type RoundedShape,
  type VehicleKind,
  type VehiclePartRole,
  type WheelLayout,
} from "../constants/vehicles";
import { HALF_PI, MIRRORED_SIDES } from "../constants/world";
import type { Vec3Tuple } from "../types";
import { createHeadlightCone } from "./headlightBeam";
import { sharedAssets } from "./sharedAssets";

export interface VehicleModelOptions {
  kind: VehicleKind;
  paint: number;
  lampBrightness: number;
  /** Adds real spot lights that illuminate the road. Expensive; meant for the player car only. */
  hasSpotlights: boolean;
}

export interface VehicleModel {
  readonly object: THREE.Group;
  readonly kind: VehicleKind;
  setPaint(color: number): void;
  setLampBrightness(brightness: number): void;
  /** Frees per-vehicle materials. Shared geometries and materials stay in `sharedAssets`. */
  dispose(): void;
}

interface LampMaterials {
  tail: THREE.MeshStandardMaterial;
  head: THREE.MeshStandardMaterial;
}

const roundedBoxGeometry = ({ size, radius }: RoundedShape): THREE.BufferGeometry => {
  const key = [ASSET_KEY.ROUNDED_BOX_GEOMETRY, ...size, radius].join(ASSET_KEY.SEPARATOR);
  return sharedAssets.geometry(key, () => new RoundedBoxGeometry(size[0], size[1], size[2], VEHICLE_STYLE.ROUNDED_SEGMENTS, radius));
};

const createPaintMaterial = (color: number): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({ color, roughness: VEHICLE_STYLE.PAINT.ROUGHNESS, metalness: VEHICLE_STYLE.PAINT.METALNESS });
};

const createLampMaterial = (color: number): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({ color, emissive: color, roughness: VEHICLE_STYLE.LAMP.ROUGHNESS, metalness: VEHICLE_STYLE.LAMP.METALNESS });
};

const getGlassMaterial = (): THREE.Material => {
  const { COLOR, ROUGHNESS, METALNESS } = VEHICLE_STYLE.GLASS;
  return sharedAssets.material(ASSET_KEY.GLASS_MATERIAL, () => new THREE.MeshStandardMaterial({ color: COLOR, roughness: ROUGHNESS, metalness: METALNESS }));
};

const getTrimMaterial = (): THREE.Material => {
  const { COLOR, ROUGHNESS, METALNESS } = VEHICLE_STYLE.TRIM;
  return sharedAssets.material(ASSET_KEY.TRIM_MATERIAL, () => new THREE.MeshStandardMaterial({ color: COLOR, roughness: ROUGHNESS, metalness: METALNESS }));
};

const addRounded = (group: THREE.Group, shape: RoundedShape, position: Vec3Tuple, material: THREE.Material) => {
  const mesh = new THREE.Mesh(roundedBoxGeometry(shape), material);
  mesh.position.set(position[0], position[1], position[2]);
  group.add(mesh);
};

const addWheels = (group: THREE.Group, { frontZ, rearZ, halfTrack }: WheelLayout) => {
  const { RADIUS, WIDTH, SEGMENTS, Y, COLOR, ROUGHNESS, METALNESS } = VEHICLE_STYLE.WHEEL;
  const geometry = sharedAssets.geometry(ASSET_KEY.WHEEL_GEOMETRY, () => new THREE.CylinderGeometry(RADIUS, RADIUS, WIDTH, SEGMENTS));
  const material = sharedAssets.material(ASSET_KEY.WHEEL_MATERIAL, () => new THREE.MeshStandardMaterial({ color: COLOR, roughness: ROUGHNESS, metalness: METALNESS }));
  for (const z of [frontZ, rearZ]) {
    for (const side of MIRRORED_SIDES) {
      const wheel = new THREE.Mesh(geometry, material);
      wheel.rotation.z = HALF_PI;
      wheel.position.set(side * halfTrack, Y, z);
      group.add(wheel);
    }
  }
};

const addSpotlight = (group: THREE.Group, origin: Vec3Tuple): THREE.SpotLight => {
  const { COLOR, INTENSITY, DISTANCE, ANGLE, PENUMBRA, DECAY, TARGET_DROP, TARGET_DISTANCE } = HEADLIGHT_SPOT;
  const [x, y, z] = origin;
  const spot = new THREE.SpotLight(COLOR, INTENSITY, DISTANCE, ANGLE, PENUMBRA, DECAY);
  spot.position.set(x, y, z);
  spot.target.position.set(x, y - TARGET_DROP, z + TARGET_DISTANCE);
  group.add(spot, spot.target);
  return spot;
};

const addLamps = (group: THREE.Group, lamps: LampLayout, materials: LampMaterials, hasSpotlights: boolean): THREE.SpotLight[] => {
  const spotlights: THREE.SpotLight[] = [];
  for (const side of MIRRORED_SIDES) {
    const x = side * lamps.halfSpan;
    addRounded(group, TAIL_LAMP_SHAPE, [x, lamps.tailY, lamps.tailZ], materials.tail);
    addRounded(group, HEAD_LAMP_SHAPE, [x, lamps.headY, lamps.headZ], materials.head);

    const beamOrigin: Vec3Tuple = [x, lamps.headY, lamps.headZ + HEADLIGHT_CONE.ORIGIN_OFFSET_Z];
    const cone = createHeadlightCone();
    cone.position.set(beamOrigin[0], beamOrigin[1], beamOrigin[2]);
    group.add(cone);
    if (hasSpotlights) {
      spotlights.push(addSpotlight(group, beamOrigin));
    }
  }
  return spotlights;
};

export const createVehicleModel = ({ kind, paint, lampBrightness, hasSpotlights }: VehicleModelOptions): VehicleModel => {
  const blueprint = VEHICLE_BLUEPRINTS[kind];
  const object = new THREE.Group();
  const paintMaterial = createPaintMaterial(blueprint.fixedPaint ?? paint);
  const lampMaterials: LampMaterials = {
    tail: createLampMaterial(VEHICLE_STYLE.LAMP_COLOR.TAIL),
    head: createLampMaterial(VEHICLE_STYLE.LAMP_COLOR.HEAD),
  };
  const ownedMaterials: THREE.Material[] = [paintMaterial, lampMaterials.tail, lampMaterials.head];
  let signMaterial: THREE.MeshStandardMaterial | null = null;

  const materialFor = (role: VehiclePartRole): THREE.Material => {
    switch (role) {
      case VEHICLE_PART_ROLE.PAINT:
        return paintMaterial;
      case VEHICLE_PART_ROLE.GLASS:
        return getGlassMaterial();
      case VEHICLE_PART_ROLE.TRIM:
        return getTrimMaterial();
      case VEHICLE_PART_ROLE.SIGN:
        if (!signMaterial) {
          signMaterial = createLampMaterial(VEHICLE_STYLE.LAMP_COLOR.SIGN);
          ownedMaterials.push(signMaterial);
        }
        return signMaterial;
    }
  };

  for (const part of blueprint.parts) {
    addRounded(object, part, part.position, materialFor(part.role));
  }
  addWheels(object, blueprint.wheels);
  const spotlights = addLamps(object, blueprint.lamps, lampMaterials, hasSpotlights);

  const setLampBrightness = (brightness: number) => {
    lampMaterials.tail.emissiveIntensity = brightness;
    lampMaterials.head.emissiveIntensity = Math.max(VEHICLE_STYLE.HEAD_BRIGHTNESS.MIN, brightness * VEHICLE_STYLE.HEAD_BRIGHTNESS.RATIO);
    if (signMaterial) {
      signMaterial.emissiveIntensity = Math.max(VEHICLE_STYLE.SIGN_BRIGHTNESS_MIN, brightness);
    }
  };
  setLampBrightness(lampBrightness);

  return {
    object,
    kind,
    setPaint: (color) => {
      if (blueprint.fixedPaint === undefined) {
        paintMaterial.color.setHex(color);
      }
    },
    setLampBrightness,
    dispose: () => {
      ownedMaterials.forEach((material) => material.dispose());
      spotlights.forEach((spotlight) => spotlight.dispose());
      object.removeFromParent();
    },
  };
};
