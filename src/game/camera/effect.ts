import { CAMERA } from "../constants/camera";
import { PLAYER } from "../constants/player";
import { clamp, smoothNumberValueExponentially } from "../util/math";

interface IScreenShakeController {
  update(speed: number, dt: number): void;
  reset(): void;
}

export const createScreenShakeController = (
  domElement: HTMLElement,
): IScreenShakeController => {
  let shakeElapsed = 0;
  let shakeIntensity = 0;

  const calculateShakeOffset = (dt: number, intensity: number) => {
    shakeElapsed += dt;

    const t = shakeElapsed;
    const lo = CAMERA.SHAKE_FREQ_LO;
    const mid = CAMERA.SHAKE_FREQ_MID;
    const hi = CAMERA.SHAKE_FREQ_HI;

    // Three layered oscillator pairs at irrational ratios — non-repeating
    // X: lateral is secondary (mostly mid + hi, less lo)
    const px =
      Math.sin(t * lo * 0.83) * 0.15 +
      Math.sin(t * mid * 1.317) * 0.45 +
      Math.sin(t * hi * 0.891) * 0.4;

    // Y: road bumps dominate (all three layers, heavy on mid + hi)
    const py =
      Math.sin(t * lo * 0.793) * 0.2 +
      Math.cos(t * mid * 1.131) * 0.4 +
      Math.sin(t * hi * 1.037) * 0.4;

    return {
      x: px * CAMERA.SHAKE_MAX_PX_X * intensity,
      y: py * CAMERA.SHAKE_MAX_PX_Y * intensity,
    };
  };

  return {
    update: (speed, dt) => {
      // Shake only activates above MAX_BASE_SPEED (squared curve from 0 to 1)
      const shakeRange = PLAYER.MAX_SPEED - PLAYER.MAX_BASE_SPEED;
      const shakeT = clamp((speed - PLAYER.MAX_BASE_SPEED) / shakeRange, 0, 1);
      const targetIntensity = shakeT * shakeT;

      shakeIntensity = smoothNumberValueExponentially(
        shakeIntensity,
        targetIntensity,
        CAMERA.SHAKE_SMOOTH_RATE,
        dt,
      );

      if (shakeIntensity > 0.001) {
        const offset = calculateShakeOffset(dt, shakeIntensity);
        domElement.style.transform = `translate3d(${offset.x.toFixed(2)}px,${offset.y.toFixed(2)}px,0)`;
      } else if (domElement.style.transform !== "") {
        domElement.style.transform = "";
      }
    },
    reset: () => {
      domElement.style.willChange = "";
      domElement.style.transform = "";
    },
  };
};
