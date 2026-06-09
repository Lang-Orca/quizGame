import React, {useEffect, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {ApiKeyStore} from '@/services/ApiKeyStore';

const store = new ApiKeyStore();

export function SettingsScreen() {
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
      <Text style={styles.title}>Paramètres</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Clé API Google Gemini</Text>
        <Text style={styles.help}>
          La clé est stockée dans le trousseau sécurisé de l'appareil
          (Keychain/Keystore) et sert à générer des questions depuis un PDF.
        </Text>
        <Text style={[styles.statut, hasKey ? styles.ok : styles.missing]}>
          {hasKey ? 'Une clé est configurée.' : 'Aucune clé configurée.'}
        </Text>

        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Collez votre clé API Gemini"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />

        <View style={styles.actions}>
          <Button title="Enregistrer la clé" onPress={enregistrer} />
          {hasKey ? (
            <Button title="Supprimer la clé" color="#dc2626" onPress={supprimer} />
          ) : null}
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
  },
  help: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  statut: {
    fontSize: 14,
    fontWeight: '600',
  },
  ok: {
    color: '#16a34a',
  },
  missing: {
    color: '#b45309',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
  },
  actions: {
    gap: 10,
  },
  message: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
  },
});
