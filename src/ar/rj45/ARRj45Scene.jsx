import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useVideoPlayer } from 'expo-video';
import { Rj45ARSceneInner } from './Rj45ARSceneInner';
import { cablingStepIds, getCablingGuide } from '../../data/cablingGuides';
import { InstallGuidePanel } from '../../components/InstallGuidePanel';
import { ARHud } from '../../components/ARHud';
import { StepVideoPlayer } from '../../components/StepVideoPlayer';
import {
  patchRj45SceneState,
  registerRj45SceneHandlers,
  resetRj45SceneState,
  notifyRj45InsertionAnimation,
} from './rj45SceneBridge';
import { Rj45WireArrangementPanel } from './Rj45WireArrangementPanel';
import { registerRj45TrackingTarget, RJ45_TARGET_NAME } from '../trackingTargets';
import { colors } from '../../theme/colors';

const stepVideoMap = {
  strip: require('../../../assets/videos/strip.mp4'),
  untwist: require('../../../assets/videos/untwist.mp4'),
  trim: require('../../../assets/videos/trim.mp4'),
  crimp: require('../../../assets/videos/crimp.mp4'),
};

const lessonButtonLabels = {
  strip: '1. Strip',
  untwist: '2. Untwist',
  trim: '3. Trim',
  order: '4. Wire colors',
  insert: '5. Insert',
  crimp: '6. Crimp',
};

const STEP_UNLOCK_ORDER = ['strip', 'untwist', 'trim', 'order', 'insert', 'crimp'];
const congratsSound = require('../../../assets/sounds/success.mp3');

function isStepUnlocked(stepId, completedSteps) {
  const idx = STEP_UNLOCK_ORDER.indexOf(stepId);
  if (idx <= 0) return true;
  return completedSteps.has(STEP_UNLOCK_ORDER[idx - 1]);
}

