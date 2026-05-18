import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { Rj45ARSceneInner } from './Rj45ARSceneInner';
import { registerRj45TrackingTarget } from './trackingTargets';
import { getCablingGuide } from '../../data/cablingGuides';
import { InstallGuidePanel } from '../../components/InstallGuidePanel';
import { ARHud } from '../../components/ARHud';
import {
  patchRj45SceneState,
  registerRj45SceneHandlers,
  resetRj45SceneState,
} from './rj45SceneBridge';

const stableRj45Scene = {
  scene: Rj45ARSceneInner,
};

export function ARRj45Scene({ wiringType, onExit }) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  useEffect(() => {
    registerRj45TrackingTarget();
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
  const wiringLabel =
    wiringType === 'crossover' ? 'Crossover' : 'Straight-through';

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={stableRj45Scene} style={styles.fill} />
      <ARHud
        markerDetected={markerVisible}
        activeSlotLabel={activeStep ? guide?.shortLabel : wiringLabel}
        scanningHint="Point camera at RJ45 marker"
        detectedHint="RJ45 detected — tap a cabling step"
        onExit={onExit}
      />
      {guide && (
        <InstallGuidePanel
          guide={guide}
          onClose={closeGuide}
          onReplayInstall={replayInstall}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
