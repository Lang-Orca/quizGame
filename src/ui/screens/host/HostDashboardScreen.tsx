import React from 'react';
import {Button, ScrollView, StyleSheet, Text, View} from 'react-native';

import {MIN_JOUEURS} from '@/constants';
import {PlayerList} from '@/ui/components/PlayerList';
import {useHostGame} from '@/ui/host/HostGameContext';

export function HostDashboardScreen() {
  const {state, addFakePlayer, lockAndPrepare} = useHostGame();
  const canLock = state.players.length >= MIN_JOUEURS;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Salon — {state.sessionId ?? '...'}</Text>
      <Text style={styles.subtitle}>
        {state.players.length} joueur(s) connecté(s)
      </Text>

      <View style={styles.section}>
        <PlayerList players={state.players} />
      </View>

      <View style={styles.actions}>
        <Button title="Ajouter un joueur (debug)" onPress={addFakePlayer} />
        <Button
          title="Boucler le salon"
          onPress={lockAndPrepare}
          disabled={!canLock}
        />
      </View>

      {!canLock ? (
        <Text style={styles.hint}>
          Il faut au moins {MIN_JOUEURS} joueurs pour démarrer.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  section: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
  },
  actions: {
    gap: 12,
  },
  hint: {
    color: '#b45309',
    fontStyle: 'italic',
  },
});
