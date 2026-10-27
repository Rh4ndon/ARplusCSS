import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

export const componentImages = {
  cpu: require('../../assets/pictures/cpu.jpg'),
  cpuBlock: require('../../assets/pictures/cpu_block.jpg'),
  ram: require('../../assets/pictures/ram.jpg'),
  eps4: require('../../assets/pictures/eps4.jpg'),
  sata: require('../../assets/pictures/sata.jpg'),
};

export function ComponentPreviewModal({ guide, onExit }) {
  const image = componentImages[guide.id];

  if (!image) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onExit}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{guide.label}</Text>
          <Text style={styles.hint}>Find the highlighted hotspot on the motherboard.</Text>
          <Image
            source={image}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={`${guide.label} component`}
          />
          <Pressable style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 220,
    marginVertical: 12,
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 13,
    width: '100%',
  },
  exitButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
