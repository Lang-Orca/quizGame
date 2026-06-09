import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {initDatabase} from '@/data/sqlite/database';
import {storage} from '@/data/mmkv/storage';
import {RootNavigator} from '@/ui/navigation/RootNavigator';
import {DebugConsole} from '@/ui/components/DebugConsole';
import voiceService from '@/services/voiceService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        await initDatabase();
        storage.pingInit();
        await voiceService.initialize();
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur initialisation');
      }
    }

    bootstrap();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.loading} />
      ) : (
        <>
          <RootNavigator />
          <DebugConsole />
        </>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
