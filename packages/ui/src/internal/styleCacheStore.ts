// eslint-disable-next-line no-restricted-imports
import type { EmotionCache } from '@emotion/cache';

// Sibling composed roots share one `cl-internal` emotion cache per clerk instance;
// two live caches under the same key would duplicate style inserts. Keyed with the
// nonce/cssLayerName it was built from so a change to either rebuilds it (matching
// the AIO StyleCacheProvider).
type StyleCacheEntry = {
  cache: EmotionCache;
  nonce: string | undefined;
  cssLayerName: string | undefined;
};

const store = new WeakMap<object, StyleCacheEntry>();

export function getStyleCacheEntry(clerkInstance: object): StyleCacheEntry | undefined {
  return store.get(clerkInstance);
}

export function getStyleCache(clerkInstance: object): EmotionCache | undefined {
  return store.get(clerkInstance)?.cache;
}

export function setStyleCache(clerkInstance: object, entry: StyleCacheEntry): void {
  store.set(clerkInstance, entry);
}
