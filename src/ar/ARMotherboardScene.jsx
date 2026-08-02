import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { MotherboardARSceneInner } from './MotherboardARSceneInner';
import { registerMotherboardTrackingTarget } from './trackingTargets';
import { componentGuides } from '../data/componentGuides';
import { InstallGuidePanel } from '../components/InstallGuidePanel';
import { MotherboardAlignPanel } from '../components/MotherboardAlignPanel';
import { ARHud } from '../components/ARHud';
import {
  confirmPlacement,
  getARSceneState,
  lockBoardAlign,
  movePlacement,
  notifyDismissError,
  notifyDismissSuccess,
  patchARSceneState,
  registerARSceneHandlers,
  resetPlacement,
  resetBoardAlign,
  subscribeARSceneState,
  unlockBoardAlign,
} from './arSceneBridge';
import { colors } from '../theme/colors';
import { getBoardState, saveBoardState } from '../utils/boardStateStorage';

const stableARScene = {
  scene: MotherboardARSceneInner,
};

const motherboardDescription =
  'The motherboard is the main circuit board that connects and powers every component \u2014 CPU, RAM, GPU, and storage \u2014 allowing them to communicate.';

const defaultStatus = 'Motherboard detected';

const INSTALL_ORDER = ['cpu', 'cpuBlock', 'ram', 'eps4', 'atx24', 'sata', 'frontPanelUsb', 'switches', 'gpu'];
const PLACEMENT_STEP_M = 0.01;

