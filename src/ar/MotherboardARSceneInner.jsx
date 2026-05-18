import React, { useEffect, useState } from 'react';
import {
  ViroARImageMarker,
  ViroARScene,
  ViroAnimations,
  ViroMaterials,
  ViroNode,
  ViroQuad,
  ViroText,
} from '@reactvision/react-viro';
import { motherboardHotspots } from './hotspots';
import { SlotInstallAnimation } from './SlotInstallAnimation';
import { MOTHERBOARD_TARGET_NAME } from './trackingTargets';
import { componentGuides } from '../data/componentGuides';
import {
  getARSceneState,
  notifyMarkerFound,
  notifyMarkerLost,
  notifySelectSlot,
  subscribeARSceneState,
} from './arSceneBridge';

ViroMaterials.createMaterials({
  boardGlow: {
    diffuseColor: '#1e3a5f',
    lightingModel: 'Constant',
  },
  hotspotIdle: {
    diffuseColor: '#f97316',
    lightingModel: 'Constant',
  },
  hotspotActive: {
    diffuseColor: '#34d399',
    lightingModel: 'Constant',
  },
});

ViroAnimations.registerAnimations({
  boardPopIn: {
    properties: { scaleX: 1, scaleY: 1, scaleZ: 1, opacity: 1 },
    easing: 'EaseOut',
    duration: 650,
  },
  hotspotPulse: {
    properties: { scaleX: 1.12, scaleY: 1.12, scaleZ: 1.12 },
    easing: 'EaseInEaseOut',
    duration: 450,
  },
});

const hotspotLabelStyle = {
  fontFamily: 'Arial',
  fontSize: 14,
  color: '#ffffff',
  textAlign: 'center',
};

export function MotherboardARSceneInner() {
  const [bridge, setBridge] = useState(getARSceneState);

  useEffect(() => subscribeARSceneState(setBridge), []);

  const { activeSlot, playInstallAnim } = bridge;
  const activeHotspot = motherboardHotspots.find((h) => h.id === activeSlot);

  return (
    <ViroARScene>
      <ViroARImageMarker
        target={MOTHERBOARD_TARGET_NAME}
        onAnchorFound={() => notifyMarkerFound()}
        onAnchorUpdated={() => notifyMarkerFound()}
        onAnchorRemoved={() => notifyMarkerLost()}
      >
        <ViroNode animation={{ name: 'boardPopIn', run: true, loop: false }}>
          <ViroQuad
            rotation={[-90, 0, 0]}
            width={0.2}
            height={0.14}
            position={[0, 0.001, 0]}
            materials={['boardGlow']}
            opacity={0.3}
          />
        </ViroNode>

        {motherboardHotspots.map((hotspot) => {
          const isActive = activeSlot === hotspot.id;
          const [w, h] = hotspot.size;
          return (
            <ViroNode key={hotspot.id} position={hotspot.position}>
              <ViroQuad
                rotation={[-90, 0, 0]}
                width={w}
                height={h}
                materials={[isActive ? 'hotspotActive' : 'hotspotIdle']}
                opacity={isActive ? 0.9 : 0.5}
                onClick={() => notifySelectSlot(hotspot.id)}
                animation={
                  isActive
                    ? { name: 'hotspotPulse', run: true, loop: true }
                    : undefined
                }
              />
              <ViroText
                text={componentGuides[hotspot.id].shortLabel}
                position={[0, 0.015, 0]}
                rotation={[-90, 0, 0]}
                width={0.09}
                height={0.035}
                style={hotspotLabelStyle}
                onClick={() => notifySelectSlot(hotspot.id)}
              />
            </ViroNode>
          );
        })}

        {activeHotspot && playInstallAnim && (
          <SlotInstallAnimation
            slotId={activeHotspot.id}
            anchorPosition={activeHotspot.position}
            visible
          />
        )}
      </ViroARImageMarker>
    </ViroARScene>
  );
}
