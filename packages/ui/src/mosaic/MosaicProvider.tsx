// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React from 'react';

import { MosaicAppearanceProvider, parseMosaicAppearance } from './appearance';
import type { MosaicAppearance } from './appearance';
import { defaultMosaicVariables, resolveVariables } from './variables';
import type { MosaicTheme } from './variables';

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

  // Children inject styles via useInsertionEffect (fires children → parents).
  // Ours fires after theirs, still before paint — no flash.
  React.useInsertionEffect(() => {
    if (!cssLayerName) return;
    document.querySelectorAll<HTMLStyleElement>(`style[data-emotion^="${cache.key}"]`).forEach(el => {
      if (el.textContent && !el.textContent.includes('@layer')) {
        el.textContent = `@layer ${cssLayerName}{${el.textContent}}`;
      }
    });
  });

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
  if (!theme) {
    throw new Error('useMosaicTheme must be used within a MosaicProvider');
  }
  return theme;
}
