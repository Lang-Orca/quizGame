import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        selected && styles.selected,
        correct && styles.correct,
        disabled && !correct && !selected && styles.disabled,
      ]}>
      <Text style={styles.letter}>{letter}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  selected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  correct: {
    borderColor: '#16a34a',
    backgroundColor: '#dcfce7',
  },
  disabled: {
    opacity: 0.6,
  },
  letter: {
    fontSize: 18,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
    color: '#1e293b',
  },
  label: {
    fontSize: 16,
    flexShrink: 1,
    color: '#1e293b',
  },
});
