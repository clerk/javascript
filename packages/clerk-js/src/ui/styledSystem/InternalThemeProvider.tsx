// eslint-disable-next-line no-restricted-imports
import { ThemeProvider } from '@emotion/react';
import React from 'react';

import { useAppearance } from '../customizables';
import type { InternalTheme } from './types';

type InternalThemeProviderProps = React.PropsWithChildren<{
  theme?: InternalTheme;
}>;

export const InternalThemeProvider = (props: InternalThemeProviderProps) => {
  const { parsedInternalTheme } = useAppearance();

  return <ThemeProvider theme={parsedInternalTheme}>{props.children}</ThemeProvider>;
};
