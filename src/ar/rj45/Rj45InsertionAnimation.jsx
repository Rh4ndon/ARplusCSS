import React from 'react';
import { ViroAnimations, ViroBox, ViroMaterials, ViroNode } from '@reactvision/react-viro';
import {
  CONNECTOR_END_A_ALIGN,
  CONNECTOR_END_B_ALIGN,
  WIRES,
  WIRE_INSERT_BASE,
  WIRE_INSERT_ROTATION,
  WIRE_INSERT_SCALE,
  WIRE_INSERT_SPACING,
  WIRE_INSERT_SLIDE_Z,
  getTargetOrder,
  wireById,
} from './wireLayout';

ViroMaterials.createMaterials(
  WIRES.reduce(
    (acc, wire) => {
      acc[`insertWire_${wire.id}`] = { diffuseColor: wire.color, lightingModel: 'Constant' };
      if (!wire.solid) {
        acc[`insertStripe_${wire.id}`] = { diffuseColor: wire.stripeColor, lightingModel: 'Constant' };
      }
      return acc;
    },
    {}
  )
);

ViroAnimations.registerAnimations({
  rj45Insert: {
    properties: { positionZ: WIRE_INSERT_SLIDE_Z },
    easing: 'EaseOut',
    duration: 900,
  },
});

const STRIPE_WIDTH = WIRE_INSERT_SCALE[0] * 0.3;
const STRIPE_CENTER = (WIRE_INSERT_SCALE[0] - STRIPE_WIDTH) / 2;

function WireRod({ wire, index }) {
  const x = WIRE_INSERT_BASE[0] + index * WIRE_INSERT_SPACING;
  const base = [x, WIRE_INSERT_BASE[1], WIRE_INSERT_BASE[2]];
  const anim = { name: 'rj45Insert', run: true, loop: false };
  if (wire.solid) {
    return (
      <ViroBox
        position={base}
        scale={WIRE_INSERT_SCALE}
        materials={[`insertWire_${wire.id}`]}
        animation={anim}
      />
    );
  }
  return (
    <ViroNode position={base} animation={anim}>
      <ViroBox
        position={[-STRIPE_WIDTH / 2, 0, 0]}
        scale={[WIRE_INSERT_SCALE[0] - STRIPE_WIDTH, WIRE_INSERT_SCALE[1], WIRE_INSERT_SCALE[2]]}
        materials={[`insertWire_${wire.id}`]}
      />
      <ViroBox
        position={[STRIPE_CENTER, 0, 0]}
        scale={[STRIPE_WIDTH, WIRE_INSERT_SCALE[1], WIRE_INSERT_SCALE[2]]}
        materials={[`insertStripe_${wire.id}`]}
      />
    </ViroNode>
  );
}

function InsertingEnd({ align, order }) {
  return (
    <ViroNode position={align.position} rotation={align.rotation}>
      <ViroNode rotation={WIRE_INSERT_ROTATION}>
        {order.map((wireId, index) => (
          <WireRod key={wireId} wire={wireById(wireId)} index={index} />
        ))}
      </ViroNode>
    </ViroNode>
  );
}

/** Temporary colored conductor motion shown after both ends are arranged correctly. */
export function Rj45InsertionAnimation({ wiringType = 'straight' }) {
  return (
    <ViroNode>
      <InsertingEnd align={CONNECTOR_END_A_ALIGN} order={getTargetOrder(wiringType, 0)} />
      <InsertingEnd align={CONNECTOR_END_B_ALIGN} order={getTargetOrder(wiringType, 1)} />
    </ViroNode>
  );
}
