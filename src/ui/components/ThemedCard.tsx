import type {ViewProps} from 'react-native';
import {View} from 'react-native';

import {useColors} from '@/ui/theme';

interface Props extends ViewProps {
  noPadding?: boolean;
}

export function ThemedCard({style, noPadding, ...props}: Props) {
  const colors = useColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: noPadding ? 0 : 16,
          gap: 8,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
      {...props}
    />
  );
}
