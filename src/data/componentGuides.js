export const componentGuides = {
  cpu: {
    id: 'cpu',
    label: 'CPU Socket',
    shortLabel: 'CPU',
    summary:
      'Align the processor triangle with the socket, place gently, then secure the retention arm.',
    steps: [
      {
        title: 'Open the socket',
        detail:
          'Lift the retention arm. Remove the plastic cover if your board still has one.',
      },
      {
        title: 'Align notches',
        detail:
          'Match the golden triangle on the CPU with the triangle mark on the socket.',
      },
      {
        title: 'Drop in place',
        detail:
          'Set the CPU straight down. Do not slide or force it sideways.',
      },
      {
        title: 'Lock the arm',
        detail:
          'Lower the retention arm until it clicks. Some boards need light pressure.',
      },
    ],
    safetyTips: [
      'Never touch CPU pins or socket contacts.',
      'Ground yourself before handling the processor.',
    ],
    animationKey: 'cpu',
  },
  ram: {
    id: 'ram',
    label: 'RAM Slots (DIMM)',
    shortLabel: 'RAM',
    summary:
      'Open the clips, align the notch, press evenly until both latches snap shut.',
    steps: [
      {
        title: 'Open clips',
        detail: 'Push the white clips outward on each end of the slot.',
      },
      {
        title: 'Align the notch',
        detail:
          'The stick notch must match the slot key. DDR4 and DDR5 notches differ.',
      },
      {
        title: 'Insert at an angle',
        detail:
          'Seat the module at a slight angle, then press down firmly on both ends.',
      },
      {
        title: 'Verify latches',
        detail:
          'Both clips should click closed. The stick should sit flush with the board.',
      },
    ],
    safetyTips: [
      'Install in the slots recommended in your manual (often A2/B2 first).',
      'Press straight down to avoid bending pins on the stick.',
    ],
    animationKey: 'ram',
  },
  atx24: {
    id: 'atx24',
    label: '24-Pin ATX Power',
    shortLabel: '24-Pin',
    summary:
      'Main motherboard power from the PSU. Clip must face the latch side of the connector.',
    steps: [
      {
        title: 'Route the cable',
        detail:
          'Feed the 24-pin harness behind the tray when possible for cleaner airflow.',
      },
      {
        title: 'Align the clip',
        detail:
          'The locking tab on the plug faces the clip on the motherboard header.',
      },
      {
        title: 'Press until seated',
        detail:
          'Push straight into the header until you hear a click from the latch.',
      },
      {
        title: 'Tug test',
        detail:
          'Gently pull the connector. It should not move if fully latched.',
      },
    ],
    safetyTips: [
      'Power off the PSU and unplug AC before connecting cables.',
      'Do not force a 20+4 adapter the wrong way around.',
    ],
    animationKey: 'atx24',
  },
  eps8: {
    id: 'eps8',
    label: '8-Pin EPS (CPU Power)',
    shortLabel: '8-Pin EPS',
    summary:
      'Dedicated CPU power near the socket. Often labeled CPU_PWR or EPS12V.',
    steps: [
      {
        title: 'Locate CPU_PWR',
        detail:
          'Find the 4+4 or 8-pin header at the top-left of most ATX boards.',
      },
      {
        title: 'Split or combine',
        detail:
          'Use a single 8-pin or two 4-pin plugs depending on your PSU cables.',
      },
      {
        title: 'Seat the connector',
        detail:
          'Align the clip, press firmly until the latch engages.',
      },
      {
        title: 'High-end CPUs',
        detail:
          'Some boards need a second 8-pin for overclocking—check your manual.',
      },
    ],
    safetyTips: [
      'Do not confuse EPS 8-pin with PCIe 8-pin GPU power.',
      'EPS connectors are keyed differently from PCIe.',
    ],
    animationKey: 'eps8',
  },
  gpu: {
    id: 'gpu',
    label: 'PCIe x16 (GPU Slot)',
    shortLabel: 'GPU',
    summary:
      'Install the graphics card in the top x16 slot, secure the bracket, and connect PCIe power.',
    steps: [
      {
        title: 'Remove slot covers',
        detail:
          'Take out the rear bracket plates that line up with your chosen PCIe slot.',
      },
      {
        title: 'Open the slot latch',
        detail:
          'Push down the plastic latch at the rear of the x16 slot before inserting.',
      },
      {
        title: 'Insert the card',
        detail:
          'Align the gold fingers with the slot and press until the latch clicks.',
      },
      {
        title: 'Power and screws',
        detail:
          'Screw the bracket to the case and plug in required 6/8/12-pin PCIe power.',
      },
    ],
    safetyTips: [
      'Support heavy GPUs with a brace to reduce slot stress.',
      'Use separate PSU cables for multi-connector GPUs when possible.',
    ],
    animationKey: 'gpu',
  },
};
