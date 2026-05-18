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
import { rj45Hotspots } from './rj45Hotspots';
import { Rj45WireAnimation } from './Rj45WireAnimation';
import { RJ45_TARGET_NAME } from './trackingTargets';
import { getCablingGuide } from '../../data/cablingGuides';
import {
  getRj45SceneState,
  notifyRj45MarkerFound,
  notifyRj45MarkerLost,
  notifyRj45SelectStep,
  subscribeRj45SceneState,
} from './rj45SceneBridge';

ViroMaterials.createMaterials({
  rj45Plate: { diffuseColor: '#1e3a5f', lightingModel: 'Constant' },
  rj45HotspotIdle: { diffuseColor: '#22c55e', lightingModel: 'Constant' },
  rj45HotspotActive: { diffuseColor: '#facc15', lightingModel: 'Constant' },
});

ViroAnimations.registerAnimations({
  rj45PopIn: {
    properties: { scaleX: 1, scaleY: 1, scaleZ: 1, opacity: 1 },
    easing: 'EaseOut',
    duration: 650,
  },
  rj45HotspotPulse: {
    properties: { scaleX: 1.12, scaleY: 1.12, scaleZ: 1.12 },
    easing: 'EaseInEaseOut',
    duration: 450,
  },
});

const labelStyle = {
  fontFamily: 'Arial',
  fontSize: 11,
  color: '#ffffff',
  textAlign: 'center',
};

export function Rj45ARSceneInner() {
  const [bridge, setBridge] = useState(getRj45SceneState);

  useEffect(() => subscribeRj45SceneState(setBridge), []);

  const { wiringType, activeStep, playInstallAnim } = bridge;
  const activeHotspot = rj45Hotspots.find((h) => h.id === activeStep);

  return (
    <ViroARScene>
      <ViroARImageMarker
        target={RJ45_TARGET_NAME}
        onAnchorFound={() => notifyRj45MarkerFound()}
        onAnchorUpdated={() => notifyRj45MarkerFound()}
        onAnchorRemoved={() => notifyRj45MarkerLost()}
      >
        <ViroNode animation={{ name: 'rj45PopIn', run: true, loop: false }}>
          <ViroQuad
            rotation={[-90, 0, 0]}
            width={0.14}
            height={0.09}
            position={[0, 0.001, 0]}
            materials={['rj45Plate']}
            opacity={0.35}
          />
        </ViroNode>

        {rj45Hotspots.map((hotspot) => {
          const isActive = activeStep === hotspot.id;
          const guide = getCablingGuide(wiringType, hotspot.id);
          const [w, h] = hotspot.size;
          return (
            <ViroNode key={hotspot.id} position={hotspot.position}>
              <ViroQuad
                rotation={[-90, 0, 0]}
                width={w}
                height={h}
                materials={[isActive ? 'rj45HotspotActive' : 'rj45HotspotIdle']}
                opacity={isActive ? 0.9 : 0.55}
                onClick={() => notifyRj45SelectStep(hotspot.id)}
                animation={
                  isActive
                    ? { name: 'rj45HotspotPulse', run: true, loop: true }
                    : undefined
                }
              />
              <ViroText
                text={guide?.shortLabel ?? hotspot.id}
                position={[0, 0.012, 0]}
                rotation={[-90, 0, 0]}
                width={0.07}
                height={0.03}
                style={labelStyle}
                onClick={() => notifyRj45SelectStep(hotspot.id)}
              />
            </ViroNode>
          );
        })}

        {activeHotspot && playInstallAnim && (
          <Rj45WireAnimation
            stepId={activeHotspot.id}
            anchorPosition={activeHotspot.position}
            wiringType={wiringType}
            visible
          />
        )}
      </ViroARImageMarker>
    </ViroARScene>
  );
}
