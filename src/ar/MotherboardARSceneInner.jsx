import React, { useEffect, useState } from 'react';
import {
  ViroARImageMarker,
  ViroARScene,
  ViroAnimations,
  ViroMaterials,
  ViroNode,
  ViroQuad,
  ViroText,
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
  const [modelError, setModelError] = useState(false);

  useEffect(() => subscribeARSceneState(setBridge), []);

  const { activeSlot, playInstallAnim, torchOn } = bridge;
  const activeHotspot = motherboardHotspots.find((h) => h.id === activeSlot);

  return (
    <ViroARScene cameraFlash={torchOn ? 'on' : 'off'}>
      {/* Higher-intensity lights so the tracked motherboard is well-illuminated */}
      <ViroAmbientLight color="#ffffff" intensity={350} />
      <ViroDirectionalLight 
        color="#ffffff" 
        direction={[0, -1, -1]} 
        intensity={500}
      />
      {/* Fill light from the front to reduce harsh shadows on the real board */}
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
        <ViroNode animation={{ name: 'boardPopIn', run: true, loop: false }}>
          <ViroQuad
            rotation={[0, 0, 0]}
            width={0.2}
            height={0.14}
            position={[0, 0.001, 0]}
            materials={['boardGlow']}
            opacity={0.3}
          />
        </ViroNode>

        
        <Viro3DObject
          source={require('../../assets/models/motherboard/motherboard.glb')}
          type="GLB"
          position={[-0.01, 0, 0]}
          scale={[0.13, 0.13, 0.13]}
          rotation={[260, 0, 0]}
          onError={(error) => {
            console.log('Model loading error:', error);
            setModelError(true);
          }}
          onLoad={() => {
            console.log('Model loaded successfully');
            setModelError(false);
          }}
        />

        {/* Debug text */}
        {modelError && (
          <ViroText
            text="Model failed to load. Check scale/position or GLB format."
            position={[0, 0.05, 0]}
            rotation={[-90, 0, 0]}
            width={0.2}
            height={0.05}
            style={{ fontFamily: 'Arial', fontSize: 12, color: 'red' }}
          />
        )}

        {/* Hotspots - Only show when active or when a slot is selected */}
        {motherboardHotspots.map((hotspot) => {
          const isActive = activeSlot === hotspot.id;
          // Only render the hotspot if it's active OR if we want to show all with low opacity
          // To completely hide inactive hotspots, use this condition:
          if (!isActive) return null; // ← This hides all inactive hotspots
          
          const [w, h] = hotspot.size;
          return (
            <ViroNode key={hotspot.id} position={hotspot.position}>
              <ViroQuad
                rotation={[-90, 0, 0]}
                width={w}
                height={h}
                materials={['hotspotActive']}  // Always active since we filtered
                opacity={0.9}
                onClick={() => notifySelectSlot(hotspot.id)}
                animation={{ name: 'hotspotPulse', run: true, loop: true }}
              />
              {/* Optional: Add text labels back if needed */}
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