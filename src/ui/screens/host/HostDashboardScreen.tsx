import React from 'react';
import {Button, ScrollView, StyleSheet} from 'react-native';

import {MIN_JOUEURS} from '@/constants';
import {PlayerList} from '@/ui/components/PlayerList';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useHostGame} from '@/ui/host/HostGameContext';

export function HostDashboardScreen() {
  const {state, addFakePlayer, lockAndPrepare} = useHostGame();
  const canLock = state.players.length >= MIN_JOUEURS;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="xxl" bold>
        Salon — {state.sessionId ?? '...'}
      </ThemedText>
      <ThemedText secondary>
        {state.players.length} joueur(s) connecté(s)
      </ThemedText>

      <ThemedView secondary style={styles.section}>
        <PlayerList players={state.players} />
      </ThemedView>

      <ThemedView style={styles.actions}>
        <Button title="Ajouter un joueur (debug)" onPress={addFakePlayer} />
        <Button
          title="Boucler le salon"
          onPress={lockAndPrepare}
          disabled={!canLock}
        />
      </ThemedView>

      {!canLock ? (
        <ThemedText warning>
          Il faut au moins {MIN_JOUEURS} joueurs pour démarrer.
        </ThemedText>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
  },
  actions: {
    gap: 12,
  },
});
