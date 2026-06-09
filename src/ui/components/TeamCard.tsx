import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {Equipe} from '@/types/equipe';
import {ThemedCard} from '@/ui/components/ThemedCard';
import {ThemedText} from '@/ui/components/ThemedText';

interface Props {
  equipe: Equipe;
}

export function TeamCard({equipe}: Props) {
  return (
    <ThemedCard style={styles.card}>
      <View style={styles.header}>
        <ThemedText bold size="base">
          {equipe.nom}
        </ThemedText>
        {equipe.bonusPoints > 0 ? (
          <ThemedText size="xs" semibold warning>
            +{equipe.bonusPoints} bonus
          </ThemedText>
        ) : null}
      </View>
      {equipe.membres.map(membre => (
        <ThemedText key={membre.id} size="sm" secondary>
          • {membre.pseudo}
        </ThemedText>
      ))}
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 4,
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
