import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet} from 'react-native';

import {PlayerList} from '@/ui/components/PlayerList';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useLanClient} from '@/ui/lan/LanClientContext';

export function LanLobbyScreen() {
  const {state} = useLanClient();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="xxl" bold>
        Salon rejoint
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
          En attente que l'hôte boucle le salon…
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
