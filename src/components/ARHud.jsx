import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function ARHud({
  markerDetected,
  description,
  showInfo,
  phase,
  onReset,
  onToggleInfo,
  onExit,
  scanningHint = 'Point camera at motherboard marker',
  detectedHint = 'Motherboard detected',
  slotLabel,
  children,
}) {
  const insets = useSafeAreaInsets();

  const showReset = phase !== 'done';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
      <View style={styles.topRow} pointerEvents="box-none">
        <View style={styles.badge}>
          <View
            style={[
              styles.dot,
              { backgroundColor: markerDetected ? colors.success : colors.warning },
            ]}
          />
          <Text style={styles.badgeText}>
            {markerDetected ? detectedHint : scanningHint}
          </Text>
          {description && (
            <Pressable
              style={[styles.infoBtn, showInfo && styles.infoBtnActive]}
              onPress={onToggleInfo}
              hitSlop={8}
            >
              <Text style={[styles.infoBtnText, showInfo && styles.infoBtnTextActive]}>i</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.topRight}>
          {showReset && (
            <Pressable style={styles.resetBtn} onPress={onReset}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          )}
          {onExit && (
            <Pressable style={styles.exitBtn} onPress={onExit}>
              <Text style={styles.exitText}>Exit</Text>
            </Pressable>
          )}
        </View>
      </View>
      {slotLabel && (
        <View style={styles.slotBanner}>
          <Text style={styles.slotText}>{slotLabel}</Text>
        </View>
      )}
      {showInfo && description && (
        <View style={styles.descBanner}>
          <Text style={styles.descText}>{description}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 16,
    zIndex: 90,
    elevation: 15,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10,14,23,0.82)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badgeText: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
  },
  infoBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  infoBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  infoBtnTextActive: {
    color: '#ffffff',
  },
  descBanner: {
    marginTop: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotBanner: {
    marginTop: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  slotText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  descText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
  topRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  resetText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  exitBtn: {
    backgroundColor: 'rgba(20,27,45,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exitText: {
    color: colors.text,
    fontWeight: '600',
  },
});
