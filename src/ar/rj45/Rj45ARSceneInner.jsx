import React, { useEffect, useState } from 'react';
import {
  ViroARScene,
  ViroAnimations,
  ViroMaterials,
  ViroNode,
  ViroQuad,
  ViroPolyline,
  ViroBox,
  Viro3DObject,
  ViroARPlane,
  ViroAmbientLight,
  ViroDirectionalLight,
} from '@reactvision/react-viro';
import { rj45Hotspots } from './rj45Hotspots';
import { Rj45WireAnimation } from './Rj45WireAnimation';
import {
  WIRES,
  PIN_POSITIONS,
  TRAY_POSITIONS,
  JACKET_POS,
  CONNECTOR_ALIGN,
  buildWireCurve,
  seatedCtrl,
  trayCtrl,
  expectedWireAt,
} from './wireLayout';
import {
  getRj45SceneState,
  notifyRj45MarkerFound,
  notifyRj45SelectStep,
  notifyWireSelect,
  notifyWirePlace,
  notifyWireError,
  subscribeRj45SceneState,
} from './rj45SceneBridge';

ViroMaterials.createMaterials({
  rj45Plate: { diffuseColor: '#1e3a5f', lightingModel: 'Constant' },
  rj45HotspotIdle: { diffuseColor: '#22c55e', lightingModel: 'Constant' },
  rj45HotspotActive: { diffuseColor: '#facc15', lightingModel: 'Constant' },
  wireWhite: { diffuseColor: '#f8fafc', lightingModel: 'Constant' },
  wireOrange: { diffuseColor: '#f97316', lightingModel: 'Constant' },
  wireGreen: { diffuseColor: '#22c55e', lightingModel: 'Constant' },
  wireBlue: { diffuseColor: '#3b82f6', lightingModel: 'Constant' },
  wireBrown: { diffuseColor: '#92400e', lightingModel: 'Constant' },
  pinSlot: { diffuseColor: '#0f172a', lightingModel: 'Constant' },
  pinSlotHighlight: { diffuseColor: '#4ade80', lightingModel: 'Constant' },
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

const WIRE_THICKNESS = 0.0028;
const STRIPE_THICKNESS = 0.0011;

const stripedMaterial = {
  wo: 'wireWhite',
  wg: 'wireWhite',
  wb: 'wireWhite',
  wbr: 'wireWhite',
};

const stripeMaterial = {
  wo: 'wireOrange',
  wg: 'wireGreen',
  wb: 'wireBlue',
  wbr: 'wireBrown',
};

const solidMaterial = {
  o: 'wireOrange',
  g: 'wireGreen',
  b: 'wireBlue',
  br: 'wireBrown',
};

function WireBody({ wire, points }) {
  const isStriped = typeof stripedMaterial[wire.id] === 'string';
  if (!isStriped) {
    return (
      <ViroPolyline
        points={points}
        thickness={WIRE_THICKNESS}
        materials={[solidMaterial[wire.id]]}
      />
    );
  }
  return (
    <>
      <ViroPolyline
        points={points}
        thickness={WIRE_THICKNESS}
        materials={[stripedMaterial[wire.id]]}
      />
      <ViroPolyline
        points={points}
        thickness={STRIPE_THICKNESS}
        materials={[stripeMaterial[wire.id]]}
        position={[0, 0.0012, 0]}
      />
    </>
  );
}

export function Rj45ARSceneInner() {
  const [bridge, setBridge] = useState(getRj45SceneState);

  useEffect(() => subscribeRj45SceneState(setBridge), []);

  const { wiringType, activeStep, playInstallAnim, wiredPins, selectedWire } =
    bridge;

  const activeHotspot = rj45Hotspots.find((h) => h.id === activeStep);

  const handlePlaneFound = () => {
    //console.log('[RJ45] plane locked, workspace mounted');
    notifyRj45MarkerFound();
  };

  const handleWireTap = (wireId) => {
    notifyWireSelect(wireId);
  };

  const handlePinTap = (pinIndex) => {
    const expected = expectedWireAt(pinIndex, wiringType);
    const alreadyCorrect = wiredPins[pinIndex] === expected;
    if (!selectedWire) {
      return;
    }
    if (alreadyCorrect) {
      return;
    }
    if (selectedWire === expected) {
      notifyWirePlace(pinIndex, selectedWire);
    } else {
      const expectedWire = WIRES.find((w) => w.id === expected);
      const placedWire = WIRES.find((w) => w.id === selectedWire);
      notifyWireError(
        `Pin ${pinIndex + 1} expects ${expectedWire?.label ?? '?'} — you placed ${placedWire?.label ?? '?'}`,
      );
    }
  };

  const isOrderActive = activeStep === 'order';

  return (
    <ViroARScene anchorDetectionTypes={['PlanesHorizontal']}>
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
      <ViroARPlane
        minWidth={0.2}
        minHeight={0.15}
        alignment="HorizontalUpward"
        onAnchorFound={handlePlaneFound}
        onAnchorUpdated={() => handlePlaneFound()}
      >
        <ViroNode
          animation={{ name: 'rj45PopIn', run: true, loop: false }}
        >
          {/* Work surface */}
          <ViroQuad
            rotation={[-90, 0, 0]}
            width={0.18}
            height={0.14}
            position={[0, 0.001, 0]}
            materials={['rj45Plate']}
            opacity={0.4}
          />

          {/* 3D RJ45 connector body */}
          <Viro3DObject
            source={require('../../../assets/models/rj45/rj45.glb')}
            type="GLB"
            position={CONNECTOR_ALIGN.position}
            scale={CONNECTOR_ALIGN.scale}
            rotation={CONNECTOR_ALIGN.rotation}
            onLoadStart={() => console.log('[LOAD] rj45 connector onLoadStart')}
            onLoadEnd={() => console.log('[LOAD] rj45 connector onLoadEnd')}
            onError={(e) => console.log('[LOAD] rj45 connector onError', e)}
          />

          {/* Cable jacket where wires emerge */}
          <ViroBox
            position={JACKET_POS}
            scale={[0.014, 0.006, 0.014]}
            materials={['wireBrown']}
          />

          {/* Plugin socket with 8 pin slots */}
          {!isOrderActive && (
            <>
              <ViroBox
                position={[0, 0.012, 0.02]}
                scale={[0.05, 0.008, 0.02]}
                materials={['pinSlot']}
              />
            </>
          )}

          {/* Pin slots (active workspace) */}
          {isOrderActive &&
            PIN_POSITIONS.map((pos, pinIndex) => {
              const expected = expectedWireAt(pinIndex, wiringType);
              const filled = wiredPins[pinIndex] != null;
              const isHighlight =
                selectedWire === expected || (filled && false);
              return (
                <ViroNode key={pinIndex} position={[pos[0], pos[1] - 0.008, pos[2]]}>
                  <ViroQuad
                    rotation={[-90, 0, 0]}
                    width={0.0045}
                    height={0.0045}
                    materials={[
                      filled
                        ? 'pinSlotHighlight'
                        : isHighlight
                          ? 'pinSlotHighlight'
                          : 'pinSlot',
                    ]}
                    onClick={() => handlePinTap(pinIndex)}
                  />
                </ViroNode>
              );
            })}

          {/* Wires */}
          {isOrderActive &&
            WIRES.map((wire, wireIndex) => {
              const pinIndex = wiredPins.indexOf(wire.id);
              const seated = pinIndex >= 0;
              const from = JACKET_POS;
              const to = seated
                ? PIN_POSITIONS[pinIndex]
                : TRAY_POSITIONS[wireIndex];
              const ctrl = seated
                ? seatedCtrl(pinIndex)
                : trayCtrl(wireIndex);
              const points = buildWireCurve(from, ctrl, to);
              const isSelected = selectedWire === wire.id;
              return (
                <ViroNode
                  key={wire.id}
                  position={[0, 0, 0]}
                  onClick={() => handleWireTap(wire.id)}
                >
                  <WireBody wire={wire} points={points} />
                </ViroNode>
              );
            })}

          {/* Step hotspots (strip / untwist / order / trim / insert / crimp) */}
          {rj45Hotspots.map((hotspot) => {
            const isActive = activeStep === hotspot.id;
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
              </ViroNode>
            );
          })}

          {activeHotspot && playInstallAnim && !isOrderActive && (
            <Rj45WireAnimation
              stepId={activeHotspot.id}
              anchorPosition={activeHotspot.position}
              wiringType={wiringType}
              visible
            />
          )}
        </ViroNode>
      </ViroARPlane>
    </ViroARScene>
  );
}