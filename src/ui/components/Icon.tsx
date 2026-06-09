import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useColors} from '@/ui/theme';

interface Props {
  name: string;
  size?: number;
  color?: string;
  secondary?: boolean;
  tertiary?: boolean;
}

export function Icon({name, size = 24, color, secondary, tertiary}: Props) {
  const colors = useColors();
  const iconColor =
    color ?? (tertiary ? colors.textTertiary : secondary ? colors.textSecondary : colors.text);

  return <MaterialCommunityIcons name={name} size={size} color={iconColor} />;
}
