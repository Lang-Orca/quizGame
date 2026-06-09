import React from 'react';
import {Button, ScrollView, StyleSheet, Text, View} from 'react-native';

import {getMatchsEnAttente} from '@/domain/bracket';
import {BracketView} from '@/ui/components/BracketView';
import {TeamCard} from '@/ui/components/TeamCard';
import {useHostGame} from '@/ui/host/HostGameContext';
import {QuestionnaireSelectScreen} from '@/ui/screens/host/QuestionnaireSelectScreen';

export function BracketScreen() {
  const {
    state,
    nextMatchNeedsQuestionnaire,
    startError,
    startNextMatch,
    prepareNextDuelQuestionnaire,
  } = useHostGame();

  if (!state.bracket) {
    return (
      <View style={styles.center}>
        <Text>Bracket non disponible.</Text>
      </View>
    );
  }

  const prochains = getMatchsEnAttente(state.bracket);
  const prochain = prochains[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tournoi</Text>

      <View style={styles.teams}>
        {state.equipes.map(equipe => (
          <TeamCard key={equipe.id} equipe={equipe} />
        ))}
      </View>

      <Text style={styles.section}>Arbre du tournoi</Text>
      <BracketView bracket={state.bracket} equipes={state.equipes} />

      <QuestionnaireSelectScreen />

      {prochain ? (
        nextMatchNeedsQuestionnaire ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              Le prochain duel n'a pas encore de questionnaire.
            </Text>
            <Button
              title="Préparer le questionnaire public"
              onPress={prepareNextDuelQuestionnaire}
            />
          </View>
        ) : (
          <Button title="Démarrer le duel suivant" onPress={startNextMatch} />
        )
      ) : (
        <Text style={styles.hint}>Tous les duels sont terminés.</Text>
      )}

      {startError ? <Text style={styles.error}>{startError}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  teams: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hint: {
    fontStyle: 'italic',
    color: '#64748b',
  },
  warnBox: {
    gap: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 14,
  },
  warnText: {
    fontSize: 14,
    color: '#92400e',
  },
  error: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
