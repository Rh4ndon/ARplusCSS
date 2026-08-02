import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ARMotherboardScene } from '../ar/ARMotherboardScene';
import { clearBoardState } from '../utils/boardStateStorage';
import { colors } from '../theme/colors';

export function ARScreen({ navigation, route }) {
  const markerUri = route?.params?.markerUri;
  const markerPhysicalWidth = route?.params?.markerPhysicalWidth;

  const handleExit = () => {
    // Clear the cached board pose so the user re-positions the motherboard
    // the next time they open the hardware components screen.
    clearBoardState();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ARMotherboardScene
        onExit={handleExit}
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
