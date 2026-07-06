import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { MotherboardARSceneInner } from './MotherboardARSceneInner';
import { registerMotherboardTrackingTarget } from './trackingTargets';
import { componentGuides } from '../data/componentGuides';
import { InstallGuidePanel } from '../components/InstallGuidePanel';
import { ARHud } from '../components/ARHud';
import {
  notifyDismissError,
  notifyDismissSuccess,
  patchARSceneState,
  registerARSceneHandlers,
  subscribeARSceneState,
} from './arSceneBridge';
import { colors } from '../theme/colors';

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
  const [installSuccess, setInstallSuccess] = useState(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [description, setDescription] = useState(motherboardDescription);
  const [statusLabel, setStatusLabel] = useState(defaultStatus);
  const [showInfo, setShowInfo] = useState(false);
  const [installedSlots, setInstalledSlots] = useState([]);
  const lastComponentId = useRef(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    registerMotherboardTrackingTarget();
    const unsub = subscribeARSceneState((s) => {
      setInstallError(s.installError ?? null);
      setInstallSuccess(s.installSuccess ?? null);
      setModelsLoading((s.pendingModelLoads ?? 0) > 0);
      if (s.installedSlots) {
        setInstalledSlots(s.installedSlots);
      }
    });
    return () => {
      unsub();
      patchARSceneState({ activeSlot: null, playInstallAnim: false });
    };
  }, []);

  useEffect(() => {
    if (!installError) return;
    errorOpacity.setValue(0);
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
  }, [installError, errorOpacity]);

  useEffect(() => {
    if (!installSuccess) return;
    successOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2800),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      notifyDismissSuccess();
      setInstallSuccess(null);
    });
  }, [installSuccess, successOpacity]);

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
    lastComponentId.current = slotId;
    const slotGuide = componentGuides[slotId];
    if (slotGuide) {
      setDescription(slotGuide.description);
      setStatusLabel(slotGuide.shortLabel + ' slot pressed');
      setShowInfo(true);
    }
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
    if (!activeSlot) return;
    const slot = activeSlot;
    setActiveSlot(null);
    setShowInfo(false);
    if (installedSlots.includes(slot)) {
      patchARSceneState({ activeSlot: null, playInstallAnim: false });
    } else {
      patchARSceneState({
        activeSlot: null,
        playInstallAnim: false,
        placingSlot: slot,
      });
    }
  }, [activeSlot, installedSlots]);

  const reopenGuide = useCallback(() => {
    const slot = lastComponentId.current;
    if (!slot) return;
    const slotGuide = componentGuides[slot];
    if (!slotGuide) return;
    setDescription(slotGuide.description);
    setStatusLabel(slotGuide.shortLabel);
    setShowInfo(true);
    setActiveSlot(slot);
    patchARSceneState({ activeSlot: slot, playInstallAnim: false });
  }, []);

  const handleToggleInfo = useCallback(() => {
    if (activeSlot) {
      setShowInfo((v) => !v);
    } else if (lastComponentId.current) {
      reopenGuide();
    }
  }, [activeSlot, reopenGuide]);

  const guide = activeSlot ? componentGuides[activeSlot] : null;

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={stableARScene} style={styles.fill} />
        <ARHud
          markerDetected={markerVisible}
          detectedHint={statusLabel}
          description={description}
          showInfo={showInfo}
          onToggleInfo={handleToggleInfo}
          onExit={onExit}
        />
      {installError && (
        <Animated.View style={[styles.errorToast, { opacity: errorOpacity }]}>
          <Text style={styles.errorText}>{installError}</Text>
        </Animated.View>
      )}
      {installSuccess && (
        <Animated.View style={[styles.successToast, { opacity: successOpacity }]}>
          <Text style={styles.successText}>
            {installSuccess} installed successfully
          </Text>
        </Animated.View>
      )}
      {modelsLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading 3D model…</Text>
          </View>
        </View>
      )}
      {guide && (
        <InstallGuidePanel
          guide={guide}
          onClose={closeGuide}
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
  successToast: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
  },
  successText: {
    color: '#042f2e',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
  },
  loadingCard: {
    backgroundColor: 'rgba(10,14,23,0.88)',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
