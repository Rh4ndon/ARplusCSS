import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BOARD_MOVE_STEP,
  BOARD_ROT_STEP,
  BOARD_SCALE_STEP,
  nudgeBoardMove,
  nudgeBoardPitch,
  nudgeBoardRoll,
  nudgeBoardScale,
  nudgeBoardYaw,
  resetBoardAlign,
} from '../ar/arSceneBridge';

const BTN = '#1D4ED8';
const RESET = '#B43E3E';
const LOCK = '#15803d';

function AlignButton({ label, onPress, color = BTN, wide }) {
  return (
    <Pressable
      style={[styles.btn, wide && styles.btnWide, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

function AlignRow({ children }) {
  return <View style={styles.row}>{children}</View>;
}

/**
 * Manual motherboard align controls (ported from Unity AlignPanel).
 * Shown after marker detect, before Start.
 */
export function MotherboardAlignPanel({ onLock, hidden = false }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.panel, hidden && styles.panelHidden, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents={hidden ? 'none' : 'auto'}
    >
      <Text style={styles.title}>Align motherboard</Text>
      <Text style={styles.hint}>
        Nudge until the 3D board sits on your physical board, then lock.
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AlignRow>
          <AlignButton label={'\u2190 ROTATE'} onPress={() => nudgeBoardYaw(-BOARD_ROT_STEP)} />
          <AlignButton label={'ROTATE \u2192'} onPress={() => nudgeBoardYaw(BOARD_ROT_STEP)} />
        </AlignRow>
        <AlignRow>
          <AlignButton label={'\u2191 TILT'} onPress={() => nudgeBoardPitch(BOARD_ROT_STEP)} />
          <AlignButton label={'TILT \u2193'} onPress={() => nudgeBoardPitch(-BOARD_ROT_STEP)} />
        </AlignRow>
        <AlignRow>
          <AlignButton label={'\u21BA ROLL'} onPress={() => nudgeBoardRoll(-BOARD_ROT_STEP)} />
          <AlignButton label={'ROLL \u21BB'} onPress={() => nudgeBoardRoll(BOARD_ROT_STEP)} />
        </AlignRow>
        <AlignRow>
          <AlignButton label={'SCALE \u2212'} onPress={() => nudgeBoardScale(1 / BOARD_SCALE_STEP)} />
          <AlignButton label={'SCALE +'} onPress={() => nudgeBoardScale(BOARD_SCALE_STEP)} />
        </AlignRow>
        <AlignRow>
          <AlignButton
            label="BACK"
            onPress={() => nudgeBoardMove([0, 0, 1], -BOARD_MOVE_STEP)}
          />
          <AlignButton
            label="FORWARD"
            onPress={() => nudgeBoardMove([0, 0, 1], BOARD_MOVE_STEP)}
          />
        </AlignRow>
        <AlignRow>
          <AlignButton
            label={'\u2190 MOVE'}
            onPress={() => nudgeBoardMove([1, 0, 0], -BOARD_MOVE_STEP)}
          />
          <AlignButton
            label={'MOVE \u2192'}
            onPress={() => nudgeBoardMove([1, 0, 0], BOARD_MOVE_STEP)}
          />
        </AlignRow>

        <AlignButton
          label="RESET POSITION"
          color={RESET}
          wide
          onPress={resetBoardAlign}
        />
        <AlignButton
          label="Lock Motherboard Position"
          color={LOCK}
          wide
          onPress={onLock}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    maxHeight: '58%',
    backgroundColor: 'rgba(10, 14, 23, 0.92)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingTop: 12,
    zIndex: 85,
    elevation: 12,
  },
  panelHidden: {
    bottom: -3000,
  },
  title: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  btnWide: {
    flex: undefined,
    alignSelf: 'stretch',
    minHeight: 48,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
