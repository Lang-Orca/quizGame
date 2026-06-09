import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
const CARD_BG = '#16213e';
const TEXT_COLOR = '#e0e0e0';
const SUCCESS_COLOR = '#10b981';

interface ResultScreenProps {
  navigation: any;
  route: any;
}

export default function ResultScreen({ navigation, route }: ResultScreenProps) {
  const { score, total, category } = route.params as {
    score: number;
    total: number;
    category: string;
  };

  const percentage = Math.round((score / total) * 100);

  const getMention = () => {
    if (percentage >= 80) return '🌟 Excellent!';
    if (percentage >= 60) return '👍 Bien!';
    return '📚 À améliorer';
  };

  const getMessage = () => {
    if (percentage >= 80) {
      return 'Vous êtes un expert! Continuez comme ça!';
    } else if (percentage >= 60) {
      return 'Bon travail! Vous progressez bien.';
    } else {
      return 'Bonne tentative. Réessayez pour améliorer votre score.';
    }
  };

  const handleReplay = async () => {
    navigation.navigate('Home');
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.scoreCard}>
        <Text style={styles.mention}>{getMention()}</Text>
        <Text style={styles.scoreText}>
          {score}/{total}
        </Text>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.message}>{getMessage()}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Catégorie</Text>
          <Text style={styles.statValue}>{category}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bonnes réponses</Text>
          <Text style={[styles.statValue, { color: SUCCESS_COLOR }]}>
            {score}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mauvaises réponses</Text>
          <Text style={[styles.statValue, styles.errorColor]}>
            {total - score}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.replayButton} onPress={handleReplay}>
          <Text style={styles.replayButtonText}>🔄 Rejouer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
          <Text style={styles.homeButtonText}>🏠 Accueil</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  scoreCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: ACCENT_PURPLE,
  },
  mention: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ACCENT_PURPLE,
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '600',
    color: ACCENT_PURPLE,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: TEXT_COLOR,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  statItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statValue: {
    color: TEXT_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorColor: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  buttonContainer: {
    gap: 12,
  },
  replayButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: ACCENT_PURPLE,
    borderRadius: 8,
    alignItems: 'center',
  },
  replayButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  homeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCENT_PURPLE,
  },
  homeButtonText: {
    color: ACCENT_PURPLE,
    fontWeight: '700',
    fontSize: 16,
  },
});
