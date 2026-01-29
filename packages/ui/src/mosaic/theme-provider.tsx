// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, ThemeContext } from '@emotion/react';
import React from 'react';

import { type MosaicTheme, mosaicTheme } from './theme';

const mosaicCache = createCache({ key: 'mosaic' });

export const MosaicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CacheProvider value={mosaicCache}>
      <ThemeContext.Provider value={mosaicTheme}>{children}</ThemeContext.Provider>
    </CacheProvider>
  );
};

export const useMosaicTheme = () => React.useContext(ThemeContext) as MosaicTheme;
