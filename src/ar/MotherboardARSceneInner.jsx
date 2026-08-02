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
  DEFAULT_BOARD_ALIGN,
  getARSceneState,
  notifyInstallComplete,
  notifyMarkerFound,
  notifyMarkerLost,
  notifyModelLoadEnd,
  notifyModelLoadStart,
  notifySelectSlot,
  notifyWrongPlacement,
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
});

export const COMPONENT_MODELS = {
  cpu: { source: require('../../assets/models/components/cpu.glb'), position: [-0.005, -0.02, -0.008], scale: [0.040, 0.040, 0.040], rotation: [184, 0, 66], dragZMin: 0.1 },
  cpuBlock: { source: require('../../assets/models/components/cpu-block.glb'), position: [-0.006, 0.01, -0.001], scale: [0.0065, 0.0065, 0.0065], rotation: [180, 0, 185], dragZMin: 0.04 },
  ram: { source: require('../../assets/models/components/ram.glb'), position: [-0.005, 0.0020, 0.015], scale: [0.00129, 0.00129, 0.00129], rotation: [91.5, 91, 9], dragZMin: 0.1 },
  eps4: { source: require('../../assets/models/components/4pin.glb'), position: [-0.001, 0.01, -0.003], scale: [0.00129, 0.00129, 0.00129], rotation: [-91.5, -180, 9], dragZMin: 0.1 },
  atx24: { source: require('../../assets/models/components/24pin.glb'), position: [0, 0, 0], scale: [1, 1, 1], rotation: [91.5, 91, 9], dragZMin: 0.1 },
  sata: { source: require('../../assets/models/components/sata-cable.glb'), position: [-0.012, -0.01, 0.008], scale: [0.025, 0.025, 0.025], rotation: [85, 0, 0], dragZMin: 0.1, placementTolerance: 0.2 },
  frontPanelUsb: { source: require('../../assets/models/components/front-panel-usb.glb'), position: [-0.008, -0.03, 0.008], scale: [0.06, 0.06, 0.06], rotation: [90, 0, -85], dragZMin: 0.08, placementTolerance: 0.2 },
  switches: { source: require('../../assets/models/components/switches.glb'), position: [0.009, 0.005, -0.001], scale: [0.12, 0.12, 0.12], rotation: [90, 0, 0], dragZMin: 0.08, placementTolerance: 0.2 },
  gpu: { source: require('../../assets/models/components/graphics-card.glb'), position: [0.065, 0.099, -0.02], scale: [0.018, 0.018, 0.018], rotation: [-90, 180, 0], dragZMin: 0.12 },
};

const DEFAULT_DRAG_Z_MIN = 0.05;
const CONTROL_STEP_BOUNDS = {
  minX: -0.11,
  maxX: 0.12,
  minZ: -0.14,
  maxZ: 0.15,
};
const INSTALL_ORDER = ['cpu', 'cpuBlock', 'ram', 'eps4', 'atx24', 'sata', 'frontPanelUsb', 'switches', 'gpu'];
/** Fraction of the component footprint that must overlap the target hotspot (XZ plane). */
const PLACEMENT_COVERAGE_THRESHOLD = 0.5;
/** Hotspots closer than this (m) are treated as the same socket (e.g. cpu / cpuBlock). */
const COINCIDENT_HOTSPOT_M = 0.012;

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

function getPlacementTolerance(slotId) {
  return COMPONENT_MODELS[slotId]?.placementTolerance
    ?? PLACEMENT_COVERAGE_THRESHOLD;
}

function clampControlledPosition(pos, fallbackPos) {
  if (!Array.isArray(pos) || pos.length !== 3 || !pos.every(Number.isFinite)) {
    return fallbackPos ?? [0, 0.08, 0];
  }
  return [
    Math.max(CONTROL_STEP_BOUNDS.minX, Math.min(CONTROL_STEP_BOUNDS.maxX, pos[0])),
    pos[1],
    Math.max(CONTROL_STEP_BOUNDS.minZ, Math.min(CONTROL_STEP_BOUNDS.maxZ, pos[2])),
  ];
}

