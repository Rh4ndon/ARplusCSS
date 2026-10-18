import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

const PROBE_TIMEOUT_MS = 8000;

/**
 * Devices on which the AR runtime is known to be unusable, even when ARCore
 * reports itself as installed/supported. Matched against the native probe
 * result (or `Platform.constants` when the native module is unavailable).
 *
 * OPPO A6 Pro 5G (CPH2781 / OP5E1BL1): the preinstalled ARCore has no camera
 * calibration profile for this build and the vendor motion-tracking camera tag
 * is missing, so native session creation returns an invalid handle and
 * ViroReact dereferences it -> native SIGSEGV. See the ar-availability module.
 */
export const AR_DEVICE_BLOCKLIST = [
  {
    device: 'OP5E1BL1',
    model: 'CPH2781',
    brand: 'OPPO',
    label: 'OPPO A6 Pro 5G',
    reason:
      'This OPPO model is missing the camera calibration data required by the AR engine, so AR cannot start on it.',
  },
];

let nativeModule;
let nativeModuleResolved = false;

function getNativeModule() {
  if (nativeModuleResolved) return nativeModule;
  nativeModuleResolved = true;
  if (Platform.OS !== 'android') {
    nativeModule = null;
    return nativeModule;
  }
  try {
    nativeModule = requireNativeModule('ARAvailability');
  } catch (error) {
    if (__DEV__) {
      console.warn('[arSupport] ARAvailability native module unavailable:', error?.message);
    }
    nativeModule = null;
  }
  return nativeModule;
}

function normalize(value) {
  return value == null ? '' : String(value).trim().toLowerCase();
}

function platformDeviceInfo() {
  const constants = Platform.constants ?? {};
  return {
    manufacturer: constants.Manufacturer ?? null,
    brand: constants.Brand ?? null,
    model: constants.Model ?? null,
    device: constants.Device ?? null,
    fingerprint: constants.Fingerprint ?? null,
    sdkInt: typeof constants.Version === 'number' ? constants.Version : null,
  };
}

export function findBlockedDevice(info) {
  if (!info) return null;
  const device = normalize(info.device);
  const model = normalize(info.model);
  const brand = normalize(info.brand);
  const fingerprint = normalize(info.fingerprint);

  for (const entry of AR_DEVICE_BLOCKLIST) {
    const deviceMatch = entry.device && device && device === normalize(entry.device);
    const modelMatch =
      entry.model &&
      model &&
      model === normalize(entry.model) &&
      (!entry.brand || !brand || brand === normalize(entry.brand));
    const fingerprintMatch =
      entry.fingerprintPrefix &&
      fingerprint &&
      fingerprint.startsWith(normalize(entry.fingerprintPrefix));

    if (deviceMatch || modelMatch || fingerprintMatch) return entry;
  }
  return null;
}

function availabilityReason(availability) {
  switch (availability) {
    case 'UNSUPPORTED_DEVICE_NOT_CAPABLE':
    case 'UNSUPPORTED_DEVICE_NOT_COMPATIBLE':
      return 'This device is not on the list of ARCore-supported devices.';
    case 'SUPPORTED_NOT_INSTALLED':
      return 'Google Play Services for AR is not installed on this device.';
    case 'SUPPORTED_APK_TOO_OLD':
      return 'The Google Play Services for AR on this device is out of date.';
    case 'UNKNOWN_TIMED_OUT':
    case 'UNKNOWN_ERROR':
      return 'The AR engine did not respond in time.';
    default:
      return 'Augmented reality is not available on this device.';
  }
}

function canInstallFor(availability) {
  return availability === 'SUPPORTED_NOT_INSTALLED' || availability === 'SUPPORTED_APK_TOO_OLD';
}

async function probeNativeAvailability() {
  const native = getNativeModule();
  const fallback = platformDeviceInfo();

  if (!native || typeof native.getStatusAsync !== 'function') {
    return { probeRan: false, info: fallback };
  }

  try {
    const status = await Promise.race([
      native.getStatusAsync(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('probe_timeout')), PROBE_TIMEOUT_MS)
      ),
    ]);
    return { probeRan: true, info: { ...fallback, ...(status ?? {}) } };
  } catch (error) {
    if (__DEV__) {
      console.warn('[arSupport] native availability probe failed:', error?.message);
    }
    return { probeRan: false, info: fallback, error: error?.message };
  }
}

/**
 * Resolves to the final AR support decision.
 *
 * @returns {Promise<{
 *   supported: boolean,
 *   uncertain?: boolean,
 *   reason?: string,
 *   source?: string,
 *   availability?: string|null,
 *   canInstall?: boolean,
 *   device?: { label?: string, model?: string|null, device?: string|null },
 * }>}
 */
export async function getARSupport() {
  const { probeRan, info } = await probeNativeAvailability();
  const availability = info?.availability ?? null;

  const blocked = findBlockedDevice(info);
  if (blocked) {
    return {
      supported: false,
      source: 'blocklist',
      reason: blocked.reason,
      availability,
      canInstall: false,
      device: {
        label: blocked.label,
        model: info?.model ?? null,
        device: info?.device ?? null,
      },
    };
  }

  if (probeRan && !info?.transient) {
    if (info?.unsupported) {
      return {
        supported: false,
        source: 'arcore',
        reason: availabilityReason(availability),
        availability,
        canInstall: canInstallFor(availability),
      };
    }
    if (info?.supported) {
      return { supported: true, source: 'arcore', availability };
    }
  }

  // Probe could not give a definitive answer (module missing, transient state
  // or timeout). Do not block - only the blocklist can veto in this case.
  return { supported: true, uncertain: true, source: probeRan ? 'transient' : 'unavailable', availability };
}

export async function requestARInstall() {
  const native = getNativeModule();
  if (!native || typeof native.requestInstallAsync !== 'function') {
    return null;
  }
  try {
    return await native.requestInstallAsync();
  } catch (error) {
    if (__DEV__) {
      console.warn('[arSupport] ARCore install request failed:', error?.message);
    }
    return null;
  }
}
