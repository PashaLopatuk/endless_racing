import * as THREE from "three";

export type StreetModel = {
  object: THREE.Group;
  width: number;
  depth: number;
};

export const lambert = (color: number): THREE.MeshLambertMaterial => {
  return new THREE.MeshLambertMaterial({ color, flatShading: true });
};

const WARM_SPILL = new THREE.Color(0xffd2a1);

export const BAKED_FACADE = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
BAKED_FACADE.userData.keepAlive = true;

export const bakeStreetFace = (geometry: THREE.BufferGeometry, baseHex: number): void => {
  const position = geometry.getAttribute("position");
  const base = new THREE.Color(baseHex);
  const colors = new Float32Array(position.count * 3);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) {
    return;
  }
  const spanX = Math.max(bounds.max.x - bounds.min.x, 0.001);
  const spanY = Math.max(bounds.max.y - bounds.min.y, 0.001);
  for (let index = 0; index < position.count; index += 1) {
    const face = (position.getX(index) - bounds.min.x) / spanX;
    const low = 1 - (position.getY(index) - bounds.min.y) / spanY;
    const spill = face * face * (0.4 + low * 0.6);
    const painted = base.clone().lerp(WARM_SPILL, Math.min(spill * 0.62, 0.58));
    colors[index * 3] = painted.r;
    colors[index * 3 + 1] = painted.g;
    colors[index * 3 + 2] = painted.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
};

export const addBakedBox = (
  group: THREE.Group,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  x: number,
  y: number,
  z: number,
  baseHex: number,
): THREE.Mesh => {
  const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
  bakeStreetFace(geometry, baseHex);
  const mesh = new THREE.Mesh(geometry, BAKED_FACADE);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
};

export const addBox = (
  group: THREE.Group,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
): THREE.Mesh => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sizeX, sizeY, sizeZ), material);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
};
