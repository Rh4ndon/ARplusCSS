const state = {
  wiringType: 'straight',
  activeStep: null,
  playInstallAnim: false,
};

const stateListeners = new Set();

let onMarkerFound;
let onMarkerLost;
let onSelectStep;

export function registerRj45SceneHandlers(handlers) {
  onMarkerFound = handlers.onMarkerFound;
  onMarkerLost = handlers.onMarkerLost;
  onSelectStep = handlers.onSelectStep;
}

export function notifyRj45MarkerFound() {
  onMarkerFound?.();
}

export function notifyRj45MarkerLost() {
  onMarkerLost?.();
}

export function notifyRj45SelectStep(stepId) {
  onSelectStep?.(stepId);
}

export function getRj45SceneState() {
  return state;
}

export function patchRj45SceneState(patch) {
  Object.assign(state, patch);
  const snapshot = { ...state };
  stateListeners.forEach((listener) => listener(snapshot));
}

export function subscribeRj45SceneState(listener) {
  stateListeners.add(listener);
  listener({ ...state });
  return () => stateListeners.delete(listener);
}

export function resetRj45SceneState() {
  patchRj45SceneState({
    wiringType: 'straight',
    activeStep: null,
    playInstallAnim: false,
  });
}
