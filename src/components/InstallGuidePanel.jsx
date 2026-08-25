import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer } from 'expo-video';
import { colors } from '../theme/colors';

const voiceOverAssets = {
  // Hardware voice overs
  cpu: require('../../assets/sounds/hardware-voice-over/cpu.m4a'),
  cpuBlock: require('../../assets/sounds/hardware-voice-over/cpu-block.m4a'),
  ram: require('../../assets/sounds/hardware-voice-over/ram.m4a'),
  atx24: require('../../assets/sounds/hardware-voice-over/atx24.m4a'),
  eps4: require('../../assets/sounds/hardware-voice-over/eps4.m4a'),
  sata: require('../../assets/sounds/hardware-voice-over/sata.m4a'),
  frontPanelUsb: require('../../assets/sounds/hardware-voice-over/front-panel-usb.m4a'),
  switches: require('../../assets/sounds/hardware-voice-over/switches.m4a'),
  gpu: require('../../assets/sounds/hardware-voice-over/gpu.m4a'),
  // Network voice overs
  strip: require('../../assets/sounds/network-voice-over/strip.m4a'),
  untwist: require('../../assets/sounds/network-voice-over/untwist.m4a'),
  trim: require('../../assets/sounds/network-voice-over/trim.m4a'),
  insert: require('../../assets/sounds/network-voice-over/insert.m4a'),
  crimp: require('../../assets/sounds/network-voice-over/crimp.m4a'),
  'wire-order-straight-through': require('../../assets/sounds/network-voice-over/wire-order-straight-through.m4a'),
  'wire-order-crossover': require('../../assets/sounds/network-voice-over/wire-order-crossover.m4a'),
};

function GuideVoiceOver({ animationKey }) {
  const source = voiceOverAssets[animationKey];
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (player && source) {
      player.play();
    }
  }, [player, source]);

  return null;
}

export function InstallGuidePanel({ guide, onClose, primaryActionLabel = 'Back', onPrimaryAction, onBackWithVideo }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      {guide.animationKey && <GuideVoiceOver animationKey={guide.animationKey} />}
      <View style={styles.fill}>
        <View style={styles.backdropArea} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{guide.label}</Text>
          <Text style={styles.summary}>{guide.summary}</Text>

          <ScrollView
            style={styles.stepsScroll}
            contentContainerStyle={styles.stepsContent}
            showsVerticalScrollIndicator={false}
          >
            {guide.steps.map((step, index) => (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{index + 1}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                </View>
              </View>
            ))}

            <Text style={styles.safetyHeading}>Safety</Text>
            {guide.safetyTips.map((tip) => (
              <Text key={tip} style={styles.safetyTip}>
                • {tip}
              </Text>
            ))}
          </ScrollView>

          <Pressable style={styles.primaryBtn} onPress={onBackWithVideo ?? onPrimaryAction ?? onClose}>
            <Text style={styles.primaryBtnText}>{primaryActionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  summary: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  stepsScroll: {
    marginTop: 16,
  },
  stepsContent: {
    paddingBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  stepBody: { flex: 1 },
  stepTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  stepDetail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  safetyHeading: {
    color: colors.warning,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  safetyTip: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
