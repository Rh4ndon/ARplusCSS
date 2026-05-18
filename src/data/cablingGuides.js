export const WIRING_STRAIGHT = 'straight';
export const WIRING_CROSSOVER = 'crossover';

const baseSteps = {
  strip: {
    id: 'strip',
    shortLabel: 'Strip',
    label: 'Strip the Jacket',
    summary: 'Remove the outer cable jacket without nicking the twisted pairs.',
    steps: [
      { title: 'Measure', detail: 'Strip about 2–3 cm (1 inch) of outer jacket from each end.' },
      { title: 'Score gently', detail: 'Use stripper notch for Cat5e/Cat6—do not cut into conductors.' },
      { title: 'Pull jacket', detail: 'Slide jacket off and check that pair insulation is intact.' },
    ],
    safetyTips: ['Keep blades sharp to avoid pulling on wires.', 'Wear eye protection when cutting many cables.'],
  },
  untwist: {
    id: 'untwist',
    shortLabel: 'Untwist',
    label: 'Untwist Pairs',
    summary: 'Separate the four twisted pairs and straighten conductors for ordering.',
    steps: [
      { title: 'Open pairs', detail: 'Untwist each pair down to the jacket line only—no extra untwisting.' },
      { title: 'Straighten', detail: 'Run fingers along each wire to reduce bends before lining up colors.' },
      { title: 'Fan out', detail: 'Spread all eight wires flat in one plane ready for the color order.' },
    ],
    safetyTips: ['Excess untwisting hurts signal quality at high speeds.'],
  },
  trim: {
    id: 'trim',
    shortLabel: 'Trim',
    label: 'Trim & Flatten',
    summary: 'Cut wires to even length and keep them flat before insertion.',
    steps: [
      { title: 'Hold order', detail: 'Keep wire order pressed between thumb and finger.' },
      { title: 'Cut square', detail: 'Trim all conductors to the same length (about 12–13 mm in the plug).' },
      { title: 'Check tips', detail: 'Ends should be straight across—re-trim if any wire is longer.' },
    ],
    safetyTips: ['Do not let go of wire order while trimming.'],
  },
  insert: {
    id: 'insert',
    shortLabel: 'Insert',
    label: 'Insert into RJ45',
    summary: 'Slide the ordered wires fully into the connector until they reach the front.',
    steps: [
      { title: 'Orient plug', detail: 'Latch tab down, gold contacts facing up (standard crimp position).' },
      { title: 'Feed wires', detail: 'Push until each conductor tip is visible in the front of the plug.' },
      { title: 'Verify', detail: 'Jacket should enter the strain relief area of the plug.' },
    ],
    safetyTips: ['If a wire slips back, pull out and re-order from the untwist step.'],
  },
  crimp: {
    id: 'crimp',
    shortLabel: 'Crimp',
    label: 'Crimp the Plug',
    summary: 'Compress the contacts and strain relief with a crimp tool.',
    steps: [
      { title: 'Seat in tool', detail: 'Place plug fully into the crimper die without twisting wires.' },
      { title: 'Squeeze firmly', detail: 'Crimp once with steady pressure until the tool completes its stroke.' },
      { title: 'Tug test', detail: 'Gently pull the cable—plug should not move. Test with a cable tester if available.' },
    ],
    safetyTips: ['Use an RJ45 die matched to your plug type (pass-through vs standard).'],
  },
};

const orderStraight = {
  id: 'order',
  shortLabel: 'Order',
  label: 'Wire Order (T568B)',
  summary: 'Both ends use the same T568B order for straight-through cables (PC to switch).',
  steps: [
    { title: 'Left to right', detail: 'Pin 1→8: White-Orange, Orange, White-Green, Blue, White-Blue, Green, White-Brown, Brown.' },
    { title: 'Both ends', detail: 'Use identical order on both ends of the cable.' },
    { title: 'Mnemonic', detail: 'Remember: straight-through = same standard on both sides.' },
  ],
  safetyTips: ['Straight-through is used for host-to-switch or host-to-router LAN ports.'],
};

const orderCrossover = {
  id: 'order',
  shortLabel: 'Order',
  label: 'Wire Order (Crossover)',
  summary: 'One end T568A and the other T568B—or swap pairs 1↔3 and 2↔6 for gigabit crossover.',
  steps: [
    { title: 'End A', detail: 'Wire one end using T568B (same as straight-through diagram).' },
    { title: 'End B', detail: 'Wire the other end using T568A (swap green and orange pairs).' },
    { title: 'Pairs swapped', detail: 'Transmit and receive pairs cross: 1–3 and 2–6 exchange between ends.' },
  ],
  safetyTips: [
    'Modern Auto-MDIX ports often work with straight cables—crossover is still taught for servicing skills.',
  ],
};

export const cablingStepIds = ['strip', 'untwist', 'order', 'trim', 'insert', 'crimp'];

export function getCablingGuide(wiringType, stepId) {
  const orderBlock = wiringType === WIRING_CROSSOVER ? orderCrossover : orderStraight;
  const step = stepId === 'order' ? orderBlock : baseSteps[stepId];
  if (!step) {
    return null;
  }
  return {
    ...step,
    wiringType,
    animationKey: stepId,
  };
}

export const cablingOverview = {
  straight: {
    title: 'Straight-Through Cable',
    body:
      'Used to connect different device types (e.g., PC to switch). Both ends follow the same pin order (typically T568B).',
  },
  crossover: {
    title: 'Crossover Cable',
    body:
      'Used to connect similar devices directly (e.g., PC to PC). Transmit and receive pairs are crossed on one end.',
  },
};
