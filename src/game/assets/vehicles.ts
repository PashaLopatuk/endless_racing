import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const VEHICLE_KIND = {
  SEDAN: "sedan",
  HATCHBACK: "hatchback",
  VAN: "van",
  PICKUP: "pickup",
  TAXI: "taxi",
} as const;

export type VehicleKind = (typeof VEHICLE_KIND)[keyof typeof VEHICLE_KIND];

export const VEHICLE_KINDS: readonly VehicleKind[] = [
  VEHICLE_KIND.SEDAN,
  VEHICLE_KIND.HATCHBACK,
  VEHICLE_KIND.VAN,
  VEHICLE_KIND.PICKUP,
  VEHICLE_KIND.TAXI,
];

const GLASS_COLOR = 0x24303a;
const WHEEL_COLOR = 0x1a1c20;
const TAIL_COLOR = 0xff2d2d;
const HEAD_COLOR = 0xfff3cf;
const WHEEL_SEGMENTS = 20;

const bodyMaterial = (color: number): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.46,
    metalness: 0.12,
    flatShading: false,
  });
};

const glassMaterial = (): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color: GLASS_COLOR,
    roughness: 0.18,
    metalness: 0.04,
    flatShading: false,
  });
};

const lampMaterial = (color: number, brightness: number): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: brightness,
    roughness: 0.32,
    metalness: 0,
    flatShading: false,
  });
};

const addRounded = (
  group: THREE.Group,
  width: number,
  height: number,
  depth: number,
  radius: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  name?: string,
): THREE.Mesh => {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 3, radius), material);
  mesh.position.set(x, y, z);
  if (name) {
    mesh.name = name;
  }
  group.add(mesh);
  return mesh;
};

const addWheels = (group: THREE.Group, zFront: number, zRear: number, x: number) => {
  const material = new THREE.MeshStandardMaterial({
    color: WHEEL_COLOR,
    roughness: 0.7,
    metalness: 0.05,
    flatShading: false,
  });
  const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.22, WHEEL_SEGMENTS);
  for (const [wheelX, wheelZ] of [
    [-x, zFront],
    [x, zFront],
    [-x, zRear],
    [x, zRear],
  ] as const) {
    const wheel = new THREE.Mesh(geometry, material);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wheelX, -0.2, wheelZ);
    group.add(wheel);
  }
};

const addHeadlightBeam = (group: THREE.Group, x: number, y: number, z: number) => {
  const beam = new THREE.SpotLight(0xfff4d2, 7, 32, 0.38, 0.45, 1.15);
  beam.position.set(x, y, z);
  const target = new THREE.Object3D();
  target.position.set(x, y - 0.35, z + 16);
  group.add(beam);
  group.add(target);
  beam.target = target;
};

const addLamps = (
  group: THREE.Group,
  brightness: number,
  tailY: number,
  tailZ: number,
  headY: number,
  headZ: number,
  span: number,
) => {
  const tail = lampMaterial(TAIL_COLOR, brightness);
  const head = lampMaterial(HEAD_COLOR, Math.max(2.2, brightness * 2.4));
  for (const side of [-1, 1]) {
    const headX = side * span;
    addRounded(group, 0.24, 0.14, 0.08, 0.03, side * span, tailY, tailZ, tail, "lamp-tail");
    addRounded(group, 0.32, 0.16, 0.1, 0.04, headX, headY, headZ, head, "lamp-head");
    addHeadlightBeam(group, headX, headY, headZ + 0.12);
  }
};

const createSedan = (color: number, brightness: number, withSign: boolean): THREE.Group => {
  const group = new THREE.Group();
  const paint = bodyMaterial(color);
  addRounded(group, 1.68, 0.46, 3.2, 0.14, 0, -0.02, 0, paint, "chassis");
  addRounded(group, 1.42, 0.4, 1.55, 0.12, 0, 0.34, -0.12, glassMaterial());
  addWheels(group, 1.02, -1.02, 0.74);
  addLamps(group, brightness, 0.08, -1.58, 0.06, 1.58, 0.52);
  if (withSign) {
    addRounded(group, 0.46, 0.12, 0.16, 0.03, 0, 0.62, -0.05, lampMaterial(0xfff6d8, Math.max(brightness, 0.8)), "lamp-sign");
  }
  return group;
};

const createHatchback = (color: number, brightness: number): THREE.Group => {
  const group = new THREE.Group();
  const paint = bodyMaterial(color);
  addRounded(group, 1.62, 0.5, 2.75, 0.16, 0, 0, -0.05, paint, "chassis");
  addRounded(group, 1.4, 0.46, 1.35, 0.14, 0, 0.4, -0.28, glassMaterial());
  addWheels(group, 0.82, -0.9, 0.72);
  addLamps(group, brightness, 0.12, -1.38, 0.1, 1.32, 0.5);
  return group;
};

const createVan = (color: number, brightness: number): THREE.Group => {
  const group = new THREE.Group();
  const paint = bodyMaterial(color);
  addRounded(group, 1.78, 0.92, 3.25, 0.12, 0, 0.22, 0, paint, "chassis");
  addRounded(group, 1.5, 0.42, 0.1, 0.03, 0, 0.48, 1.56, glassMaterial());
  addWheels(group, 1.05, -1.05, 0.78);
  addLamps(group, brightness, 0.28, -1.6, 0.22, 1.62, 0.58);
  return group;
};

const createPickup = (color: number, brightness: number): THREE.Group => {
  const group = new THREE.Group();
  const paint = bodyMaterial(color);
  const bed = bodyMaterial(0x2a241e);
  addRounded(group, 1.7, 0.4, 3.3, 0.1, 0, -0.06, 0.05, paint, "chassis");
  addRounded(group, 1.55, 0.48, 1.15, 0.1, 0, 0.32, 0.72, glassMaterial());
  addRounded(group, 1.62, 0.28, 1.35, 0.06, 0, 0.08, -0.85, bed);
  addWheels(group, 1.05, -1.08, 0.76);
  addLamps(group, brightness, 0.08, -1.62, 0.1, 1.64, 0.54);
  return group;
};

export const getVehicleModel = (kind: VehicleKind, color: number, brightness: number): THREE.Group => {
  switch (kind) {
    case VEHICLE_KIND.HATCHBACK:
      return createHatchback(color, brightness);
    case VEHICLE_KIND.VAN:
      return createVan(color, brightness);
    case VEHICLE_KIND.PICKUP:
      return createPickup(color, brightness);
    case VEHICLE_KIND.TAXI:
      return createSedan(0xe2b13c, brightness, true);
    case VEHICLE_KIND.SEDAN:
      return createSedan(color, brightness, false);
  }
};

export const getCarModel = (bodyColor: number): THREE.Group => {
  return getVehicleModel(VEHICLE_KIND.SEDAN, bodyColor, 0.85);
};
