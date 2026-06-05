import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizMode } from '../types';

const CATEGORIES = ['Culture générale', 'Science', 'Sport', 'Histoire'];
const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
const CARD_BG = '#16213e';
const TEXT_COLOR = '#e0e0e0';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedMode, setSelectedMode] = useState<'offline' | 'online' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);

  const handlePlay = async () => {
    if (!selectedMode || !selectedCategory) {
        // Veuillez sélectionner un mode et une catégorie
    }

    const quizData: QuizMode = {
      type: selectedMode,
      category: selectedCategory,
    };

    try {
      await AsyncStorage.setItem('quizMode', JSON.stringify(quizData));
      await AsyncStorage.setItem('voiceMode', JSON.stringify(voiceMode));
      navigation.navigate('Quiz', { mode: quizData, voiceMode });
    } catch (error) {
      console.error('Error saving quiz mode:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>🎯 Quiz Master</Text>

      {/* Mode Selection */}
      <Text style={styles.sectionTitle}>Choisir le mode:</Text>
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'offline' && styles.modeButtonActive,
          ]}
          onPress={() => setSelectedMode('offline')}
        >
          <Text style={styles.modeButtonText}>📱 Offline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'online' && styles.modeButtonActive,
          ]}
          onPress={() => setSelectedMode('online')}
        >
          <Text style={styles.modeButtonText}>🌐 Online</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'ai' && styles.modeButtonActive,
          ]}
          onPress={() => setSelectedMode('ai')}
        >
          <Text style={styles.modeButtonText}>🤖 IA</Text>
        </TouchableOpacity>
      </View>

      {/* Category Selection - shown for offline/online */}
      {selectedMode !== 'ai' && (
        <>
          <Text style={styles.sectionTitle}>Choisir une catégorie:</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryButtonText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* AI Theme Input - shown for AI mode */}
      {selectedMode === 'ai' && (
        <>
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory('ai-theme');
              navigation.navigate('AIGenerator', { voiceMode });
            }}
            style={styles.aiButton}
          >
            <Text style={styles.aiButtonText}>Générer des questions avec l'IA</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Voice Mode Toggle */}
      <View style={styles.voiceModeContainer}>
        <Text style={styles.voiceModeLabel}>🎤 Mode Vocal</Text>
        <Switch
          value={voiceMode}
          onValueChange={setVoiceMode}
          trackColor={{ false: '#767577', true: ACCENT_PURPLE }}
          thumbColor={voiceMode ? ACCENT_PURPLE : '#f4f3f4'}
        />
      </View>

      {/* Play Button */}
      <TouchableOpacity
        style={[
          styles.playButton,
          (!selectedMode || (!selectedCategory && selectedMode !== 'ai')) &&
            styles.playButtonDisabled,
        ]}
        onPress={handlePlay}
        disabled={!selectedMode || (!selectedCategory && selectedMode !== 'ai')}
      >
        <Text style={styles.playButtonText}>🚀 Jouer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ACCENT_PURPLE,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 12,
    marginTop: 20,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: ACCENT_PURPLE,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  modeButtonText: {
    color: TEXT_COLOR,
    fontWeight: '600',
    fontSize: 14,
  },
  categoryContainer: {
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: ACCENT_PURPLE,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  categoryButtonText: {
    color: TEXT_COLOR,
    fontWeight: '500',
    fontSize: 16,
  },
  aiButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  aiButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  voiceModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 8,
    marginBottom: 30,
  },
  voiceModeLabel: {
    color: TEXT_COLOR,
    fontWeight: '500',
    fontSize: 16,
  },
  playButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
