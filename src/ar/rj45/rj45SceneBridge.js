const state = {
  wiringType: 'straight',
  activeStep: null,
  playInstallAnim: false,
  activeEnd: 0,
  completedEnds: [false, false],
  wiredPins: [null, null, null, null, null, null, null, null],
  selectedWire: null,
  wireError: null,
  wrongAttempts: 0,
  insertionAnimationRun: 0,
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
    activeEnd: 0,
    completedEnds: [false, false],
    wiredPins: [null, null, null, null, null, null, null, null],
    selectedWire: null,
    wireError: null,
    wrongAttempts: 0,
    insertionAnimationRun: 0,
  });
}

export function notifyWireSelect(wireId) {
  if (state.wiredPins.includes(wireId)) {
    return;
  }
  patchRj45SceneState({ selectedWire: wireId, wireError: null });
}

export function notifyWirePlace(pinIndex, wireId) {
  const next = [...state.wiredPins];
  const previousIndex = next.indexOf(wireId);
  if (previousIndex >= 0 && previousIndex !== pinIndex) {
    next[previousIndex] = null;
  }
  next[pinIndex] = wireId;
  const allFilled = next.every((w) => w != null);
  const completedEnds = [...state.completedEnds];
  if (allFilled) {
    completedEnds[state.activeEnd] = true;
  }
  patchRj45SceneState({
    wiredPins: next,
    selectedWire: null,
    wireError: null,
    completedEnds,
  });
}

export function notifyWireError(message) {
  patchRj45SceneState({
    wireError: message,
    selectedWire: null,
    wrongAttempts: state.wrongAttempts + 1,
  });
}

export function notifyDismissWireError() {
  patchRj45SceneState({ wireError: null });
}

export function notifyResetWires() {
  patchRj45SceneState({
    activeEnd: 0,
    completedEnds: [false, false],
    wiredPins: [null, null, null, null, null, null, null, null],
    selectedWire: null,
    wireError: null,
    wrongAttempts: 0,
  });
}

export function notifyNextConnectorEnd() {
  if (!state.completedEnds[state.activeEnd] || state.activeEnd >= 1) {
    return;
  }
  patchRj45SceneState({
    activeEnd: state.activeEnd + 1,
    wiredPins: [null, null, null, null, null, null, null, null],
    selectedWire: null,
    wireError: null,
  });
}

export function notifyRj45InsertionAnimation() {
  patchRj45SceneState({ insertionAnimationRun: state.insertionAnimationRun + 1 });
}
