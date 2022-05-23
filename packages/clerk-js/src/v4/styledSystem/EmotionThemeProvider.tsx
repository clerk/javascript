import { ThemeProvider, ThemeProviderProps } from '@emotion/react';

import { baseTheme } from '../foundations';

// TODO: make it customisable

export const EmotionThemeProvider = (props: Partial<ThemeProviderProps>) => {
  const { children, theme: userDefinedTheme } = props;
  return <ThemeProvider theme={userDefinedTheme || baseTheme}>{children}</ThemeProvider>;
};
