import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cablingOverview } from '../data/cablingGuides';

// ── OptionScreen-aligned palette ─────────────────────────────────────────────
const C = {
  background:  '#dde8f8',
  surface:     '#ffffff',
  navy:        '#0c2d6b',
  navyLight:   '#1a4a9c',
  border:      '#b8d0ef',
  text:        '#0c2d6b',
  textMuted:   '#374e7a',
  white:       '#ffffff',
};

export function NetworkCablingSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.heading}>Network Cabling</Text>
        <Text style={styles.lead}>
          Choose the cable type you want to practice in AR. Point your camera at the
          RJ45 marker, then tap each step on the connector.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.choiceCard, pressed && styles.choicePressed]}
          onPress={() => navigation.navigate('ARNetwork', { wiringType: 'straight' })}
        >
          <View style={styles.choiceInner}>
            <Text style={styles.choiceTitle}>Straight-Through</Text>
            <Text style={styles.choiceBody}>{cablingOverview.straight.body}</Text>
            <Text style={styles.choiceCta}>Start AR lesson →</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.choiceCard, pressed && styles.choicePressed]}
          onPress={() => navigation.navigate('ARNetwork', { wiringType: 'crossover' })}
        >
          <View style={styles.choiceInner}>
            <Text style={styles.choiceTitle}>Crossover</Text>
            <Text style={styles.choiceBody}>{cablingOverview.crossover.body}</Text>
            <Text style={styles.choiceCta}>Start AR lesson →</Text>
          </View>
        </Pressable>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Marker tip</Text>
          <Text style={styles.tipBody}>
            Print{' '}
            <Text style={styles.mono}>assets/images/rj45-marker.jpg</Text> at about
            12 cm width. Use good lighting and a flat surface.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingHorizontal: 20,
  },

  // ── Heading ──────────────────────────────────────────────
  heading: {
    color: C.navy,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  lead: {
    color: C.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },

  // ── Choice cards (navy pill style like OptionScreen) ─────
  choiceCard: {
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  choicePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  choiceInner: {
    backgroundColor: C.navy,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  choiceTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  choiceBody: {
    color: 'rgba(200, 220, 255, 0.9)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
    textAlign: 'center',
  },
  choiceCta: {
    color: '#93c5fd',
    fontWeight: '800',
    fontSize: 14,
  },

  // ── Tip box ──────────────────────────────────────────────
  tipBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.navy,
  },
  tipTitle: {
    color: C.navy,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 6,
  },
  tipBody: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  mono: {
    fontFamily: 'monospace',
    color: C.navyLight,
    fontSize: 12,
  },
});