import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider, ThemeProviderProps } from '@emotion/react';
import React from 'react';

// TODO: make it customisable
import { baseTheme } from '../foundations';

const cache = createCache({
  key: 'cl-internal',
  prepend: true,
});

export const StyledSystemProvider = (props: Partial<ThemeProviderProps>) => {
  const { children, theme = baseTheme } = props;
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
};
