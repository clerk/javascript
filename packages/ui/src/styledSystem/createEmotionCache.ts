// eslint-disable-next-line no-restricted-imports
import createCache, { type EmotionCache } from '@emotion/cache';

type CreateEmotionCacheOptions = {
  /** The nonce value for CSP (Content Security Policy). */
  nonce?: string;
  /** The CSS layer name to wrap style insertions in. */
  cssLayerName?: string;
};

/**
 * Creates the shared `cl-internal` emotion cache used by both the AIO
 * `StyleCacheProvider` and the composed `ProfileProviderShell`. When
 * `cssLayerName` is set, every insertion is wrapped in `@layer <name> { ... }`
 * so consumers can control cascade precedence relative to their own styles.
 */
export function createEmotionCache({ nonce, cssLayerName }: CreateEmotionCacheOptions): EmotionCache {
  const el = typeof document !== 'undefined' ? document.querySelector('style#cl-style-insertion-point') : null;
  const cache = createCache({
    key: 'cl-internal',
    prepend: cssLayerName ? false : !el,
    insertionPoint: el ? (el as HTMLElement) : undefined,
    nonce,
  });

  if (cssLayerName) {
    const prevInsert = cache.insert.bind(cache);

    cache.insert = (selector, serialized, sheet, shouldCache) => {
      if (serialized && typeof serialized.styles === 'string' && !serialized.styles.startsWith('@layer')) {
        const wrapped = { ...serialized, styles: `@layer ${cssLayerName} {${serialized.styles}}` };
        return prevInsert(selector, wrapped, sheet, shouldCache);
      }
      return prevInsert(selector, serialized, sheet, shouldCache);
    };
  }

  return cache;
}
