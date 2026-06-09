import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import type {Bracket, Match} from '@/types/bracket';
import type {Equipe} from '@/types/equipe';
import {ThemedText} from '@/ui/components/ThemedText';
import {useColors} from '@/ui/theme';

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
  const colors = useColors();

  const nameOf = (equipeId: string): string => {
    if (equipeId.startsWith('vainqueur_')) {
      return 'À déterminer';
    }
    return equipes.find(e => e.id === equipeId)?.nom ?? equipeId;
  };

  const renderMatch = (match: Match) => {
    const isWinnerA = match.vainqueurId === match.equipeAId;
    const isWinnerB = match.vainqueurId === match.equipeBId;
    const isActive = match.statut === 'active';
    return (
      <View
        key={match.id}
        style={[
          styles.match,
          {backgroundColor: colors.card, borderColor: colors.cardBorder},
          isActive && {borderColor: colors.primary, borderWidth: 2},
        ]}>
        <ThemedText
          size="sm"
          bold={isWinnerA}
          success={isWinnerA}>
          {nameOf(match.equipeAId)}
        </ThemedText>
        <ThemedText size="xs" muted center>
          vs
        </ThemedText>
        <ThemedText
          size="sm"
          bold={isWinnerB}
          success={isWinnerB}>
          {nameOf(match.equipeBId)}
        </ThemedText>
      </View>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.rounds}>
        {bracket.rounds.map((round, roundIndex) => (
          <View key={roundIndex} style={styles.round}>
            <ThemedText size="xs" bold tertiary center>
              {roundLabel(roundIndex, bracket.rounds.length)}
            </ThemedText>
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
  match: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    minWidth: 130,
    gap: 2,
  },
});
