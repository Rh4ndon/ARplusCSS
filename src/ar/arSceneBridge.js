const INSTALL_LABELS = {
  cpu: 'CPU',
  cpuBlock: 'CPU Block',
  ram: 'RAM',
  eps4: 'EPS 4-pin',
  atx24: 'ATX 24-pin',
  gpu: 'GPU',
};

const state = {
  activeSlot: null,
  playInstallAnim: false,
  installedSlots: [],
  installError: null,
  installSuccess: null,
  placingSlot: null,
  pendingModelLoads: 0,
};

const stateListeners = new Set();

let onMarkerFound;
let onMarkerLost;
let onSelectSlot;

export const prerequisites = {
  cpu: [],
  cpuBlock: ['cpu'],
  ram: ['cpuBlock'],
  eps4: ['ram'],
  atx24: ['eps4'],
  sata: ['atx24'],
  frontPanelUsb: ['sata'],
  powerSw: ['frontPanelUsb'],
  resetSw: ['powerSw'],
  gpu: ['resetSw'],
};

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
  if (state.installedSlots.includes(slotId)) {
    onSelectSlot?.(slotId);
    return;
  }
  const deps = prerequisites[slotId];
  if (deps && deps.length > 0) {
    const missing = deps.filter((d) => !state.installedSlots.includes(d));
    if (missing.length > 0) {
      const label = missing.map((id) => {
        const map = { cpu: 'CPU', cpuBlock: 'CPU Block', ram: 'RAM', sata: 'SATA', frontPanelUsb: 'Front Panel USB', powerSw: 'Power SW', resetSw: 'Reset SW' };
        return map[id] || id;
      }).join(', ');
      patchARSceneState({ installError: `Install ${label} first` });
      return;
    }
  }
  onSelectSlot?.(slotId);
}

export function notifyInstallComplete(slotId) {
  if (!state.installedSlots.includes(slotId)) {
    patchARSceneState({
      installedSlots: [...state.installedSlots, slotId],
      installSuccess: INSTALL_LABELS[slotId] || slotId,
    });
  }
}

export function notifyDismissError() {
  patchARSceneState({ installError: null });
}

export function notifyDismissSuccess() {
  patchARSceneState({ installSuccess: null });
}

export function notifyModelLoadStart() {
  patchARSceneState({ pendingModelLoads: state.pendingModelLoads + 1 });
}

export function notifyModelLoadEnd() {
  patchARSceneState({ pendingModelLoads: Math.max(0, state.pendingModelLoads - 1) });
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
