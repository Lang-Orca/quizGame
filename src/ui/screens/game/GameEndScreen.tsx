import React from 'react';
import {Button, ScrollView, StyleSheet, Text, View} from 'react-native';

import {useHostGame} from '@/ui/host/HostGameContext';

interface Props {
  onQuit: () => void;
}

export function GameEndScreen({onQuit}: Props) {
  const {state} = useHostGame();
  const vainqueur = state.classement.find(
    c => c.equipeId === state.vainqueurTournoiId,
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.trophy}>🏆</Text>
      <Text style={styles.title}>
        {vainqueur ? vainqueur.nom : 'Vainqueur'} remporte le tournoi !
      </Text>

      <Text style={styles.section}>Classement</Text>
      <View style={styles.list}>
        {state.classement.map((entry, index) => (
          <View key={entry.equipeId} style={styles.row}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.nom}>{entry.nom}</Text>
            <Text style={styles.points}>{entry.points} pts</Text>
          </View>
        ))}
      </View>

      <Button title="Retour à l'accueil" onPress={onQuit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    alignItems: 'stretch',
  },
  trophy: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
  },
  rank: {
    fontSize: 16,
    fontWeight: '700',
    width: 28,
  },
  nom: {
    fontSize: 16,
    flex: 1,
  },
  points: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
});
