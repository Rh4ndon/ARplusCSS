import { ViroARTrackingTargets } from '@reactvision/react-viro';

export const RJ45_MARKER_PHYSICAL_WIDTH_M = 0.12;

export const RJ45_TARGET_NAME = 'rj45';

let targetsRegistered = false;

export function registerRj45TrackingTarget() {
  if (targetsRegistered) {
    return;
  }

  ViroARTrackingTargets.createTargets({
    [RJ45_TARGET_NAME]: {
      source: require('../../../assets/images/rj45-marker.jpg'),
      orientation: 'Up',
      physicalWidth: RJ45_MARKER_PHYSICAL_WIDTH_M,
    },
  });

  targetsRegistered = true;
}
