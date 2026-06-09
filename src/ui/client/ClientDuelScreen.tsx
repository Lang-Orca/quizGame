import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {QUESTIONS_PAR_DUEL, TIMER_DEFAULT_SECONDS} from '@/constants';
import {OptionButton} from '@/ui/components/OptionButton';
import {QuestionCard} from '@/ui/components/QuestionCard';
import {TimerBar} from '@/ui/components/TimerBar';

import {useClient} from './ClientContext';

const LETTRES = ['A', 'B', 'C', 'D'];

export function ClientDuelScreen() {
  const {state, submitAnswer} = useClient();
  const question = state.question;

  if (!question) {
    return (
      <View style={styles.center}>
        <Text>En attente de la question…</Text>
      </View>
    );
  }

  const isReveal = state.duelPhase === 'reveal';
  const optionCorrecte = state.lastReveal?.optionCorrecte;
  const aRepondu = state.selectedOption !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TimerBar
        deadline={question.deadline}
        totalSeconds={TIMER_DEFAULT_SECONDS}
      />

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
            selected={state.selectedOption === option}
            correct={isReveal && option === optionCorrecte}
            disabled={isReveal || aRepondu}
            onPress={() => submitAnswer(option)}
          />
        ))}
      </View>

      {isReveal ? (
        <Text style={styles.info}>
          {state.selectedOption === optionCorrecte
            ? 'Bonne réponse !'
            : 'Mauvaise réponse.'}
        </Text>
      ) : aRepondu ? (
        <Text style={styles.info}>Réponse envoyée. En attente du reveal…</Text>
      ) : (
        <Text style={styles.info}>Sélectionnez votre réponse.</Text>
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
  options: {
    gap: 10,
  },
  info: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
