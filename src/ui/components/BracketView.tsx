import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import type {Bracket, Match} from '@/types/bracket';
import type {Equipe} from '@/types/equipe';

interface Props {
  bracket: Bracket;
  equipes: Equipe[];
}

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

export function BracketView({bracket, equipes}: Props) {
  const nameOf = (equipeId: string): string => {
    if (equipeId.startsWith('vainqueur_')) {
      return 'À déterminer';
    }
    return equipes.find(e => e.id === equipeId)?.nom ?? equipeId;
  };

  const renderMatch = (match: Match) => {
    const isWinnerA = match.vainqueurId === match.equipeAId;
    const isWinnerB = match.vainqueurId === match.equipeBId;
    return (
      <View
        key={match.id}
        style={[styles.match, match.statut === 'active' && styles.matchActive]}>
        <Text style={[styles.team, isWinnerA && styles.winner]}>
          {nameOf(match.equipeAId)}
        </Text>
        <Text style={styles.vs}>vs</Text>
        <Text style={[styles.team, isWinnerB && styles.winner]}>
          {nameOf(match.equipeBId)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.rounds}>
        {bracket.rounds.map((round, roundIndex) => (
          <View key={roundIndex} style={styles.round}>
            <Text style={styles.roundTitle}>
              {roundLabel(roundIndex, bracket.rounds.length)}
            </Text>
            {round.map(renderMatch)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rounds: {
    flexDirection: 'row',
    gap: 16,
  },
  round: {
    gap: 12,
    justifyContent: 'center',
  },
  roundTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  match: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    minWidth: 130,
    gap: 2,
  },
  matchActive: {
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  team: {
    fontSize: 14,
    color: '#1e293b',
  },
  winner: {
    fontWeight: '700',
    color: '#16a34a',
  },
  vs: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
