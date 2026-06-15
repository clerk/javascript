// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React from 'react';

import { MosaicAppearanceProvider, parseMosaicAppearance } from '../appearance';
import type { MosaicScopedElements } from '../appearance';
import { defaultMosaicVariables, resolveVariables } from '../variables';
import type { MosaicTheme, MosaicVariables } from '../variables';

const getInsertionPoint = (): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  return document.querySelector('style#cl-mosaic-style-insertion-point');
};

export const MosaicThemeContext = React.createContext<MosaicTheme | null>(null);

export interface AppearanceProviderProps {
  children: React.ReactNode;
  nonce?: string;
  cssLayerName?: string;
  variables?: MosaicVariables;
  elements?: MosaicScopedElements;
  scope?: string;
}

export function AppearanceProvider({
  children,
  nonce,
  cssLayerName,
  variables,
  elements,
  scope,
}: AppearanceProviderProps) {
  const theme = React.useMemo(() => resolveVariables(defaultMosaicVariables, variables), [variables]);
  const parsedElements = React.useMemo(
    () => parseMosaicAppearance({ variables, elements }, scope),
    [variables, elements, scope],
  );
  const cache = React.useMemo(() => {
    const el = getInsertionPoint();
    return createCache({
      key: 'cl-mosaic',
      stylisPlugins: [],
      prepend: cssLayerName ? false : !el,
      insertionPoint: el ?? undefined,
      nonce,
    });
  }, [nonce, cssLayerName]);

  return (
    <MosaicThemeContext.Provider value={theme}>
      <MosaicAppearanceProvider value={parsedElements}>
        <CacheProvider value={cache}>{children}</CacheProvider>
      </MosaicAppearanceProvider>
    </MosaicThemeContext.Provider>
  );
}

export function useMosaicTheme(): MosaicTheme {
  const theme = React.useContext(MosaicThemeContext);
  if (!theme) throw new Error('useMosaicTheme must be used within a MosaicProvider');
  return theme;
}
