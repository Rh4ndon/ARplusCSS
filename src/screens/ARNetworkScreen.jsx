import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ARRj45Scene } from '../ar/rj45/ARRj45Scene';
import { colors } from '../theme/colors';

export function ARNetworkScreen({ navigation, route }) {
  const wiringType = route.params?.wiringType ?? 'straight';

  return (
    <View style={styles.container}>
      <ARRj45Scene
        wiringType={wiringType}
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
