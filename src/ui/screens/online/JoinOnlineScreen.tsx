import React, {useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import {isValidCode6} from '@/domain/code';
import {useClient} from '@/ui/client/ClientContext';
import {ThemedText} from '@/ui/components/ThemedText';
import {useColors} from '@/ui/theme';

export function JoinOnlineScreen() {
  const colors = useColors();
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
      <ThemedText size="xxl" bold>
        Rejoindre une partie online
      </ThemedText>

      <ThemedText size="sm" semibold secondary>
        Votre pseudo
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.card},
        ]}
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="Ex : Marco"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <ThemedText size="sm" semibold secondary>
        Code de la partie
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          styles.code,
          {borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.card},
        ]}
        value={code}
        onChangeText={setCode}
        placeholder="4F7K2P"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />

      {localError ? <ThemedText error>{localError}</ThemedText> : null}

      <Button
        title="Rejoindre"
        onPress={rejoindre}
        disabled={!pseudoPret}
      />

      {!pseudoPret ? (
        <ThemedText tertiary>Saisissez un pseudo pour rejoindre.</ThemedText>
      ) : null}
      {state.error ? <ThemedText error>{state.error}</ThemedText> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  input: {
    borderWidth: 1,
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
});
