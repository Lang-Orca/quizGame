import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/QuizScreen';
import AIGeneratorScreen from '../screens/AIGeneratorScreen';
import ResultScreen from '../screens/ResultScreen';

const Stack = createNativeStackNavigator();

const DARK_BG = '#1a1a2e';
const ACCENT_PURPLE = '#7c3aed';
const TEXT_COLOR = '#e0e0e0';

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: DARK_BG,
          },
          headerTintColor: ACCENT_PURPLE,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: TEXT_COLOR,
          },
          headerBackTitleVisible: false,
          cardStyle: {
            backgroundColor: DARK_BG,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Quiz Master',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{
            title: 'Quiz',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AIGenerator"
          component={AIGeneratorScreen}
          options={{
            title: 'Générateur IA',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            title: 'Résultats',
            headerShown: true,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
