import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import type {Joueur} from '@/types/joueur';

interface Props {
  players: Joueur[];
}

export function PlayerList({players}: Props) {
  if (players.length === 0) {
    return <Text style={styles.empty}>Aucun joueur connecté.</Text>;
  }

  return (
    <View style={styles.container}>
      {players.map(player => (
        <View key={player.id} style={styles.row}>
          <View
            style={[styles.dot, player.connected ? styles.on : styles.off]}
          />
          <Text style={styles.pseudo}>{player.pseudo}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  empty: {
    fontStyle: 'italic',
    color: '#64748b',
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
  on: {
    backgroundColor: '#16a34a',
  },
  off: {
    backgroundColor: '#94a3b8',
  },
  pseudo: {
    fontSize: 16,
    color: '#1e293b',
  },
});
