import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import BootSplash from 'react-native-bootsplash';

import {initDatabase} from '@/data/sqlite/database';
import {storage} from '@/data/mmkv/storage';
import {RootNavigator} from '@/ui/navigation/RootNavigator';
import {ThemedView} from '@/ui/components/ThemedView';
import {ThemedText} from '@/ui/components/ThemedText';
import {ToastProvider} from '@/ui/components/ToastProvider';
import {lightPaperTheme, darkPaperTheme} from '@/ui/theme/paperTheme';

function App() {
  const isDark = useColorScheme() === 'dark';
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        await initDatabase();
        storage.pingInit();
        setReady(true);
      } catch (e) {
        console.error('App bootstrap error:', e);
        setError(e instanceof Error ? e.message : 'Erreur initialisation');
      }
    }

    bootstrap();
  }, []);

  const onReady = useCallback(async () => {
    if (ready && !error) {
      try {
        await BootSplash.hide({fade: true});
      } catch {
        // BootSplash native module may not be linked yet
      }
    }
  }, [ready, error]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  const theme = isDark ? darkPaperTheme : lightPaperTheme;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <ThemedView surface style={{flex: 1}}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <ToastProvider>
            {!ready ? (
              <ThemedView
                surface
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </ThemedView>
            ) : error ? (
              <ThemedView
                surface
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 24,
                }}>
                <ThemedText error>{error}</ThemedText>
              </ThemedView>
            ) : (
              <RootNavigator />
            )}
          </ToastProvider>
        </ThemedView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default App;
