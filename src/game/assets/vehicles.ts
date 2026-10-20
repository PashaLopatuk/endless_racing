import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { ASSET_KEY } from "../constants/assets";
import {
  HEAD_LAMP_SHAPE,
  HEADLIGHT_CONE,
  HEADLIGHT_POOL,
  HEADLIGHT_SPOT,
  REAR_DAY_LAMP_LAYOUT,
  REAR_DAY_LAMP_SHAPE,
  TAIL_LAMP_SHAPE,
  VEHICLE_BLUEPRINTS,
  VEHICLE_PART_ROLE,
  VEHICLE_STYLE,
  VEHICLES_SIZE_RATIO,
  type ILampLayout,
  type INpcTailLampStyle,
  type IRoundedShape,
  type VehicleKind,
  type VehiclePartRole,
  type IWheelLayout,
} from "../constants/vehicles";
import { SCENE_BRIGHTNESS } from "../constants/sceneBrightness";
import { HALF_PI, MIRRORED_SIDES } from "../constants/world";
import type { Vec3Tuple } from "../types";
import { createHeadlightCone } from "./headlightBeam";
import { sharedAssets } from "./sharedAssets";

export interface IVehicleModelOptions {
  kind: VehicleKind;
  paint: number;
  lampBrightness: number;
  /** Headlight cones + spot/pool lights. Player only; NPCs use emissive lamps only. */
  hasSpotlights: boolean;
  /** Whether this is the player's car. */
  isPlayer?: boolean;
  /** NPC tail emissive layout; player uses the default round lamp. */
  tailLampStyle?: INpcTailLampStyle;
  /** Head emissive color (day DRL yellow on NPCs). */
  headLampColor?: number;
  /** Rear emissive DRL yellow (day NPCs); omitted at night. */
  rearDayLampColor?: number;
  /** Index into `NPC_TAIL_LAMP_STYLES` for pooling comparisons. */
  tailLampStyleId?: number;
}

export interface IVehicleModel {
  readonly object: THREE.Group;
  readonly kind: VehicleKind;
  readonly tailLampStyleId: number;
  readonly hasRearDayLamps: boolean;
  setPaint(color: number): void;
  setLampBrightness(brightness: number): void;
  setLampColors(tailColor: number, headColor: number, rearDayColor?: number): void;
  /** Frees per-vehicle materials. Shared geometries and materials stay in `sharedAssets`. */
  dispose(): void;
}

interface ILampMaterials {
  tail: THREE.MeshStandardMaterial;
  head: THREE.MeshStandardMaterial;
  rearDay: THREE.MeshStandardMaterial | null;
}

const roundedBoxGeometry = ({
  size,
  radius,
}: IRoundedShape): THREE.BufferGeometry => {
  const key = [ASSET_KEY.ROUNDED_BOX_GEOMETRY, ...size, radius].join(
    ASSET_KEY.SEPARATOR,
  );
  return sharedAssets.geometry(
    key,
    () =>
      new RoundedBoxGeometry(
        size[0],
        size[1],
        size[2],
        VEHICLE_STYLE.ROUNDED_SEGMENTS,
        radius,
      ),
  );
};

const createPaintMaterial = (
  color: number,
  emissiveIntensity: number,
): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    roughness: VEHICLE_STYLE.PAINT.ROUGHNESS,
    metalness: VEHICLE_STYLE.PAINT.METALNESS,
  });
};

const createLampMaterial = (color: number): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    roughness: VEHICLE_STYLE.LAMP.ROUGHNESS,
    metalness: VEHICLE_STYLE.LAMP.METALNESS,
  });
};

const getGlassMaterial = (): THREE.Material => {
  const { COLOR, ROUGHNESS, METALNESS } = VEHICLE_STYLE.GLASS;
  return sharedAssets.material(
    ASSET_KEY.GLASS_MATERIAL,
    () =>
      new THREE.MeshStandardMaterial({
        color: COLOR,
        roughness: ROUGHNESS,
        metalness: METALNESS,
      }),
  );
};

const getTrimMaterial = (): THREE.Material => {
  const { COLOR, ROUGHNESS, METALNESS } = VEHICLE_STYLE.TRIM;
  return sharedAssets.material(
    ASSET_KEY.TRIM_MATERIAL,
    () =>
      new THREE.MeshStandardMaterial({
        color: COLOR,
        roughness: ROUGHNESS,
        metalness: METALNESS,
      }),
  );
};

const addRounded = (
  group: THREE.Group,
  shape: IRoundedShape,
  position: Vec3Tuple,
  material: THREE.Material,
) => {
  const mesh = new THREE.Mesh(roundedBoxGeometry(shape), material);
  mesh.position.set(position[0], position[1], position[2]);
  group.add(mesh);
};

