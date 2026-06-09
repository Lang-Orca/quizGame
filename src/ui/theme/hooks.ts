import {useColorScheme} from 'react-native';

import {lightColors, darkColors} from './colors';
import {spacing, borderRadius, fontSize, fontWeight, lineHeight} from './spacing';
import type {Theme, Colors} from './Theme';

function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    lineHeight,
    isDark,
  };
}

function useColors(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

export {useTheme, useColors};
