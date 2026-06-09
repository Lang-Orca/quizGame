import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {HostGameProvider} from '@/ui/host/HostGameContext';
import {HostGameFlow} from '@/ui/host/HostGameFlow';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateLan'>;

export function CreateLanScreen({navigation}: Props) {
  return (
    <HostGameProvider transport="lan" sessionName="Salon LAN">
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
