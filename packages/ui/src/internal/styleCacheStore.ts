// eslint-disable-next-line no-restricted-imports
import type { EmotionCache } from '@emotion/cache';

// Why: composed profile roots (UserProfile + OrganizationProfile) mount as
// separate React roots in the consumer tree, so N can be live per clerk instance.
// One `cl-internal` emotion cache per instance is the invariant (two live caches,
// same key = duplicate style inserts, broken emotion dedup/ordering). AIO gets this
// free from its single portal tree; composed reconstructs it by keying the cache
// on the clerk instance here so sibling roots reuse one cache instead of each making
// their own. The cache is stored with the nonce/cssLayerName it was built from so a
// later change to either rebuilds it (matching the AIO StyleCacheProvider) instead
// of pinning whatever the first-mounted root happened to see.
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
