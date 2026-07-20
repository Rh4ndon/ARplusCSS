import React, { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../theme/colors';
import { saveMarkerImage, saveMarkerConfig } from '../utils/markerStorage';

const DEFAULTS = {
  motherboard: 24,
  rj45: 12,
};

const LABELS = {
  motherboard: 'motherboard',
  rj45: 'RJ45 port',
};

export function MarkerCaptureScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState(null);
  const [ready, setReady] = useState(false);
  const camRef = useRef(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const markerType = route?.params?.type ?? 'motherboard';
  const returnTo = route?.params?.returnTo ?? 'AR';
  const returnParams = route?.params?.returnParams ?? {};

  const defaultWidth = DEFAULTS[markerType] ?? DEFAULTS.rj45;
  const label = LABELS[markerType] ?? 'marker';
  const [physicalWidth, setPhysicalWidth] = useState(String(defaultWidth));

  const frameSize = width * 0.78;

  const handleCapture = async () => {
    if (!camRef.current) return;
    try {
      const photo = await camRef.current.takePictureAsync({
        quality: 0.8,
      });
      setCaptured(photo);
    } catch (e) {
      console.log('[CAPTURE] error taking picture', e);
    }
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleConfirm = async () => {
    if (!captured) return;
    try {
      const savedUri = await saveMarkerImage(captured.uri, markerType);
      const widthCm = parseFloat(physicalWidth) || defaultWidth;
      await saveMarkerConfig({
        [`${markerType}PhysicalWidth`]: widthCm,
        capturedAt: Date.now(),
      });
      navigation.replace(returnTo, {
        ...returnParams,
        markerUri: savedUri,
        markerPhysicalWidth: widthCm / 100,
      });
    } catch (e) {
      console.log('[CAPTURE] error saving marker', e);
    }
  };

  if (!permission) {
    return (
      <View style={styles.fill}>
        <Text style={styles.statusText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.fill}>
        <Text style={styles.statusText}>Camera access is required to capture the {label}.</Text>
        <Pressable style={styles.actionBtn} onPress={requestPermission}>
          <Text style={styles.actionBtnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (captured) {
    return (
      <View style={styles.fill}>
        <Image source={{ uri: captured.uri }} style={styles.preview} resizeMode="contain" />

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.widthRow}>
            <Text style={styles.widthLabel}>Physical width (cm):</Text>
            <TextInput
              style={styles.widthInput}
              value={physicalWidth}
              onChangeText={setPhysicalWidth}
              keyboardType="decimal-pad"
              placeholder={String(defaultWidth)}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryBtn} onPress={handleRetake}>
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleConfirm}>
              <Text style={styles.actionBtnText}>Use Photo</Text>
            </Pressable>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Compatible boards</Text>
            <Text style={styles.tipBody}>
              Hotspot positions are calibrated for ASUS P5G41T-M LX3. Any board with
              similar layout (CPU top-left, RAM right, ATX bottom-right) will work.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView
        ref={camRef}
        style={styles.camera}
        facing="back"
        ratio="4:3"
        onCameraReady={() => setReady(true)}
      />
      <View style={styles.overlay}>
        <View style={styles.frameWrap}>
          <View style={[styles.frame, { width: frameSize, height: frameSize * 0.75 }]}>
            <Text style={styles.frameText}>Position {label} inside the frame</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Compatible boards</Text>
          <Text style={styles.tipBody}>
            Hotspot positions are calibrated for ASUS P5G41T-M LX3. Any board with
            similar layout (CPU top-left, RAM right, ATX bottom-right) will work.
          </Text>
        </View>
        <View style={styles.widthRow}>
          <Text style={styles.widthLabel}>Physical width (cm):</Text>
          <TextInput
            style={styles.widthInput}
            value={physicalWidth}
            onChangeText={setPhysicalWidth}
            keyboardType="decimal-pad"
            placeholder={String(defaultWidth)}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <Pressable
          style={[styles.actionBtn, !ready && styles.disabledBtn]}
          onPress={handleCapture}
          disabled={!ready}
        >
          <Text style={styles.actionBtnText}>Capture</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  frameText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  preview: { flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 14,
    backgroundColor: 'rgba(10,14,23,0.92)',
  },
  widthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  widthLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  widthInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  tipBox: {
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  tipTitle: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipBody: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  statusText: {
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
    padding: 40,
  },
});
