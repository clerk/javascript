// eslint-disable-next-line no-restricted-imports
import type { EmotionCache } from '@emotion/cache';

const store = new WeakMap<object, EmotionCache>();

export function getStyleCache(clerkInstance: object): EmotionCache | undefined {
  return store.get(clerkInstance);
}

export function setStyleCache(clerkInstance: object, cache: EmotionCache): void {
  store.set(clerkInstance, cache);
}
