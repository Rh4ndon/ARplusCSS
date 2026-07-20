import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ARMotherboardScene } from '../ar/ARMotherboardScene';
import { colors } from '../theme/colors';

export function ARScreen({ navigation, route }) {
  const markerUri = route?.params?.markerUri;
  const markerPhysicalWidth = route?.params?.markerPhysicalWidth;

  return (
    <View style={styles.container}>
      <ARMotherboardScene
        onExit={() => navigation.goBack()}
        markerUri={markerUri}
        markerPhysicalWidth={markerPhysicalWidth}
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
