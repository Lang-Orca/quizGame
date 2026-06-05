import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import type {Equipe} from '@/types/equipe';

interface Props {
  equipe: Equipe;
}

export function TeamCard({equipe}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.nom}>{equipe.nom}</Text>
        {equipe.bonusPoints > 0 ? (
          <Text style={styles.bonus}>+{equipe.bonusPoints} bonus</Text>
        ) : null}
      </View>
      {equipe.membres.map(membre => (
        <Text key={membre.id} style={styles.membre}>
          • {membre.pseudo}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nom: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  bonus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b45309',
  },
  membre: {
    fontSize: 14,
    color: '#475569',
  },
});
