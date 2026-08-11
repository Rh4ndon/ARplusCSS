import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { Rj45ARSceneInner } from './Rj45ARSceneInner';
import { cablingStepIds, getCablingGuide } from '../../data/cablingGuides';
import { InstallGuidePanel } from '../../components/InstallGuidePanel';
import { ARHud } from '../../components/ARHud';
import {
  patchRj45SceneState,
  registerRj45SceneHandlers,
  resetRj45SceneState,
  notifyRj45InsertionAnimation,
} from './rj45SceneBridge';
import { Rj45WireArrangementPanel } from './Rj45WireArrangementPanel';

const stableRj45Scene = {
  scene: Rj45ARSceneInner,
};

const lessonButtonLabels = {
  strip: '1. Strip',
  untwist: '2. Untwist',
  trim: '3. Trim',
  order: '4. Wire colors',
  insert: '5. Insert',
  crimp: '6. Crimp',
};

function CablingStepButtons({ arrangementComplete, notice, onSelect, onBlocked }) {
  return (
    <View style={styles.lessonControls}>
      <Text style={styles.lessonControlsTitle}>Choose a cabling guide</Text>
      <View style={styles.lessonButtonGrid}>
        {cablingStepIds.map((stepId) => (
          <Pressable
            key={stepId}
            style={({ pressed }) => [
              styles.lessonButton,
              (stepId === 'insert' || stepId === 'crimp') && !arrangementComplete && styles.lessonButtonLocked,
              pressed && styles.lessonButtonPressed,
            ]}
            onPress={() => {
              if ((stepId === 'insert' || stepId === 'crimp') && !arrangementComplete) {
                onBlocked();
                return;
              }
              onSelect(stepId);
            }}
          >
            <Text style={styles.lessonButtonText}>{lessonButtonLabels[stepId]}</Text>
            {(stepId === 'insert' || stepId === 'crimp') && !arrangementComplete && (
              <Text style={styles.lockText}>Finish colors first</Text>
            )}
          </Pressable>
        ))}
      </View>
      {notice && <Text style={styles.lessonNotice}>{notice}</Text>}
    </View>
  );
}

export function ARRj45Scene({ wiringType, onExit }) {
  const [markerVisible, setMarkerVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [showOrderGuide, setShowOrderGuide] = useState(false);
  const [arrangementComplete, setArrangementComplete] = useState(false);
  const [notice, setNotice] = useState(null);

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
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
  }, []);

  const handleSelectStep = useCallback((stepId) => {
    setNotice(null);
    setActiveStep(stepId);
    setShowOrderGuide(stepId === 'order');
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
    const shouldReplayInsertion = activeStep === 'insert' && arrangementComplete;
    setActiveStep(null);
    setShowOrderGuide(false);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
    if (shouldReplayInsertion) {
      requestAnimationFrame(notifyRj45InsertionAnimation);
    }
  }, [activeStep, arrangementComplete]);

  const startOrderPractice = useCallback(() => {
    setShowOrderGuide(false);
  }, []);

  const handleArrangementComplete = useCallback(() => {
    setArrangementComplete(true);
    setActiveStep(null);
    setShowOrderGuide(false);
    patchRj45SceneState({ activeStep: null, playInstallAnim: false });
    requestAnimationFrame(notifyRj45InsertionAnimation);
  }, []);

  const resetScene = useCallback(() => {
    resetRj45SceneState();
    patchRj45SceneState({ wiringType, activeStep: null, playInstallAnim: false });
    setActiveStep(null);
    setShowOrderGuide(false);
    setArrangementComplete(false);
    setNotice(null);
  }, [wiringType]);

  const guide = activeStep ? getCablingGuide(wiringType, activeStep) : null;
  const isOrderActive = activeStep === 'order' && !showOrderGuide;
  const wiringLabel =
    wiringType === 'crossover' ? 'Crossover' : 'Straight-through';

  return (
    <View style={styles.fill}>
      <ViroARSceneNavigator autofocus initialScene={stableRj45Scene} style={styles.fill} />
      <ARHud
        markerDetected={markerVisible}
        slotLabel={activeStep ? `${wiringLabel} · ${guide?.shortLabel}` : wiringLabel}
        activeSlotLabel={activeStep ? guide?.shortLabel : wiringLabel}
        scanningHint="Point camera at a flat surface"
        detectedHint="Surface ready — choose a guide below"
        onReset={resetScene}
        onExit={onExit}
      />
      {markerVisible && !activeStep && (
        <CablingStepButtons
          arrangementComplete={arrangementComplete}
          notice={notice}
          onSelect={handleSelectStep}
          onBlocked={() => setNotice('Finish the Wire colors challenge perfectly before inserting or crimping.')}
        />
      )}
      {guide && (!isOrderActive || showOrderGuide) && (
        <InstallGuidePanel
          guide={guide}
          onClose={closeGuide}
          primaryActionLabel={activeStep === 'order' ? 'Start wire practice' : 'Back'}
          onPrimaryAction={activeStep === 'order' ? startOrderPractice : undefined}
        />
      )}
      {isOrderActive && (
        <Rj45WireArrangementPanel
          wiringType={wiringType}
          onComplete={handleArrangementComplete}
          onClose={closeGuide}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  lessonControls: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 30,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(10,14,23,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
  },
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
  lessonButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  lockText: {
    color: '#fbbf24',
    fontSize: 8,
    fontWeight: '700',
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
});
