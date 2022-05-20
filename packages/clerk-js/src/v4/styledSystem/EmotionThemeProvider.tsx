import { ThemeProvider, ThemeProviderProps } from '@emotion/react';

// TODO: make it customisable
import { baseTheme } from './theme';

export const EmotionThemeProvider = (props: Partial<ThemeProviderProps>) => {
  const { children, theme: userDefinedTheme } = props;
  return <ThemeProvider theme={userDefinedTheme || baseTheme}>{children}</ThemeProvider>;
};
