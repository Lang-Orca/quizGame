import React from 'react';
import {Button, ScrollView, StyleSheet, View} from 'react-native';

import {getMatchsEnAttente} from '@/domain/bracket';
import {BracketView} from '@/ui/components/BracketView';
import {TeamCard} from '@/ui/components/TeamCard';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useHostGame} from '@/ui/host/HostGameContext';
import {QuestionnaireSelectScreen} from '@/ui/screens/host/QuestionnaireSelectScreen';
import {useColors} from '@/ui/theme';

export function BracketScreen() {
  const colors = useColors();
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
        <ThemedText>Bracket non disponible.</ThemedText>
      </View>
    );
  }

  const prochains = getMatchsEnAttente(state.bracket);
  const prochain = prochains[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="xxl" bold>
        Tournoi
      </ThemedText>

      <View style={styles.teams}>
        {state.equipes.map(equipe => (
          <TeamCard key={equipe.id} equipe={equipe} />
        ))}
      </View>

      <ThemedText semibold size="base" secondary>
        Arbre du tournoi
      </ThemedText>
      <BracketView bracket={state.bracket} equipes={state.equipes} />

      <QuestionnaireSelectScreen />

      {prochain ? (
        nextMatchNeedsQuestionnaire ? (
          <ThemedView style={[styles.warnBox, {backgroundColor: colors.warningLight}]}>
            <ThemedText size="sm" warning>
              Le prochain duel n'a pas encore de questionnaire.
            </ThemedText>
            <Button
              title="Préparer le questionnaire public"
              onPress={prepareNextDuelQuestionnaire}
            />
          </ThemedView>
        ) : (
          <Button title="Démarrer le duel suivant" onPress={startNextMatch} />
        )
      ) : (
        <ThemedText tertiary>Tous les duels sont terminés.</ThemedText>
      )}

      {startError ? <ThemedText error>{startError}</ThemedText> : null}
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
  teams: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  warnBox: {
    gap: 10,
    borderRadius: 12,
    padding: 14,
  },
});
