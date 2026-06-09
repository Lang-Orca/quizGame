import React, {useEffect} from 'react';
import {Button, ScrollView, StyleSheet, Text, View} from 'react-native';

import {QUESTIONS_PAR_DUEL, TIMER_DEFAULT_SECONDS} from '@/constants';
import {OptionButton} from '@/ui/components/OptionButton';
import {QuestionCard} from '@/ui/components/QuestionCard';
import {TimerBar} from '@/ui/components/TimerBar';
import {useHostGame} from '@/ui/host/HostGameContext';
import voiceService from '@/services/voiceService';

const LETTRES = ['A', 'B', 'C', 'D'];

export function DuelScreen() {
  const {state, debug, simulateRandomAnswers, forceReveal, nextQuestion} =
    useHostGame();
  const match = state.currentMatch;
  const question = state.question;

  useEffect(() => {
    if (question && state.duelPhase === 'wait') {
      voiceService.speak(question.texte);
    }
  }, [question?.texte, state.duelPhase]);

  if (!match || !question) {
    return (
      <View style={styles.center}>
        <Text>Préparation du duel...</Text>
      </View>
    );
  }

  const nomEquipe = (id: string) =>
    state.equipes.find(e => e.id === id)?.nom ?? id;
  const isReveal = state.duelPhase === 'reveal';
  const optionCorrecte = state.lastReveal?.optionCorrecte;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.scoreRow}>
        <Text style={styles.teamScore}>
          {nomEquipe(match.equipeAId)} : {state.manches.A}
        </Text>
        <Text style={styles.teamScore}>
          {nomEquipe(match.equipeBId)} : {state.manches.B}
        </Text>
      </View>

      <TimerBar deadline={state.deadline} totalSeconds={TIMER_DEFAULT_SECONDS} />

      <QuestionCard
        index={question.index}
        total={QUESTIONS_PAR_DUEL}
        texte={question.texte}
      />

      <View style={styles.options}>
        {question.options.map((option, i) => (
          <OptionButton
            key={i}
            letter={LETTRES[i]}
            label={option}
            correct={isReveal && option === optionCorrecte}
            disabled={isReveal}
          />
        ))}
      </View>

      {isReveal ? (
        <View style={styles.revealBox}>
          <Text style={styles.revealText}>
            Manche : {state.lastReveal?.mancheGagnante === 'egalite'
              ? 'Égalité'
              : `Équipe ${state.lastReveal?.mancheGagnante} remporte la manche`}
          </Text>
          <Button title="Question suivante" onPress={nextQuestion} />
        </View>
      ) : debug ? (
        <Button
          title="Simuler les réponses (debug)"
          onPress={simulateRandomAnswers}
        />
      ) : (
        <View style={styles.waitBox}>
          <Text style={styles.waitText}>En attente des réponses des joueurs…</Text>
          <Button title="Révéler maintenant" onPress={forceReveal} />
        </View>
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
  teamScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  options: {
    gap: 10,
  },
  revealBox: {
    gap: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
  },
  revealText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  waitBox: {
    gap: 12,
  },
  waitText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#64748b',
  },
});
