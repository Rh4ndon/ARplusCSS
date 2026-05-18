import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cablingOverview } from '../data/cablingGuides';

export function NetworkCablingSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={['#0c2d5c', '#081f42', '#040d1f']}
        style={StyleSheet.absoluteFill}
      />
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
          <LinearGradient
            colors={['#16a34a', '#15803d']}
            style={styles.choiceGradient}
          >
            <Text style={styles.choiceTitle}>Straight-Through</Text>
            <Text style={styles.choiceBody}>{cablingOverview.straight.body}</Text>
            <Text style={styles.choiceCta}>Start AR lesson →</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.choiceCard, pressed && styles.choicePressed]}
          onPress={() => navigation.navigate('ARNetwork', { wiringType: 'crossover' })}
        >
          <LinearGradient
            colors={['#059669', '#047857']}
            style={styles.choiceGradient}
          >
            <Text style={styles.choiceTitle}>Crossover</Text>
            <Text style={styles.choiceBody}>{cablingOverview.crossover.body}</Text>
            <Text style={styles.choiceCta}>Start AR lesson →</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Marker tip</Text>
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
  fill: { flex: 1, backgroundColor: '#040d1f' },
  content: { paddingHorizontal: 20 },
  heading: {
    color: '#f1f5f9',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  lead: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },
  choiceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  choicePressed: { opacity: 0.92 },
  choiceGradient: {
    padding: 18,
  },
  choiceTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  choiceBody: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  choiceCta: {
    color: '#ecfccb',
    fontWeight: '800',
    fontSize: 14,
  },
  tipBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(20,27,45,0.85)',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipTitle: {
    color: '#fbbf24',
    fontWeight: '700',
    marginBottom: 6,
  },
  tipBody: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 19,
  },
  mono: {
    fontFamily: 'monospace',
    color: '#e2e8f0',
  },
});
