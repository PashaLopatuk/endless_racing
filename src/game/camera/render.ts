import { RENDERER } from "../constants/camera";
import { WebGPURenderer } from "three/webgpu";

export const createGameRenderer = (
  container: HTMLElement,
  width: number,
  height: number,
): WebGPURenderer => {
  const renderer = new WebGPURenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, RENDERER.MAX_PIXEL_RATIO),
  );

  renderer.setSize(width, height, false);

  renderer.shadowMap.enabled = true;
  renderer.domElement.className = RENDERER.CANVAS_CLASS;
  renderer.domElement.style.willChange = "transform";

  container.appendChild(renderer.domElement);

  return renderer;
};
