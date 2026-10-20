import { RENDERER } from "../constants/camera";

export const viewportSize = (container: HTMLElement) => ({
  width: Math.max(container.clientWidth, RENDERER.MIN_VIEWPORT_SIZE),
  height: Math.max(container.clientHeight, RENDERER.MIN_VIEWPORT_SIZE),
});
