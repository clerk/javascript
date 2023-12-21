import { useCallback, useEffect, useRef, useState } from 'react';

export type State<Data = any, Error = any> = {
  data?: Data;
  error?: Error;
  isLoading?: boolean;
  cachedAt?: number;
};

export interface Cache<Data = any> {
  keys(): IterableIterator<string>;

  get(key: string): State<Data> | undefined;

  set(key: string, value: State<Data>): void;

  delete(key: string): void;
}

const map = new WeakMap<Cache, State>();
const subscribers = new Set<() => void>();
const useCache = (
  param: any,
): {
  get: <T>() => State<T> | undefined;
  set: (state: State) => void;
  subscribe: (callback: () => void) => () => void;
} => {
  // const subscribers = useRef(new Set<() => void>());

  const get = useCallback(() => map.get(param), [param]);
  const set = useCallback(
    (data: State) => {
      map.set(param, data);
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
    if (!fetcherRef.current) {
      return;
    }

    // Only fetch stale data
    if (Date.now() - (cache.get()?.cachedAt || 0) < 20000) {
      return;
    }

    // No parallel requests for the same resource
    if (cache.get()?.isLoading) {
      return;
    }

    cache.set({
      data: null,
      isLoading: true,
      error: null,
    });
    fetcherRef
      .current(params)
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
