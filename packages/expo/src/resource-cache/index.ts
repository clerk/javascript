import { createResourceCacheStore } from './resource-cache';

/**
 * @deprecated Use `resourceCache` from `@clerk/clerk-expo/resource-cache` instead.
 */
const secureStore = createResourceCacheStore;

export { secureStore, createResourceCacheStore as resourceCache };