export function ARRj45Scene({ wiringType, onExit, markerUri, markerPhysicalWidth, markerTargetName }) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [showOrderGuide, setShowOrderGuide] = useState(false);
  const [arrangementComplete, setArrangementComplete] = useState(false);
  const [notice, setNotice] = useState(null);
  const [videoStep, setVideoStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showCongrats, setShowCongrats] = useState(false);
  const [showStepGrid, setShowStepGrid] = useState(true);
  const [showWirePanel, setShowWirePanel] = useState(false);
  const congratsShown = useRef(false);

  const congratsPlayer = useVideoPlayer(congratsSound, (p) => { p.loop = false; });

  const targetName = markerTargetName ?? RJ45_TARGET_NAME;
  const rj45Scene = React.useMemo(
    () => ({ scene: Rj45ARSceneInner, passProps: { targetName } }),
    [targetName],
  );

  useEffect(() => {
    registerRj45TrackingTarget({
      targetName,
      sourceUri: markerUri,
      physicalWidth: markerPhysicalWidth,
    });
  }, [targetName, markerUri, markerPhysicalWidth]);

  useEffect(() => {
    resetRj45SceneState();
    setArrangementComplete(false);
    setNotice(null);
    patchRj45SceneState({ wiringType, activeStep: null, playInstallAnim: false });
    return () => resetRj45SceneState();
  }, [wiringType]);

  const handleMarkerFound = useCallback(() => setMarkerVisible(true), []);
  const handleMarkerLost = useCallback(() => {
    setMarkerVisible(false);
    setActiveStep(null);
    setVideoStep(null);
    setShowStepGrid(true);
    setShowWirePanel(false);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
  }, []);

  const handleSelectStep = useCallback((stepId) => {
    if (!isStepUnlocked(stepId, completedSteps)) return;
    setNotice(null);
    setActiveStep(stepId);
    setShowOrderGuide(stepId === 'order');
    setShowStepGrid(false);
    patchRj45SceneState({ activeStep: stepId, playInstallAnim: false });
    requestAnimationFrame(() => {
      patchRj45SceneState({ playInstallAnim: true });
    });
  }, [completedSteps]);

  useEffect(() => {
    registerRj45SceneHandlers({
      onMarkerFound: handleMarkerFound,
      onMarkerLost: handleMarkerLost,
      onSelectStep: handleSelectStep,
    });
  }, [handleMarkerFound, handleMarkerLost, handleSelectStep]);

  const handleStepComplete = useCallback((stepId) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      if (next.size === STEP_UNLOCK_ORDER.length && !congratsShown.current) {
        congratsShown.current = true;
        setTimeout(() => {
          setShowCongrats(true);
          congratsPlayer.currentTime = 0;
          congratsPlayer.play();
        }, 0);
      }
      return next;
    });
    setActiveStep(null);
    setShowOrderGuide(false);
    setShowStepGrid(true);
    setShowWirePanel(false);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
  }, [congratsPlayer]);

  const closeGuide = useCallback(() => {
    const closingStep = activeStep;
    const shouldPlayInsertAnim = activeStep === 'insert';
    setActiveStep(null);
    setShowOrderGuide(false);
    setShowStepGrid(true);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
    if (closingStep === 'insert' && !completedSteps.has('insert')) {
      handleStepComplete('insert');
    }
    if (shouldPlayInsertAnim) {
      requestAnimationFrame(notifyRj45InsertionAnimation);
    }
  }, [activeStep, completedSteps, handleStepComplete]);

  const startOrderPractice = useCallback(() => {
    setShowOrderGuide(false);
  }, []);

  const handleBackWithVideo = useCallback(() => {
    if (activeStep && stepVideoMap[activeStep]) {
      setVideoStep(activeStep);
      setActiveStep(null);
      setShowOrderGuide(false);
    } else {
      closeGuide();
    }
  }, [activeStep, closeGuide]);

  const handleCloseVideo = useCallback(() => {
    const completedVideoStep = videoStep;
    setVideoStep(null);
    setActiveStep(null);
    setShowStepGrid(true);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
    if (completedVideoStep && !completedSteps.has(completedVideoStep)) {
      handleStepComplete(completedVideoStep);
    }
  }, [videoStep, completedSteps, handleStepComplete]);

  const handleArrangementComplete = useCallback(() => {
    setArrangementComplete(true);
    setActiveStep(null);
    setShowOrderGuide(false);
    setShowStepGrid(true);
    setShowWirePanel(false);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
    if (!completedSteps.has('order')) {
      handleStepComplete('order');
    }
    requestAnimationFrame(notifyRj45InsertionAnimation);
  }, [completedSteps, handleStepComplete]);

  const resetScene = useCallback(() => {
    resetRj45SceneState();
    patchRj45SceneState({ wiringType, activeStep: null, playInstallAnim: false });
    setActiveStep(null);
    setShowOrderGuide(false);
    setArrangementComplete(false);
    setNotice(null);
    setCompletedSteps(new Set());
    setShowCongrats(false);
    setShowStepGrid(true);
    setShowWirePanel(false);
    congratsShown.current = false;
  }, [wiringType]);

  const guide = activeStep ? getCablingGuide(wiringType, activeStep) : null;
  const isOrderActive = activeStep === 'order' && !showOrderGuide;
  const wiringLabel =
    wiringType === 'crossover' ? 'Crossover' : 'Straight-through';

  const showStepGridPanel = markerVisible && showStepGrid && !videoStep && !showWirePanel;

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={rj45Scene} style={styles.fill} />
      <ARHud
        markerDetected={markerVisible}
        slotLabel={activeStep ? `${wiringLabel} · ${guide?.shortLabel}` : wiringLabel}
        activeSlotLabel={activeStep ? guide?.shortLabel : wiringLabel}
        scanningHint="Point camera at RJ45 marker"
        detectedHint="RJ45 detected — choose a guide below"
        onReset={resetScene}
        onExit={onExit}
      >
        <View style={[styles.lessonControls, showStepGridPanel ? styles.lessonControlsOn : styles.lessonControlsOff]}>
          <Text style={styles.lessonControlsTitle}>Choose a cabling guide</Text>
            <View style={styles.lessonButtonGrid}>
              {cablingStepIds.map((stepId) => {
                const unlocked = isStepUnlocked(stepId, completedSteps);
                const completed = completedSteps.has(stepId);
                return (
                  <Pressable
                    key={stepId}
                    style={({ pressed }) => [
                      styles.lessonButton,
                      !unlocked && styles.lessonButtonLocked,
                      completed && styles.lessonButtonCompleted,
                      pressed && unlocked && styles.lessonButtonPressed,
                    ]}
                    onPress={() => {
                      if (!unlocked) {
                        setNotice('Complete the previous step first.');
                        return;
                      }
                      handleSelectStep(stepId);
                    }}
                  >
                    <Text style={[styles.lessonButtonText, !unlocked && styles.lessonButtonTextLocked]}>
                      {lessonButtonLabels[stepId]}
                    </Text>
                    {!unlocked && (
                      <Text style={styles.lockText}>Complete previous step</Text>
                    )}
                    {completed && (
                      <Text style={styles.checkText}>✓</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {notice && <Text style={styles.lessonNotice}>{notice}</Text>}
      </View>
    </ARHud>
      {guide && (!isOrderActive || showOrderGuide) && (
        <InstallGuidePanel          guide={guide}
          onClose={closeGuide}
          primaryActionLabel={activeStep === 'order' ? 'Start wire practice' : 'Back'}
          onPrimaryAction={activeStep === 'order' ? startOrderPractice : undefined}
          onBackWithVideo={activeStep !== 'order' ? handleBackWithVideo : undefined}
        />
      )}
      {isOrderActive && (
        <Rj45WireArrangementPanel
          wiringType={wiringType}
          onComplete={handleArrangementComplete}
          onClose={closeGuide}
        />
      )}
      <StepVideoPlayer
        visible={videoStep !== null}
        videoSource={videoStep ? stepVideoMap[videoStep] : null}
        onExit={handleCloseVideo}
      />
      <Modal visible={showCongrats} transparent animationType="fade">
        <View style={styles.congratsOverlay}>
          <View style={styles.congratsCard}>
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.congratsDesc}>All cabling steps completed successfully</Text>
            <Pressable
              style={({ pressed }) => [styles.okBtn, pressed && styles.okBtnPressed]}
              onPress={() => setShowCongrats(false)}
            >
              <Text style={styles.okBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  lessonControls: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(10,14,23,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
  },
  lessonControlsOn: { bottom: 30 },
  lessonControlsOff: { bottom: -1000 },
  lessonControlsTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  lessonButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  lessonButton: {
    width: '31.7%',
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.55)',
    paddingHorizontal: 4,
  },
  lessonButtonPressed: {
    backgroundColor: 'rgba(59,130,246,0.5)',
  },
  lessonButtonLocked: {
    backgroundColor: 'rgba(71,85,105,0.35)',
    borderColor: 'rgba(148,163,184,0.35)',
  },
  lessonButtonCompleted: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor: 'rgba(74,222,128,0.55)',
  },
  lessonButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  lessonButtonTextLocked: {
    color: 'rgba(255,255,255,0.35)',
  },
  lockText: {
    color: '#fbbf24',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 2,
  },
  checkText: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  lessonNotice: {
    color: '#fde68a',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 9,
    textAlign: 'center',
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
  okBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  okBtnPressed: {
    opacity: 0.8,
  },
  okBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
