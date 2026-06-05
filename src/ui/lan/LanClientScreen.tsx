import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {LanLobbyScreen} from '@/ui/screens/lan/LanLobbyScreen';
import {ScanLanScreen} from '@/ui/screens/lan/ScanLanScreen';
import {PlayerDuelScreen} from '@/ui/screens/game/PlayerDuelScreen';

import {LanClientProvider, useLanClient} from './LanClientContext';

function WaitingTournament() {
  return (
    <View style={styles.center}>
      <ActivityIndicator />
      <Text style={styles.waitingText}>En attente du prochain duel…</Text>
    </View>
  );
}

function ConnectingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={styles.waitingText}>Connexion au salon…</Text>
    </View>
  );
}

function ClientFinishedView() {
  const {state} = useLanClient();
  const vainqueur = state.classement.find(
    c => c.equipeId === state.vainqueurEquipeId,
  );
  return (
    <ScrollView contentContainerStyle={styles.finished}>
      <Text style={styles.trophy}>🏆</Text>
      <Text style={styles.title}>
        {vainqueur ? vainqueur.nom : 'Tournoi'} remporte la partie !
      </Text>
      {state.classement.map((entry, index) => (
        <View key={entry.equipeId} style={styles.row}>
          <Text style={styles.rank}>{index + 1}.</Text>
          <Text style={styles.nom}>{entry.nom}</Text>
          <Text style={styles.points}>{entry.points} pts</Text>
        </View>
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
      <View style={styles.container}>
        <LanClientFlow />
      </View>
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
  waitingText: {
    fontStyle: 'italic',
    color: '#64748b',
  },
  finished: {
    padding: 24,
    gap: 12,
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
