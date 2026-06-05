import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

import {useHostGame} from '@/ui/host/HostGameContext';

function roundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) {
    return 'Finale';
  }
  if (fromEnd === 1) {
    return 'Demi-finales';
  }
  if (fromEnd === 2) {
    return 'Quarts';
  }
  return `Round ${roundIndex + 1}`;
}

export function QuestionnaireSelectScreen() {
  const {coverage, prepareAllMissing} = useHostGame();
  const totalRounds = coverage.length;
  const totalMissing = coverage.reduce(
    (acc, c) => acc + (c.needed - c.available),
    0,
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Questionnaires par round</Text>
      {coverage.map(({roundIndex, needed, available}) => {
        const missing = needed - available;
        return (
          <View key={roundIndex} style={styles.row}>
            <Text style={styles.round}>
              {roundLabel(roundIndex, totalRounds)}
            </Text>
            <Text style={[styles.count, missing > 0 && styles.missing]}>
              {available} / {needed}
              {missing > 0 ? ` (${missing} manquant${missing > 1 ? 's' : ''})` : ''}
            </Text>
          </View>
        );
      })}

      {totalMissing > 0 ? (
        <>
          <Text style={styles.warning}>
            En mode LAN offline, chaque duel doit disposer d'un questionnaire
            public pré-caché.
          </Text>
          <Button
            title="Préparer les questionnaires publics manquants"
            onPress={prepareAllMissing}
          />
        </>
      ) : (
        <Text style={styles.ok}>Tous les rounds sont couverts.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  round: {
    fontSize: 14,
    color: '#334155',
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  missing: {
    color: '#dc2626',
  },
  warning: {
    fontSize: 13,
    color: '#b45309',
    fontStyle: 'italic',
  },
  ok: {
    fontSize: 13,
    color: '#16a34a',
  },
});
