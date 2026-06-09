import type {TextProps, TextStyle} from 'react-native';
import {Text} from 'react-native';

import {useColors} from '@/ui/theme';

interface Props extends TextProps {
  secondary?: boolean;
  tertiary?: boolean;
  muted?: boolean;
  inverse?: boolean;
  primary?: boolean;
  success?: boolean;
  error?: boolean;
  warning?: boolean;
  bold?: boolean;
  semibold?: boolean;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'display';
  center?: boolean;
}

export function ThemedText({
  style,
  secondary,
  tertiary,
  muted,
  inverse,
  primary,
  success,
  error,
  warning,
  bold,
  semibold,
  size,
  center,
  ...props
}: Props) {
  const colors = useColors();

  const color = inverse
    ? colors.textInverse
    : primary
      ? colors.primary
      : success
        ? colors.success
        : error
          ? colors.error
          : warning
            ? colors.warning
            : tertiary
              ? colors.textTertiary
              : muted
                ? colors.textMuted
                : secondary
                  ? colors.textSecondary
                  : colors.text;

  const fontSizeMap: Record<string, number> = {
    xs: 13,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
  };

  const textStyle: TextStyle = {
    color,
    fontWeight: bold ? '700' : semibold ? '600' : '400',
    textAlign: center ? 'center' : undefined,
    fontSize: size ? fontSizeMap[size] : undefined,
  };

  return <Text style={[textStyle, style]} {...props} />;
}
