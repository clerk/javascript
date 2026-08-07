// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React from 'react';

import type { MosaicAppearance } from './appearance';
import { MosaicAppearanceProvider, MosaicIconsProvider, parseMosaicAppearance } from './appearance';
import type { MosaicTheme } from './variables';
import { defaultMosaicVariables, resolveVariables } from './variables';

const INSERTION_POINT_ID = 'cl-mosaic-style-insertion-point';

// Anchor Emotion's <style> insertion at a known point so Mosaic's styles land in a
// deterministic spot relative to any host styles. A host may pre-place the node; if
// it hasn't, create it once so the consumer contract is just "wrap with MosaicProvider".
// querySelector-first keeps this idempotent across StrictMode double-renders and
// multiple providers.
const ensureInsertionPoint = (): HTMLElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const existing = document.querySelector<HTMLElement>(`style#${INSERTION_POINT_ID}`);
  if (existing) {
    return existing;
  }
  const node = document.createElement('style');
  node.id = INSERTION_POINT_ID;
  document.head.appendChild(node);
  return node;
};

// A single zero-specificity reset for every Mosaic part. Keyed on `data-cl-slot` — the one
// attribute that every part emits (via useRecipe / useSlot / slot) — so it covers all authoring
// tiers with one rule instead of bloating each element's generated css. Scoped to the attribute
// (never a bare `*`) so it can't stomp host-app or legacy-system styles. Wrapped in `:where()` so
// it has 0 specificity: any component class (recipe / sx / appearance) wins regardless of
// stylesheet insertion order — a plain `[data-cl-slot]` selector (0,1,0) ties with the generated
// class and would override it on insertion order, undoing component padding/margin.
//
// Rendered as a plain <style>, not Emotion's <Global>: <Global> emits an inline <style> during SSR
// but injects via an insertion effect (rendering null) on the client, so the two trees never match
// and hydration throws. A static <style> is byte-identical on server and client, so it hydrates
// cleanly. Order doesn't matter thanks to `:where()`, so it needn't live in the Emotion cache.
const MOSAIC_RESET_CSS = ':where([data-cl-slot]){box-sizing:border-box;margin:0;padding:0;font-family:inherit;}';

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

// Exported Mosaic components annotate a React return type on purpose. The package sets
// `jsxImportSource: '@emotion/react'`, so an inferred return leaks Emotion's `JSX.Element` into the
// published `.d.ts`, which React 19 consumers reject as a JSX element type.
export function MosaicProvider({
  children,
  nonce,
  cssLayerName,
  appearance,
  scope,
}: MosaicProviderProps): React.ReactElement {
  const theme = React.useMemo(() => resolveVariables(defaultMosaicVariables, appearance?.variables), [appearance]);
  const parsedElements = React.useMemo(() => parseMosaicAppearance(appearance, scope), [appearance, scope]);
  const icons = React.useMemo(() => appearance?.icons ?? {}, [appearance]);
  const cache = React.useMemo(() => {
    const el = ensureInsertionPoint();
    const emotionCache = createCache({
      key: 'cl-mosaic',
      stylisPlugins: [],
      prepend: cssLayerName ? false : !el,
      insertionPoint: el ?? undefined,
      nonce,
    });

    // Route every cache insert through `@layer` so generated component styles carry the same layer
    // as the static reset above. The reset alone is not enough: without wrapping `insert`, Emotion
    // ships each component rule unlayered, and unlayered styles always outrank a consumer's
    // `@layer`-ed app styles. Mirrors StyleCacheProvider's wrap — keep the two in sync.
    if (cssLayerName) {
      const layer = cssLayerName;
      const insert = emotionCache.insert.bind(emotionCache);
      emotionCache.insert = (selector, serialized, sheet, shouldCache) => {
        if (!serialized.styles.startsWith('@layer')) {
          const layered = { ...serialized, styles: `@layer ${layer} {${serialized.styles}}` };
          return insert(selector, layered, sheet, shouldCache);
        }
        return insert(selector, serialized, sheet, shouldCache);
      };
    }

    return emotionCache;
  }, [nonce, cssLayerName]);

  return (
    <MosaicThemeContext.Provider value={theme}>
      <MosaicAppearanceProvider value={parsedElements}>
        <MosaicIconsProvider value={icons}>
          <CacheProvider value={cache}>
            <style
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: cssLayerName ? `@layer ${cssLayerName}{${MOSAIC_RESET_CSS}}` : MOSAIC_RESET_CSS,
              }}
            />
            {children}
          </CacheProvider>
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
