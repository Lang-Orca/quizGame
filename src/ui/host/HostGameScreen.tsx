import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {ThemedView} from '@/ui/components/ThemedView';

import {HostGameProvider} from './HostGameContext';
import {HostGameFlow} from './HostGameFlow';

type Props = NativeStackScreenProps<RootStackParamList, 'HostGame'>;

export function HostGameScreen({navigation}: Props) {
  return (
    <HostGameProvider transport="memory" sessionName="Salon local">
      <ThemedView style={{flex: 1}}>
        <HostGameFlow onQuit={() => navigation.popToTop()} />
      </ThemedView>
    </HostGameProvider>
  );
}
