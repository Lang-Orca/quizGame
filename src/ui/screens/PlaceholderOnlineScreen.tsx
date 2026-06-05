import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceholderOnline'>;

export function PlaceholderOnlineScreen({}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mode Online</Text>
      <Text style={styles.text}>
        Création et rejoindre une partie — prévu au Sprint S7 (Firebase).
      </Text>
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
});
