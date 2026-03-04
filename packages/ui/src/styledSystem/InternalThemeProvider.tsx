// eslint-disable-next-line no-restricted-imports
import { ThemeProvider } from '@emotion/react';
import React from 'react';

import { useAppearance } from '../customizables';
import type { InternalTheme } from './types';

type InternalThemeProviderProps = React.PropsWithChildren<{
  theme?: InternalTheme;
}>;

export const InternalThemeProvider = (props: InternalThemeProviderProps) => {
  const { parsedInternalTheme, rawMode } = useAppearance();
  const theme = React.useMemo(
    () => (rawMode ? { ...parsedInternalTheme, __rawMode: true } : parsedInternalTheme),
    [parsedInternalTheme, rawMode],
  );

  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};
