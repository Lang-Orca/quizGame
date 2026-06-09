import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from 'react-native-paper';

import {HostGameScreen} from '@/ui/host/HostGameScreen';
import {LanClientScreen} from '@/ui/lan/LanClientScreen';
import {OnlineClientScreen} from '@/ui/online/OnlineClientScreen';
import {HomeScreen} from '@/ui/screens/HomeScreen';
import {HistoryScreen} from '@/ui/screens/catalog/HistoryScreen';
import {PublicListScreen} from '@/ui/screens/catalog/PublicListScreen';
import {CreateLanScreen} from '@/ui/screens/lan/CreateLanScreen';
import {CreateOnlineScreen} from '@/ui/screens/online/CreateOnlineScreen';
import {PdfUploadScreen} from '@/ui/screens/host/PdfUploadScreen';
import {PlaceholderOfflineScreen} from '@/ui/screens/PlaceholderOfflineScreen';
import {PlaceholderOnlineScreen} from '@/ui/screens/PlaceholderOnlineScreen';
import {SettingsScreen} from '@/ui/screens/SettingsScreen';

import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator id="root"
        screenOptions={{
          contentStyle: {backgroundColor: theme.colors.background},
        }}>
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
        <Stack.Screen
          name="CreateOnline"
          component={CreateOnlineScreen}
          options={{title: 'Créer une partie online'}}
        />
        <Stack.Screen
          name="JoinOnline"
          component={OnlineClientScreen}
          options={{title: 'Rejoindre par code'}}
        />
        <Stack.Screen
          name="PdfUpload"
          component={PdfUploadScreen}
          options={{title: 'Questionnaire depuis un PDF'}}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: 'Paramètres'}}
        />
        <Stack.Screen
          name="PublicList"
          component={PublicListScreen}
          options={{title: 'Catalogue public'}}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{title: 'Historique'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
