import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { componentGuides } from '../data/componentGuides';
import { cablingOverview, cablingStepIds, getCablingGuide } from '../data/cablingGuides';

export function HelpGuide() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Help & Guide</Text>
      <Text style={styles.tagline}>
        Reference for ARplusCSS lessons. Print markers, use good lighting, and tap
        hotspots in AR to open step-by-step instructions.
      </Text>

      <Text style={styles.sectionTitle}>Using AR in this app</Text>
      <View style={styles.card}>
        <Text style={styles.cardBody}>
          1. Choose a lesson from the options menu.{'\n'}
          2. Point your camera at the printed marker until tracking locks.{'\n'}
          3. Tap colored hotspots on the model for guides and animations.{'\n'}
          4. Use Replay AR animation on the guide sheet to see the motion again.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Hardware components (motherboard)</Text>
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

      <Text style={styles.sectionTitle}>Network cabling (RJ45)</Text>
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
        <Text style={styles.tipTitle}>Tips for best tracking</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  brand: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionIntro: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  subHeading: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMuted: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  cardTitleSmall: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  tipBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipTitle: {
    color: colors.warning,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  mono: {
    fontFamily: 'monospace',
    color: colors.text,
    fontSize: 12,
  },
});
