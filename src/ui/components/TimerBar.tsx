import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface Props {
  deadline: number | null;
  totalSeconds: number;
}

export function TimerBar({deadline, totalSeconds}: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (deadline === null) {
      setRemaining(totalSeconds);
      return;
    }

    const tick = () => {
      const secs = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(secs);
    };

    tick();
    const handle = setInterval(tick, 250);
    return () => clearInterval(handle);
  }, [deadline, totalSeconds]);

  const ratio = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, {flex: ratio}]} />
        <View style={{flex: 1 - ratio}} />
      </View>
      <Text style={styles.label}>{remaining}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 12,
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: '#2563eb',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    width: 44,
    textAlign: 'right',
    color: '#1e293b',
  },
});
