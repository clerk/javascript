// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React from 'react';

import type { MosaicAppearance } from './appearance';
import { MosaicAppearanceProvider, MosaicIconsProvider, parseMosaicAppearance } from './appearance';
import type { MosaicTheme } from './variables';
import { defaultMosaicVariables, resolveVariables } from './variables';

const getInsertionPoint = (): HTMLElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.querySelector('style#cl-mosaic-style-insertion-point');
};

const MosaicThemeContext = React.createContext<MosaicTheme | null>(null);

export interface MosaicProviderProps {
  children: React.ReactNode;
  nonce?: string;
  cssLayerName?: string;
  /** Consumer overrides — `variables` (design tokens) + `elements` (per-slot styles), with optional per-flow scoping. */
  appearance?: MosaicAppearance;
  /** The active flow key (`'signIn'`, `'userButton'`, …) used to resolve scoped overrides. */
  scope?: string;
}

export function MosaicProvider({ children, nonce, cssLayerName, appearance, scope }: MosaicProviderProps) {
  const theme = React.useMemo(() => resolveVariables(defaultMosaicVariables, appearance?.variables), [appearance]);
  const parsedElements = React.useMemo(() => parseMosaicAppearance(appearance, scope), [appearance, scope]);
  const icons = React.useMemo(() => appearance?.icons ?? {}, [appearance]);
  const cache = React.useMemo(() => {
    const el = getInsertionPoint();
    const emotionCache = createCache({
      key: 'cl-mosaic',
      stylisPlugins: [],
      prepend: cssLayerName ? false : !el,
      insertionPoint: el ?? undefined,
      nonce,
    });

    return emotionCache;
  }, [nonce, cssLayerName]);

  return (
    <MosaicThemeContext.Provider value={theme}>
      <MosaicAppearanceProvider value={parsedElements}>
        <MosaicIconsProvider value={icons}>
          <CacheProvider value={cache}>{children}</CacheProvider>
        </MosaicIconsProvider>
      </MosaicAppearanceProvider>
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