export function ARMotherboardScene({ onExit, markerUri, markerPhysicalWidth }) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [installError, setInstallError] = useState(null);
  const [installSuccess, setInstallSuccess] = useState(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [description, setDescription] = useState(motherboardDescription);
  const [statusLabel, setStatusLabel] = useState(defaultStatus);
  const [showInfo, setShowInfo] = useState(false);
  const [installedSlots, setInstalledSlots] = useState([]);
  const [phase, setPhase] = useState('align');
  const lastComponentId = useRef(null);
  const prevInstalledCount = useRef(0);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const prevLoading = useRef(false);

  useEffect(() => {
    registerMotherboardTrackingTarget({
      sourceUri: markerUri,
      physicalWidth: markerPhysicalWidth,
    });
    let cancelled = false;
    // Restore a previously locked board pose across reloads so the position
    // does not need to be re-assigned every time.
    getBoardState().then((saved) => {
      if (cancelled) return;
      if (saved && saved.boardLocked && saved.boardAlign) {
        patchARSceneState({
          boardLocked: true,
          boardAlign: saved.boardAlign,
        });
        setPhase('start');
        setStatusLabel('Position locked — tap Start');
      } else {
        // Fresh AR session always starts in align mode.
        unlockBoardAlign();
        setPhase('align');
      }
    });
    const unsub = subscribeARSceneState((s) => {
      if (s.installError !== undefined) setInstallError(s.installError ?? null);
      if (s.installSuccess !== undefined) setInstallSuccess(s.installSuccess ?? null);
      const loading = (s.pendingModelLoads ?? 0) > 0;
      if (loading !== prevLoading.current) {
        console.log('[LOAD] modelsLoading changed:', { from: prevLoading.current, to: loading, pendingModelLoads: s.pendingModelLoads });
        prevLoading.current = loading;
      }
      setModelsLoading(loading);
      if (s.installedSlots) {
        setInstalledSlots(s.installedSlots);
      }
    });
    return () => {
      cancelled = true;
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

  useEffect(() => {
    if (installedSlots.length > prevInstalledCount.current && phase === 'placing') {
      prevInstalledCount.current = installedSlots.length;
      setPhase('installed');
    } else {
      prevInstalledCount.current = installedSlots.length;
    }
  }, [installedSlots, phase]);

  const handleMarkerFound = useCallback(() => setMarkerVisible(true), []);
  const handleMarkerLost = useCallback(() => {
    setMarkerVisible(false);
  }, []);

  const handleSelectSlot = useCallback((slotId) => {
    lastComponentId.current = slotId;
    const slotGuide = componentGuides[slotId];
    if (slotGuide) {
      setDescription(slotGuide.description);
      setStatusLabel(slotGuide.shortLabel);
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

  const handleProceed = useCallback(() => {
    const next = INSTALL_ORDER.find((id) => !installedSlots.includes(id));
    if (!next) {
      setPhase('done');
      return;
    }
    handleSelectSlot(next);
    // Without a guide panel there is nothing to close — go straight to placing.
    if (!componentGuides[next]) {
      lastComponentId.current = next;
      setActiveSlot(null);
      setShowInfo(false);
      patchARSceneState({
        activeSlot: null,
        playInstallAnim: false,
        placingSlot: next,
      });
      setPhase('placing');
      return;
    }
    setPhase('guide');
  }, [installedSlots, handleSelectSlot]);

  const handleLockBoard = useCallback(() => {
    lockBoardAlign();
    // Cache the locked pose so a reload keeps the board in place.
    const current = getARSceneState();
    saveBoardState({
      boardLocked: true,
      boardAlign: current.boardAlign,
    });
    setPhase('start');
    setStatusLabel('Position locked — tap Start');
  }, []);

  const handleReset = useCallback(() => {
    if (phase === 'align') {
      resetBoardAlign();
      return;
    }
    prevInstalledCount.current = 0;
    setInstalledSlots([]);
    setActiveSlot(null);
    setShowInfo(false);
    setDescription(motherboardDescription);
    setStatusLabel('Position locked — tap Start');
    // Lesson reset keeps the locked board pose.
    setPhase('start');
    patchARSceneState({
      installedSlots: [],
      placingSlot: null,
      activeSlot: null,
      playInstallAnim: false,
    });
  }, [phase]);

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
      setPhase('placing');
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
  const showAlign =
    phase === 'align' && markerVisible && !guide && !modelsLoading;
  const showStart = phase === 'start' && markerVisible && !guide && !modelsLoading;
  const showNext = phase === 'installed' && !modelsLoading;
  const showDone = phase === 'done';
  const showPlacementControls = phase === 'placing' && markerVisible && !modelsLoading;

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={stableARScene} style={styles.fill} />
        <ARHud
          markerDetected={markerVisible}
          scanningHint="Point camera at motherboard marker"
          detectedHint={phase === 'align' ? 'Align the motherboard' : statusLabel}
          description={description}
          showInfo={showInfo && phase !== 'align'}
          phase={phase}
          onReset={handleReset}
          onToggleInfo={handleToggleInfo}
          onExit={onExit}
        />
      {showAlign && <MotherboardAlignPanel onLock={handleLockBoard} />}
      {showStart && (
        <Pressable style={styles.actionBtn} onPress={handleProceed}>
          <Text style={styles.actionBtnText}>Start</Text>
        </Pressable>
      )}
      {showNext && (
        <Pressable style={styles.actionBtn} onPress={handleProceed}>
          <Text style={styles.actionBtnText}>Next</Text>
        </Pressable>
      )}
      {showPlacementControls && (
        <View style={styles.placementControls}>
          <Text style={styles.placementHint}>Move the component over the blue slot</Text>
          <View style={styles.dpad}>
            <Pressable
              accessibilityLabel="Move component up"
              style={styles.moveBtn}
              onPress={() => movePlacement(0, -PLACEMENT_STEP_M)}
            >
              <Text style={styles.moveBtnText}>↑</Text>
            </Pressable>
            <View style={styles.dpadRow}>
              <Pressable
                accessibilityLabel="Move component left"
                style={styles.moveBtn}
                onPress={() => movePlacement(-PLACEMENT_STEP_M, 0)}
              >
                <Text style={styles.moveBtnText}>←</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Move component right"
                style={styles.moveBtn}
                onPress={() => movePlacement(PLACEMENT_STEP_M, 0)}
              >
                <Text style={styles.moveBtnText}>→</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityLabel="Move component down"
              style={styles.moveBtn}
              onPress={() => movePlacement(0, PLACEMENT_STEP_M)}
            >
              <Text style={styles.moveBtnText}>↓</Text>
            </Pressable>
          </View>
          <View style={styles.placementActions}>
            <Pressable style={styles.resetPlacementBtn} onPress={resetPlacement}>
              <Text style={styles.resetPlacementText}>Reset</Text>
            </Pressable>
            <Pressable style={styles.placeBtn} onPress={confirmPlacement}>
              <Text style={styles.placeBtnText}>Place</Text>
            </Pressable>
          </View>
        </View>
      )}
      {showDone && (
        <View style={styles.congratsOverlay}>
          <View style={styles.congratsCard}>
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.congratsDesc}>All components installed successfully</Text>
            <Pressable style={styles.restartBtn} onPress={handleReset}>
              <Text style={styles.restartBtnText}>Start Over</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  actionBtn: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 8,
    zIndex: 80,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  placementControls: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,14,23,0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
    zIndex: 80,
    elevation: 8,
  },
  placementHint: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  dpad: {
    alignItems: 'center',
    gap: 4,
  },
  dpadRow: {
    flexDirection: 'row',
    gap: 54,
  },
  moveBtn: {
    width: 42,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  moveBtnText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 25,
  },
  placementActions: {
    flexDirection: 'row',
    gap: 10,
  },
  resetPlacementBtn: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resetPlacementText: {
    color: colors.text,
    fontWeight: '700',
  },
  placeBtn: {
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  placeBtnText: {
    color: '#042f2e',
    fontWeight: '800',
  },
  congratsOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 200,
  },
  congratsCard: {
    backgroundColor: 'rgba(10,14,23,0.95)',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginHorizontal: 32,
  },
  congratsTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  congratsDesc: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  restartBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  restartBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
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
