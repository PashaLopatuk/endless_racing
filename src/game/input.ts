import { INPUT } from "./constants/input";

export interface DriveGesture {
  readonly isActive: boolean;
  /** Pixels dragged right since the touch started. */
  readonly deltaX: number;
  /** Pixels dragged up since the touch started. */
  readonly deltaY: number;
}

export interface TouchInput {
  /** Returns the same object every call; read it immediately rather than storing it. */
  read(): DriveGesture;
  dispose(): void;
}

interface MutableGesture {
  isActive: boolean;
  deltaX: number;
  deltaY: number;
}

const isInDriveZone = (clientY: number): boolean => {
  return clientY >= window.innerHeight * INPUT.DRIVE_ZONE_START;
};

const isUiTarget = (target: EventTarget | null): boolean => {
  return (
    target instanceof Element && target.closest(INPUT.IGNORED_TARGETS) !== null
  );
};

export const createTouchInput = (): TouchInput => {
  const gesture: MutableGesture = { isActive: false, deltaX: 0, deltaY: 0 };
  let activePointerId: number | null = null;
  let originX = 0;
  let originY = 0;

  const onPointerDown = (event: PointerEvent) => {
    if (
      isUiTarget(event.target) ||
      activePointerId !== null ||
      !isInDriveZone(event.clientY)
    ) {
      return;
    }

    activePointerId = event.pointerId;
    originX = event.clientX;
    originY = event.clientY;

    gesture.isActive = true;
    gesture.deltaX = 0;
    gesture.deltaY = 0;

    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) {
      return;
    }

    gesture.deltaX = event.clientX - originX;
    gesture.deltaY = originY - event.clientY;
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) {
      return;
    }

    activePointerId = null;
    gesture.isActive = false;
    gesture.deltaX = 0;
    gesture.deltaY = 0;
  };

  window.addEventListener("pointerdown", onPointerDown, { passive: false });
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  return {
    read: () => gesture,
    dispose: () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    },
  };
};
