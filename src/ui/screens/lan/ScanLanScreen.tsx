import React, {useState} from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {WS_PORT} from '@/constants';
import {pickLanAddress, parseHostAddress} from '@/utils/network';
import {useLanClient} from '@/ui/lan/LanClientContext';

export function ScanLanScreen() {
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
      <Text style={styles.title}>Rejoindre un salon LAN</Text>

      <Text style={styles.label}>Votre pseudo</Text>
      <TextInput
        style={styles.input}
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="Ex : Marco"
        autoCapitalize="words"
      />

      <View style={styles.actions}>
        <Button title="Scanner le réseau" onPress={startScan} />
      </View>

      <Text style={styles.section}>Salons détectés</Text>
      {salons.length === 0 ? (
        <Text style={styles.hint}>
          Aucun salon détecté. Assurez-vous d'être sur le même WiFi, ou
          utilisez la saisie IP ci-dessous.
        </Text>
      ) : (
        salons.map(salon => (
          <Pressable
            key={salon.name}
            disabled={!pseudoPret}
            style={[styles.salon, !pseudoPret && styles.salonDisabled]}
            onPress={() =>
              connect(
                pickLanAddress(salon.addresses) ?? salon.host,
                salon.port,
                pseudo.trim(),
              )
            }>
            <Text style={styles.salonNom}>{salon.nom ?? salon.name}</Text>
            {salon.code ? (
              <Text style={styles.salonCode}>Code : {salon.code}</Text>
            ) : null}
          </Pressable>
        ))
      )}

      <Text style={styles.section}>Saisie manuelle (fallback)</Text>
      <TextInput
        style={styles.input}
        value={ip}
        onChangeText={setIp}
        placeholder="192.168.1.42"
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      {ipError ? <Text style={styles.error}>{ipError}</Text> : null}
      <Button
        title="Rejoindre par IP"
        onPress={rejoindreIp}
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
  section: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  actions: {
    marginVertical: 4,
  },
  salon: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
  },
  salonDisabled: {
    opacity: 0.5,
  },
  salonNom: {
    fontSize: 16,
    fontWeight: '600',
  },
  salonCode: {
    fontSize: 13,
    color: '#64748b',
  },
  hint: {
    fontStyle: 'italic',
    color: '#64748b',
  },
  error: {
    color: '#dc2626',
  },
});
