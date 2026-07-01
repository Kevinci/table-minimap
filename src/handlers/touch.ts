/**
 * Calculates the distance between two touch points.
 */
export function getTouchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[1].clientX - touches[0].clientX;
  const dy = touches[1].clientY - touches[0].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the center point between two touch points.
 */
export function getTouchCenter(touches: TouchList): { x: number; y: number } {
  if (touches.length < 2) {
    return { x: touches[0]?.clientX ?? 0, y: touches[0]?.clientY ?? 0 };
  }
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

/**
 * Touch state for gesture handling.
 */
export interface TouchState {
  activeTouches: Map<number, { x: number; y: number }>;
  pinchStartDistance: number;
  pinchStartZoom: number;
  isPinching: boolean;
  lastTapTime: number;
  lastTapX: number;
  lastTapY: number;
  tapTimer: number | null;
}

/**
 * Creates initial touch state.
 */
export function createTouchState(): TouchState {
  return {
    activeTouches: new Map(),
    pinchStartDistance: 0,
    pinchStartZoom: 1,
    isPinching: false,
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
    tapTimer: null,
  };
}

/**
 * Clears the pending tap timer.
 */
export function clearTapTimer(state: TouchState): void {
  if (state.tapTimer !== null) {
    clearTimeout(state.tapTimer);
    state.tapTimer = null;
  }
}

/**
 * Updates active touches from a TouchEvent.
 */
export function updateActiveTouches(state: TouchState, touches: TouchList): void {
  for (let i = 0; i < touches.length; i++) {
    const touch = touches[i];
    state.activeTouches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
  }
}

/**
 * Removes ended touches from tracking.
 */
export function removeEndedTouches(state: TouchState, changedTouches: TouchList): void {
  for (let i = 0; i < changedTouches.length; i++) {
    state.activeTouches.delete(changedTouches[i].identifier);
  }
}

