import { useCallback, useEffect, useRef, useState } from 'react';

export type State<Data = any, Error = any> = {
  data?: Data;
  error?: Error;
  isLoading?: boolean;
  cachedAt?: number;
};

export interface Cache<Data = any> {
  get(key: string): State<Data> | undefined;

  set(key: string, value: State<Data>): void;

  delete(key: string): void;

  clear(): void;
}

/**
 * Global cache for storing status of fetched resources
 */
let requestCache = new WeakMap<Cache, State>();

/**
 * A set to store subscribers in order to notify when the value of a key of `requestCache` changes
 */
const subscribers = new Set<() => void>();

/**
 * This utility should only be used in tests to clear previously fetched data
 */
export const clearFetchCache = () => {
  requestCache = new WeakMap<Cache, State>();
};

const useCache = (
  param: any,
): {
  get: <T>() => State<T> | undefined;
  set: (state: State) => void;
  subscribe: (callback: () => void) => () => void;
} => {
  const get = useCallback(() => requestCache.get(param), [param]);
  const set = useCallback(
    (data: State) => {
      requestCache.set(param, data);
      subscribers.forEach(callback => callback());
    },
    [param],
  );
  const subscribe = useCallback((callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }, []);

  return {
    get,
    set,
    subscribe,
  };
};

export const useFetch = <T>(
  fetcher: ((...args: any) => Promise<T>) | undefined,
  params: any,
  callbacks?: {
    onSuccess?: (data: T) => void;
  },
) => {
  const cache = useCache(params);

  const [state, setState] = useState(cache.get<T>());
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    const unsub = cache.subscribe(() => {
      setState(cache.get<T>());
    });
    return () => unsub();
  }, [cache.subscribe]);

  useEffect(() => {
    const fetcherMissing = !fetcherRef.current;
    const isCacheStale = Date.now() - (cache.get()?.cachedAt || 0) < 20000;
    const isRequestOnGoing = cache.get()?.isLoading;

    if (fetcherMissing || isCacheStale || isRequestOnGoing) {
      return;
    }

    cache.set({
      data: null,
      isLoading: true,
      error: null,
    });
    fetcherRef.current!(params)
      .then(result => {
        if (typeof result !== 'undefined') {
          const data = typeof result === 'object' ? { ...result } : result;
          cache.set({
            data,
            isLoading: false,
            error: null,
            cachedAt: Date.now(),
          });
          callbacks?.onSuccess?.(data);
        }
      })
      .catch(() => {
        cache.set({
          data: null,
          isLoading: false,
          error: true,
          cachedAt: Date.now(),
        });
      });
  }, [JSON.stringify(params), cache.set, cache.get]);

  return {
    ...state,
  };
};