function getDragStart(hotspot, slotId) {
  // The held component stays above the board; only X/Z are changed by the
  // placement controls. Its installed transform remains untouched.
  if (!hotspot) return [0, 0.08, 0];
  return [0, Math.max(hotspot.position[1] + 0.06, 0.08), 0];
}

function getInstallHoverY(slotId, hotspotY) {
  const motion = INSTALL_MOTION[slotId] ?? DEFAULT_INSTALL_MOTION;
  return hotspotY + motion.hoverY;
}

function getInstallHoverZ(slotId, hotspotZ) {
  const motion = INSTALL_MOTION[slotId] ?? DEFAULT_INSTALL_MOTION;
  return Math.max(hotspotZ + motion.hoverZ, getDragZMin(slotId));
}

function hotspotBoundsXZ(hotspot) {
  const [cx, , cz] = hotspot.position;
  const [w, d] = hotspot.size;
  return {
    minX: cx - w / 2,
    maxX: cx + w / 2,
    minZ: cz - d / 2,
    maxZ: cz + d / 2,
  };
}

function rectArea(bounds) {
  return Math.max(0, bounds.maxX - bounds.minX) * Math.max(0, bounds.maxZ - bounds.minZ);
}

function intersectArea(a, b) {
  const ix = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
  const iz = Math.max(0, Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ));
  return ix * iz;
}

/**
 * How much of the component footprint (centered on drop pos, sized like its slot)
 * overlaps a hotspot on the motherboard XZ plane.
 */
function coverageOnHotspot(componentPos, footprintSize, hotspot) {
  const [cx, , cz] = componentPos;
  const [w, d] = footprintSize;
  const componentBounds = {
    minX: cx - w / 2,
    maxX: cx + w / 2,
    minZ: cz - d / 2,
    maxZ: cz + d / 2,
  };
  const area = rectArea(componentBounds);
  if (area <= 0) return 0;
  return intersectArea(componentBounds, hotspotBoundsXZ(hotspot)) / area;
}

function hotspotsCoincide(a, b) {
  const dx = a.position[0] - b.position[0];
  const dz = a.position[2] - b.position[2];
  return Math.hypot(dx, dz) < COINCIDENT_HOTSPOT_M;
}

/**
 * @returns {'correct' | 'wrong' | 'miss'}
 */
