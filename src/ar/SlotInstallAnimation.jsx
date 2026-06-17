import React, { useEffect, useRef } from 'react';
import {
  ViroAnimations,
  ViroBox,
  ViroMaterials,
  ViroNode,
  ViroQuad,
} from '@reactvision/react-viro';

ViroMaterials.createMaterials({
  cpuPart: { diffuseColor: '#94a3b8' },
  cpuBlockPart: { diffuseColor: '#06b6d4' },
  ramPart: { diffuseColor: '#22d3ee' },
  powerPart: { diffuseColor: '#fbbf24' },
  gpuPart: { diffuseColor: '#f97316' },
  glow: { diffuseColor: '#60a5fa', lightingModel: 'Constant' },
});

ViroAnimations.registerAnimations({
  installPulse: {
    properties: { scaleX: 1.08, scaleY: 1.08, scaleZ: 1.08 },
    easing: 'EaseOut',
    duration: 400,
  },
  ramSlideIn: {
    properties: { positionY: 0.02 },
    easing: 'EaseOut',
    duration: 900,
  },
  cpuDropIn: {
    properties: { positionY: 0.02 },
    easing: 'Bounce',
    duration: 1100,
  },
  cpuBlockDropIn: {
    properties: { positionY: 0.04 },
    easing: 'Bounce',
    duration: 1100,
  },
  cablePlugIn: {
    properties: { positionZ: -0.01 },
    easing: 'EaseOut',
    duration: 800,
  },
  gpuSeatIn: {
    properties: { positionY: -0.05 },
    easing: 'EaseOut',
    duration: 1000,
  },
});

const SLOT_ANIMATION = {
  cpu: 'cpuDropIn',
  cpuBlock: 'cpuBlockDropIn',
  ram: 'ramSlideIn',
  atx24: 'cablePlugIn',
  eps4: 'cablePlugIn',
  gpu: 'gpuSeatIn',
};

export function SlotInstallAnimation({ slotId, anchorPosition, visible }) {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!visible || !nodeRef.current) {
      return;
    }
    const animation = SLOT_ANIMATION[slotId];
    nodeRef.current.setNativeProps?.({
      animation: { name: animation, run: true, loop: false },
    });
  }, [slotId, visible]);

  if (!visible) {
    return null;
  }

  const [x, y, z] = anchorPosition;

  return (
    <ViroNode position={[x, y, z]} ref={nodeRef}>
      <ViroNode
        animation={{
          name: 'installPulse',
          run: true,
          loop: true,
        }}
      >
        <ViroQuad
          rotation={[-90, 0, 0]}
          width={0.06}
          height={0.06}
          materials={['glow']}
          opacity={0.35}
        />
      </ViroNode>
      {slotId === 'cpu' && (
        <ViroBox
          position={[0, 0.05, 0]}
          scale={[0.035, 0.008, 0.035]}
          materials={['cpuPart']}
          animation={{ name: 'cpuDropIn', run: true, loop: false }}
        />
      )}
      {slotId === 'cpuBlock' && (
        <ViroBox
          position={[0, 0.06, 0]}
          scale={[0.045, 0.02, 0.045]}
          materials={['cpuBlockPart']}
          animation={{ name: 'cpuBlockDropIn', run: true, loop: false }}
        />
      )}
      {slotId === 'ram' && (
        <ViroBox
          position={[0, 0.08, 0]}
          scale={[0.008, 0.055, 0.1]}
          materials={['ramPart']}
          animation={{ name: 'ramSlideIn', run: true, loop: false }}
        />
      )}
      {(slotId === 'atx24' || slotId === 'eps4') && (
        <ViroBox
          position={[0, 0, 0.04]}
          scale={[0.03, 0.015, 0.05]}
          materials={['powerPart']}
          animation={{ name: 'cablePlugIn', run: true, loop: false }}
        />
      )}
      {slotId === 'gpu' && (
        <ViroBox
          position={[0, 0.12, 0]}
          scale={[0.1, 0.02, 0.05]}
          materials={['gpuPart']}
          animation={{ name: 'gpuSeatIn', run: true, loop: false }}
        />
      )}
    </ViroNode>
  );
}
