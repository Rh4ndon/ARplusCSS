export const WIRES = [
  { id: 'wo', label: 'White-Orange', solid: false, color: '#ffffff', stripeColor: '#f97316' },
  { id: 'o', label: 'Orange', solid: true, color: '#f97316' },
  { id: 'wg', label: 'White-Green', solid: false, color: '#ffffff', stripeColor: '#22c55e' },
  { id: 'b', label: 'Blue', solid: true, color: '#2563eb' },
  { id: 'wb', label: 'White-Blue', solid: false, color: '#ffffff', stripeColor: '#3b82f6' },
  { id: 'g', label: 'Green', solid: true, color: '#22c55e' },
  { id: 'wbr', label: 'White-Brown', solid: false, color: '#ffffff', stripeColor: '#92400e' },
  { id: 'br', label: 'Brown', solid: true, color: '#92400e' },
];

export const T568B = ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'];
export const T568A = ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'];

export const CONNECTOR_ENDS = {
  straight: [
    { id: 'end-a', label: 'End A', standard: 'T568B', order: T568B },
    { id: 'end-b', label: 'End B', standard: 'T568B', order: T568B },
  ],
  crossover: [
    { id: 'end-a', label: 'End A', standard: 'T568A', order: T568A },
    { id: 'end-b', label: 'End B', standard: 'T568B', order: T568B },
  ],
};

export function getConnectorEnd(wiringType, endIndex = 0) {
  const ends = CONNECTOR_ENDS[wiringType] ?? CONNECTOR_ENDS.straight;
  return ends[endIndex] ?? ends[0];
}

export function getTargetOrder(wiringType, endIndex = 0) {
  return getConnectorEnd(wiringType, endIndex).order;
}

export function wireById(id) {
  return WIRES.find((w) => w.id === id);
}

export const wireByMaterial = (material) => WIRES.find((w) => w.material === material);

export const PIN_SPACING = 0.0055;

export const PIN_POSITIONS = Array.from({ length: 8 }, (_, i) => [
  (i - 3.5) * PIN_SPACING,
  0.014,
  0.01,
]);

export const TRAY_POSITIONS = Array.from({ length: 8 }, (_, i) => [
  0.05,
  0.02,
  (i - 3.5) * 0.006,
]);

export const JACKET_POS = [0, 0.012, -0.045];

// Tune these values while viewing the AR scene on a phone.
// Position format is [left/right (x), up/down (y), near/far (z)].
// Both connector ends deliberately share the same scale and rotation.
export const RJ45_CONNECTOR_SCALE = [0.016, 0.016, 0.016];
export const RJ45_CONNECTOR_ROTATION = [0, -90, 180];

export const CONNECTOR_END_A_ALIGN = {
  position: [-0.045, 0.05, 0],
  scale: RJ45_CONNECTOR_SCALE,
  rotation: RJ45_CONNECTOR_ROTATION,
  wireRotation: [0, 0, 0],
};

export const CONNECTOR_END_B_ALIGN = {
  position: [0.045, 0.05, 0],
  scale: RJ45_CONNECTOR_SCALE,
  rotation: RJ45_CONNECTOR_ROTATION,
  wireRotation: [0, 0, 0],
};

// ---- Wire tuning (edit these freely) ----
// All values are relative to the connector's local frame, so they already
// inherit the 3D RJ45's scale/rotation. Tweak them until the wires line up
// perfectly with the model's pins.
export const WIRE_INSERT_BASE = [-0.0075, 0.02, -0.045]; // [x, y, z] of the leftmost pin
export const WIRE_INSERT_SPACING = 0.0025; // gap between adjacent pins
export const WIRE_INSERT_ROTATION = [0, -90, 0]; // [x, y, z] in degrees
export const WIRE_INSERT_SCALE = [0.0015, 0.0015, 0.035]; // [x, y, z] box size
export const WIRE_INSERT_SLIDE_Z = 0.018; // travel distance when sliding into the plug

export function seatPos(pinIndex) {
  return PIN_POSITIONS[pinIndex];
}

export function buildWireCurve(from, ctrl, to, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([
      u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0],
      u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1],
      u * u * from[2] + 2 * u * t * ctrl[2] + t * t * to[2],
    ]);
  }
  return pts;
}

export function seatedCtrl(pinIndex) {
  const p = PIN_POSITIONS[pinIndex];
  return [p[0], 0.032, (p[2] + JACKET_POS[2]) / 2];
}

export function trayCtrl(pinIndex) {
  const t = TRAY_POSITIONS[pinIndex];
  return [t[0], t[1] + 0.02, (t[2] + JACKET_POS[2]) / 2];
}

/** Expected wire id at a given pin (0-indexed) for a wiring type. */
export function expectedWireAt(pinIndex, wiringType, endIndex = 0) {
  const order = getTargetOrder(wiringType, endIndex);
  return order[pinIndex] ?? null;
}
