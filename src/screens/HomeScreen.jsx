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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HOME_BLUE_TOP = '#0c2d5c';
const HOME_BLUE_MID = '#081f42';
const HOME_BLUE_BOTTOM = '#040d1f';
const LIME = '#9ae600';
const LIME_DARK = '#7bc700';

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
      <LinearGradient
        colors={[HOME_BLUE_TOP, HOME_BLUE_MID, HOME_BLUE_BOTTOM]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.circuitOverlay} pointerEvents="none" />

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
        <View style={styles.header}>
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

        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={() => navigation.navigate('Options')}
        >
          <LinearGradient
            colors={[LIME, LIME_DARK]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>GET STARTED</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: HOME_BLUE_BOTTOM,
  },
  circuitOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.15)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    marginBottom: 4,
  },
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
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.55)',
    justifyContent: 'center',
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60a5fa',
    position: 'absolute',
    left: 0,
  },
  sectionDotRight: {
    left: undefined,
    right: 0,
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  bodyText: {
    color: 'rgba(241, 245, 249, 0.92)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 340,
  },
  bodyTextGap: {
    marginTop: 14,
  },
  heroWrap: {
    marginTop: 22,
    marginBottom: 28,
    alignItems: 'center',
  },
  heroImage: {
    maxWidth: '100%',
  },
  ctaButton: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaText: {
    color: '#1a2332',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  ctaArrow: {
    color: '#1a2332',
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },
});
