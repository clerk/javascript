import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

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

const useCache = <K = any, V = any>(
  key: K,
  serializer = serialize,
): {
  getCache: () => State<V> | undefined;
  setCache: (state: State<V> | ((params: State<V>) => State<V>)) => void;
  clearCache: () => void;
  subscribeCache: (callback: () => void) => () => void;
} => {
  const serializedKey = serializer(key);
  const get = useCallback(() => requestCache.get(serializedKey), [serializedKey]);
  const set = useCallback(
    (data: State | ((params: State) => State)) => {
      // @ts-ignore
      requestCache.set(serializedKey, typeof data === 'function' ? data(get()) : data);
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
 * @param resourceId
 */
export const useFetch = <K, T>(
  fetcher: ((...args: any) => Promise<T>) | undefined,
  params: K,
  options?: {
    throttleTime?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    staleTime?: number;
  },
  resourceId?: string,
) => {
  const cacheKey = { resourceId, params };
  const { subscribeCache, getCache, setCache, clearCache } = useCache<typeof cacheKey, T>(cacheKey);
  const {
    subscribeCache: subscribeRevalidationCounter,
    getCache: getRevalidationCounter,
    setCache: setRevalidationCounter,
  } = useCache<typeof cacheKey, number>({
    ...cacheKey,
    // @ts-ignore just an extra identifier for the cache key
    rv: true,
  });

  const staleTime = options?.staleTime ?? 1000 * 60 * 2; //cache for 2 minutes by default
  const throttleTime = options?.throttleTime || 0;
  const fetcherRef = useRef(fetcher);

  if (throttleTime < 0) {
    throw new Error('ClerkJS: A negative value for `throttleTime` is not allowed ');
  }

  const cached = useSyncExternalStore(subscribeCache, getCache);
  const revalidateCache = useSyncExternalStore(subscribeRevalidationCounter, getRevalidationCounter);

  const revalidate = useCallback(() => {
    setCache(d => ({
      ...d,
      cachedAt: 0,
    }));
    setRevalidationCounter(d => ({
      isLoading: false,
      isValidating: false,
      error: null,
      data: (d?.data || 0) + 1,
    }));
  }, [setCache, setRevalidationCounter]);

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      .catch((e: Error | null) => {
        setCache({
          data: getCache()?.data ?? null,
          isLoading: false,
          isValidating: false,
          error: e,
          cachedAt: Date.now(),
        });
        if (e) {
          options?.onError?.(e);
        }
      });
  }, [serialize(params), setCache, getCache, revalidateCache]);

  return {
    ...cached,
    setCache,
    invalidate: clearCache,
    revalidate,
  };
};
