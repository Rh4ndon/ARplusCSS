import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function OptionCard({
  colors: gradientColors,
  imageSource,
  icon,
  title,
  subtitle,
  onPress,
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.thumb} resizeMode="contain" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbIcon}>{icon}</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            {icon ? <Text style={styles.inlineIcon}>{icon}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
    minHeight: 100,
  },
  thumb: {
    width: 72,
    height: 72,
    flexShrink: 0,
  },
  thumbPlaceholder: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbIcon: {
    fontSize: 36,
  },
  body: {
    flex: 1,
    paddingRight: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  inlineIcon: {
    fontSize: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 17,
  },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chevronText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    marginTop: -2,
    marginLeft: 2,
  },
});
