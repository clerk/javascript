import type { ColorSchemeName } from 'react-native';

export type UpdateRequiredColors = {
  background: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  border: string;
  versionBoxBackground: string;
};

const LIGHT: UpdateRequiredColors = {
  background: '#FFFFFF',
  foreground: '#212126',
  mutedForeground: '#747686',
  primary: '#2F3037',
  primaryForeground: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.06)',
  versionBoxBackground: 'rgba(0, 0, 0, 0.02)',
};

const DARK: UpdateRequiredColors = {
  background: '#131316',
  foreground: '#FFFFFF',
  mutedForeground: '#B7B8C2',
  primary: '#FAFAFB',
  primaryForeground: '#000000',
  border: 'rgba(255, 255, 255, 0.08)',
  versionBoxBackground: 'rgba(255, 255, 255, 0.03)',
};

export function updateRequiredColors(colorScheme: ColorSchemeName): UpdateRequiredColors {
  return colorScheme === 'dark' ? DARK : LIGHT;
}
