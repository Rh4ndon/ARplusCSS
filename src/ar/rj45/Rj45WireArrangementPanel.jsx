import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getConnectorEnd, getTargetOrder, wireById } from './wireLayout';

const wireShortLabels = {
  wo: 'White / Orange', o: 'Orange', wg: 'White / Green', b: 'Blue',
  wb: 'White / Blue', g: 'Green', wbr: 'White / Brown', br: 'Brown',
};

const wireColors = {
  wo: '#fb923c', o: '#f97316', wg: '#4ade80', b: '#3b82f6',
  wb: '#60a5fa', g: '#22c55e', wbr: '#a16207', br: '#713f12',
};

function EndOrder({ end, order, placed = [], activePin, compact = false }) {
  return (
    <View style={[styles.endCard, compact && styles.endCardCompact]}>
      <View style={styles.endHeading}>
        <Text style={styles.endTitle}>{end.label}</Text>
        <Text style={styles.standard}>{end.standard}</Text>
      </View>
      <Text style={styles.orientation}>Latch down · contacts up · pins 1 → 8</Text>
      <View style={styles.pinGrid}>
        {order.map((wireId, index) => {
          const isPlaced = placed[index] === wireId;
          const isActive = activePin === index;
          return (
            <View key={`${end.id}-${index}`} style={[styles.pin, isActive && styles.pinActive]}>
              <Text style={styles.pinNumber}>{index + 1}</Text>
              <View style={[styles.swatch, isPlaced && { backgroundColor: wireColors[wireId] }]} />
              <Text style={styles.pinLabel}>{isPlaced ? wireShortLabels[wireId] : '—'}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function Rj45WireArrangementPanel({ wiringType, onComplete, onClose }) {
  const ends = useMemo(() => [getConnectorEnd(wiringType, 0), getConnectorEnd(wiringType, 1)], [wiringType]);
  const [mode, setMode] = useState('learn');
  const [endIndex, setEndIndex] = useState(0);
  const [pinIndex, setPinIndex] = useState(0);
  const [placed, setPlaced] = useState([Array(8).fill(null), Array(8).fill(null)]);
  const [message, setMessage] = useState(null);

  const activeOrder = getTargetOrder(wiringType, endIndex);
  const expectedWire = activeOrder[pinIndex];
  const complete = mode === 'complete';

  const startPractice = () => {
    setMode('practice');
    setEndIndex(0);
    setPinIndex(0);
    setPlaced([Array(8).fill(null), Array(8).fill(null)]);
    setMessage('Build End A first. Select the color for Pin 1.');
  };

  const chooseWire = (wireId) => {
    if (wireId !== expectedWire) {
      setMessage(`Not quite. Pin ${pinIndex + 1} needs ${wireShortLabels[expectedWire]}.`);
      return;
    }
    const nextPlaced = placed.map((end) => [...end]);
    nextPlaced[endIndex][pinIndex] = wireId;
    setPlaced(nextPlaced);

    if (pinIndex < 7) {
      setPinIndex(pinIndex + 1);
      setMessage(`Correct. Now choose Pin ${pinIndex + 2}.`);
    } else if (endIndex === 0) {
      setEndIndex(1);
      setPinIndex(0);
      setMessage(`${ends[0].label} is complete. Now build ${ends[1].label}, Pin 1.`);
    } else {
      setMode('complete');
      setMessage('Perfect arrangement on both RJ45 ends.');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>RJ45 wire arrangement</Text>
          <Text style={styles.subtitle}>
            {mode === 'learn' ? 'Study both ends, then test yourself.' : complete ? 'Both ends are ready to crimp.' : `${ends[endIndex].label}: choose Pin ${pinIndex + 1} of 8`}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={10}><Text style={styles.close}>Close</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {mode === 'learn' ? (
          <>
            <Text style={styles.learnNote}>A finished cable has two RJ45 ends. Read each order left to right with the latch down.</Text>
            {ends.map((end, index) => (
              <EndOrder key={end.id} end={end} order={getTargetOrder(wiringType, index)} placed={getTargetOrder(wiringType, index)} />
            ))}
            <Pressable style={styles.primaryButton} onPress={startPractice}>
              <Text style={styles.primaryButtonText}>Start 16-pin challenge</Text>
            </Pressable>
          </>
        ) : (
          <>
            {ends.map((end, index) => (
              <EndOrder
                key={end.id}
                end={end}
                order={getTargetOrder(wiringType, index)}
                placed={placed[index]}
                activePin={!complete && index === endIndex ? pinIndex : null}
                compact
              />
            ))}
            {message && <Text style={[styles.message, complete && styles.successMessage]}>{message}</Text>}
            {!complete ? (
              <View style={styles.palette}>
                {getTargetOrder(wiringType, endIndex).map((wireId) => {
                  const used = placed[endIndex].includes(wireId);
                  return (
                    <Pressable
                      key={wireId}
                      disabled={used}
                      style={[styles.wireButton, used && styles.wireButtonUsed]}
                      onPress={() => chooseWire(wireId)}
                    >
                      <View style={[styles.paletteSwatch, { backgroundColor: wireColors[wireId] }]} />
                      <Text style={styles.wireButtonText}>{wireById(wireId)?.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Pressable style={styles.primaryButton} onPress={onComplete}>
                <Text style={styles.primaryButtonText}>Show insertion animation</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 72, bottom: 12, left: 10, right: 10, backgroundColor: 'rgba(15,23,42,0.97)', borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' }, subtitle: { color: '#94a3b8', fontSize: 12, marginTop: 4 }, close: { color: '#93c5fd', fontWeight: '800', fontSize: 13 },
  content: { padding: 14, gap: 10 }, learnNote: { color: '#cbd5e1', fontSize: 13, lineHeight: 18 },
  endCard: { backgroundColor: '#172033', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', gap: 7 }, endCardCompact: { paddingVertical: 8 },
  endHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, endTitle: { color: '#fff', fontSize: 15, fontWeight: '800' }, standard: { color: '#86efac', fontSize: 12, fontWeight: '800' }, orientation: { color: '#94a3b8', fontSize: 10 },
  pinGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 }, pin: { width: '23.8%', minHeight: 54, borderRadius: 7, backgroundColor: '#0f172a', padding: 5, borderWidth: 1, borderColor: '#334155' }, pinActive: { borderColor: '#facc15', backgroundColor: '#3b310c' }, pinNumber: { color: '#94a3b8', fontSize: 9, fontWeight: '800' }, swatch: { height: 7, borderRadius: 4, backgroundColor: '#334155', marginVertical: 4 }, pinLabel: { color: '#e2e8f0', fontSize: 8, fontWeight: '700' },
  message: { color: '#fecaca', backgroundColor: '#450a0a', borderRadius: 8, padding: 10, fontSize: 12, fontWeight: '700', textAlign: 'center' }, successMessage: { color: '#bbf7d0', backgroundColor: '#14532d' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 2 }, wireButton: { width: '48.7%', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 8, borderWidth: 1, borderColor: '#475569', backgroundColor: '#1e293b', padding: 9 }, wireButtonUsed: { opacity: 0.35 }, paletteSwatch: { width: 13, height: 13, borderRadius: 7 }, wireButtonText: { color: '#fff', fontSize: 11, fontWeight: '700', flexShrink: 1 },
  primaryButton: { marginTop: 4, borderRadius: 10, backgroundColor: '#2563eb', paddingVertical: 13, alignItems: 'center' }, primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
