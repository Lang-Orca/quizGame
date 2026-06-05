import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface Props {
  index: number;
  total: number;
  texte: string;
}

export function QuestionCard({index, total, texte}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.counter}>
        Question {index + 1} / {total}
      </Text>
      <Text style={styles.texte}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  counter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  texte: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 26,
  },
});
