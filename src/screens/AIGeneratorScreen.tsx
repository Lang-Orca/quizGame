import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import anthropicService from '../services/GeminiService';
import voiceService from '../services/voiceService';
import { QuizMode } from '../types';

const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
const CARD_BG = '#16213e';
const TEXT_COLOR = '#e0e0e0';
const ERROR_COLOR = '#ef4444';

interface AIGeneratorScreenProps {
  navigation: any;
  route: any;
}

export default function AIGeneratorScreen({ navigation, route }: AIGeneratorScreenProps) {
  const { voiceMode } = route.params as { voiceMode: boolean };

  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    if (!theme.trim()) {
      setError('Veuillez entrer un thème');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedQuestions = await anthropicService.generateQuestions(theme);

      if (generatedQuestions.length === 0) {
        setError('Impossible de générer les questions. Réessayez.');
        setLoading(false);
        return;
      }

      const quizMode: QuizMode = {
        type: 'ai',
        theme,
      };

      navigation.navigate('Quiz', {
        mode: quizMode,
        voiceMode,
        aiQuestions: generatedQuestions,
      });
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Erreur lors de la génération des questions. Veuillez vérifier votre clé API.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    try {
      await voiceService.initialize();
      const result = await voiceService.startListening();
      if (result) {
        setTheme(result);
      }
    } catch (err) {
      console.error('Error during voice input:', err);
      setError('Erreur lors de la reconnaissance vocale');
    } finally {
      setIsListening(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 Générer des Questions</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Entrez un thème:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Les dinosaures, La cuisine italienne..."
          placeholderTextColor="#666"
          value={theme}
          onChangeText={setTheme}
          editable={!loading && !isListening}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.voiceButton]}
            onPress={handleVoiceInput}
            disabled={loading || isListening}
          >
            {isListening ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🎤 Dicter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.generateButton, loading && styles.disabledButton]}
            onPress={handleGenerateQuestions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>✨ Générer</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ACCENT_PURPLE,
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: TEXT_COLOR,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.7)',
  },
  generateButton: {
    backgroundColor: ACCENT_PURPLE,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCENT_PURPLE,
  },
  backButtonText: {
    color: ACCENT_PURPLE,
    fontWeight: '600',
    fontSize: 14,
  },
});
