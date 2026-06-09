import React, {useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import {isValidCode6} from '@/domain/code';
import {useClient} from '@/ui/client/ClientContext';

export function JoinOnlineScreen() {
  const {state, connect} = useClient();
  const [pseudo, setPseudo] = useState('');
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const pseudoPret = pseudo.trim().length > 0;

  const rejoindre = () => {
    const codeNettoye = code.trim().toUpperCase();
    if (!isValidCode6(codeNettoye)) {
      setLocalError('Code invalide (6 caractères, ex : 4F7K2P).');
      return;
    }
    setLocalError(null);
    connect(codeNettoye, pseudo.trim());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rejoindre une partie online</Text>

      <Text style={styles.label}>Votre pseudo</Text>
      <TextInput
        style={styles.input}
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="Ex : Marco"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Code de la partie</Text>
      <TextInput
        style={[styles.input, styles.code]}
        value={code}
        onChangeText={setCode}
        placeholder="4F7K2P"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />

      {localError ? <Text style={styles.error}>{localError}</Text> : null}

      <Button
        title="Rejoindre"
        onPress={rejoindre}
        disabled={!pseudoPret}
      />

      {!pseudoPret ? (
        <Text style={styles.hint}>Saisissez un pseudo pour rejoindre.</Text>
      ) : null}
      {state.error ? <Text style={styles.error}>{state.error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  code: {
    fontSize: 22,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '700',
  },
  hint: {
    fontStyle: 'italic',
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
  },
});
