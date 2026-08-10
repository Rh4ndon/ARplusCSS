import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { Rj45ARSceneInner } from './Rj45ARSceneInner';
import { getCablingGuide } from '../../data/cablingGuides';
import { InstallGuidePanel } from '../../components/InstallGuidePanel';
import { ARHud } from '../../components/ARHud';
import {
  patchRj45SceneState,
  registerRj45SceneHandlers,
  resetRj45SceneState,
  subscribeRj45SceneState,
  getRj45SceneState,
  notifyResetWires,
} from './rj45SceneBridge';
import { getTargetOrder, WIRES } from './wireLayout';

const stableRj45Scene = {
  scene: Rj45ARSceneInner,
};

function WireHint({ wiringType }) {
  const order = getTargetOrder(wiringType);
  const labelFor = (id) => ({
    wo: 'WO',
    o: 'O',
    wg: 'WG',
    b: 'B',
    wb: 'WB',
    g: 'G',
    wbr: 'WBr',
    br: 'Br',
  })[id];
  return (
    <View style={styles.wireHint}>
      <Text style={styles.wireHintTitle}>
        Tap a wire, then tap its pin. Target order:
      </Text>
      <View style={styles.wireOrderRow}>
        {order.map((id, i) => (
          <View key={id} style={styles.wireOrderChip}>
            <Text style={styles.wireOrderPin}>{i + 1}</Text>
            <Text style={styles.wireOrderLabel}>{labelFor(id)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WireFeedback() {
  const [state, setState] = useState(getRj45SceneState);
  useEffect(() => subscribeRj45SceneState(setState), []);
  const { wireError, wireSuccess } = state;
  if (!wireError && !wireSuccess) {
    return null;
  }
  return (
    <View
      style={[
        styles.wireFeedback,
        wireSuccess ? styles.wireFeedbackOk : styles.wireFeedbackErr,
      ]}
      pointerEvents="box-none"
    >
      <Text style={styles.wireFeedbackText}>
        {wireSuccess ? 'All 8 wires in the correct order!' : wireError}
      </Text>
      {wireSuccess && (
        <Text
          style={styles.wireFeedbackReset}
          onPress={() => notifyResetWires()}
        >
          Try again
        </Text>
      )}
    </View>
  );
}

export function ARRj45Scene({ wiringType, onExit }) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  useEffect(() => {
    patchRj45SceneState({ wiringType, activeStep: null, playInstallAnim: false });
    return () => resetRj45SceneState();
  }, [wiringType]);

  const handleMarkerFound = useCallback(() => setMarkerVisible(true), []);
  const handleMarkerLost = useCallback(() => {
    setMarkerVisible(false);
    setActiveStep(null);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
  }, []);

  const handleSelectStep = useCallback((stepId) => {
    setActiveStep(stepId);
    patchRj45SceneState({ activeStep: stepId, playInstallAnim: false });
    requestAnimationFrame(() => {
      patchRj45SceneState({ playInstallAnim: true });
    });
  }, []);

  useEffect(() => {
    registerRj45SceneHandlers({
      onMarkerFound: handleMarkerFound,
      onMarkerLost: handleMarkerLost,
      onSelectStep: handleSelectStep,
    });
  }, [handleMarkerFound, handleMarkerLost, handleSelectStep]);

  const closeGuide = useCallback(() => {
    setActiveStep(null);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
  }, []);

  const replayInstall = useCallback(() => {
    if (!activeStep) {
      return;
    }
    patchRj45SceneState({ playInstallAnim: false });
    requestAnimationFrame(() => {
      patchRj45SceneState({ playInstallAnim: true });
    });
  }, [activeStep]);

  const guide = activeStep ? getCablingGuide(wiringType, activeStep) : null;
  const isOrderActive = activeStep === 'order';
  const wiringLabel =
    wiringType === 'crossover' ? 'Crossover' : 'Straight-through';

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={stableRj45Scene} style={styles.fill} />
      <ARHud
        markerDetected={markerVisible}
        activeSlotLabel={activeStep ? guide?.shortLabel : wiringLabel}
        scanningHint="Point camera at a flat surface"
        detectedHint="Surface ready — tap a cabling step"
        onExit={onExit}
      />
      {guide && !isOrderActive && (
        <InstallGuidePanel
          guide={guide}
          onClose={closeGuide}
          onReplayInstall={replayInstall}
        />
      )}
      {isOrderActive && <WireHint wiringType={wiringType} />}
      <WireFeedback />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  wireHint: {
    position: 'absolute',
    top: 96,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(10,14,23,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
    padding: 14,
    gap: 8,
  },
  wireHintTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  wireOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  wireOrderChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  wireOrderPin: {
    color: 'rgba(147,197,253,0.7)',
    fontSize: 10,
    fontWeight: '700',
  },
  wireOrderLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  wireFeedback: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 120,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
    zIndex: 90,
  },
  wireFeedbackText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  wireFeedbackOk: {
    backgroundColor: 'rgba(34,197,94,0.92)',
  },
  wireFeedbackErr: {
    backgroundColor: 'rgba(239,68,68,0.92)',
  },
  wireFeedbackReset: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});