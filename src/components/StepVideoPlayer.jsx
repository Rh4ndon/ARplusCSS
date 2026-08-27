import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function StepVideoPlayer({ visible, videoSource, onExit, aspectRatio = 16 / 9 }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const sliderWidth = useRef(0);
  const sliderOriginX = useRef(0);
  const rafRef = useRef(null);
  const playerRef = useRef(null);
  const isSeekingRef = useRef(false);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  playerRef.current = player;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (_, gestureState) => {
          isSeekingRef.current = true;
          sliderOriginX.current = gestureState.x0;
        },
        onPanResponderMove: (_, gestureState) => {
          if (!sliderWidth.current || !duration) return;
          const dx = gestureState.moveX - sliderOriginX.current;
          const x = Math.max(0, Math.min(dx, sliderWidth.current));
          const ratio = x / sliderWidth.current;
          const newTime = ratio * duration;
          playerRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        },
        onPanResponderRelease: () => {
          isSeekingRef.current = false;
        },
        onPanResponderTerminate: () => {
          isSeekingRef.current = false;
        },
      }),
    [duration],
  );

  const handleSliderLayout = useCallback((e) => {
    sliderWidth.current = e.nativeEvent.layout.width;
  }, []);

  useEffect(() => {
    if (visible && videoSource) {
      player.currentTime = 0;
      player.play();
      setCurrentTime(0);
      setIsPlaying(true);
      setDuration(player.duration);
    }
  }, [visible, videoSource, player]);

  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      const p = playerRef.current;
      if (p && !isSeekingRef.current) {
        const time = p.currentTime;
        const dur = p.duration;
        setCurrentTime(time);
        if (dur && dur !== duration) {
          setDuration(dur);
        }
      }
      if (p) setIsPlaying(p.playing);
      rafRef.current = requestAnimationFrame(tick);
    };
    if (visible) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, duration]);

  const togglePlayPause = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.playing) {
      p.pause();
    } else {
      p.play();
    }
  }, []);

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

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

          <View style={styles.controlsBar}>
            <Pressable style={styles.playPauseBtn} onPress={togglePlayPause}>
              <Text style={styles.playPauseText}>{isPlaying ? '⏸' : '▶'}</Text>
            </Pressable>

            <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>

            <View
              style={styles.sliderTrack}
              onLayout={handleSliderLayout}
              {...panResponder.panHandlers}
            >
              <View style={styles.sliderBackground} pointerEvents="none" />
              <View style={[styles.sliderFill, { width: `${progress * 100}%` }]} pointerEvents="none" />
              <View style={[styles.sliderThumb, { left: `${progress * 100}%` }]} pointerEvents="none" />
            </View>

            <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
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
    paddingBottom: 8,
    paddingTop: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
    gap: 10,
  },
  playPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59,130,246,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseText: {
    color: '#ffffff',
    fontSize: 14,
  },
  timeLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    minWidth: 32,
    textAlign: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    overflow: 'visible',
  },
  sliderBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -2,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.25)',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -2,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(59,130,246,0.8)',
  },
  sliderThumb: {
    position: 'absolute',
    top: '50%',
    marginTop: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#ffffff',
    marginLeft: -7,
  },
});
