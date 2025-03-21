import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

export type State<Data = any, Error = any> = {
  data: Data | null;
  error: Error | null;
  /**
   * if there's an ongoing request and no "loaded data"
   */
  isLoading: boolean;
  /**
   * if there's a request or revalidation loading
   */
  isValidating: boolean;
  cachedAt?: number;
};

/**
 * Global cache for storing status of fetched resources
 */
let requestCache = new Map<string, State>();

/**
 * A set to store subscribers in order to notify when the value of a key of `requestCache` changes
 */
const subscribers = new Set<() => void>();

/**
 * This utility should only be used in tests to clear previously fetched data
 */
export const clearFetchCache = () => {
  requestCache = new Map<string, State>();
};

const serialize = (key: unknown) => (typeof key === 'string' ? key : JSON.stringify(key));

export const useCache = <K = any, V = any>(
  key: K,
  serializer = serialize,
): {
  getCache: () => State<V> | undefined;
  setCache: (state: State<V>) => void;
  clearCache: () => void;
  subscribeCache: (callback: () => void) => () => void;
} => {
  const serializedKey = serializer(key);
  const get = useCallback(() => requestCache.get(serializedKey), [serializedKey]);
  const set = useCallback(
    (data: State) => {
      requestCache.set(serializedKey, data);
      subscribers.forEach(callback => callback());
    },
    [serializedKey],
  );

  const clear = useCallback(() => {
    set({
      isLoading: false,
      isValidating: false,
      data: null,
      error: null,
      cachedAt: undefined,
    });
  }, [set]);
  const subscribe = useCallback((callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }, []);

  return {
    getCache: get,
    setCache: set,
    subscribeCache: subscribe,
    clearCache: clear,
  };
};

/**
 * An in-house simpler alternative to useSWR
 * @param fetcher If fetcher is undefined no action will be performed
 * @param params
 * @param options
 */
export const useFetch = <K, T>(
  fetcher: ((...args: any) => Promise<T>) | undefined,
  params: K,
  options?: {
    throttleTime?: number;
    onSuccess?: (data: T) => void;
    staleTime?: number;
  },
) => {
  const { subscribeCache, getCache, setCache, clearCache } = useCache<K, T>(params);
  const [revalidationCounter, setRevalidationCounter] = useState(0);

  const staleTime = options?.staleTime ?? 1000 * 60 * 2; //cache for 2 minutes by default
  const throttleTime = options?.throttleTime || 0;
  const fetcherRef = useRef(fetcher);

  if (throttleTime < 0) {
    throw new Error('ClerkJS: A negative value for `throttleTime` is not allowed ');
  }

  const cached = useSyncExternalStore(subscribeCache, getCache);

  const revalidate = useCallback(() => {
    clearCache(); // Clear the cache
    setRevalidationCounter(prev => prev + 1); // Increment counter to trigger effect
  }, [clearCache]);

  useEffect(() => {
    const fetcherMissing = !fetcherRef.current;
    const isCacheStale =
      typeof getCache()?.cachedAt === 'undefined' ? true : Date.now() - (getCache()?.cachedAt || 0) >= staleTime;
    const isRequestOnGoing = getCache()?.isValidating ?? false;

    if (fetcherMissing || !isCacheStale || isRequestOnGoing) {
      return;
    }

    const d = performance.now();

    setCache({
      data: getCache()?.data ?? null,
      isLoading: !getCache()?.data,
      isValidating: true,
      error: null,
    });
    fetcherRef.current!(params)
      .then(result => {
        if (typeof result !== 'undefined') {
          const data = Array.isArray(result) ? result : typeof result === 'object' ? { ...result } : result;
          const n = performance.now();
          const waitTime = throttleTime - (n - d);

          setTimeout(() => {
            setCache({
              data,
              isLoading: false,
              isValidating: false,
              error: null,
              cachedAt: Date.now(),
            });
            options?.onSuccess?.(data);
          }, waitTime);
        }
      })
      .catch(() => {
        setCache({
          data: getCache()?.data ?? null,
          isLoading: false,
          isValidating: false,
          error: true,
          cachedAt: Date.now(),
        });
      });
  }, [serialize(params), setCache, getCache, revalidationCounter]);

  return {
    ...cached,
    setCache,
    invalidate: clearCache,
    revalidate,
  };
};
