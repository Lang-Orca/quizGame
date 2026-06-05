import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';

import {HostGameProvider} from './HostGameContext';
import {HostGameFlow} from './HostGameFlow';

type Props = NativeStackScreenProps<RootStackParamList, 'HostGame'>;

export function HostGameScreen({navigation}: Props) {
  return (
    <HostGameProvider transport="memory" sessionName="Salon local">
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
