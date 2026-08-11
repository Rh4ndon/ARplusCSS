import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ARRj45Scene } from '../ar/rj45/ARRj45Scene';
import { colors } from '../theme/colors';
import { deleteMarkerImages } from '../utils/markerStorage';

export function ARNetworkScreen({ navigation, route }) {
  const wiringType = route.params?.wiringType ?? 'straight';
  const markerUri = route.params?.markerUri;
  const markerPhysicalWidth = route.params?.markerPhysicalWidth;
  const markerTargetName = route.params?.markerTargetName;

  useEffect(() => {
    return () => deleteMarkerImages('rj45');
  }, []);

  return (
    <View style={styles.container}>
      <ARRj45Scene
        wiringType={wiringType}
        markerUri={markerUri}
        markerPhysicalWidth={markerPhysicalWidth}
        markerTargetName={markerTargetName}
        onExit={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});