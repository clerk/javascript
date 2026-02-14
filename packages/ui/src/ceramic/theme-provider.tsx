// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, ThemeContext } from '@emotion/react';
import React from 'react';

import { type CeramicTheme, ceramicTheme } from './theme';

const ceramicCache = createCache({ key: 'ceramic' });

export const CeramicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CacheProvider value={ceramicCache}>
      <ThemeContext.Provider value={ceramicTheme}>{children}</ThemeContext.Provider>
    </CacheProvider>
  );
};

export const useCeramicTheme = () => React.useContext(ThemeContext) as CeramicTheme;
