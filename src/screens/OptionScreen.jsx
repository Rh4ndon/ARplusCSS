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
import { OptionCard } from '../components/OptionCard';

function WelcomeCard() {
  return (
    <View style={styles.welcomeCard}>
      <View style={styles.welcomeIconWrap}>
        <Text style={styles.welcomeIcon}>👋</Text>
      </View>
      <Text style={styles.welcomeText}>
        Welcome, Learner! Explore interactive AR lessons and develop your Computer
        System Servicing skills.
      </Text>
    </View>
  );
}

export function OptionScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={['#0c2d5c', '#081f42', '#040d1f']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
          accessibilityLabel="AR+CSS"
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeCard />

        <OptionCard
          colors={['#2563eb', '#1d4ed8']}
          imageSource={require('../../assets/images/option-hardware.png')}
          icon="🖥️"
          title="Hardware Components"
          subtitle="Explore and identify computer hardware using AR 3D models."
          onPress={() => navigation.navigate('AR')}
        />

        <OptionCard
          colors={['#16a34a', '#15803d']}
          imageSource={require('../../assets/images/option-network.png')}
          icon="🌐"
          title="Network Cabling"
          subtitle="Learn network cabling procedures step-by-step with AR guidance."
          onPress={() => navigation.navigate('NetworkCablingSetup')}
        />

        <OptionCard
          colors={['#7c3aed', '#6d28d9']}
          imageSource={require('../../assets/images/option-help.png')}
          icon="❓"
          title="Help / Guide"
          subtitle="How to use the app, scan markers, and other helpful tips."
          onPress={() => navigation.navigate('HelpGuide')}
        />
      </ScrollView>

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
    backgroundColor: '#040d1f',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(8, 31, 66, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  headerLogo: {
    width: '100%',
    maxWidth: 280,
    height: 88,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 40, 80, 0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  welcomeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeIcon: {
    fontSize: 26,
  },
  welcomeText: {
    flex: 1,
    color: 'rgba(241, 245, 249, 0.95)',
    fontSize: 13,
    lineHeight: 19,
  },
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
    backgroundColor: 'rgba(4, 13, 31, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.6)',
  },
  footerBulb: {
    fontSize: 18,
  },
  footerText: {
    flex: 1,
    color: 'rgba(148, 163, 184, 0.95)',
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
