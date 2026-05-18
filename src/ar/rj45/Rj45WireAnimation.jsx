import React from 'react';
import {
  ViroAnimations,
  ViroBox,
  ViroMaterials,
  ViroNode,
  ViroQuad,
} from '@reactvision/react-viro';

ViroMaterials.createMaterials({
  wireOrange: { diffuseColor: '#f97316', lightingModel: 'Constant' },
  wireGreen: { diffuseColor: '#22c55e', lightingModel: 'Constant' },
  wireBlue: { diffuseColor: '#3b82f6', lightingModel: 'Constant' },
  rj45Glow: { diffuseColor: '#4ade80', lightingModel: 'Constant' },
});

ViroAnimations.registerAnimations({
  wireSlide: {
    properties: { positionZ: -0.015 },
    easing: 'EaseOut',
    duration: 900,
  },
  crimpPress: {
    properties: { scaleY: 0.85 },
    easing: 'EaseInEaseOut',
    duration: 600,
  },
});

export function Rj45WireAnimation({ stepId, anchorPosition, wiringType, visible }) {
  if (!visible) {
    return null;
  }

  const [x, y, z] = anchorPosition;
  const isCrossover = wiringType === 'crossover';

  return (
    <ViroNode position={[x, y, z]}>
      <ViroQuad
        rotation={[-90, 0, 0]}
        width={0.05}
        height={0.05}
        materials={['rj45Glow']}
        opacity={0.35}
      />
      {(stepId === 'order' || stepId === 'insert') && (
        <>
          <ViroBox
            position={[-0.015, 0, 0.02]}
            scale={[0.003, 0.003, 0.025]}
            materials={['wireOrange']}
            animation={{ name: 'wireSlide', run: true, loop: false }}
          />
          <ViroBox
            position={[0, 0, 0.02]}
            scale={[0.003, 0.003, 0.025]}
            materials={['wireGreen']}
            animation={{ name: 'wireSlide', run: true, loop: false }}
          />
          <ViroBox
            position={[0.015, 0, 0.02]}
            scale={[0.003, 0.003, 0.025]}
            materials={isCrossover ? ['wireOrange'] : ['wireBlue']}
            animation={{ name: 'wireSlide', run: true, loop: false }}
          />
        </>
      )}
      {stepId === 'crimp' && (
        <ViroBox
          position={[0, 0.01, 0]}
          scale={[0.04, 0.015, 0.02]}
          materials={['wireBlue']}
          animation={{ name: 'crimpPress', run: true, loop: true }}
        />
      )}
    </ViroNode>
  );
}
