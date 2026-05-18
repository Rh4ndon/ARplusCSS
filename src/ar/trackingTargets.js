import { ViroARTrackingTargets } from '@reactvision/react-viro';

/** Physical width of the printed marker in meters. */
export const MOTHERBOARD_MARKER_PHYSICAL_WIDTH_M = 0.21;

export const MOTHERBOARD_TARGET_NAME = 'motherboard';

let targetsRegistered = false;

export function registerMotherboardTrackingTarget() {
  if (targetsRegistered) {
    return;
  }

  ViroARTrackingTargets.createTargets({
    [MOTHERBOARD_TARGET_NAME]: {
      source: require('../../assets/images/motherboard-marker.jpg'),
      orientation: 'Up',
      physicalWidth: MOTHERBOARD_MARKER_PHYSICAL_WIDTH_M,
    },
  });

  targetsRegistered = true;
}
