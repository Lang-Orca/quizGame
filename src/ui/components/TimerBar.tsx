import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {ThemedText} from '@/ui/components/ThemedText';
import {useColors} from '@/ui/theme';

interface Props {
  deadline: number | null;
  totalSeconds: number;
}

export function TimerBar({deadline, totalSeconds}: Props) {
  const colors = useColors();
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
      <View style={[styles.track, {backgroundColor: colors.timerTrack}]}>
        <View style={[styles.fill, {backgroundColor: colors.timerFill, flex: ratio}]} />
        <View style={{flex: 1 - ratio}} />
      </View>
      <ThemedText size="base" bold style={styles.label}>
        {remaining}s
      </ThemedText>
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
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {},
  label: {
    width: 44,
    textAlign: 'right',
  },
});
