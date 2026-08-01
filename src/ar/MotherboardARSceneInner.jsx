import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ViroARImageMarker,
  ViroARScene,
  ViroAnimations,
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

/** Per-slot press-in: start elevated on Y+Z, then ease both down into the board. */
const INSTALL_MOTION = {
  cpu: { hoverY: 0.045, hoverZ: 0.07, seatMs: 720 },
  cpuBlock: { hoverY: 0.05, hoverZ: 0.075, seatMs: 780 },
  ram: { hoverY: 0.05, hoverZ: 0.08, seatMs: 680 },
  eps4: { hoverY: 0.04, hoverZ: 0.06, seatMs: 560 },
  atx24: { hoverY: 0.04, hoverZ: 0.06, seatMs: 580 },
  sata: { hoverY: 0.035, hoverZ: 0.055, seatMs: 540 },
  frontPanelUsb: { hoverY: 0.035, hoverZ: 0.055, seatMs: 540 },
  switches: { hoverY: 0.03, hoverZ: 0.05, seatMs: 520 },
  gpu: { hoverY: 0.055, hoverZ: 0.09, seatMs: 820 },
};

const DEFAULT_INSTALL_MOTION = { hoverY: 0.045, hoverZ: 0.07, seatMs: 680 };

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

function getInstallHoverY(slotId, hotspotY) {
  const motion = INSTALL_MOTION[slotId] ?? DEFAULT_INSTALL_MOTION;
  return hotspotY + motion.hoverY;
}

function getInstallHoverZ(slotId, hotspotZ) {
  const motion = INSTALL_MOTION[slotId] ?? DEFAULT_INSTALL_MOTION;
  return Math.max(hotspotZ + motion.hoverZ, getDragZMin(slotId));
}

function buildInstallAnimations() {
  const anims = {};

  for (const hotspot of motherboardHotspots) {
    const motion = INSTALL_MOTION[hotspot.id] ?? DEFAULT_INSTALL_MOTION;
    const [, ty, tz] = hotspot.position;

    // Ease Y + Z down together — like lowering and seating the part into the board.
    anims[`${hotspot.id}Install`] = {
      properties: {
        positionY: ty,
        positionZ: tz,
      },
      easing: 'EaseInEaseOut',
      duration: motion.seatMs,
    };
  }

  return anims;
}

ViroAnimations.registerAnimations(buildInstallAnimations());

function installAnimName(slotId) {
  return `${slotId}Install`;
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
  /** While set, the part is playing its seat-into-board animation (no drag). */
  const [installAnim, setInstallAnim] = useState(null);

  useEffect(
    () =>
      subscribeARSceneState((s) => {
        setInstalledSlots(s.installedSlots);
        setPlacingSlot(s.placingSlot);
      }),
    [],
  );

  useLayoutEffect(() => {
    if (placingSlot && !installedSlots.includes(placingSlot) && !installAnim) {
      snappedRef.current = false;
      const hotspot = motherboardHotspots.find((h) => h.id === placingSlot);
      const startPos = getDragStart(hotspot, placingSlot);
      setModelPos(startPos);
      dragPosRef.current = null;
    }
  }, [placingSlot, installedSlots, installAnim]);

  const nextComponent = INSTALL_ORDER.find((id) => !installedSlots.includes(id));

  const activeSlotId = installAnim?.slotId ?? (
    placingSlot && !installedSlots.includes(placingSlot) ? placingSlot : null
  );
  const isAnimatingInstall = !!installAnim;
  const isPlacing = !!activeSlotId && !isAnimatingInstall;
  const activeModelConfig = activeSlotId ? COMPONENT_MODELS[activeSlotId] : null;
  const placingHotspot = activeSlotId
    ? motherboardHotspots.find((h) => h.id === activeSlotId)
    : null;

  const finishInstallAnimation = (slotId) => {
    notifyInstallComplete(slotId);
    setInstallAnim(null);
    patchARSceneState({ placingSlot: null });
  };

  const completeInstall = (slotId) => {
    if (snappedRef.current) return;
    if (!COMPONENT_MODELS[slotId]) return;
    snappedRef.current = true;

    const hotspot = motherboardHotspots.find((h) => h.id === slotId);
    const fromPos = dragPosRef.current ?? modelPos;
    // Snap over the socket, elevated on Y + Z, then animate both down into the board.
    const startPos = hotspot
      ? [
          hotspot.position[0],
          Math.max(fromPos[1], getInstallHoverY(slotId, hotspot.position[1])),
          Math.max(fromPos[2], getInstallHoverZ(slotId, hotspot.position[2])),
        ]
      : fromPos;

    setModelPos(startPos);
    dragPosRef.current = startPos;
    setInstallAnim({ slotId, fromPos: startPos });
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
          const isActivePlaceTarget =
            activeSlotId === hotspot.id && !installedSlots.includes(hotspot.id);

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

          if (isActivePlaceTarget) {
            return (
              <ViroNode key={`hotspot-${hotspot.id}`} position={hotspot.position}>
                <ViroQuad
                  rotation={[-90, 0, 0]}
                  width={w}
                  height={h}
                  materials={['hotspotAvailable']}
                  opacity={isAnimatingInstall ? 0.35 : 0.6}
                  onClickState={(state) => {
                    if (state !== 3) return;
                    if (isAnimatingInstall) return;
                    completeInstall(activeSlotId);
                  }}
                />
              </ViroNode>
            );
          }

          return null;
        })}

        {nextComponent && COMPONENT_MODELS[nextComponent] && !activeSlotId && (
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

        {activeSlotId && activeModelConfig && placingHotspot && (
          <ViroNode
            key={`placing-${activeSlotId}`}
            position={modelPos}
            dragType={isAnimatingInstall ? undefined : 'FixedToWorld'}
            onDrag={
              isAnimatingInstall
                ? undefined
                : (pos) => {
                    const clamped = clampDragPosition(pos, activeSlotId);
                    setModelPos(clamped);
                    dragPosRef.current = clamped;
                  }
            }
            onClickState={
              isAnimatingInstall
                ? undefined
                : (state) => {
                    if (state !== 3) return;
                    completeInstall(activeSlotId);
                  }
            }
            animation={
              isAnimatingInstall
                ? {
                    name: installAnimName(activeSlotId),
                    run: true,
                    loop: false,
                    onFinish: () => finishInstallAnimation(activeSlotId),
                  }
                : undefined
            }
          >
            <ComponentModel
              trackLoading={isPlacing}
              source={activeModelConfig.source}
              position={activeModelConfig.position ?? [0, 0, 0]}
              scale={activeModelConfig.scale}
              rotation={activeModelConfig.rotation}
            />
          </ViroNode>
        )}
      </ViroARImageMarker>
    </ViroARScene>
  );
}
