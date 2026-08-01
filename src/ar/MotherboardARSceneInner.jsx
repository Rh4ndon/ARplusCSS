import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  cpuBlock: { source: require('../../assets/models/components/cpu-block.glb'), position: [-0.006, 0.01, -0.001], scale: [0.0065, 0.0065, 0.0065], rotation: [180, 0, 185], dragZMin: 0.04 },
  ram: { source: require('../../assets/models/components/ram.glb'), position: [-0.005, 0.0020, 0.015], scale: [0.00129, 0.00129, 0.00129], rotation: [91.5, 91, 9], dragZMin: 0.1 },
  eps4: { source: require('../../assets/models/components/4pin.glb'), position: [-0.006, 0.01, 0.001], scale: [0.00129, 0.00129, 0.00129], rotation: [-91.5, -180, 9], dragZMin: 0.1 },
  atx24: { source: require('../../assets/models/components/24pin.glb'), position: [0, 0, 0], scale: [1, 1, 1], rotation: [91.5, 91, 9], dragZMin: 0.1 },
  sata: { source: require('../../assets/models/components/sata-cable.glb'), position: [-0.01, 0.001, 0.008], scale: [0.025, 0.025, 0.025], rotation: [85, 0, 0], dragZMin: 0.1 },
  frontPanelUsb: { source: require('../../assets/models/components/front-panel-usb.glb'), position: [-0.008, -0.03, 0.008], scale: [0.06, 0.06, 0.06], rotation: [90, 0, -85], dragZMin: 0.08 },
  switches: { source: require('../../assets/models/components/switches.glb'), position: [0, 0.005, 0], scale: [0.12, 0.12, 0.12], rotation: [90, 0, 0], dragZMin: 0.08 },
  gpu: { source: require('../../assets/models/components/graphics-card.glb'), position: [0.06, 0.099, -0.006], scale: [0.018, 0.018, 0.018], rotation: [-90, 180, 0], dragZMin: 0.12 },
};

const DEFAULT_DRAG_Z_MIN = 0.05;
const INSTALL_ORDER = ['cpu', 'cpuBlock', 'ram', 'eps4', 'atx24', 'sata', 'frontPanelUsb', 'switches', 'gpu'];

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
              console.log('[LOAD] onLoadStart called');
              notifyModelLoadStart();
              onLoadStart?.();
            }
          : undefined
      }
      onLoadEnd={
        trackLoading
          ? () => {
              console.log('[LOAD] onLoadEnd called');
              notifyModelLoadEnd();
              onLoadEnd?.();
            }
          : undefined
      }
      onError={(e) => console.log('[LOAD] ComponentModel error', e)}
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
    console.log('[LAYOUTEFFECT] deps changed:', { placingSlot, installedSlots: [...installedSlots] });
    if (placingSlot && !installedSlots.includes(placingSlot)) {
      console.log('[LAYOUTEFFECT] resetting for slot:', placingSlot);
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

  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`[RENDER#${renderCount.current}]`, {
    placingSlot,
    installedSlots,
    isPlacing,
    modelPos,
    dragZMin: placingSlot ? getDragZMin(placingSlot) : null,
  });

  useLayoutEffect(() => {
    if (isPlacing && placingSlot && placingModelConfig) {
      console.log('[RENDER] floating model mounting for', placingSlot);
    }
    return () => {
      if (placingSlot) {
        console.log('[RENDER] floating model unmounting for', placingSlot);
      }
    };
  }, [isPlacing, placingSlot, placingModelConfig]);

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
        onAnchorFound={() => {
          notifyMarkerFound();
          patchARSceneState({ pendingModelLoads: 0 });
        }}
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
          onLoadStart={() => console.log('[LOAD] motherboard onLoadStart')}
          onLoadEnd={() => console.log('[LOAD] motherboard onLoadEnd')}
          onError={(e) => console.log('[LOAD] motherboard onError', e)}
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

          if (isPlacing && hotspot.id === placingSlot) {
            return (
              <ViroNode key={`hotspot-${hotspot.id}`} position={hotspot.position}>
                <ViroQuad
                  rotation={[-90, 0, 0]}
                  width={w}
                  height={h}
                  materials={['hotspotAvailable']}
                  opacity={0.6}
                  onClickState={(state) => {
                    if (state !== 3) return;
                    completeInstall(placingSlot);
                  }}
                />
              </ViroNode>
            );
          }

          return null;
        })}

        {nextComponent && COMPONENT_MODELS[nextComponent] && !isPlacing && (
          <ViroNode visible={false}>
            <Viro3DObject
              source={COMPONENT_MODELS[nextComponent].source}
              type="GLB"
              onLoadStart={() => console.log('[LOAD] preload onLoadStart for', nextComponent)}
              onLoadEnd={() => console.log('[LOAD] preload onLoadEnd for', nextComponent)}
              onError={(e) => console.log('[LOAD] preload error for', nextComponent, e)}
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
              position={placingModelConfig.position ?? [0, 0, 0]}
              scale={placingModelConfig.scale}
              rotation={placingModelConfig.rotation}
            />
          </ViroNode>
        )}
      </ViroARImageMarker>
    </ViroARScene>
  );
}
