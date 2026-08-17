/** Hotspot layout on the tracked motherboard plane (meters, origin = marker center). */
export const motherboardHotspots = [
  {
    id: 'cpu',
    position: [-0.01, 0.02, -0.06],
    size: [0.05, 0.045],
    color: '#3b82f6',
  },
  {
    id: 'cpuBlock',
    position: [-0.01, 0.02, -0.06],
    size: [0.1, 0.1],
    color: '#06b6d4',
  },
  {
    id: 'ram',
    position: [0.055, 0.02, -0.035],
    size: [0.02, 0.155],
    color: '#22d3ee',
  },
  {
    id: 'atx24',
    position: [0.075, 0.02, 0.015],
    size: [0.020, 0.060],
    color: '#fbbf24',
  },
  {
    id: 'eps4',
    position: [-0.07, 0.02, -0.1],
    size: [0.04, 0.04],
    color: '#a78bfa',
  },
  {
    id: 'gpu',
    position: [-0.01, 0.02, 0.075],
    size: [0.18, 0.05],
    color: '#f97316',
  },
  {
    id: 'sata',
    // Right edge, below ATX 24-pin (ATX is at z≈0.015)
    position: [0.062, 0.03, 0.11],
    size: [0.04, 0.03],
    color: '#84cc16',
  },
  {
    id: 'frontPanelUsb',
    // Bottom-right front-panel header area
    position: [0.01, 0.05, 0.11],
    size: [0.02, 0.02],
    color: '#06b6d4',
  },
  {
    id: 'switches',
    // Front-panel power + reset pins — left of SATA, near bottom edge
    position: [0.025, 0.02, 0.115],
    size: [0.03, 0.02],
    color: '#f43f5e',
  },
];
