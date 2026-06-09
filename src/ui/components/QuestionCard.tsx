import React from 'react';
import {StyleSheet} from 'react-native';

import {ThemedCard} from '@/ui/components/ThemedCard';
import {ThemedText} from '@/ui/components/ThemedText';

interface Props {
  index: number;
  total: number;
  texte: string;
}

export function QuestionCard({index, total, texte}: Props) {
  return (
    <ThemedCard>
      <ThemedText tertiary semibold size="xs">
        Question {index + 1} / {total}
      </ThemedText>
      <ThemedText bold size="lg" style={styles.texte}>
        {texte}
      </ThemedText>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  texte: {
    lineHeight: 26,
  },
});
