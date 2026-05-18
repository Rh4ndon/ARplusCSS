import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { MotherboardARSceneInner } from './MotherboardARSceneInner';
import { registerMotherboardTrackingTarget } from './trackingTargets';
import { componentGuides } from '../data/componentGuides';
import { InstallGuidePanel } from '../components/InstallGuidePanel';
import { ARHud } from '../components/ARHud';
import { patchARSceneState, registerARSceneHandlers } from './arSceneBridge';

const stableARScene = {
  scene: MotherboardARSceneInner,
};

export function ARMotherboardScene({ onExit }) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    registerMotherboardTrackingTarget();
    return () => {
      patchARSceneState({ activeSlot: null, playInstallAnim: false });
    };
  }, []);

  const handleMarkerFound = useCallback(() => setMarkerVisible(true), []);
  const handleMarkerLost = useCallback(() => {
    setMarkerVisible(false);
    setActiveSlot(null);
    patchARSceneState({ activeSlot: null, playInstallAnim: false });
  }, []);

  const handleSelectSlot = useCallback((slotId) => {
    setActiveSlot(slotId);
    patchARSceneState({ activeSlot: slotId, playInstallAnim: false });
    requestAnimationFrame(() => {
      patchARSceneState({ playInstallAnim: true });
    });
  }, []);

  useEffect(() => {
    registerARSceneHandlers({
      onMarkerFound: handleMarkerFound,
      onMarkerLost: handleMarkerLost,
      onSelectSlot: handleSelectSlot,
    });
  }, [handleMarkerFound, handleMarkerLost, handleSelectSlot]);

  const closeGuide = useCallback(() => {
    setActiveSlot(null);
    patchARSceneState({ activeSlot: null, playInstallAnim: false });
  }, []);

  const replayInstall = useCallback(() => {
    if (!activeSlot) {
      return;
    }
    patchARSceneState({ playInstallAnim: false });
    requestAnimationFrame(() => {
      patchARSceneState({ playInstallAnim: true });
    });
  }, [activeSlot]);

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={stableARScene} style={styles.fill} />
      <ARHud
        markerDetected={markerVisible}
        activeSlotLabel={
          activeSlot ? componentGuides[activeSlot].shortLabel : undefined
        }
        onExit={onExit}
      />
      {activeSlot && (
        <InstallGuidePanel
          guide={componentGuides[activeSlot]}
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
