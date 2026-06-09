import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '@/ui/navigation/types';
import {ThemedView} from '@/ui/components/ThemedView';
import {ThemedText} from '@/ui/components/ThemedText';
import {Icon} from '@/ui/components/Icon';
import {useColors, spacing, borderRadius} from '@/ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MENU_ITEMS = [
  {key: 'PlaceholderOnline', label: 'Mode Online', icon: 'wifi'},
  {key: 'PlaceholderOffline', label: 'Mode Offline (LAN)', icon: 'access-point'},
  {key: 'PdfUpload', label: 'Questionnaire depuis un PDF (IA)', icon: 'file-pdf-box'},
  {key: 'PublicList', label: 'Catalogue public', icon: 'book-open-variant'},
  {key: 'History', label: 'Historique', icon: 'trophy'},
  {key: 'Settings', label: 'Paramètres', icon: 'cog'},
];

export function HomeScreen({navigation}: Props) {
  const colors = useColors();

  return (
    <ThemedView style={styles.container}>
      <ThemedText size="display" bold center>
        QuizGame
      </ThemedText>
      <ThemedText secondary center size="lg" style={styles.subtitle}>
        Choisissez un mode de jeu
      </ThemedText>
      <ThemedView style={styles.buttons}>
        {MENU_ITEMS.map(item => (
          <Pressable
            key={item.key}
            style={({pressed}) => [
              styles.menuButton,
              {backgroundColor: colors.surface, borderColor: colors.cardBorder},
              pressed && {opacity: 0.8},
            ]}
            onPress={() => navigation.navigate(item.key as any)}>
            <Icon name={item.icon} size={28} />
            <ThemedText size="lg" semibold>
              {item.label}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  buttons: {
    gap: spacing.md,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
});
