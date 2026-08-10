const state = {
  wiringType: 'straight',
  activeStep: null,
  playInstallAnim: false,
  wiredPins: [null, null, null, null, null, null, null, null],
  selectedWire: null,
  wireError: null,
  wireSuccess: false,
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
    wiredPins: [null, null, null, null, null, null, null, null],
    selectedWire: null,
    wireError: null,
    wireSuccess: false,
  });
}

export function notifyWireSelect(wireId) {
  patchRj45SceneState({ selectedWire: wireId });
}

export function notifyWirePlace(pinIndex, wireId) {
  const next = [...state.wiredPins];
  const previousIndex = next.indexOf(wireId);
  if (previousIndex >= 0 && previousIndex !== pinIndex) {
    next[previousIndex] = null;
  }
  next[pinIndex] = wireId;
  const allFilled = next.every((w) => w != null);
  patchRj45SceneState({
    wiredPins: next,
    selectedWire: null,
    wireError: null,
    wireSuccess: allFilled,
  });
}

export function notifyWireError(message) {
  patchRj45SceneState({ wireError: message, selectedWire: null });
}

export function notifyDismissWireError() {
  patchRj45SceneState({ wireError: null });
}

export function notifyResetWires() {
  patchRj45SceneState({
    wiredPins: [null, null, null, null, null, null, null, null],
    selectedWire: null,
    wireError: null,
    wireSuccess: false,
  });
}