function evaluatePlacement(pos, slotId) {
  const intended = motherboardHotspots.find((h) => h.id === slotId);
  if (!intended) return { result: 'miss' };

  const footprint = intended.size;
  const placementTolerance = getPlacementTolerance(slotId);
  // Score the socket/connector origin. Some models, notably the GPU, have a
  // local visual offset because the card extends away from its socket.
  const correctCoverage = coverageOnHotspot(pos, footprint, intended);
  if (correctCoverage >= placementTolerance) {
    return { result: 'correct', coverage: correctCoverage };
  }

  let bestWrong = null;
  let bestWrongCoverage = 0;
  for (const hotspot of motherboardHotspots) {
    if (hotspot.id === slotId) continue;
    if (hotspotsCoincide(hotspot, intended)) continue;
    const coverage = coverageOnHotspot(pos, footprint, hotspot);
    if (coverage > bestWrongCoverage) {
      bestWrongCoverage = coverage;
      bestWrong = hotspot;
    }
  }

  if (bestWrong && bestWrongCoverage >= placementTolerance) {
    return { result: 'wrong', hotspotId: bestWrong.id, coverage: bestWrongCoverage };
  }

  return { result: 'miss', coverage: correctCoverage };
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
  const [placementControl, setPlacementControl] = useState(
    () => getARSceneState().placementControl,
  );
  const [boardAlign, setBoardAlign] = useState(
    () => getARSceneState().boardAlign ?? DEFAULT_BOARD_ALIGN,
  );
  const [boardLocked, setBoardLocked] = useState(
    () => getARSceneState().boardLocked,
  );
  const snappedRef = useRef(false);
  const dragPosRef = useRef(null);
  const handledControlRef = useRef(null);
  const [modelPos, setModelPos] = useState([0, 0.03, DEFAULT_DRAG_Z_MIN]);
  /** While set, the part is playing its seat-into-board animation (no drag). */
  const [installAnim, setInstallAnim] = useState(null);

  useEffect(
    () =>
      subscribeARSceneState((s) => {
        setInstalledSlots(s.installedSlots);
        setPlacingSlot(s.placingSlot);
        setPlacementControl(s.placementControl);
        if (s.boardAlign) setBoardAlign(s.boardAlign);
        setBoardLocked(!!s.boardLocked);
      }),
    [],
  );

  useLayoutEffect(() => {
    if (placingSlot && !installedSlots.includes(placingSlot) && !installAnim) {
      snappedRef.current = false;
      const hotspot = motherboardHotspots.find((h) => h.id === placingSlot);
      const startPos = getDragStart(hotspot, placingSlot);
      setModelPos(startPos);
      dragPosRef.current = startPos;
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

  /** Release / drop: ≥50% overlap on intended slot installs; wrong slot shows a mistake. */
  const tryPlaceComponent = (slotId) => {
    if (snappedRef.current || isAnimatingInstall) return;
    const pos = dragPosRef.current ?? modelPos;
    const verdict = evaluatePlacement(pos, slotId);

    if (verdict.result === 'correct') {
      completeInstall(slotId);
      return;
    }
    if (verdict.result === 'wrong') {
      notifyWrongPlacement(slotId, verdict.hotspotId);
      return;
    }
    notifyWrongPlacement(slotId);
  };

  useEffect(() => {
    if (!placementControl || placementControl.id === handledControlRef.current) return;
    handledControlRef.current = placementControl.id;
    if (!activeSlotId || isAnimatingInstall) return;

    const hotspot = motherboardHotspots.find((h) => h.id === activeSlotId);
    if (placementControl.type === 'reset') {
      const startPos = getDragStart(hotspot, activeSlotId);
      setModelPos(startPos);
      dragPosRef.current = startPos;
      return;
    }
    if (placementControl.type === 'move') {
      const currentPos = dragPosRef.current ?? modelPos;
      const nextPos = clampControlledPosition(
        [
          currentPos[0] + placementControl.dx,
          currentPos[1],
          currentPos[2] + placementControl.dz,
        ],
        currentPos,
      );
      setModelPos(nextPos);
      dragPosRef.current = nextPos;
      return;
    }
    if (placementControl.type === 'place') {
      tryPlaceComponent(activeSlotId);
    }
  }, [placementControl, activeSlotId, isAnimatingInstall, modelPos]);

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
        {/* Parent node carries manual align offsets so board + hotspots move together. */}
        <ViroNode
          position={boardAlign.position}
          rotation={boardAlign.rotation}
          scale={boardAlign.scale}
        >
        <Viro3DObject
          source={require('../../assets/models/motherboard/motherboard.glb')}
          type="GLB"
          position={[-0.01, 0.01, 0]}
          scale={[0.25, 0.25, 0.25]}
          rotation={[1, 181, 3]}
          ignoreEventHandling={!!placingSlot || !boardLocked}
          onLoadStart={() => console.log('[LOAD] motherboard onLoadStart')}
          onLoadEnd={() => console.log('[LOAD] motherboard onLoadEnd')}
          onError={(e) => console.log('[LOAD] motherboard onError', e)}
          onClickState={(state) => {
            if (state !== 3) return;
            if (!boardLocked) return;
            if (placingSlot) return;
            if (nextComponent) {
              notifySelectSlot(nextComponent);
            }
          }}
        />

        {motherboardHotspots.map((hotspot) => {
          const modelConfig = COMPONENT_MODELS[hotspot.id];
          const [w, h] = hotspot.size;
          const isIntendedTarget =
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

          if (isIntendedTarget) {
            return (
              <ViroNode key={`hotspot-${hotspot.id}`} position={hotspot.position}>
                <ViroQuad
                  rotation={[-90, 0, 0]}
                  width={w}
                  height={h}
                  materials={['hotspotAvailable']}
                  opacity={isAnimatingInstall ? 0.35 : 0.6}
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
              renderingOrder={2}
            />
          </ViroNode>
        )}
        </ViroNode>
      </ViroARImageMarker>
    </ViroARScene>
  );
}
