import React from 'react';
import {Button, StyleSheet} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceholderOffline'>;

export function PlaceholderOfflineScreen({navigation}: Props) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText size="xxl" bold>
        Mode Offline (LAN)
      </ThemedText>
      <ThemedText size="base" secondary>
        Hébergez un salon sur votre WiFi local, ou rejoignez un salon proche.
      </ThemedText>
      <ThemedView style={styles.buttons}>
        <Button
          title="Héberger un salon LAN"
          onPress={() => navigation.navigate('CreateLan')}
        />
        <Button
          title="Rejoindre un salon LAN"
          onPress={() => navigation.navigate('JoinLan')}
        />
        <Button
          title="Partie locale (debug)"
          onPress={() => navigation.navigate('HostGame')}
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
