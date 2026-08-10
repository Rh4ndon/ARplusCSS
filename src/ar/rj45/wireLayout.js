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

const T568B = ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'];
const T568A = ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'];

export function getTargetOrder(wiringType) {
  return wiringType === 'crossover' ? T568A : T568B;
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

export const CONNECTOR_ALIGN = {
  position: [-0.01, 0.01, 0],
  rotation: [1, 181, 3],
  scale: [0.25, 0.25, 0.25],
};

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
export function expectedWireAt(pinIndex, wiringType) {
  const order = getTargetOrder(wiringType);
  return order[pinIndex] ?? null;
}