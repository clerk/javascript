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
): {
  getCache: () => State<V> | undefined;
  setCache: (state: State<V>) => void;
  subscribeCache: (callback: () => void) => () => void;
} => {
  const serializedKey = serialize(key);
  const get = useCallback(() => requestCache.get(serializedKey), [serializedKey]);
  const set = useCallback(
    (data: State) => {
      requestCache.set(serializedKey, data);
      subscribers.forEach(callback => callback());
    },
    [serializedKey],
  );
  const subscribe = useCallback((callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }, []);

  return {
    getCache: get,
    setCache: set,
    subscribeCache: subscribe,
  };
};

/**
 *
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
  const { subscribeCache, getCache, setCache } = useCache<K, T>(params);

  const staleTime = options?.staleTime || 1000 * 60 * 2; //cache for 2 minutes by default
  const throttleTime = options?.throttleTime || 0;
  const fetcherRef = useRef(fetcher);

  const cached = useSyncExternalStore(subscribeCache, getCache);

  useEffect(() => {
    const fetcherMissing = !fetcherRef.current;
    const isCacheStale = Date.now() - (getCache()?.cachedAt || 0) >= staleTime;
    const isRequestOnGoing = getCache()?.isValidating;

    if (fetcherMissing || !isCacheStale || isRequestOnGoing) {
      return;
    }

    const d = performance.now();

    setCache({
      data: null,
      isLoading: !getCache(),
      isValidating: true,
      error: null,
    });
    fetcherRef.current!(params)
      .then(result => {
        if (typeof result !== 'undefined') {
          const data = Array.isArray(result) ? result : typeof result === 'object' ? { ...result } : result;
          const n = performance.now();
          const waitTime = throttleTime - (n - d);

          // TODO: sleep on it and come back later
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
          data: null,
          isLoading: false,
          isValidating: false,
          error: true,
          cachedAt: Date.now(),
        });
      });
  }, [serialize(params), setCache, getCache]);

  return {
    ...cached,
  };
};
