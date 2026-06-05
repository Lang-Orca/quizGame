import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceholderOffline'>;

export function PlaceholderOfflineScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mode Offline (LAN)</Text>
      <Text style={styles.text}>
        Hébergez un salon sur votre WiFi local, ou rejoignez un salon proche.
      </Text>
      <View style={styles.buttons}>
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
