import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceholderOnline'>;

export function PlaceholderOnlineScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mode Online</Text>
      <Text style={styles.text}>
        Créez une partie partagée par code, ou rejoignez une partie existante
        depuis n'importe quel réseau.
      </Text>
      <View style={styles.buttons}>
        <Button
          title="Créer une partie online"
          onPress={() => navigation.navigate('CreateOnline')}
        />
        <Button
          title="Rejoindre par code"
          onPress={() => navigation.navigate('JoinOnline')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttons: {
    marginTop: 24,
    gap: 12,
  },
});
