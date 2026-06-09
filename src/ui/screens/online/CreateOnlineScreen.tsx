import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {HostGameProvider} from '@/ui/host/HostGameContext';
import {HostGameFlow} from '@/ui/host/HostGameFlow';
import type {RootStackParamList} from '@/ui/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOnline'>;

export function CreateOnlineScreen({navigation}: Props) {
  return (
    <HostGameProvider transport="firebase" sessionName="Partie online">
      <View style={styles.container}>
        <HostGameFlow onQuit={() => navigation.popToTop()} />
      </View>
    </HostGameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
