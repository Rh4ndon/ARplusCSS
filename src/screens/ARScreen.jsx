import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ARMotherboardScene } from '../ar/ARMotherboardScene';
import { colors } from '../theme/colors';

export function ARScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ARMotherboardScene onExit={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
