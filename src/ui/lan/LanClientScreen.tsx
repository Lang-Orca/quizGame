import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {LanLobbyScreen} from '@/ui/screens/lan/LanLobbyScreen';
import {ScanLanScreen} from '@/ui/screens/lan/ScanLanScreen';
import {PlayerDuelScreen} from '@/ui/screens/game/PlayerDuelScreen';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';

import {LanClientProvider, useLanClient} from './LanClientContext';

function WaitingTournament() {
  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator />
      <ThemedText tertiary>En attente du prochain duel…</ThemedText>
    </ThemedView>
  );
}

function ConnectingView() {
  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator size="large" />
      <ThemedText tertiary>Connexion au salon…</ThemedText>
    </ThemedView>
  );
}

function ClientFinishedView() {
  const {state} = useLanClient();
  const vainqueur = state.classement.find(
    c => c.equipeId === state.vainqueurEquipeId,
  );
  return (
    <ScrollView contentContainerStyle={styles.finished}>
      <ThemedText size="display" center>
        🏆
      </ThemedText>
      <ThemedText size="xxl" bold center>
        {vainqueur ? vainqueur.nom : 'Tournoi'} remporte la partie !
      </ThemedText>
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
    </ScrollView>
  );
}

function LanClientFlow() {
  const {state} = useLanClient();

  switch (state.phase) {
    case 'connecting':
      return <ConnectingView />;
    case 'lobby':
      return <LanLobbyScreen />;
    case 'tournament':
      return <WaitingTournament />;
    case 'duel':
      return <PlayerDuelScreen />;
    case 'finished':
      return <ClientFinishedView />;
    case 'idle':
    default:
      return <ScanLanScreen />;
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'JoinLan'>;

export function LanClientScreen(_props: Props) {
  return (
    <LanClientProvider>
      <ThemedView style={styles.container}>
        <LanClientFlow />
      </ThemedView>
    </LanClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  finished: {
    padding: 24,
    gap: 12,
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
