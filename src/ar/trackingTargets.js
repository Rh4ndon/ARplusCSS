import { ViroARTrackingTargets } from '@reactvision/react-viro';

export const MOTHERBOARD_TARGET_NAME = 'motherboard';
export const RJ45_TARGET_NAME = 'rj45';

const registered = {};

let lastRj45TargetName = null;

function registerTarget(name, { sourceUri, physicalWidth, fallbackSource }) {
  if (registered[name]) {
    ViroARTrackingTargets.deleteTarget(name);
  }

  const source = sourceUri
    ? { uri: sourceUri }
    : fallbackSource;

  ViroARTrackingTargets.createTargets({
    [name]: {
      source,
      orientation: 'Up',
      physicalWidth: physicalWidth ?? 0.21,
    },
  });

  registered[name] = true;
}

export function registerMotherboardTrackingTarget({ sourceUri, physicalWidth } = {}) {
  registerTarget(MOTHERBOARD_TARGET_NAME, {
    sourceUri,
    physicalWidth,
    fallbackSource: require('../../assets/images/motherboard-marker.jpg'),
  });
}

export function registerRj45TrackingTarget({ targetName, sourceUri, physicalWidth } = {}) {
  const name = targetName ?? RJ45_TARGET_NAME;
  if (lastRj45TargetName && lastRj45TargetName !== name) {
    ViroARTrackingTargets.deleteTarget(lastRj45TargetName);
    delete registered[lastRj45TargetName];
  }
  registerTarget(name, {
    sourceUri,
    physicalWidth: physicalWidth ?? 0.12,
    fallbackSource: require('../../assets/images/rj45-marker.jpg'),
  });
  lastRj45TargetName = name;
}