const addWheels = (
  group: THREE.Group,
  { frontZ, rearZ, halfTrack, extraRearZ }: IWheelLayout,
) => {
  const { RADIUS, WIDTH, SEGMENTS, Y, COLOR, ROUGHNESS, METALNESS } =
    VEHICLE_STYLE.WHEEL;

  const geometry = sharedAssets.geometry(
    ASSET_KEY.WHEEL_GEOMETRY,
    () => new THREE.CylinderGeometry(RADIUS, RADIUS, WIDTH, SEGMENTS),
  );
  const material = sharedAssets.material(
    ASSET_KEY.WHEEL_MATERIAL,
    () =>
      new THREE.MeshStandardMaterial({
        color: COLOR,
        roughness: ROUGHNESS,
        metalness: METALNESS,
      }),
  );

  const zList =
    extraRearZ !== undefined ? [frontZ, rearZ, extraRearZ] : [frontZ, rearZ];

  for (const z of zList) {
    for (const side of MIRRORED_SIDES) {
      const wheel = new THREE.Mesh(geometry, material);
      wheel.rotation.z = HALF_PI;
      wheel.position.set(side * halfTrack, Y, z);
      group.add(wheel);
    }
  }
};

const addSpotlight = (
  group: THREE.Group,
  origin: Vec3Tuple,
): THREE.SpotLight => {
  const {
    COLOR,
    INTENSITY,
    DISTANCE,
    ANGLE,
    PENUMBRA,
    DECAY,
    TARGET_DROP,
    TARGET_DISTANCE,
  } = HEADLIGHT_SPOT;
  const [x, y, z] = origin;

  const spot = new THREE.SpotLight(
    COLOR,
    INTENSITY,
    DISTANCE,
    ANGLE,
    PENUMBRA,
    DECAY,
  );

  spot.position.set(x, y, z);
  spot.target.position.set(x, y - TARGET_DROP, z + TARGET_DISTANCE);

  group.add(spot, spot.target);

  return spot;
};

const addTailLampMeshes = (
  group: THREE.Group,
  side: number,
  lamps: ILampLayout,
  style: INpcTailLampStyle,
  material: THREE.Material,
) => {
  const x = side * lamps.halfSpan;

  addRounded(
    group,
    style.primary,
    [x, lamps.tailY, lamps.tailZ],
    material,
  );

  if (!style.accent) {
    return;
  }

  const [dx, dy, dz] = style.accent.offset;

  addRounded(
    group,
    style.accent.shape,
    [x + dx, lamps.tailY + dy, lamps.tailZ + dz],
    material,
  );
};

const addRearDayLampMeshes = (
  group: THREE.Group,
  side: number,
  lamps: ILampLayout,
  material: THREE.Material,
) => {
  const x = side * lamps.halfSpan;

  addRounded(
    group,
    REAR_DAY_LAMP_SHAPE,
    [
      x,
      lamps.tailY + REAR_DAY_LAMP_LAYOUT.Y_OFFSET,
      lamps.tailZ + REAR_DAY_LAMP_LAYOUT.Z_OFFSET,
    ],
    material,
  );
};

const addLamps = (
  group: THREE.Group,
  lamps: ILampLayout,
  materials: ILampMaterials,
  hasSpotlights: boolean,
  tailLampStyle: INpcTailLampStyle,
): THREE.Light[] => {
  const dynamicLights: THREE.Light[] = [];

  for (const side of MIRRORED_SIDES) {
    const x = side * lamps.halfSpan;

    addTailLampMeshes(group, side, lamps, tailLampStyle, materials.tail);

    if (materials.rearDay) {
      addRearDayLampMeshes(group, side, lamps, materials.rearDay);
    }

    addRounded(
      group,
      HEAD_LAMP_SHAPE,
      [x, lamps.headY, lamps.headZ],
      materials.head,
    );

    if (!hasSpotlights) {
      continue;
    }

    const beamOrigin: Vec3Tuple = [
      x,
      lamps.headY,
      lamps.headZ + HEADLIGHT_CONE.ORIGIN_OFFSET_Z,
    ];
    const cone = createHeadlightCone();

    cone.position.set(beamOrigin[0], beamOrigin[1], beamOrigin[2]);

    group.add(cone);

    dynamicLights.push(addSpotlight(group, beamOrigin));

    const pool = new THREE.PointLight(
      HEADLIGHT_POOL.COLOR,
      HEADLIGHT_POOL.INTENSITY,
      HEADLIGHT_POOL.DISTANCE,
      HEADLIGHT_POOL.DECAY,
    );

    pool.position.set(x, HEADLIGHT_POOL.Y, lamps.headZ + HEADLIGHT_POOL.Z_OFFSET);
    group.add(pool);
    dynamicLights.push(pool);
  }

  return dynamicLights;
};

