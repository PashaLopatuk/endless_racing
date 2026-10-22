import { CAMERA } from "../constants/camera";
import { PLAYER } from "../constants/player";
import { clamp, smoothNumberValueExponentially } from "../util/math";

export interface IScreenShakeController {
  update(speed: number, dt: number): void;
  triggerImpact(severity: number): void;
  reset(): void;
}

export const createScreenShakeController = (
  domElement: HTMLElement,
): IScreenShakeController => {
  let speedElapsed = 0;
  let speedIntensity = 0;

  let impactTrauma = 0;
  let impactElapsed = 0;

  const calculateSpeedShakeOffset = (dt: number, intensity: number) => {
    speedElapsed += dt;

    const t = speedElapsed;
    const lo = CAMERA.SHAKE_FREQ_LO;
    const mid = CAMERA.SHAKE_FREQ_MID;
    const hi = CAMERA.SHAKE_FREQ_HI;

    // Three layered oscillator pairs at irrational ratios — non-repeating
    const px =
      Math.sin(t * lo * 0.83) * 0.15 +
      Math.sin(t * mid * 1.317) * 0.45 +
      Math.sin(t * hi * 0.891) * 0.4;

    const py =
      Math.sin(t * lo * 0.793) * 0.2 +
      Math.cos(t * mid * 1.131) * 0.4 +
      Math.sin(t * hi * 1.037) * 0.4;

    return {
      x: px * CAMERA.SHAKE_MAX_PX_X * intensity,
      y: py * CAMERA.SHAKE_MAX_PX_Y * intensity,
    };
  };

  const calculateImpactShakeOffset = (dt: number) => {
    if (impactTrauma <= 0.001) {
      impactTrauma = 0;
      return { x: 0, y: 0, rot: 0 };
    }

    impactElapsed += dt;

    // Decay impact trauma over time
    impactTrauma = Math.max(0, impactTrauma - dt * CAMERA.IMPACT_SHAKE_DECAY);

    // Non-linear power: stronger hits produce exponentially heavier shudder
    const shakePower = Math.pow(impactTrauma, 1.35);

    const t = impactElapsed * CAMERA.IMPACT_SHAKE_FREQ;
    // Dominant horizontal oscillation: rapid multi-harmonic jolt
    const oscX = Math.sin(t) * 0.65 + Math.sin(t * 1.618) * 0.35;
    // Weaker vertical oscillation
    const oscY = Math.cos(t * 1.23) * 0.7 + Math.sin(t * 0.73) * 0.3;
    // Subtle angular roll
    const oscRot = Math.sin(t * 0.91) * 0.8 + Math.cos(t * 1.41) * 0.2;

    return {
      x: oscX * CAMERA.IMPACT_SHAKE_MAX_PX_X * shakePower,
      y: oscY * CAMERA.IMPACT_SHAKE_MAX_PX_Y * shakePower,
      rot: oscRot * CAMERA.IMPACT_SHAKE_MAX_DEG * shakePower,
    };
  };

  return {
    triggerImpact: (severity: number) => {
      // Clamped between 0 and 1; harder hit adds more trauma
      const clamped = clamp(severity, 0.15, 1.0);
      impactTrauma = Math.min(1.0, impactTrauma + clamped);
      impactElapsed = 0;
    },
    update: (speed, dt) => {
      // Speed shake only activates above MAX_BASE_SPEED (squared curve from 0 to 1)
      const shakeRange = PLAYER.MAX_SPEED - PLAYER.MAX_BASE_SPEED;
      const shakeT = clamp((speed - PLAYER.MAX_BASE_SPEED) / shakeRange, 0, 1);
      const targetSpeedIntensity = shakeT * shakeT;

      speedIntensity = smoothNumberValueExponentially(
        speedIntensity,
        targetSpeedIntensity,
        CAMERA.SHAKE_SMOOTH_RATE,
        dt,
      );

      const speedShake =
        speedIntensity > 0.001
          ? calculateSpeedShakeOffset(dt, speedIntensity)
          : { x: 0, y: 0 };

      const impactShake = calculateImpactShakeOffset(dt);

      const totalX = speedShake.x + impactShake.x;
      const totalY = speedShake.y + impactShake.y;
      const totalRot = impactShake.rot;

      if (
        Math.abs(totalX) > 0.01 ||
        Math.abs(totalY) > 0.01 ||
        Math.abs(totalRot) > 0.01
      ) {
        domElement.style.transform = `translate3d(${totalX.toFixed(2)}px,${totalY.toFixed(2)}px,0) rotate(${totalRot.toFixed(2)}deg)`;
      } else if (domElement.style.transform !== "") {
        domElement.style.transform = "";
      }
    },
    reset: () => {
      impactTrauma = 0;
      impactElapsed = 0;
      speedIntensity = 0;
      speedElapsed = 0;
      domElement.style.willChange = "";
      domElement.style.transform = "";
    },
  };
};
