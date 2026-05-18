import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPLASH_BLUE = '#0047AB';
const SPLASH_BLUE_LIGHT = '#1a5fc4';
const SPLASH_BLUE_DARK = '#002d6e';

const TAGLINE_LINES = [
  'AUGMENTED REALITY–BASED',
  'INSTRUCTIONAL MATERIALS IN',
  'COMPUTER SYSTEM SERVICING',
];

export function SplashScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Side-by-side on wider screens; stack only if the phone is very narrow.
  const stackVertically = width < 380;
  const logoSize = stackVertically
    ? Math.min(width * 0.72, 300)
    : Math.min(width * 0.46, 240);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3200);
    return () => clearTimeout(timer);
  }, [navigation]);

  const goHome = () => navigation.replace('Home');

  return (
    <Pressable style={styles.fill} onPress={goHome}>
      <LinearGradient
        colors={[SPLASH_BLUE_LIGHT, SPLASH_BLUE, SPLASH_BLUE_DARK]}
        locations={[0.15, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            minHeight: height - insets.top - insets.bottom,
          },
        ]}
      >
        <View
          style={[
            styles.centerBlock,
            stackVertically ? styles.centerBlockStacked : styles.centerBlockRow,
          ]}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize * 0.92,
              },
            ]}
            resizeMode="contain"
            accessibilityLabel="ARplusCSS logo"
          />

          <View style={styles.textSection}>
            {TAGLINE_LINES.map((line) => (
              <Text
                key={line}
                style={[
                  styles.tagline,
                  stackVertically ? styles.taglineCenter : styles.taglineLeft,
                ]}
              >
                {line}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: SPLASH_BLUE,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerBlock: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  centerBlockRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  centerBlockStacked: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 20,
  },
  logo: {
    flexShrink: 0,
  },
  textSection: {
    flexShrink: 1,
    justifyContent: 'center',
    maxWidth: 220,
  },
  tagline: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.35,
    lineHeight: 19,
  },
  taglineLeft: {
    textAlign: 'left',
  },
  taglineCenter: {
    textAlign: 'center',
  },
});
