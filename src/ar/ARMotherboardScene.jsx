import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { MotherboardARSceneInner } from './MotherboardARSceneInner';
import { registerMotherboardTrackingTarget } from './trackingTargets';
import { componentGuides } from '../data/componentGuides';
import { InstallGuidePanel } from '../components/InstallGuidePanel';
import { ARHud } from '../components/ARHud';
import {
  notifyDismissError,
  patchARSceneState,
  registerARSceneHandlers,
  subscribeARSceneState,
} from './arSceneBridge';

const stableARScene = {
  scene: MotherboardARSceneInner,
};

const motherboardDescription =
  'The motherboard is the main circuit board that connects and powers every component \u2014 CPU, RAM, GPU, and storage \u2014 allowing them to communicate.';

const defaultStatus = 'Motherboard detected \u2014 tap a slot';

export function ARMotherboardScene({ onExit }) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [installError, setInstallError] = useState(null);
  const [description, setDescription] = useState(motherboardDescription);
  const [statusLabel, setStatusLabel] = useState(defaultStatus);
  const [showInfo, setShowInfo] = useState(false);
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    registerMotherboardTrackingTarget();
    const unsub = subscribeARSceneState((s) => {
      if (s.installError !== installError) {
        setInstallError(s.installError);
      }
    });
    return () => {
      unsub();
      patchARSceneState({ activeSlot: null, playInstallAnim: false });
    };
  }, []);

  useEffect(() => {
    if (installError) {
      Animated.sequence([
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        notifyDismissError();
        setInstallError(null);
      });
    }
  }, [installError]);

  const handleMarkerFound = useCallback(() => setMarkerVisible(true), []);
  const handleMarkerLost = useCallback(() => {
    setMarkerVisible(false);
    setActiveSlot(null);
    setDescription(motherboardDescription);
    setStatusLabel(defaultStatus);
    setShowInfo(false);
    patchARSceneState({ activeSlot: null, playInstallAnim: false });
  }, []);

  const handleSelectSlot = useCallback((slotId) => {
    console.log('[DEBUG] handleSelectSlot called:', slotId);
    const slotGuide = componentGuides[slotId];
    if (slotGuide) {
      setDescription(slotGuide.description);
      setStatusLabel(slotGuide.shortLabel + ' slot pressed');
      setShowInfo(true);
    }
    setActiveSlot(slotId);
    patchARSceneState({ activeSlot: slotId, playInstallAnim: false });
    requestAnimationFrame(() => {
      console.log('[DEBUG] playInstallAnim triggered');
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

  const guide = activeSlot ? componentGuides[activeSlot] : null;

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={stableARScene} style={styles.fill} />
        <ARHud
          markerDetected={markerVisible}
          detectedHint={statusLabel}
          description={description}
          showInfo={showInfo}
          onToggleInfo={() => setShowInfo((v) => !v)}
          onExit={onExit}
        />
      {installError && (
        <Animated.View style={[styles.errorToast, { opacity: errorOpacity }]}>
          <Text style={styles.errorText}>{installError}</Text>
        </Animated.View>
      )}
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
  errorToast: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
