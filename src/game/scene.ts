import * as THREE from "three";

import {
  CAMERA_BACK,
  CAMERA_FOLLOW,
  CAMERA_FOV,
  CAMERA_FOV_MAX,
  CAMERA_FOV_RESPONSE,
  CAMERA_HEIGHT,
  CAMERA_LOOK_AHEAD,
  MAX_SPEED,
  MIN_SPEED,
} from "./const";
import { createStarSky } from "./assets/sky";
import { approach, clamp } from "./util/math";

const SKY_COLOR = 0x070910;
const FOG_NEAR = 36;
const FOG_FAR = 190;
const HEMISPHERE_SKY = 0x243044;
const HEMISPHERE_GROUND = 0x0a0a0c;
const MOON_COLOR = 0xb7c4d4;
const FILL_COLOR = 0x3a2a20;

export type GameScene = {
  scene: THREE.Scene;
  follow: (playerX: number, speed: number, dt: number) => void;
  render: () => void;
  resize: () => void;
  dispose: () => void;
};

export const createGameScene = (container: HTMLElement): GameScene => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY_COLOR);
  scene.fog = new THREE.Fog(SKY_COLOR, FOG_NEAR, FOG_FAR);

  const hemisphere = new THREE.HemisphereLight(HEMISPHERE_SKY, HEMISPHERE_GROUND, 0.72);
  scene.add(hemisphere);

  const moon = new THREE.DirectionalLight(MOON_COLOR, 1.25);
  moon.position.set(-28, 36, -18);
  scene.add(moon);

  const fill = new THREE.DirectionalLight(FILL_COLOR, 0.38);
  fill.position.set(16, 12, 30);
  scene.add(fill);

  const sky = createStarSky();
  scene.add(sky.object);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 900),
    new THREE.MeshLambertMaterial({ color: 0x0b0c10, flatShading: true }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.22, 120);
  scene.add(ground);

  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 320);
  camera.position.set(0, CAMERA_HEIGHT, -CAMERA_BACK);
  camera.lookAt(0, 1.2, CAMERA_LOOK_AHEAD);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  renderer.domElement.className = "game-webgl-canvas";
  container.appendChild(renderer.domElement);

  const resize = () => {
    const nextWidth = Math.max(container.clientWidth, 1);
    const nextHeight = Math.max(container.clientHeight, 1);
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight, false);
  };

  return {
    scene,
    follow: (playerX, speed, dt) => {
      const lookX = playerX * 0.7;
      camera.position.x = approach(camera.position.x, lookX, CAMERA_FOLLOW, dt);
      camera.position.y = CAMERA_HEIGHT;
      camera.position.z = -CAMERA_BACK;
      camera.lookAt(camera.position.x, 1.15, CAMERA_LOOK_AHEAD);
      const pace = clamp((speed - MIN_SPEED) / Math.max(MAX_SPEED - MIN_SPEED, 1), 0, 1);
      const targetFov = CAMERA_FOV + (CAMERA_FOV_MAX - CAMERA_FOV) * pace;
      const nextFov = approach(camera.fov, targetFov, CAMERA_FOV_RESPONSE, dt);
      if (Math.abs(nextFov - camera.fov) > 0.01) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    },
    render: () => {
      renderer.render(scene, camera);
    },
    resize,
    dispose: () => {
      sky.dispose();
      ground.geometry.dispose();
      if (!Array.isArray(ground.material)) {
        ground.material.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};
