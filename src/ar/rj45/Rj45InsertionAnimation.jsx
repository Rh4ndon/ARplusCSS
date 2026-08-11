import React from 'react';
import { ViroAnimations, ViroBox, ViroMaterials, ViroNode } from '@reactvision/react-viro';
import { CONNECTOR_END_A_ALIGN, CONNECTOR_END_B_ALIGN } from './wireLayout';

ViroMaterials.createMaterials({
  insertWhite: { diffuseColor: '#f8fafc', lightingModel: 'Constant' },
  insertOrange: { diffuseColor: '#f97316', lightingModel: 'Constant' },
  insertGreen: { diffuseColor: '#22c55e', lightingModel: 'Constant' },
  insertBlue: { diffuseColor: '#3b82f6', lightingModel: 'Constant' },
  insertBrown: { diffuseColor: '#92400e', lightingModel: 'Constant' },
});

ViroAnimations.registerAnimations({
  rj45Insert: {
    properties: { positionZ: 0.045 },
    easing: 'EaseOut',
    duration: 900,
  },
});

const materials = ['insertWhite', 'insertOrange', 'insertWhite', 'insertBlue', 'insertWhite', 'insertGreen', 'insertWhite', 'insertBrown'];

function InsertingEnd({ align }) {
  return (
    <ViroNode position={align.position} rotation={align.rotation}>
      {materials.map((material, index) => (
        <ViroBox
          key={index}
          position={[-0.017 + index * 0.0048, 0, -0.045]}
          rotation={align.wireRotation}
          scale={[0.0015, 0.0015, 0.026]}
          materials={[material]}
          animation={{ name: 'rj45Insert', run: true, loop: false }}
        />
      ))}
    </ViroNode>
  );
}

/** Temporary colored conductor motion shown after both ends are arranged correctly. */
export function Rj45InsertionAnimation() {
  return (
    <ViroNode>
      <InsertingEnd align={CONNECTOR_END_A_ALIGN} />
      <InsertingEnd align={CONNECTOR_END_B_ALIGN} />
    </ViroNode>
  );
}
