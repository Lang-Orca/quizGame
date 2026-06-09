import React, {useState} from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import {WS_PORT} from '@/constants';
import {pickLanAddress, parseHostAddress} from '@/utils/network';
import {useLanClient} from '@/ui/lan/LanClientContext';
import {ThemedText} from '@/ui/components/ThemedText';
import {ThemedView} from '@/ui/components/ThemedView';
import {useColors} from '@/ui/theme';

export function ScanLanScreen() {
  const colors = useColors();
  const {state, salons, startScan, connect} = useLanClient();
  const [pseudo, setPseudo] = useState('');
  const [ip, setIp] = useState('');
  const [ipError, setIpError] = useState<string | null>(null);

  const pseudoPret = pseudo.trim().length > 0;

  const rejoindreIp = () => {
    const parsed = parseHostAddress(ip, WS_PORT);
    if (!parsed) {
      setIpError('Adresse IP invalide (ex : 192.168.1.42).');
      return;
    }
    setIpError(null);
    connect(parsed.host, parsed.port, pseudo.trim());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText size="xxl" bold>
        Rejoindre un salon LAN
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

      <ThemedView style={styles.actions}>
        <Button title="Scanner le réseau" onPress={startScan} />
      </ThemedView>

      <ThemedText semibold size="base" secondary style={styles.section}>
        Salons détectés
      </ThemedText>
      {salons.length === 0 ? (
        <ThemedText tertiary>
          Aucun salon détecté. Assurez-vous d'être sur le même WiFi, ou
          utilisez la saisie IP ci-dessous.
        </ThemedText>
      ) : (
        salons.map(salon => (
          <Pressable
            key={salon.name}
            disabled={!pseudoPret}
            style={({pressed}) => [
              styles.salon,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                opacity: !pseudoPret ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
            onPress={() =>
              connect(
                pickLanAddress(salon.addresses) ?? salon.host,
                salon.port,
                pseudo.trim(),
              )
            }>
            <ThemedText semibold>{salon.nom ?? salon.name}</ThemedText>
            {salon.code ? (
              <ThemedText size="xs" tertiary>
                Code : {salon.code}
              </ThemedText>
            ) : null}
          </Pressable>
        ))
      )}

      <ThemedText semibold size="base" secondary style={styles.section}>
        Saisie manuelle (fallback)
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.card},
        ]}
        value={ip}
        onChangeText={setIp}
        placeholder="192.168.1.42"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      {ipError ? <ThemedText error>{ipError}</ThemedText> : null}
      <Button
        title="Rejoindre par IP"
        onPress={rejoindreIp}
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
  section: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  actions: {
    marginVertical: 4,
  },
  salon: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
});
