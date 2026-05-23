import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── OptionScreen-aligned palette ─────────────────────────────────────────────
const C = {
  background:  '#dde8f8',   // light blue page bg
  navy:        '#0c2d6b',   // primary navy
  navyLight:   '#1a4a9c',   // section line / accents
  accent:      '#1d4ed8',   // blue accent
  border:      '#b8d0ef',   // soft blue border
  text:        '#0c2d6b',   // primary text
  textMuted:   '#374e7a',   // body text
  white:       '#ffffff',
};

function SectionHeading({ title }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionLine}>
        <View style={styles.sectionDot} />
      </View>
      <Text style={styles.sectionHeading}>{title}</Text>
      <View style={styles.sectionLine}>
        <View style={[styles.sectionDot, styles.sectionDotRight]} />
      </View>
    </View>
  );
}

export function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const logoWidth = Math.min(width * 0.88, 360);
  const heroWidth = Math.min(width - 32, 400);

  return (
    <View style={styles.fill}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo header — navy background like OptionScreen header */}
        <View style={[styles.header, { width: width }]}>
          <Image
            source={require('../../assets/logo.png')}
            style={[styles.logo, { width: logoWidth, height: logoWidth * 0.72 }]}
            resizeMode="contain"
            accessibilityLabel="AR+CSS logo"
          />
        </View>

        <SectionHeading title="About This Prototype" />

        <Text style={styles.bodyText}>
          AR + CSS is an interactive augmented reality app designed to help learners
          explore Computer System Servicing concepts.
        </Text>
        <Text style={[styles.bodyText, styles.bodyTextGap]}>
          Visualize hardware components, perform network cabling procedures, and test
          your skills—all through AR.
        </Text>

        <View style={styles.heroWrap}>
          <Image
            source={require('../../assets/images/home-hero.png')}
            style={[styles.heroImage, { width: heroWidth, height: heroWidth * 0.62 }]}
            resizeMode="contain"
            accessibilityLabel="AR learning preview"
          />
        </View>

        {/* CTA button — same navy pill style as OptionScreen menu cards */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={() => navigation.navigate('Options')}
        >
          <View style={styles.ctaInner}>
            <Text style={styles.ctaText}>GET STARTED</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // ── Header (navy bar matching OptionScreen) ──────────────
  header: {
    alignItems: 'center',
    backgroundColor: C.navy,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: -20,    // bleed to edges
    marginBottom: 8,
  },
  logo: {
    marginBottom: 4,
  },

  // ── Section heading ──────────────────────────────────────
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: C.border,
    justifyContent: 'center',
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
    position: 'absolute',
    left: 0,
  },
  sectionDotRight: {
    left: undefined,
    right: 0,
  },
  sectionHeading: {
    color: C.navy,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    flexShrink: 0,
  },

  // ── Body text ────────────────────────────────────────────
  bodyText: {
    color: C.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 340,
  },
  bodyTextGap: {
    marginTop: 14,
  },

  // ── Hero image ───────────────────────────────────────────
  heroWrap: {
    marginTop: 22,
    marginBottom: 28,
    alignItems: 'center',
  },
  heroImage: {
    maxWidth: '100%',
  },

  // ── CTA button (navy pill matching OptionScreen cards) ───
  ctaButton: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  ctaButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.navy,
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaText: {
    color: C.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  ctaArrow: {
    color: C.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: -2,
  },
});