const defaultTailLampStyle = (): INpcTailLampStyle => ({
  primary: TAIL_LAMP_SHAPE,
  color: VEHICLE_STYLE.LAMP_COLOR.TAIL,
});

export const createVehicleModel = ({
  kind,
  paint,
  lampBrightness,
  hasSpotlights,
  tailLampStyle,
  headLampColor,
  rearDayLampColor,
  isPlayer,
  tailLampStyleId = -1,
}: IVehicleModelOptions): IVehicleModel => {
  const blueprint = VEHICLE_BLUEPRINTS[kind];
  const object = new THREE.Group();
  const resolvedTailStyle = tailLampStyle ?? defaultTailLampStyle();
  const resolvedHeadColor =
    headLampColor ?? VEHICLE_STYLE.LAMP_COLOR.HEAD;
  const isHeroCar = isPlayer ?? hasSpotlights;
  const hasRearDayLamps = !isHeroCar && rearDayLampColor !== undefined;
  const paintEmissive = isHeroCar
    ? SCENE_BRIGHTNESS.VEHICLE.PLAYER_PAINT_EMISSIVE
    : SCENE_BRIGHTNESS.VEHICLE.NPC_PAINT_EMISSIVE;
  const paintMaterial = createPaintMaterial(
    blueprint.fixedPaint ?? paint,
    paintEmissive,
  );

  const rearDayMaterial = hasRearDayLamps
    ? createLampMaterial(rearDayLampColor)
    : null;

  const lampMaterials: ILampMaterials = {
    tail: createLampMaterial(resolvedTailStyle.color),
    head: createLampMaterial(resolvedHeadColor),
    rearDay: rearDayMaterial,
  };

  const ownedMaterials: THREE.Material[] = [
    paintMaterial,
    lampMaterials.tail,
    lampMaterials.head,
  ];

  if (rearDayMaterial) {
    ownedMaterials.push(rearDayMaterial);
  }
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

  const dynamicLights = addLamps(
    object,
    blueprint.lamps,
    lampMaterials,
    hasSpotlights,
    resolvedTailStyle,
  );

  const setLampColors = (
    tailColor: number,
    headColor: number,
    rearDayColor?: number,
  ) => {
    lampMaterials.tail.color.setHex(tailColor);
    lampMaterials.tail.emissive.setHex(tailColor);
    lampMaterials.head.color.setHex(headColor);
    lampMaterials.head.emissive.setHex(headColor);

    if (lampMaterials.rearDay && rearDayColor !== undefined) {
      lampMaterials.rearDay.color.setHex(rearDayColor);
      lampMaterials.rearDay.emissive.setHex(rearDayColor);
    }
  };

  const headEmissiveIntensity = (brightness: number) =>
    Math.max(
      VEHICLE_STYLE.HEAD_BRIGHTNESS.MIN,
      brightness * VEHICLE_STYLE.HEAD_BRIGHTNESS.RATIO,
    );

  const rearAmberEmissiveIntensity = (brightness: number) =>
    Math.max(
      VEHICLE_STYLE.REAR_AMBER_BRIGHTNESS.MIN,
      brightness * VEHICLE_STYLE.REAR_AMBER_BRIGHTNESS.RATIO,
    );

  const setLampBrightness = (brightness: number) => {
    lampMaterials.tail.emissiveIntensity = brightness;
    const headIntensity = headEmissiveIntensity(brightness);

    lampMaterials.head.emissiveIntensity = headIntensity;

    if (lampMaterials.rearDay) {
      lampMaterials.rearDay.emissiveIntensity =
        rearAmberEmissiveIntensity(brightness);
    }

    if (signMaterial) {
      signMaterial.emissiveIntensity = Math.max(
        VEHICLE_STYLE.SIGN_BRIGHTNESS_MIN,
        brightness,
      );
    }
  };

  setLampBrightness(lampBrightness);

  object.scale.setScalar(VEHICLES_SIZE_RATIO);

  return {
    object,
    kind,
    tailLampStyleId,
    hasRearDayLamps,
    setPaint: (color) => {
      if (blueprint.fixedPaint === undefined) {
        paintMaterial.color.setHex(color);
        paintMaterial.emissive.setHex(color);
      }
    },
    setLampBrightness,
    setLampColors,
    dispose: () => {
      ownedMaterials.forEach((material) => material.dispose());
      dynamicLights.forEach((light) => light.dispose());
      object.removeFromParent();
    },
  };
};
