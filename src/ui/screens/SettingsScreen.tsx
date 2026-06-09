import React, {useEffect, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import {ApiKeyStore} from '@/services/ApiKeyStore';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {ThemedCard} from '@/ui/components/ThemedCard';
import {useColors} from '@/ui/theme';

const store = new ApiKeyStore();

export function SettingsScreen() {
  const colors = useColors();
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    store.hasKey().then(setHasKey);
  }, []);

  const enregistrer = async () => {
    if (apiKey.trim().length === 0) {
      setMessage('Saisissez une clé API valide.');
      return;
    }
    await store.save(apiKey.trim());
    setApiKey('');
    setHasKey(true);
    setMessage('Clé API enregistrée de façon sécurisée.');
  };

  const supprimer = async () => {
    await store.clear();
    setHasKey(false);
    setMessage('Clé API supprimée.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="xxl" bold>
        Paramètres
      </ThemedText>

      <ThemedCard style={styles.card}>
        <ThemedText bold size="base">
          Clé API Google Gemini
        </ThemedText>
        <ThemedText size="sm" tertiary>
          La clé est stockée dans le trousseau sécurisé de l'appareil
          (Keychain/Keystore) et sert à générer des questions depuis un PDF.
        </ThemedText>
        <ThemedText size="sm" semibold success={hasKey} warning={!hasKey}>
          {hasKey ? 'Une clé est configurée.' : 'Aucune clé configurée.'}
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            {borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.card},
          ]}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Collez votre clé API Gemini"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />

        <ThemedView style={styles.actions}>
          <Button title="Enregistrer la clé" onPress={enregistrer} />
          {hasKey ? (
            <Button title="Supprimer la clé" color={colors.error} onPress={supprimer} />
          ) : null}
        </ThemedView>

        {message ? <ThemedText secondary>{message}</ThemedText> : null}
      </ThemedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  card: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  actions: {
    gap: 10,
  },
});
