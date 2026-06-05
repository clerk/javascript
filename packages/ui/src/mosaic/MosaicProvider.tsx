// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, type SerializedStyles } from '@emotion/react';
import React from 'react';

import { defaultMosaicVariables, resolveVariables } from './variables';
import type { MosaicTheme, MosaicVariables } from './variables';

const el = document.querySelector('style#cl-mosaic-style-insertion-point');

const MosaicThemeContext = React.createContext<MosaicTheme | null>(null);

export interface MosaicProviderProps {
  children: React.ReactNode;
  variables?: MosaicVariables;
  nonce?: string;
  cssLayerName?: string;
}

export function MosaicProvider({ children, variables, nonce, cssLayerName }: MosaicProviderProps) {
  const theme = React.useMemo(() => resolveVariables(defaultMosaicVariables, variables), [variables]);
  const cache = React.useMemo(() => {
    const emotionCache = createCache({
      key: 'cl-mosaic',
      stylisPlugins: [],
      prepend: cssLayerName ? false : !el,
      insertionPoint: el ? (el as HTMLElement) : undefined,
      nonce,
    });

    if (cssLayerName) {
      const prevInsert = emotionCache.insert.bind(emotionCache);
      emotionCache.insert = (selector: string, serialized: SerializedStyles, sheet: any, shouldCache: boolean) => {
        if (serialized && typeof serialized.styles === 'string' && !serialized.styles.startsWith('@layer')) {
          const newSerialized = { ...serialized };
          newSerialized.styles = `@layer ${cssLayerName} {${serialized.styles}}`;
          return prevInsert(selector, newSerialized, sheet, shouldCache);
        }
        return prevInsert(selector, serialized, sheet, shouldCache);
      };
    }

    return emotionCache;
  }, [nonce, cssLayerName]);
  return (
    <MosaicThemeContext.Provider value={theme}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </MosaicThemeContext.Provider>
  );
}

export function useMosaicTheme(): MosaicTheme {
  const theme = React.useContext(MosaicThemeContext);
  if (!theme) {
    throw new Error('useMosaicTheme must be used within a MosaicProvider');
  }
  return theme;
}
