import * as THREE from "three";

import {
  ASSET_KEY,
  GEOMETRY_ATTRIBUTE,
  RGB_ITEM_SIZE,
} from "../constants/assets";
import { HEADLIGHT_CONE } from "../constants/vehicles";
import { HALF_PI } from "../constants/world";
import { clamp } from "../util/math";
import { sharedAssets } from "./sharedAssets";

/**
 * Open cone with its apex at the origin, opening toward +Z and pitched slightly down.
 * Vertex colours fade to black along the length, and the shader fades surfaces seen edge-on;
 * with additive blending black adds nothing, so the beam dissolves without needing alpha sorting.
 */
const createConeGeometry = (): THREE.BufferGeometry => {
  const {
    RADIUS,
    LENGTH,
    RADIAL_SEGMENTS,
    LENGTH_SEGMENTS,
    PITCH,
    COLOR,
    INTENSITY,
    FALLOFF,
  } = HEADLIGHT_CONE;
  const geometry = new THREE.ConeGeometry(
    RADIUS,
    LENGTH,
    RADIAL_SEGMENTS,
    LENGTH_SEGMENTS,
    true,
  );

  geometry.rotateX(-HALF_PI);
  geometry.translate(0, 0, LENGTH / 2);

  const position = geometry.getAttribute(GEOMETRY_ATTRIBUTE.POSITION);
  const colors = new Float32Array(position.count * RGB_ITEM_SIZE);
  const beam = new THREE.Color(COLOR).multiplyScalar(INTENSITY);

  for (let index = 0; index < position.count; index += 1) {
    const along = clamp(position.getZ(index) / LENGTH, 0, 1);
    const fade = Math.pow(1 - along, FALLOFF);
    const offset = index * RGB_ITEM_SIZE;

    colors[offset] = beam.r * fade;
    colors[offset + 1] = beam.g * fade;
    colors[offset + 2] = beam.b * fade;
  }

  geometry.setAttribute(
    GEOMETRY_ATTRIBUTE.COLOR,
    new THREE.BufferAttribute(colors, RGB_ITEM_SIZE),
  );
  geometry.rotateX(PITCH);

  return geometry;
};

const coneVertexShader = /* glsl */ `
  varying vec3 vBeamColor;
  varying float vFacing;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normal);
    vFacing = abs(dot(viewNormal, normalize(-viewPosition.xyz)));
    vBeamColor = color;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const coneFragmentShader = /* glsl */ `
  uniform float edgeSoftness;

  varying vec3 vBeamColor;
  varying float vFacing;

  void main() {
    gl_FragColor = vec4(vBeamColor * pow(vFacing, edgeSoftness), 1.0);
  }
`;

const createConeMaterial = (): THREE.ShaderMaterial => {
  return new THREE.ShaderMaterial({
    vertexShader: coneVertexShader,
    fragmentShader: coneFragmentShader,
    uniforms: { edgeSoftness: { value: HEADLIGHT_CONE.EDGE_SOFTNESS } },
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
};

/** Cheap fake light beam. Geometry and material are shared by every cone in the scene. */
export const createHeadlightCone = (): THREE.Mesh => {
  const geometry = sharedAssets.geometry(
    ASSET_KEY.HEADLIGHT_CONE_GEOMETRY,
    createConeGeometry,
  );
  const material = sharedAssets.material(
    ASSET_KEY.HEADLIGHT_CONE_MATERIAL,
    createConeMaterial,
  );

  return new THREE.Mesh(geometry, material);
};
