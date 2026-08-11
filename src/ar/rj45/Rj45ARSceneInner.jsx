import React from 'react';
import {
  ViroARPlane,
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
import { getRj45SceneState, notifyRj45MarkerFound, subscribeRj45SceneState } from './rj45SceneBridge';

const rj45ModelSource = require('../../../assets/models/rj45/rj45.glb');

/**
 * The AR workspace deliberately renders only the two physical RJ45 ends.
 * End B is mounted only after End A finishes loading so the same GLB is
 * never decoded twice concurrently (native Viro renderer race on Android).
 */
export function Rj45ARSceneInner() {
  const [bridge, setBridge] = React.useState(getRj45SceneState);
  const [endALoaded, setEndALoaded] = React.useState(false);
  React.useEffect(() => subscribeRj45SceneState(setBridge), []);

  return (
    <ViroARScene anchorDetectionTypes={['PlanesHorizontal']}>
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
      <ViroARPlane
        minWidth={0.2}
        minHeight={0.15}
        alignment="HorizontalUpward"
        onAnchorFound={notifyRj45MarkerFound}
        onAnchorUpdated={notifyRj45MarkerFound}
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
      </ViroARPlane>
    </ViroARScene>
  );
}
