const state = {
  activeSlot: null,
  playInstallAnim: false,
};

const stateListeners = new Set();

let onMarkerFound;
let onMarkerLost;
let onSelectSlot;

export function registerARSceneHandlers(handlers) {
  onMarkerFound = handlers.onMarkerFound;
  onMarkerLost = handlers.onMarkerLost;
  onSelectSlot = handlers.onSelectSlot;
}

export function notifyMarkerFound() {
  onMarkerFound?.();
}

export function notifyMarkerLost() {
  onMarkerLost?.();
}

export function notifySelectSlot(slotId) {
  onSelectSlot?.(slotId);
}

export function getARSceneState() {
  return state;
}

export function patchARSceneState(patch) {
  Object.assign(state, patch);
  const snapshot = { ...state };
  stateListeners.forEach((listener) => listener(snapshot));
}

export function subscribeARSceneState(listener) {
  stateListeners.add(listener);
  listener({ ...state });
  return () => stateListeners.delete(listener);
}
