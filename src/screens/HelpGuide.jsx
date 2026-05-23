import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { componentGuides } from '../data/componentGuides';
import { cablingOverview, cablingStepIds, getCablingGuide } from '../data/cablingGuides';

// ── OptionScreen-aligned palette ────────────────────────────────────────────
const C = {
  background:       '#dde8f8',   // light blue page bg
  surface:          '#ffffff',   // white cards
  surfaceElevated:  '#eaf1fc',   // slightly tinted cards (muted)
  border:           '#b8d0ef',   // soft blue border
  navy:             '#0c2d6b',   // header / primary text
  navyLight:        '#1a4a9c',   // section titles
  accent:           '#1d4ed8',   // card titles / links (blue)
  success:          '#15803d',   // step labels (green)
  warning:          '#b45309',   // tip title (amber, readable on light bg)
  text:             '#0c2d6b',   // primary text (navy)
  textMuted:        '#374e7a',   // body / secondary text
  mono:             '#1e3a6e',   // inline code
};

export function HelpGuide() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Page heading */}
      <View style={styles.brandRow}>
        <Text style={styles.brand}>Help & Guide</Text>
      </View>
      <Text style={styles.tagline}>
        Reference for ARplusCSS lessons. Print markers, use good lighting, and tap
        hotspots in AR to open step-by-step instructions.
      </Text>

      <SectionTitle>Using AR in this app</SectionTitle>
      <View style={styles.card}>
        <Text style={styles.cardBody}>
          1. Choose a lesson from the options menu.{'\n'}
          2. Point your camera at the printed marker until tracking locks.{'\n'}
          3. Tap colored hotspots on the model for guides and animations.{'\n'}
          4. Use Replay AR animation on the guide sheet to see the motion again.
        </Text>
      </View>

      <SectionTitle>Hardware components (motherboard)</SectionTitle>
      <Text style={styles.sectionIntro}>
        Scan{' '}
        <Text style={styles.mono}>assets/images/motherboard-marker.jpg</Text> (~A5 /
        21 cm wide). Lessons cover:
      </Text>
      {Object.values(componentGuides).map((guide) => (
        <View key={guide.id} style={styles.card}>
          <Text style={styles.cardTitle}>{guide.label}</Text>
          <Text style={styles.cardBody}>{guide.summary}</Text>
        </View>
      ))}

      <SectionTitle>Network cabling (RJ45)</SectionTitle>
      <Text style={styles.sectionIntro}>
        Scan{' '}
        <Text style={styles.mono}>assets/images/rj45-marker.jpg</Text> (~12 cm wide).
        Pick straight-through or crossover before starting AR.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{cablingOverview.straight.title}</Text>
        <Text style={styles.cardBody}>{cablingOverview.straight.body}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{cablingOverview.crossover.title}</Text>
        <Text style={styles.cardBody}>{cablingOverview.crossover.body}</Text>
      </View>

      <Text style={styles.subHeading}>Cabling steps in AR</Text>
      {cablingStepIds.map((stepId) => {
        const guide = getCablingGuide('straight', stepId);
        return (
          <View key={stepId} style={styles.cardMuted}>
            <Text style={styles.cardTitleSmall}>{guide.label}</Text>
            <Text style={styles.cardBody}>{guide.summary}</Text>
          </View>
        );
      })}

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 Tips for best tracking</Text>
        <Text style={styles.tipBody}>
          • Use bright, even lighting — avoid glare on glossy markers.{'\n'}
          • Keep the marker flat and fill part of the camera view.{'\n'}
          • Hold the phone steady for a second when tracking starts.{'\n'}
          • Replace placeholder markers with high-contrast photos for class use.
        </Text>
      </View>
    </ScrollView>
  );
}

function SectionTitle({ children }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },

  // ── Brand / heading ──────────────────────────────────────
  brandRow: {
    marginBottom: 6,
  },
  brand: {
    color: C.navy,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    color: C.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },

  // ── Section title pill ───────────────────────────────────
  sectionTitleWrap: {
    backgroundColor: C.navy,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionIntro: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  subHeading: {
    color: C.navyLight,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },

  // ── Cards ────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMuted: {
    backgroundColor: C.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: {
    color: C.accent,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  cardTitleSmall: {
    color: C.success,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  cardBody: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },

  // ── Tip box ──────────────────────────────────────────────
  tipBox: {
    marginTop: 20,
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
    marginBottom: 8,
  },
  tipBody: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },

  // ── Inline mono ──────────────────────────────────────────
  mono: {
    fontFamily: 'monospace',
    color: C.mono,
    fontSize: 12,
  },
});