import type {ViewProps} from 'react-native';
import {View} from 'react-native';

import {useColors} from '@/ui/theme';

interface Props extends ViewProps {
  surface?: boolean;
  secondary?: boolean;
}

export function ThemedView({style, surface, secondary, ...props}: Props) {
  const colors = useColors();
  const bg = surface
    ? colors.surface
    : secondary
      ? colors.surfaceSecondary
      : 'transparent';

  return <View style={[{backgroundColor: bg}, style]} {...props} />;
}
