import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Question, QuizMode } from '../types';
import questions from '../data/questions';
import voiceService from '../services/voiceService';

const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
const CARD_BG = '#16213e';
const TEXT_COLOR = '#e0e0e0';
const SUCCESS_COLOR = '#10b981';
const ERROR_COLOR = '#ef4444';

interface QuizScreenProps {
  navigation: any;
  route: any;
}

export default function QuizScreen({ navigation, route }: QuizScreenProps) {
  const { mode, voiceMode } = route.params as {
    mode: QuizMode;
    voiceMode: boolean;
  };

  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let quizQuestions: Question[] = [];

        // Check if AI questions were passed
        if (route.params?.aiQuestions) {
          quizQuestions = route.params.aiQuestions;
        } else if (mode.type === 'offline') {
          quizQuestions = questions[mode.category || ''] || [];
        } else if (mode.type === 'online') {
          const response = await fetch(
            'https://opentdb.com/api.php?amount=10&type=multiple&category=9'
          );
          const data = await response.json();

          quizQuestions = data.results.map((q: any) => ({
            question: decodeHTML(q.question),
            choices: [
              decodeHTML(q.correct_answer),
              ...q.incorrect_answers.map((a: string) => decodeHTML(a)),
            ].sort(() => Math.random() - 0.5),
            answer: decodeHTML(q.correct_answer),
          }));
        }

        setCurrentQuestions(quizQuestions);
        setLoading(false);

        if (voiceMode && quizQuestions.length > 0) {
          await voiceService.initialize();
          await readQuestion(quizQuestions[0]);
        }
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Erreur lors du chargement des questions');
        setLoading(false);
      }
    };

    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showResult || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, loading, currentIndex]);

  useEffect(() => {
    if (voiceMode && !showResult && !loading && !isListening && currentQuestions.length > 0) {
      const timer = setTimeout(() => {
        startVoiceRecognition();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, loading, currentIndex]);

  const decodeHTML = (html: string) => {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#039;/g, "'")
      .replace(/&mdash;/g, '—');
  };

  const readQuestion = async (question: Question) => {
    try {
      const text = `${question.question}. Les réponses sont: ${question.choices.join(', ')}`;
      await voiceService.speak(text);
    } catch (err) {
      console.error('Error reading question:', err);
    }
  };

  const startVoiceRecognition = async () => {
    if (!voiceMode || isListening) return;

    setIsListening(true);
    try {
      const result = await voiceService.startListening();
      const current = currentQuestions[currentIndex];

      if (result && current) {
        const matched = voiceService.matchVoiceToChoice(result, current.choices);
        if (matched) {
          handleAnswerSelect(matched);
        }
      }
    } catch (err) {
      console.error('Error during voice recognition:', err);
    } finally {
      setIsListening(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;

    const current = currentQuestions[currentIndex];
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === current.answer) {
      setScore(score + 1);
      animateCorrect();
    } else {
      animateWrong();
    }
  };

  const animateCorrect = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateWrong = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTimeout = () => {
    setSelectedAnswer(null);
    setShowResult(true);
  };

  const handleNext = async () => {
    setTimeLeft(15);

    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      scaleAnim.setValue(1);

      if (voiceMode) {
        await readQuestion(currentQuestions[currentIndex + 1]);
      }
    } else {
      navigation.navigate('Result', {
        score,
        total: currentQuestions.length,
        category: mode.category || 'Thème IA',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={ACCENT_PURPLE} />
        <Text style={styles.loadingText}>Chargement des questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = currentQuestions[currentIndex];
  if (!current) {
    return null;
  }

  const progress = ((currentIndex + 1) / currentQuestions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.progressText}>
            Question {currentIndex + 1}/{currentQuestions.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={styles.scoreTimeContainer}>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={[styles.timer, timeLeft < 5 && styles.timerWarning]}>
            ⏱️ {timeLeft}s
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text style={styles.question}>{current.question}</Text>

      {/* Voice Indicator */}
      {voiceMode && (
        <View
          style={[
            styles.voiceIndicator,
            isListening && styles.voiceIndicatorActive,
          ]}
        >
          <Text style={styles.voiceIndicatorText}>
            {isListening ? '🎤 En écoute...' : '🎤 Mode vocal activé'}
          </Text>
        </View>
      )}

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {current.choices.map((choice, index) => {
          const isSelected = selectedAnswer === choice;
          const isCorrect = choice === current.answer;
          const isWrong = isSelected && choice !== current.answer;

          let backgroundColor = CARD_BG;
          let borderColor = 'transparent';

          if (showResult) {
            if (isCorrect) {
              backgroundColor = 'rgba(16, 185, 129, 0.2)';
              borderColor = SUCCESS_COLOR;
            } else if (isWrong) {
              backgroundColor = 'rgba(239, 68, 68, 0.2)';
              borderColor = ERROR_COLOR;
            }
          } else if (isSelected) {
            backgroundColor = 'rgba(124, 58, 237, 0.2)';
            borderColor = ACCENT_PURPLE;
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.choiceButton,
                {
                  backgroundColor,
                  borderColor,
                },
              ]}
              onPress={() => !showResult && handleAnswerSelect(choice)}
              disabled={showResult}
            >
              <View style={styles.choiceLetter}>
                <Text style={styles.choiceLetterText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={styles.choiceText}>{choice}</Text>
              {showResult && isCorrect && <Text style={styles.correctIcon}>✓</Text>}
              {showResult && isWrong && <Text style={styles.wrongIcon}>✗</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next Button */}
      {showResult && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex + 1 === currentQuestions.length
              ? 'Voir les résultats'
              : 'Suivant'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: DARK_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  progressText: {
    color: TEXT_COLOR,
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: CARD_BG,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT_PURPLE,
  },
  scoreTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  score: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  timer: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  timerWarning: {
    color: ERROR_COLOR,
  },
  question: {
    color: ACCENT_PURPLE,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    lineHeight: 26,
  },
  voiceIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_PURPLE,
    marginBottom: 16,
  },
  voiceIndicatorActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeftColor: SUCCESS_COLOR,
  },
  voiceIndicatorText: {
    color: TEXT_COLOR,
    fontSize: 12,
    fontWeight: '500',
  },
  choicesContainer: {
    gap: 12,
    marginBottom: 20,
    flex: 1,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACCENT_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  choiceLetterText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  choiceText: {
    flex: 1,
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: '500',
  },
  correctIcon: {
    color: SUCCESS_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  wrongIcon: {
    color: ERROR_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingText: {
    color: TEXT_COLOR,
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
