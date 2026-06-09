import type {MD3Theme} from 'react-native-paper';
import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

import {lightColors, darkColors} from './colors';

function buildPaperTheme(isDark: boolean): MD3Theme {
  const c = isDark ? darkColors : lightColors;
  const base = isDark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      onPrimary: c.textInverse,
      primaryContainer: c.primaryLight,
      onPrimaryContainer: c.primary,
      secondary: c.textSecondary,
      onSecondary: c.textInverse,
      secondaryContainer: c.surfaceSecondary,
      onSecondaryContainer: c.textSecondary,
      tertiary: c.textTertiary,
      surface: c.surface,
      onSurface: c.text,
      surfaceVariant: c.surfaceSecondary,
      onSurfaceVariant: c.textSecondary,
      background: c.background,
      onBackground: c.text,
      error: c.error,
      onError: c.textInverse,
      errorContainer: c.errorLight,
      onErrorContainer: c.error,
      outline: c.cardBorder,
      outlineVariant: c.inputBorder,
      elevation: {
        ...base.colors.elevation,
        level0: c.surface,
        level1: c.surface,
        level2: c.surfaceSecondary,
        level3: c.surfaceSecondary,
        level4: c.surfaceSecondary,
        level5: c.surfaceSecondary,
      },
      inverseSurface: c.text,
      inverseOnSurface: c.textInverse,
      inversePrimary: c.primaryLight,
      shadow: c.overlay,
      scrim: c.overlay,
      backdrop: c.overlay,
    },
    roundness: 12,
    animation: {
      scale: 1,
    },
  };
}

export const lightPaperTheme = buildPaperTheme(false);
export const darkPaperTheme = buildPaperTheme(true);
