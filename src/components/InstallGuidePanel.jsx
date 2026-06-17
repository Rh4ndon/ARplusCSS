import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

export function InstallGuidePanel({ guide, onClose, onReplayInstall }) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{guide.label}</Text>
          <Text style={styles.summary}>{guide.summary}</Text>

          <ScrollView style={styles.steps} showsVerticalScrollIndicator={false}>
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

          <View style={styles.actions}>
            <Pressable style={styles.secondaryBtn} onPress={onReplayInstall}>
              <Text style={styles.secondaryBtnText}>Replay AR animation</Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={onClose}>
              <Text style={styles.primaryBtnText}>Back to board</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
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
  steps: {
    marginTop: 16,
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
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
