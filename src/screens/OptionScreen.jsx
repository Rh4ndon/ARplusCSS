import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MenuCard({ imageSource, label, onPress }) {
  return (
    <Pressable style={styles.menuCard} onPress={onPress} android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
      <Image
        source={imageSource}
        style={styles.menuCardImage}
        resizeMode="contain"
      />
      <View style={styles.menuCardBtn}>
        <Text style={styles.menuCardLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function OptionScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="AR+CSS"
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <MenuCard
          imageSource={require('../../assets/images/option-hardware.png')}
          label="HARDWARE COMPONENTS"
          onPress={() => navigation.navigate('AR')}
        />

        <MenuCard
          imageSource={require('../../assets/images/option-network.png')}
          label="NETWORK CABLING"
          onPress={() => navigation.navigate('NetworkCablingSetup')}
        />

        <MenuCard
          imageSource={require('../../assets/images/option-help.png')}
          label="HELP/GUIDE"
          onPress={() => navigation.navigate('HelpGuide')}
        />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <Text style={styles.footerBulb}>💡</Text>
        <Text style={styles.footerText}>
          Make sure your device camera is working and you are in a well-lit area for
          best AR experience.
        </Text>
        <Pressable
          style={styles.scanBtn}
          onPress={() => navigation.navigate('AR')}
        >
          <Text style={styles.scanIcon}>⌁</Text>
          <Text style={styles.scanLabel}>Scan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#e8f0fc',
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0c2d6b',
    borderBottomWidth: 0,
  },
  headerLogo: {
    width: '100%',
    maxWidth: 240,
    height: 80,
  },

  // ── Scroll ───────────────────────────────────────────────
  scroll: {
    flex: 1,
    backgroundColor: '#dde8f8',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    alignItems: 'center',
    gap: 32,
  },

  // ── Menu Card ────────────────────────────────────────────
  menuCard: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  menuCardImage: {
    width: 140,
    height: 120,
    marginBottom: -8,
    zIndex: 1,
  },
  menuCardBtn: {
    backgroundColor: '#0c2d6b',
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  menuCardLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.2,
    lineHeight: 26,
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    backgroundColor: '#0c2d6b',
    borderTopWidth: 0,
  },
  footerBulb: {
    fontSize: 18,
  },
  footerText: {
    flex: 1,
    color: 'rgba(200, 220, 255, 0.9)',
    fontSize: 10,
    lineHeight: 14,
  },
  scanBtn: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scanIcon: {
    color: '#60a5fa',
    fontSize: 22,
    fontWeight: '700',
  },
  scanLabel: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
  },
});