import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {HostGameProvider} from '@/ui/host/HostGameContext';
import {HostGameFlow} from '@/ui/host/HostGameFlow';
import {ThemedView} from '@/ui/components/ThemedView';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateLan'>;

export function CreateLanScreen({navigation}: Props) {
  return (
    <HostGameProvider transport="lan" sessionName="Salon LAN">
      <ThemedView style={{flex: 1}}>
        <HostGameFlow onQuit={() => navigation.popToTop()} />
      </ThemedView>
    </HostGameProvider>
  );
}
