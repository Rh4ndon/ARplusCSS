import { ViroARTrackingTargets } from '@reactvision/react-viro';

export const MOTHERBOARD_TARGET_NAME = 'motherboard';
export const RJ45_TARGET_NAME = 'rj45';

let targetsRegistered = false;

export function registerMotherboardTrackingTarget({ sourceUri, physicalWidth } = {}) {
  if (targetsRegistered) {
    ViroARTrackingTargets.deleteTarget(MOTHERBOARD_TARGET_NAME);
  }

  const source = sourceUri
    ? { uri: sourceUri }
    : require('../../assets/images/motherboard-marker.jpg');

  ViroARTrackingTargets.createTargets({
    [MOTHERBOARD_TARGET_NAME]: {
      source,
      orientation: 'Up',
      physicalWidth: physicalWidth ?? 0.21,
    },
  });

  targetsRegistered = true;
}
