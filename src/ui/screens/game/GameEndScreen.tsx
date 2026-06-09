import React from 'react';
import {Button, ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useHostGame} from '@/ui/host/HostGameContext';
import type {RootStackParamList} from '@/ui/navigation/types';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';

interface Props {
  onQuit: () => void;
}

export function GameEndScreen({onQuit}: Props) {
  const {state} = useHostGame();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vainqueur = state.classement.find(
    c => c.equipeId === state.vainqueurTournoiId,
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="display" center>
        🏆
      </ThemedText>
      <ThemedText size="xxl" bold center>
        {vainqueur ? vainqueur.nom : 'Vainqueur'} remporte le tournoi !
      </ThemedText>

      <ThemedText semibold size="base" secondary>
        Classement
      </ThemedText>
      <ThemedView style={styles.list}>
        {state.classement.map((entry, index) => (
          <ThemedView key={entry.equipeId} secondary style={styles.row}>
            <ThemedText bold style={styles.rank}>
              {index + 1}.
            </ThemedText>
            <ThemedText size="base" style={styles.nom}>
              {entry.nom}
            </ThemedText>
            <ThemedText semibold secondary>
              {entry.points} pts
            </ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView style={styles.actions}>
        <Button
          title="Voir l'historique"
          onPress={() => navigation.navigate('History')}
        />
        <Button title="Retour à l'accueil" onPress={onQuit} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    alignItems: 'stretch',
  },
  list: {
    gap: 8,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    padding: 12,
  },
  rank: {
    width: 28,
  },
  nom: {
    flex: 1,
  },
});
