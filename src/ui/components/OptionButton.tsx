import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {ThemedText} from '@/ui/components/ThemedText';
import {useColors} from '@/ui/theme';

interface Props {
  label: string;
  letter: string;
  selected?: boolean;
  correct?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function OptionButton({
  label,
  letter,
  selected,
  correct,
  disabled,
  onPress,
}: Props) {
  const colors = useColors();

  const bg = correct
    ? colors.successLight
    : selected
      ? colors.primaryLight
      : colors.card;

  const border = correct
    ? colors.success
    : selected
      ? colors.primary
      : colors.inputBorder;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {backgroundColor: bg, borderColor: border},
        disabled && !correct && !selected && styles.disabled,
      ]}>
      <ThemedText bold size="lg" style={styles.letter}>
        {letter}
      </ThemedText>
      <ThemedText size="lg" style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  letter: {
    width: 24,
    textAlign: 'center',
  },
  label: {
    flexShrink: 1,
  },
});
