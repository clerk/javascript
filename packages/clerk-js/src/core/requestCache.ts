import { debugLogger } from '@/utils/debug';

export type RequestCacheState<T = unknown> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  cachedAt?: number;
};

const cache = new Map<string, RequestCacheState<unknown>>();
const subscribers = new Set<() => void>();

/**
 * Gets a cache entry
 */
export const getCacheEntry = <T>(key: string): RequestCacheState<T> | undefined => {
  return cache.get(key) as RequestCacheState<T> | undefined;
};

/**
 * Sets a cache entry and notifies subscribers
 */
export const setCacheEntry = <T>(
  key: string,
  state: RequestCacheState<T> | ((current: RequestCacheState<T> | undefined) => RequestCacheState<T>),
): void => {
  const currentState = cache.get(key) as RequestCacheState<T> | undefined;
  const newState = typeof state === 'function' ? state(currentState) : state;
  cache.set(key, newState as RequestCacheState<unknown>);
  notifySubscribers();
};

/**
 * Subscribes to cache changes
 */
export const subscribe = (callback: () => void): (() => void) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

/**
 * Clears the entire request cache
 */
export const clearRequestCache = (): void => {
  cache.clear();
  notifySubscribers();
};

/**
 * Notifies all subscribers of cache changes
 */
const notifySubscribers = (): void => {
  subscribers.forEach(callback => {
    try {
      callback();
    } catch (error) {
      debugLogger.error('Error executing subscriber callback', { error }, 'RequestCache');
    }
  });
};
