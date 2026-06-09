import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {PlayerList} from '@/ui/components/PlayerList';
import {useClient} from '@/ui/client/ClientContext';

export function OnlineLobbyScreen() {
  const {state} = useClient();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Partie rejointe</Text>
      <Text style={styles.subtitle}>
        Connecté en tant que {state.pseudo || '...'}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Joueurs ({state.players.length})
        </Text>
        <PlayerList players={state.players} />
      </View>

      <View style={styles.waiting}>
        <ActivityIndicator />
        <Text style={styles.waitingText}>
          En attente que l'hôte démarre le tournoi…
        </Text>
      </View>
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
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waitingText: {
    fontStyle: 'italic',
    color: '#64748b',
  },
});
