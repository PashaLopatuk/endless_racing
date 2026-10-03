import { INPUT_ZONE_START } from "./const";

export type DriveGesture = {
  isActive: boolean;
  deltaX: number;
  deltaY: number;
};

export type TouchInput = {
  read: () => DriveGesture;
  dispose: () => void;
};

const isInDriveZone = (clientY: number): boolean => {
  return clientY >= window.innerHeight * INPUT_ZONE_START;
};

export const createTouchInput = (): TouchInput => {
  let activePointerId: number | null = null;
  let originX = 0;
  let originY = 0;
  let currentX = 0;
  let currentY = 0;
  let isActive = false;

  const endGesture = (pointerId: number) => {
    if (pointerId !== activePointerId) {
      return;
    }
    activePointerId = null;
    isActive = false;
  };

  const onPointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (target instanceof Element && target.closest("button, a")) {
      return;
    }
    if (activePointerId !== null || !isInDriveZone(event.clientY)) {
      return;
    }
    activePointerId = event.pointerId;
    originX = event.clientX;
    originY = event.clientY;
    currentX = event.clientX;
    currentY = event.clientY;
    isActive = true;
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) {
      return;
    }
    currentX = event.clientX;
    currentY = event.clientY;
  };

  const onPointerUp = (event: PointerEvent) => {
    endGesture(event.pointerId);
  };

  window.addEventListener("pointerdown", onPointerDown, { passive: false });
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  return {
    read: () => {
      if (!isActive) {
        return { isActive: false, deltaX: 0, deltaY: 0 };
      }
      return {
        isActive: true,
        deltaX: currentX - originX,
        deltaY: originY - currentY,
      };
    },
    dispose: () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    },
  };
};
