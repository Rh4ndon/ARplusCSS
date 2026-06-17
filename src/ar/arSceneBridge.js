const state = {
  activeSlot: null,
  playInstallAnim: false,
  installedSlots: [],
  installError: null,
};

const stateListeners = new Set();

let onMarkerFound;
let onMarkerLost;
let onSelectSlot;

export const prerequisites = {
  cpu: [],
  cpuBlock: ['cpu'],
  ram: ['cpu', 'cpuBlock'],
  atx24: ['cpu'],
  eps4: ['cpu'],
  gpu: ['cpu'],
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
  console.log('[DEBUG] notifySelectSlot called:', slotId, 'installedSlots:', state.installedSlots, 'prerequisites:', prerequisites[slotId]);
  if (state.installedSlots.includes(slotId)) {
    console.log('[DEBUG] Slot already installed, opening guide');
    onSelectSlot?.(slotId);
    return;
  }
  const deps = prerequisites[slotId];
  if (deps && deps.length > 0) {
    const missing = deps.filter((d) => !state.installedSlots.includes(d));
    if (missing.length > 0) {
      const label = missing.map((id) => {
        const map = { cpu: 'CPU', cpuBlock: 'CPU Block', ram: 'RAM' };
        return map[id] || id;
      }).join(', ');
      console.log('[DEBUG] Prerequisites not met:', missing);
      patchARSceneState({ installError: `Install ${label} first` });
      return;
    }
  }
  console.log('[DEBUG] Prerequisites met, calling notifyInstallComplete');
  notifyInstallComplete(slotId);
  console.log('[DEBUG] Calling onSelectSlot');
  onSelectSlot?.(slotId);
}

export function notifyInstallComplete(slotId) {
  console.log('[DEBUG] notifyInstallComplete:', slotId, 'already installed:', state.installedSlots.includes(slotId));
  if (!state.installedSlots.includes(slotId)) {
    patchARSceneState({ installedSlots: [...state.installedSlots, slotId] });
  }
}

export function notifyDismissError() {
  patchARSceneState({ installError: null });
}

export function getARSceneState() {
  return state;
}

export function patchARSceneState(patch) {
  console.log('[DEBUG] patchARSceneState:', JSON.stringify(patch), '→ installedSlots:', state.installedSlots);
  Object.assign(state, patch);
  const snapshot = { ...state };
  stateListeners.forEach((listener) => listener(snapshot));
}

export function subscribeARSceneState(listener) {
  stateListeners.add(listener);
  listener({ ...state });
  return () => stateListeners.delete(listener);
}
