import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useARSupport } from '../hooks/useARSupport';
import { requestARInstall } from '../utils/arSupport';

/**
 * Renders children (the Viro AR navigator) only after AR has been confirmed
 * usable. On unsupported devices the native AR engine is never started, which
 * avoids the SIGSEGV caused by ARCore session creation on those devices.
 */
export function ARAvailabilityGate({ onExit, children }) {
  const { checking, support, refresh } = useARSupport();

  if (checking) {
    return <ARCheckingView />;
  }

  if (!support?.supported) {
    return <ARUnavailableView support={support} onExit={onExit} onRetry={refresh} />;
  }

  return children;
}

function ARCheckingView() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.centered, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.checkingText}>Checking AR support…</Text>
    </View>
  );
}

function ARUnavailableView({ support, onExit, onRetry }) {
  const insets = useSafeAreaInsets();
  const [installing, setInstalling] = useState(false);

  const deviceLabel = support?.device?.label;
  const deviceModel = support?.device?.model;

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await requestARInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <View
      style={[styles.centered, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.card}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>!</Text>
        </View>

        <Text style={styles.title}>AR Not Available</Text>

        <Text style={styles.message}>
          {support?.reason ?? 'Augmented reality is not available on this device.'}
        </Text>

        {(deviceLabel || deviceModel) && (
          <Text style={styles.deviceLabel}>
            Device: {[deviceLabel, deviceModel].filter(Boolean).join(' — ')}
          </Text>
        )}

        <Text style={styles.hint}>
          You can still study the motherboard and RJ45 wiring using the guides and videos in the app.
        </Text>

        <View style={styles.actions}>
          {support?.canInstall && (
            <Pressable
              style={[styles.button, styles.primaryButton, installing && styles.buttonDisabled]}
              onPress={handleInstall}
              disabled={installing}
            >
              {installing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Install AR</Text>
              )}
            </Pressable>
          )}

          {support?.canInstall && (
            <Pressable style={styles.button} onPress={onRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          )}

          <Pressable style={[styles.button, styles.primaryButton]} onPress={onExit}>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  checkingText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 15,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: 18,
  },
  iconText: {
    color: colors.warning,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  deviceLabel: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  hint: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 24,
    gap: 10,
  },
  button: {
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
});
