import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {QUESTIONS_PAR_DUEL, TIMER_DEFAULT_SECONDS} from '@/constants';
import {OptionButton} from '@/ui/components/OptionButton';
import {QuestionCard} from '@/ui/components/QuestionCard';
import {TimerBar} from '@/ui/components/TimerBar';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useLanClient} from '@/ui/lan/LanClientContext';
import {notificationSuccess, notificationError} from '@/utils/haptics';

const LETTRES = ['A', 'B', 'C', 'D'];

export function PlayerDuelScreen() {
  const {state, submitAnswer} = useLanClient();
  const question = state.question;

  if (!question) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>En attente de la question…</ThemedText>
      </ThemedView>
    );
  }

  const isReveal = state.duelPhase === 'reveal';
  const optionCorrecte = state.lastReveal?.optionCorrecte;
  const aRepondu = state.selectedOption !== null;

  const [hapticsDone, setHapticsDone] = useState(false);
  if (isReveal && !hapticsDone) {
    setHapticsDone(true);
    if (state.selectedOption === optionCorrecte) {
      notificationSuccess();
    } else if (state.selectedOption !== null) {
      notificationError();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TimerBar deadline={question.deadline} totalSeconds={TIMER_DEFAULT_SECONDS} />

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
            selected={state.selectedOption === option}
            correct={isReveal && option === optionCorrecte}
            disabled={isReveal || aRepondu}
            onPress={() => submitAnswer(option)}
          />
        ))}
      </ThemedView>

      {isReveal ? (
        <ThemedText semibold center>
          {state.selectedOption === optionCorrecte
            ? 'Bonne réponse !'
            : 'Mauvaise réponse.'}
        </ThemedText>
      ) : aRepondu ? (
        <ThemedText center secondary>
          Réponse envoyée. En attente du reveal…
        </ThemedText>
      ) : (
        <ThemedText center secondary>
          Sélectionnez votre réponse.
        </ThemedText>
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
});
