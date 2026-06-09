import React from 'react';
import {Button, ScrollView, StyleSheet} from 'react-native';

import {QUESTIONS_PAR_DUEL, TIMER_DEFAULT_SECONDS} from '@/constants';
import {OptionButton} from '@/ui/components/OptionButton';
import {QuestionCard} from '@/ui/components/QuestionCard';
import {TimerBar} from '@/ui/components/TimerBar';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useHostGame} from '@/ui/host/HostGameContext';
import {notificationSuccess, impactMedium} from '@/utils/haptics';

const LETTRES = ['A', 'B', 'C', 'D'];

export function DuelScreen() {
  const {state, debug, simulateRandomAnswers, forceReveal, nextQuestion} =
    useHostGame();
  const match = state.currentMatch;
  const question = state.question;

  if (!match || !question) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Préparation du duel...</ThemedText>
      </ThemedView>
    );
  }

  const nomEquipe = (id: string) =>
    state.equipes.find(e => e.id === id)?.nom ?? id;
  const isReveal = state.duelPhase === 'reveal';
  const optionCorrecte = state.lastReveal?.optionCorrecte;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.scoreRow}>
        <ThemedText bold size="base">
          {nomEquipe(match.equipeAId)} : {state.manches.A}
        </ThemedText>
        <ThemedText bold size="base">
          {nomEquipe(match.equipeBId)} : {state.manches.B}
        </ThemedText>
      </ThemedView>

      <TimerBar deadline={state.deadline} totalSeconds={TIMER_DEFAULT_SECONDS} />

      <QuestionCard
        index={question.index}
        total={QUESTIONS_PAR_DUEL}
        texte={question.texte}
      />

      <ThemedView style={styles.options}>
        {question.options.map((option, i) => (
          <OptionButton
            key={i}
            letter={LETTRES[i]}
            label={option}
            correct={isReveal && option === optionCorrecte}
            disabled={isReveal}
          />
        ))}
      </ThemedView>

      {isReveal ? (
        <ThemedView secondary style={styles.revealBox}>
          <ThemedText semibold size="base">
            Manche : {state.lastReveal?.mancheGagnante === 'egalite'
              ? 'Égalité'
              : `Équipe ${state.lastReveal?.mancheGagnante} remporte la manche`}
          </ThemedText>
          <Button title="Question suivante" onPress={nextQuestion} />
        </ThemedView>
      ) : debug ? (
        <Button
          title="Simuler les réponses (debug)"
          onPress={simulateRandomAnswers}
        />
      ) : (
        <ThemedView style={styles.waitBox}>
          <ThemedText tertiary>En attente des réponses des joueurs…</ThemedText>
          <Button title="Révéler maintenant" onPress={() => { impactMedium(); forceReveal(); }} />
        </ThemedView>
      )}
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
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  options: {
    gap: 10,
  },
  revealBox: {
    gap: 12,
    borderRadius: 12,
    padding: 16,
  },
  waitBox: {
    gap: 12,
  },
});
