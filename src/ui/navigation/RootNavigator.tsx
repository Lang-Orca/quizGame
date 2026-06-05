import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {HomeScreen} from '@/ui/screens/HomeScreen';
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
