const INSTALL_LABELS = {
  cpu: 'CPU',
  cpuBlock: 'CPU Block',
  ram: 'RAM',
  eps4: 'EPS 4-pin',
  atx24: 'ATX 24-pin',
  sata: 'SATA',
  frontPanelUsb: 'Front Panel USB',
  switches: 'Switches',
  gpu: 'GPU',
};

/** Degrees / scale factor / meters per align nudge (mirrors Unity board*Step). */
export const BOARD_ROT_STEP = 5;
export const BOARD_SCALE_STEP = 1.05;
export const BOARD_MOVE_STEP = 0.005;

export const DEFAULT_BOARD_ALIGN = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

const state = {
  activeSlot: null,
  playInstallAnim: false,
  installedSlots: [],
  installError: null,
  installSuccess: null,
  placingSlot: null,
  pendingModelLoads: 0,
  /** False until user locks the motherboard after manual align. */
  boardLocked: false,
  boardAlign: { ...DEFAULT_BOARD_ALIGN, position: [...DEFAULT_BOARD_ALIGN.position], rotation: [...DEFAULT_BOARD_ALIGN.rotation], scale: [...DEFAULT_BOARD_ALIGN.scale] },
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
  switches: ['frontPanelUsb'],
  gpu: ['switches'],
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
  if (!state.boardLocked) return;
  if (state.installedSlots.includes(slotId)) {
    onSelectSlot?.(slotId);
    return;
  }
  const deps = prerequisites[slotId];
  if (deps && deps.length > 0) {
    const missing = deps.filter((d) => !state.installedSlots.includes(d));
    if (missing.length > 0) {
      const label = missing.map((id) => {
        const map = {
          cpu: 'CPU',
          cpuBlock: 'CPU Block',
          ram: 'RAM',
          eps4: 'EPS 4-pin',
          atx24: 'ATX 24-pin',
          sata: 'SATA',
          frontPanelUsb: 'Front Panel USB',
          switches: 'Switches',
          gpu: 'GPU',
        };
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
      installError: null,
    });
  }
}

/** Learning feedback when a part is released on the wrong slot or off-target. */
export function notifyWrongPlacement(intendedSlotId, wrongSlotId = null) {
  const intended = INSTALL_LABELS[intendedSlotId] || intendedSlotId;
  if (wrongSlotId) {
    const wrong = INSTALL_LABELS[wrongSlotId] || wrongSlotId;
    patchARSceneState({
      installError: `Wrong slot — that area is for the ${wrong}. Place the ${intended} on the highlighted position.`,
    });
    return;
  }
  patchARSceneState({
    installError: `Not quite — move the ${intended} onto the highlighted slot (about halfway over is enough).`,
  });
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

function cloneBoardAlign(align = state.boardAlign) {
  return {
    position: [...align.position],
    rotation: [...align.rotation],
    scale: [...align.scale],
  };
}

function patchBoardAlign(mutator) {
  const next = cloneBoardAlign();
  mutator(next);
  patchARSceneState({ boardAlign: next });
}

/** Yaw around Y (left / right rotate). */
export function nudgeBoardYaw(degrees) {
  patchBoardAlign((a) => {
    a.rotation[1] += degrees;
  });
}

/** Pitch around X (tilt up / down). */
export function nudgeBoardPitch(degrees) {
  patchBoardAlign((a) => {
    a.rotation[0] += degrees;
  });
}

/** Roll around Z. */
export function nudgeBoardRoll(degrees) {
  patchBoardAlign((a) => {
    a.rotation[2] += degrees;
  });
}

export function nudgeBoardScale(factor) {
  patchBoardAlign((a) => {
    const s = Math.max(0.05, Math.min(4, a.scale[0] * factor));
    a.scale = [s, s, s];
  });
}

/** Move in marker-local space. axis: [dx, dy, dz] unit direction. */
export function nudgeBoardMove(axis, distance) {
  patchBoardAlign((a) => {
    a.position[0] += axis[0] * distance;
    a.position[1] += axis[1] * distance;
    a.position[2] += axis[2] * distance;
  });
}

export function resetBoardAlign() {
  patchARSceneState({ boardAlign: cloneBoardAlign(DEFAULT_BOARD_ALIGN) });
}

export function lockBoardAlign() {
  patchARSceneState({ boardLocked: true });
}

export function unlockBoardAlign() {
  patchARSceneState({
    boardLocked: false,
    boardAlign: cloneBoardAlign(DEFAULT_BOARD_ALIGN),
  });
}

export function subscribeARSceneState(listener) {
  stateListeners.add(listener);
  listener({ ...state });
  return () => stateListeners.delete(listener);
}
