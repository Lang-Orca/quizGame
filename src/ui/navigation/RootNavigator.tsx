import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {HostGameScreen} from '@/ui/host/HostGameScreen';
import {LanClientScreen} from '@/ui/lan/LanClientScreen';
import {HomeScreen} from '@/ui/screens/HomeScreen';
import {CreateLanScreen} from '@/ui/screens/lan/CreateLanScreen';
import {PlaceholderOfflineScreen} from '@/ui/screens/PlaceholderOfflineScreen';
import {PlaceholderOnlineScreen} from '@/ui/screens/PlaceholderOnlineScreen';

import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'QuizGame'}}
        />
        <Stack.Screen
          name="PlaceholderOnline"
          component={PlaceholderOnlineScreen}
          options={{title: 'Online'}}
        />
        <Stack.Screen
          name="PlaceholderOffline"
          component={PlaceholderOfflineScreen}
          options={{title: 'Offline LAN'}}
        />
        <Stack.Screen
          name="HostGame"
          component={HostGameScreen}
          options={{title: 'Partie locale'}}
        />
        <Stack.Screen
          name="CreateLan"
          component={CreateLanScreen}
          options={{title: 'Héberger un salon LAN'}}
        />
        <Stack.Screen
          name="JoinLan"
          component={LanClientScreen}
          options={{title: 'Rejoindre un salon LAN'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
