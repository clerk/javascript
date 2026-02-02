// eslint-disable-next-line no-restricted-imports
import type { Interpolation, Theme } from '@emotion/react';

import { type MosaicTheme } from './theme';

type ButtonStyleOptions = {
  /**
   * @default primary
   */
  variant?: 'primary';
  /**
   * @default false
   */
  fullWidth?: boolean;
};

// Returns a function that Emotion calls with theme from context
// When used within MosaicThemeProvider, theme will be MosaicTheme at runtime
//
// Type note: Emotion's Theme type (InternalTheme) is incompatible with MosaicTheme,
// but at runtime within MosaicThemeProvider, the theme is guaranteed to be MosaicTheme.
// We use a type assertion to bridge this gap, which is safe because MosaicThemeProvider
// ensures the correct theme type at runtime.
export function buttonStyles(options: ButtonStyleOptions = {}): Interpolation<Theme> {
  const { variant = 'primary', fullWidth = false } = options;

  const styleFunction = (theme: MosaicTheme) => {
    return {
      boxSizing: 'border-box',
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[1],
      width: fullWidth ? '100%' : 'auto',
      height: theme.spacing[7],
      borderRadius: theme.spacing[1.5],
      fontSize: theme.typography.label[3].fontSize,
      fontWeight: theme.fontWeights.medium,
      fontFamily: theme.fontFamilies.sans,
      border: 'none',
      outline: 'none',
      margin: 0,
      paddingBlock: 0,
      paddingInline: theme.spacing[3],
      cursor: 'pointer',
      textDecoration: 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, ${theme.alpha(theme.colors.white, 16)} 46%, ${theme.alpha(theme.colors.white, 0)} 54%)`,
        mixBlendMode: 'overlay',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      },

      '&:focus-visible': {
        outline: `2px solid ${theme.colors.purple[700]}`,
        outlineOffset: '2px',
      },

      ...(variant === 'primary' && {
        background: theme.colors.purple[700],
        color: theme.colors.white,
        boxShadow: `${theme.colors.white} 0px 0px 0px 0px, ${theme.colors.purple[700]} 0px 0px 0px 1px, ${theme.alpha(theme.colors.white, 7)} 0px 1px 0px 0px inset, ${theme.alpha(theme.colors.gray[1300], 20)} 0px 1px 3px 0px`,
      }),
    };
  };

  // Type assertion: safe because MosaicThemeProvider ensures theme is MosaicTheme at runtime
  return styleFunction as unknown as Interpolation<Theme>;
}
