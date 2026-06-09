import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';

import {PlayerList} from '@/ui/components/PlayerList';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useClient} from '@/ui/client/ClientContext';

export function OnlineLobbyScreen() {
  const {state} = useClient();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="xxl" bold>
        Partie rejointe
      </ThemedText>
      <ThemedText secondary>
        Connecté en tant que {state.pseudo || '...'}
      </ThemedText>

      <ThemedView secondary style={styles.section}>
        <ThemedText semibold>
          Joueurs ({state.players.length})
        </ThemedText>
        <PlayerList players={state.players} />
      </ThemedView>

      <ThemedView style={styles.waiting}>
        <ActivityIndicator />
        <ThemedText tertiary>
          En attente que l'hôte démarre le tournoi…
        </ThemedText>
      </ThemedView>
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
    gap: 8,
  },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
