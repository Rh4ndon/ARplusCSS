import React, { useEffect, useRef, useState } from 'react';
import {
  ViroARImageMarker,
  ViroARScene,
  ViroAnimations,
  ViroBox,
  ViroMaterials,
  ViroNode,
  ViroQuad,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
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
  prerequisites,
  subscribeARSceneState,
} from './arSceneBridge';

ViroMaterials.createMaterials({
  boardGlow: {
    diffuseColor: '#1e3a5f',
    lightingModel: 'Constant',
  },
  hotspotAvailable: {
    diffuseColor: '#3b82f6',
    lightingModel: 'Constant',
  },
  hotspotLocked: {
    diffuseColor: '#475569',
    lightingModel: 'Constant',
  },
  hotspotInstalled: {
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
    properties: { scaleX: 1.15, scaleY: 1.15, scaleZ: 1.15 },
    easing: 'EaseInEaseOut',
    duration: 500,
  },
  componentPopIn: {
    properties: { scaleX: 1, scaleY: 1, scaleZ: 1 },
    easing: 'Bounce',
    duration: 900,
  },
});

const hotspotLabelStyle = {
  fontFamily: 'Arial',
  fontSize: 14,
  color: '#ffffff',
  textAlign: 'center',
};

const HOTSPOT_ZONES = {
  cpu: { x: [-0.05, -0.015], y: [0.115, 0.145] },
};

const COMPONENT_MODELS = {
  cpu: { source: require('../../assets/models/components/cpu.glb'), scale: [0.025, 0.025, 0.025], rotation: [-90, 0, 0] },
  cpuBlock: { source: require('../../assets/models/components/fan.glb'), scale: [0.025, 0.025, 0.025], rotation: [-90, 0, 0] },
  ram: { source: require('../../assets/models/components/ram.glb'), scale: [0.025, 0.025, 0.025], rotation: [-90, 0, 0] },
};

export function MotherboardARSceneInner() {
  const [bridge, setBridge] = useState(getARSceneState);
  const [modelError, setModelError] = useState(false);

  useEffect(() => subscribeARSceneState(setBridge), []);

  const { activeSlot, playInstallAnim, torchOn, installedSlots } = bridge;
  const activeHotspot = motherboardHotspots.find((h) => h.id === activeSlot);

  const isSlotInstalled = (id) => installedSlots.includes(id);
  const isSlotAvailable = (id) => {
    if (isSlotInstalled(id)) return false;
    const deps = prerequisites[id] || [];
    return deps.every((d) => installedSlots.includes(d));
  };

  return (
    <ViroARScene cameraFlash={torchOn ? 'on' : 'off'}>
      <ViroAmbientLight color="#ffffff" intensity={350} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -1]}
        intensity={500}
      />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, 0, 1]}
        intensity={200}
      />

      <ViroARImageMarker
        target={MOTHERBOARD_TARGET_NAME}
        onAnchorFound={() => notifyMarkerFound()}
        onAnchorUpdated={() => notifyMarkerFound()}
        onAnchorRemoved={() => notifyMarkerLost()}
      >
        <Viro3DObject
          source={require('../../assets/models/motherboard/motherboard.glb')}
          type="GLB"
          position={[-0.01, 0.01, 0]}
          scale={[0.25, 0.25, 0.25]}
          rotation={[1, 181, 3]}
          onError={(error) => {
            console.log('Model loading error:', error);
            setModelError(true);
          }}
          onLoad={() => {
            console.log('Model loaded successfully');
            setModelError(false);
          }}
          onClickState={(state, pos) => {
            if (state === 3) {
              const available = motherboardHotspots.filter((h) => isSlotAvailable(h.id));
              if (available.length > 0) {
                console.log('[DEBUG] Model tap → installing:', available[0].id);
                notifySelectSlot(available[0].id);
              }
            }
          }}
        />

        {motherboardHotspots.map((hotspot) => {
          const installed = isSlotInstalled(hotspot.id);
          const available = isSlotAvailable(hotspot.id);
          const isActive = activeSlot === hotspot.id;
          const modelConfig = COMPONENT_MODELS[hotspot.id];
          const [w, h] = hotspot.size;

          console.log('[DEBUG] Hotspot render:', hotspot.id, 'installed:', installed, 'available:', available, 'isActive:', isActive, 'modelConfig:', !!modelConfig);

          if (installed && modelConfig) {
            console.log('[DEBUG] → RENDERING 3D MODEL FOR:', hotspot.id);
            return (
              <ViroNode key={hotspot.id} position={hotspot.position}>
                <ViroQuad
                  rotation={[-90, 0, 0]}
                  width={w}
                  height={h}
                  materials={['hotspotInstalled']}
                  opacity={0.9}
                  animation={{ name: 'hotspotPulse', run: true, loop: true }}
                />
                <Viro3DObject
                  source={modelConfig.source}
                  type="GLB"
                  position={[0, 0.01, 0]}
                  scale={modelConfig.scale}
                  rotation={modelConfig.rotation}
                  onLoad={() => console.log('[DEBUG] Component model loaded:', hotspot.id)}
                  onError={(err) => console.log('[DEBUG] Component model error:', hotspot.id, err)}
                />
              </ViroNode>
            );
          }

          return null;
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