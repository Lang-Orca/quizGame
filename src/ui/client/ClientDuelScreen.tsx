import React, {useState} from 'react';
import {Button, ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator} from 'react-native';

import {QUESTIONS_PAR_DUEL, TIMER_DEFAULT_SECONDS} from '@/constants';
import {OptionButton} from '@/ui/components/OptionButton';
import {QuestionCard} from '@/ui/components/QuestionCard';
import {TimerBar} from '@/ui/components/TimerBar';
import voiceService from '@/services/voiceService';

import {useClient} from './ClientContext';

const LETTRES = ['A', 'B', 'C', 'D'];

export function ClientDuelScreen() {
  const {state, submitAnswer} = useClient();
  const question = state.question;
  const [listening, setListening] = useState(false);

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

  const startVoice = async () => {
    setListening(true);
    const spoken = await voiceService.startListening();
    setListening(false);
    if (spoken) {
      const match = voiceService.matchVoiceToChoice(spoken, question.options);
      if (match) {
        submitAnswer(match);
      } else {
        console.warn(`Aucune option reconnue pour : ${spoken}`);
      }
    }
  };

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

      <View style={styles.voiceControls}>
        {!isReveal && !aRepondu && (
           <TouchableOpacity 
             style={[styles.voiceButton, listening && styles.voiceButtonActive]}
             onPress={listening ? voiceService.stopListening : startVoice}
             disabled={isReveal || aRepondu}
           >
             {listening ? <ActivityIndicator color="#fff" /> : <Text style={styles.voiceButtonText}>🎤 Répondre à la voix</Text>}
           </TouchableOpacity>
        )}
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
  voiceControls: {
    alignItems: 'center',
    marginVertical: 10,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
  },
  voiceButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  info: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
