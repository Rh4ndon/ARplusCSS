import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ViroARImageMarker,
  ViroARScene,
  ViroMaterials,
  ViroNode,
  ViroQuad,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
} from '@reactvision/react-viro';
import { motherboardHotspots } from './hotspots';
import { MOTHERBOARD_TARGET_NAME } from './trackingTargets';
import {
  getARSceneState,
  notifyInstallComplete,
  notifyMarkerFound,
  notifyMarkerLost,
  notifyModelLoadEnd,
  notifyModelLoadStart,
  notifySelectSlot,
  patchARSceneState,
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
});

export const COMPONENT_MODELS = {
  cpu: { source: require('../../assets/models/components/cpu.glb'), position: [-0.005, -0.02, -0.008], scale: [0.040, 0.040, 0.040], rotation: [184, 0, 66], dragZMin: 0.08},
  cpuBlock: { source: require('../../assets/models/components/fan.glb'), position: [-0.006, 0.01, -0.001], scale: [0.0065, 0.0065, 0.0065], rotation: [180, 0, 185], dragZMin: 0.04 },
  ram: { source: require('../../assets/models/components/ram.glb'), position: [-0.005, 0.0020, 0.015], scale: [0.00129, 0.00129, 0.00129], rotation: [91.5, 91, 9], dragZMin: 0.1 },
};

const DEFAULT_DRAG_Z_MIN = 0.05;
const INSTALL_ORDER = ['cpu', 'cpuBlock', 'ram', 'eps4', 'atx24', 'sata', 'frontPanelUsb', 'powerSw', 'resetSw', 'gpu'];

function getDragZMin(slotId) {
  return COMPONENT_MODELS[slotId]?.dragZMin ?? DEFAULT_DRAG_Z_MIN;
}

function clampDragPosition(pos, slotId) {
  const dragZMin = getDragZMin(slotId);
  return [pos[0], pos[1], Math.max(pos[2], dragZMin)];
}

function getDragStart(hotspot, slotId) {
  const dragZMin = getDragZMin(slotId);
  if (!hotspot) return [0, 0.03, dragZMin];
  return [hotspot.position[0], hotspot.position[1] + 0.03, dragZMin];
}

function ComponentModel({ source, trackLoading = false, onLoadStart, onLoadEnd, ...props }) {
  return (
    <Viro3DObject
      source={source}
      type="GLB"
      onLoadStart={
        trackLoading
          ? () => {
              notifyModelLoadStart();
              onLoadStart?.();
            }
          : undefined
      }
      onLoadEnd={
        trackLoading
          ? () => {
              notifyModelLoadEnd();
              onLoadEnd?.();
            }
          : undefined
      }
      {...props}
    />
  );
}

export function MotherboardARSceneInner() {
  const [installedSlots, setInstalledSlots] = useState(
    () => getARSceneState().installedSlots,
  );
  const [placingSlot, setPlacingSlot] = useState(
    () => getARSceneState().placingSlot,
  );
  const snappedRef = useRef(false);
  const dragPosRef = useRef(null);
  const [modelPos, setModelPos] = useState([0, 0.03, DEFAULT_DRAG_Z_MIN]);

  useEffect(
    () =>
      subscribeARSceneState((s) => {
        setInstalledSlots(s.installedSlots);
        setPlacingSlot(s.placingSlot);
      }),
    [],
  );

  useLayoutEffect(() => {
    if (placingSlot && !installedSlots.includes(placingSlot)) {
      snappedRef.current = false;
      const hotspot = motherboardHotspots.find((h) => h.id === placingSlot);
      const startPos = getDragStart(hotspot, placingSlot);
      setModelPos(startPos);
      dragPosRef.current = null;
    }
  }, [placingSlot, installedSlots]);

  const nextComponent = INSTALL_ORDER.find((id) => !installedSlots.includes(id));
  const isSlotAvailable = (id) => id === nextComponent;

  const isPlacing = placingSlot && !installedSlots.includes(placingSlot);
  const placingModelConfig = isPlacing ? COMPONENT_MODELS[placingSlot] : null;
  const placingHotspot = isPlacing ? motherboardHotspots.find((h) => h.id === placingSlot) : null;

  const completeInstall = (slotId) => {
    if (snappedRef.current) return;
    snappedRef.current = true;
    notifyInstallComplete(slotId);
    patchARSceneState({ placingSlot: null });
  };

  return (
    <ViroARScene>
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
          ignoreEventHandling={!!placingSlot}
          onClickState={(state) => {
            if (state !== 3) return;
            if (placingSlot) return;
            if (nextComponent) {
              notifySelectSlot(nextComponent);
            }
          }}
        />

        {motherboardHotspots.map((hotspot) => {
          const modelConfig = COMPONENT_MODELS[hotspot.id];
          const [w, h] = hotspot.size;

          if (installedSlots.includes(hotspot.id) && modelConfig) {
            return (
              <ViroNode key={`installed-${hotspot.id}`} position={hotspot.position}>
                <Viro3DObject
                  source={modelConfig.source}
                  type="GLB"
                  position={modelConfig.position}
                  scale={modelConfig.scale}
                  rotation={modelConfig.rotation}
                />
              </ViroNode>
            );
          }

          if (isSlotAvailable(hotspot.id) && !installedSlots.includes(hotspot.id) && (!isPlacing || hotspot.id === placingSlot)) {
            const isTarget = isPlacing && hotspot.id === placingSlot;
            return (
              <ViroNode key={`hotspot-${hotspot.id}`} position={hotspot.position}>
                <ViroQuad
                  rotation={[-90, 0, 0]}
                  width={w}
                  height={h}
                  materials={['hotspotAvailable']}
                  opacity={isTarget ? 0.6 : 0.3}
                  onClickState={isTarget ? (state) => {
                    if (state !== 3) return;
                    completeInstall(placingSlot);
                  } : undefined}
                />
              </ViroNode>
            );
          }

          return null;
        })}

        {nextComponent && COMPONENT_MODELS[nextComponent] && !isPlacing && (
          <ViroNode visible={false}>
            <ComponentModel
              trackLoading
              source={COMPONENT_MODELS[nextComponent].source}
            />
          </ViroNode>
        )}

        {isPlacing && placingModelConfig && placingHotspot && (
          <ViroNode
            key={`placing-${placingSlot}`}
            position={modelPos}
            dragType="FixedToWorld"
            onDrag={(pos) => {
              const clamped = clampDragPosition(pos, placingSlot);
              setModelPos(clamped);
              dragPosRef.current = clamped;
            }}
            onClickState={(state) => {
              if (state !== 3) return;
              completeInstall(placingSlot);
            }}
          >
            <ComponentModel
              trackLoading
              source={placingModelConfig.source}
              position={[0, 0, 0]}
              scale={placingModelConfig.scale}
              rotation={placingModelConfig.rotation}
            />
          </ViroNode>
        )}
      </ViroARImageMarker>
    </ViroARScene>
  );
}
