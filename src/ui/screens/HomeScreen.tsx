import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QuizGame</Text>
      <Text style={styles.subtitle}>Choisissez un mode de jeu</Text>
      <View style={styles.buttons}>
        <Text style={styles.sectionTitle}>Mode Online</Text>
        <Button
          title="Créer une partie Online"
          onPress={() => navigation.navigate('CreateOnline')}
        />
        <Button
          title="Rejoindre une partie Online"
          onPress={() => navigation.navigate('JoinOnline')}
        />
        
        <Text style={styles.sectionTitle}>Mode Offline (LAN)</Text>
        <Button
          title="Héberger un salon LAN"
          onPress={() => navigation.navigate('CreateLan')}
        />
        <Button
          title="Rejoindre un salon LAN"
          onPress={() => navigation.navigate('JoinLan')}
        />
        <Button
          title="Partie locale (Debug)"
          onPress={() => navigation.navigate('HostGame')}
        />
        
        <Text style={styles.sectionTitle}>Autres Modes</Text>
        <Button
          title="Questionnaire depuis un PDF (IA)"
          onPress={() => navigation.navigate('PdfUpload')}
        />
        <Button
          title="Catalogue public"
          onPress={() => navigation.navigate('PublicList')}
        />
        <Button
          title="Historique"
          onPress={() => navigation.navigate('History')}
        />
        <Button
          title="Paramètres"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#334155',
  },
  buttons: {
    gap: 12,
  },
});
