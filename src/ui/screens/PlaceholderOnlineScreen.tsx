import React from 'react';
import {Button, StyleSheet} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceholderOnline'>;

export function PlaceholderOnlineScreen({navigation}: Props) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText size="xxl" bold>
        Mode Online
      </ThemedText>
      <ThemedText size="base" secondary>
        Créez une partie partagée par code, ou rejoignez une partie existante
        depuis n'importe quel réseau.
      </ThemedText>
      <ThemedView style={styles.buttons}>
        <Button
          title="Créer une partie online"
          onPress={() => navigation.navigate('CreateOnline')}
        />
        <Button
          title="Rejoindre par code"
          onPress={() => navigation.navigate('JoinOnline')}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  buttons: {
    marginTop: 24,
    gap: 12,
  },
});
