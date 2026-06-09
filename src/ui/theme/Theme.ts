import type {lightColors} from './colors';
import type {spacing, borderRadius, fontSize, fontWeight, lineHeight} from './spacing';

export type Colors = typeof lightColors;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;

export interface Theme {
  colors: Colors;
  spacing: Spacing;
  borderRadius: BorderRadius;
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
  isDark: boolean;
}
