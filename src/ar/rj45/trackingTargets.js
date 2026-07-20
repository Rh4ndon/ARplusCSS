import { ViroARTrackingTargets } from '@reactvision/react-viro';

export const RJ45_TARGET_NAME = 'rj45';

let targetsRegistered = false;

export function registerRj45TrackingTarget({ sourceUri, physicalWidth } = {}) {
  if (targetsRegistered) {
    ViroARTrackingTargets.deleteTarget(RJ45_TARGET_NAME);
  }

  const source = sourceUri
    ? { uri: sourceUri }
    : require('../../../assets/images/rj45-marker.jpg');

  ViroARTrackingTargets.createTargets({
    [RJ45_TARGET_NAME]: {
      source,
      orientation: 'Up',
      physicalWidth: physicalWidth ?? 0.12,
    },
  });

  targetsRegistered = true;
}
