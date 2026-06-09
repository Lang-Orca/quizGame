import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {FirebaseSessionSync} from '@/sync/FirebaseSessionSync';
import {ClientDuelScreen} from '@/ui/client/ClientDuelScreen';
import {ClientProvider, useClient} from '@/ui/client/ClientContext';
import type {RootStackParamList} from '@/ui/navigation/types';
import {JoinOnlineScreen} from '@/ui/screens/online/JoinOnlineScreen';
import {OnlineLobbyScreen} from '@/ui/screens/online/OnlineLobbyScreen';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';

function ConnectingView() {
  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator size="large" />
      <ThemedText tertiary>Connexion à la partie…</ThemedText>
    </ThemedView>
  );
}

function WaitingTournament() {
  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator />
      <ThemedText tertiary>En attente du prochain duel…</ThemedText>
    </ThemedView>
  );
}

function ClientFinishedView() {
  const {state} = useClient();
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

function OnlineClientFlow() {
  const {state} = useClient();

  switch (state.phase) {
    case 'connecting':
      return <ConnectingView />;
    case 'lobby':
      return <OnlineLobbyScreen />;
    case 'tournament':
      return <WaitingTournament />;
    case 'duel':
      return <ClientDuelScreen />;
    case 'finished':
      return <ClientFinishedView />;
    case 'idle':
    default:
      return <JoinOnlineScreen />;
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'JoinOnline'>;

export function OnlineClientScreen(_props: Props) {
  return (
    <ClientProvider createSync={() => new FirebaseSessionSync()}>
      <ThemedView style={styles.container}>
        <OnlineClientFlow />
      </ThemedView>
    </ClientProvider>
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
