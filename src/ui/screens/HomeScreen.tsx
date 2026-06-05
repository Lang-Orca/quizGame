import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QuizGame</Text>
      <Text style={styles.subtitle}>Choisissez un mode de jeu</Text>
      <View style={styles.buttons}>
        <Button
          title="Mode Online"
          onPress={() => navigation.navigate('PlaceholderOnline')}
        />
        <Button
          title="Mode Offline (LAN)"
          onPress={() => navigation.navigate('PlaceholderOffline')}
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
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  buttons: {
    gap: 12,
  },
});
