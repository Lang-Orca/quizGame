import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {HostGameProvider} from '@/ui/host/HostGameContext';
import {HostGameFlow} from '@/ui/host/HostGameFlow';
import {ThemedView} from '@/ui/components/ThemedView';
import type {RootStackParamList} from '@/ui/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOnline'>;

export function CreateOnlineScreen({navigation}: Props) {
  return (
    <HostGameProvider transport="firebase" sessionName="Partie online">
      <ThemedView style={{flex: 1}}>
        <HostGameFlow onQuit={() => navigation.popToTop()} />
      </ThemedView>
    </HostGameProvider>
  );
}
