import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function ARHud({
  markerDetected,
  activeSlotLabel,
  onExit,
  scanningHint = 'Point camera at motherboard marker',
  detectedHint = 'Motherboard detected — tap a slot',
}) {
  const insets = useSafeAreaInsets();

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
        </View>
        {onExit && (
          <Pressable style={styles.exitBtn} onPress={onExit}>
            <Text style={styles.exitText}>Exit</Text>
          </Pressable>
        )}
      </View>
      {activeSlotLabel && (
        <View style={styles.activeChip}>
          <Text style={styles.activeChipText}>Learning: {activeSlotLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 16,
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
  activeChip: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activeChipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
});
