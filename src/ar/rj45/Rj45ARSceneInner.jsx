import React from 'react';
import {
  ViroARImageMarker,
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroNode,
  Viro3DObject,
} from '@reactvision/react-viro';
import {
  CONNECTOR_END_A_ALIGN,
  CONNECTOR_END_B_ALIGN,
} from './wireLayout';
import { Rj45InsertionAnimation } from './Rj45InsertionAnimation';
import {
  getRj45SceneState,
  notifyRj45MarkerFound,
  notifyRj45MarkerLost,
  subscribeRj45SceneState,
} from './rj45SceneBridge';
import { RJ45_TARGET_NAME } from '../trackingTargets';

const rj45ModelSource = require('../../../assets/models/rj45/rj45.glb');

/**
 * The AR workspace deliberately renders only the two physical RJ45 ends.
 * End B is mounted only after End A finishes loading so the same GLB is
 * never decoded twice concurrently (native Viro renderer race on Android).
 *
 * The scene anchors on a captured RJ45 image target instead of a plane so
 * the 3D render only appears once the user's RJ45 marker is tracked.
 */
export function Rj45ARSceneInner({ targetName }) {
  const [bridge, setBridge] = React.useState(getRj45SceneState);
  const [endALoaded, setEndALoaded] = React.useState(false);
  React.useEffect(() => subscribeRj45SceneState(setBridge), []);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={350} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -1]}
        intensity={500}
      />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, 0, 1]}
        intensity={200}
      />
      <ViroARImageMarker
        target={targetName ?? RJ45_TARGET_NAME}
        onAnchorFound={notifyRj45MarkerFound}
        onAnchorUpdated={notifyRj45MarkerFound}
        onAnchorRemoved={notifyRj45MarkerLost}
      >
        <ViroNode>
          <Viro3DObject
            source={rj45ModelSource}
            type="GLB"
            position={CONNECTOR_END_A_ALIGN.position}
            scale={CONNECTOR_END_A_ALIGN.scale}
            rotation={CONNECTOR_END_A_ALIGN.rotation}
            onLoadStart={() => console.log('[LOAD] RJ45 End A onLoadStart')}
            onLoadEnd={() => {
              console.log('[LOAD] RJ45 End A onLoadEnd');
              setEndALoaded(true);
            }}
            onError={(e) => console.log('[LOAD] RJ45 End A onError', e)}
          />
          {endALoaded && (
            <Viro3DObject
              source={rj45ModelSource}
              type="GLB"
              position={CONNECTOR_END_B_ALIGN.position}
              scale={CONNECTOR_END_B_ALIGN.scale}
              rotation={CONNECTOR_END_B_ALIGN.rotation}
              onLoadStart={() => console.log('[LOAD] RJ45 End B onLoadStart')}
              onLoadEnd={() => console.log('[LOAD] RJ45 End B onLoadEnd')}
              onError={(e) => console.log('[LOAD] RJ45 End B onError', e)}
            />
          )}
          {bridge.insertionAnimationRun > 0 && (
            <Rj45InsertionAnimation key={bridge.insertionAnimationRun} wiringType={bridge.wiringType} />
          )}
        </ViroNode>
      </ViroARImageMarker>
    </ViroARScene>
  );
}
