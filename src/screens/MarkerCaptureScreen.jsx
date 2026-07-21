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

const DIMENSIONS = {
  motherboard: { width: 24.4, height: 18.8 },
  rj45: { width: 12, height: null },
};

const RJ45_FRAME_RATIO = 0.55;

export function MarkerCaptureScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const camRef = useRef(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const markerType = route?.params?.type ?? 'motherboard';
  const returnTo = route?.params?.returnTo ?? 'AR';
  const returnParams = route?.params?.returnParams ?? {};

  const defaultWidth = DEFAULTS[markerType] ?? DEFAULTS.rj45;
  const label = LABELS[markerType] ?? 'marker';
  const dims = DIMENSIONS[markerType] ?? DIMENSIONS.rj45;
  const locked = markerType === 'motherboard';
  const isSmallMarker = !locked;
  const [physicalWidth, setPhysicalWidth] = useState(String(defaultWidth));

  const frameSize = width * 0.78;

  function renderSmallFrame() {
    const frameSize = width * RJ45_FRAME_RATIO;
    const frameX = (width - frameSize) / 2;
    const frameY = (width - frameSize) / 2;
    return (
      <>
        <View style={[styles.frameCorner, { top: frameY, left: frameX, borderTopWidth: 3, borderLeftWidth: 3 }]} />
        <View style={[styles.frameCorner, { top: frameY, right: width - frameX - frameSize, borderTopWidth: 3, borderRightWidth: 3 }]} />
        <View style={[styles.frameCorner, { bottom: width - frameY - frameSize, left: frameX, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
        <View style={[styles.frameCorner, { bottom: width - frameY - frameSize, right: width - frameX - frameSize, borderBottomWidth: 3, borderRightWidth: 3 }]} />
      </>
    );
  }

  const handleCapture = async () => {
    if (!camRef.current) return;
    try {
      const photo = await camRef.current.takePictureAsync({
        quality: 1.0,
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
    if (!captured || saving) return;
    try {
      setSaving(true);
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
      setSaving(false);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>Camera access is required to capture the {label}.</Text>
        <Pressable style={styles.actionBtn} onPress={requestPermission}>
          <Text style={styles.actionBtnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (captured) {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <Image source={{ uri: captured.uri }} style={styles.preview} resizeMode="contain" />

        {saving && (
          <View style={styles.savingOverlay}>
            <Text style={styles.savingText}>Setting up AR…</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 14, backgroundColor: 'rgba(10,14,23,0.92)', paddingBottom: insets.bottom + 20 }}>
          {locked ? (
            <View style={styles.dimRow}>
              <Text style={styles.dimText}>
                {dims.width} × {dims.height} cm
              </Text>
              <Text style={styles.dimHint}>ASUS P5G41T-M LX3</Text>
            </View>
          ) : (
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
          )}

          <View style={styles.buttonRow}>
            <Pressable style={[styles.secondaryBtn, saving && styles.disabledBtn]} onPress={handleRetake} disabled={saving}>
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, saving && styles.disabledBtn]} onPress={handleConfirm} disabled={saving}>
              <Text style={styles.actionBtnText}>Use Photo</Text>
            </Pressable>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{locked ? 'Compatible boards' : 'Tip'}</Text>
            <Text style={styles.tipBody}>
              {locked
                ? 'Hotspot positions are calibrated for ASUS P5G41T-M LX3. Any board with similar layout (CPU top-left, RAM right, ATX bottom-right) will work.'
                : 'Make sure the port is well-lit and centered in the frame for reliable tracking.'}
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
      <View style={[styles.overlay, { paddingTop: insets.top + 16 }]}>
        {isSmallMarker ? renderSmallFrame() : (
          <>
            <View style={[styles.corner, styles.cornerTL, { top: 220, left: 16 }]} />
            <View style={[styles.corner, styles.cornerTR, { top: 220, right: 16 }]} />
            <View style={[styles.corner, styles.cornerBL, { bottom: 220, left: 16 }]} />
            <View style={[styles.corner, styles.cornerBR, { bottom: 220, right: 16 }]} />
          </>
        )}
        <Text style={styles.overlayLabel}>
          {isSmallMarker ? `Center the ${label} in the frame` : `Fill the screen with the ${label}`}
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>{locked ? 'Compatible boards' : 'Tip'}</Text>
          <Text style={styles.tipBody}>
            {locked
              ? 'Hotspot positions are calibrated for ASUS P5G41T-M LX3. Any board with similar layout (CPU top-left, RAM right, ATX bottom-right) will work.'
              : 'Make sure the port is well-lit and centered in the frame for reliable tracking.'}
          </Text>
        </View>
        {locked ? (
          <View style={styles.dimRow}>
            <Text style={styles.dimText}>
              {dims.width} × {dims.height} cm
            </Text>
            <Text style={styles.dimHint}>ASUS P5G41T-M LX3</Text>
          </View>
        ) : (
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
        )}

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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3b82f6',
  },
  frameCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#3b82f6',
  },
  cornerTL: { borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { borderBottomWidth: 3, borderRightWidth: 3 },
  overlayLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
  dimRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  dimText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dimHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
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
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  savingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
