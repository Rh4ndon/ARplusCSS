import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function StepVideoPlayer({ visible, videoSource, onExit, aspectRatio = 16 / 9 }) {
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  React.useEffect(() => {
    if (visible && videoSource) {
      player.currentTime = 0;
      player.play();
    }
  }, [visible, videoSource, player]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onExit}>
      <View style={styles.backdrop}>
        <View style={[styles.container, aspectRatio < 1 && styles.containerPortrait]}>
          <View style={styles.header}>
            <Text style={styles.title}>Demonstration</Text>
            <Pressable style={styles.exitBtn} onPress={onExit}>
              <Text style={styles.exitBtnText}>Exit</Text>
            </Pressable>
          </View>

          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              nativeControls={false}
              contentFit="contain"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    height: '75%',
    backgroundColor: '#0a0e17',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
    overflow: 'hidden',
  },
  containerPortrait: {
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.2)',
    zIndex: 10,
  },
  title: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
  },
  exitBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  exitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  videoContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
