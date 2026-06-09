import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {Joueur} from '@/types/joueur';
import {ThemedText} from '@/ui/components/ThemedText';
import {useColors} from '@/ui/theme';

interface Props {
  players: Joueur[];
}

export function PlayerList({players}: Props) {
  const colors = useColors();

  if (players.length === 0) {
    return <ThemedText tertiary>Aucun joueur connecté.</ThemedText>;
  }

  return (
    <View style={styles.container}>
      {players.map(player => (
        <View key={player.id} style={styles.row}>
          <View
            style={[
              styles.dot,
              {backgroundColor: player.connected ? colors.onlineDot : colors.offlineDot},
            ]}
          />
          <ThemedText size="base">{player.pseudo}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
