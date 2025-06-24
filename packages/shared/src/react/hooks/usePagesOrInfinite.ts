'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useSWR, useSWRInfinite } from '../clerk-swr';
import type {
  CacheSetter,
  PagesOrInfiniteConfig,
  PagesOrInfiniteOptions,
  PaginatedResources,
  ValueOrSetter,
} from '../types';

/**
 * Returns an object containing only the keys from the first object that are not present in the second object.
 * Useful for extracting unique parameters that should be passed to a request while excluding common cache keys.
 *
 * @internal
 *
 * @example
 * ```typescript
 * // Example 1: Basic usage
 * const obj1 = { name: 'John', age: 30, city: 'NY' };
 * const obj2 = { name: 'John', age: 30 };
 * getDifferentKeys(obj1, obj2); // Returns { city: 'NY' }
 *
 * // Example 2: With cache keys
 * const requestParams = { page: 1, limit: 10, userId: '123' };
 * const cacheKeys = { userId: '123' };
 * getDifferentKeys(requestParams, cacheKeys); // Returns { page: 1, limit: 10 }
 * ```
 */
function getDifferentKeys(obj1: Record<string, unknown>, obj2: Record<string, unknown>): Record<string, unknown> {
  const keysSet = new Set(Object.keys(obj2));
  const differentKeysObject: Record<string, unknown> = {};

  for (const key1 of Object.keys(obj1)) {
    if (!keysSet.has(key1)) {
      differentKeysObject[key1] = obj1[key1];
    }
  }

  return differentKeysObject;
}

/**
 * A hook that safely merges user-provided pagination options with default values.
 * It caches initial pagination values (page and size) until component unmount to prevent unwanted rerenders.
 *
 * @internal
 *
 * @example
 * ```typescript
 * // Example 1: With user-provided options
 * const userOptions = { initialPage: 2, pageSize: 20, infinite: true };
 * const defaults = { initialPage: 1, pageSize: 10, infinite: false };
 * useWithSafeValues(userOptions, defaults);
 * // Returns { initialPage: 2, pageSize: 20, infinite: true }
 *
 * // Example 2: With boolean true (use defaults)
 * const params = true;
 * const defaults = { initialPage: 1, pageSize: 10, infinite: false };
 * useWithSafeValues(params, defaults);
 * // Returns { initialPage: 1, pageSize: 10, infinite: false }
 *
 * // Example 3: With undefined options (fallback to defaults)
 * const params = undefined;
 * const defaults = { initialPage: 1, pageSize: 10, infinite: false };
 * useWithSafeValues(params, defaults);
 * // Returns { initialPage: 1, pageSize: 10, infinite: false }
 * ```
 */
export const useWithSafeValues = <T extends PagesOrInfiniteOptions>(params: T | true | undefined, defaultValues: T) => {
  const shouldUseDefaults = typeof params === 'boolean' && params;

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(
    shouldUseDefaults ? defaultValues.initialPage : (params?.initialPage ?? defaultValues.initialPage),
  );
  const pageSizeRef = useRef(shouldUseDefaults ? defaultValues.pageSize : (params?.pageSize ?? defaultValues.pageSize));

  const newObj: Record<string, unknown> = {};
  for (const key of Object.keys(defaultValues)) {
    // @ts-ignore
    newObj[key] = shouldUseDefaults ? defaultValues[key] : (params?.[key] ?? defaultValues[key]);
  }

  return {
    ...newObj,
    initialPage: initialPageRef.current,
    pageSize: pageSizeRef.current,
  } as T;
};

const cachingSWROptions = {
  dedupingInterval: 1000 * 60,
  focusThrottleInterval: 1000 * 60 * 2,
} satisfies Parameters<typeof useSWR>[2];

type ArrayType<DataArray> = DataArray extends Array<infer ElementType> ? ElementType : never;
type ExtractData<Type> = Type extends { data: infer Data } ? ArrayType<Data> : Type;

type UsePagesOrInfinite = <
  Params extends PagesOrInfiniteOptions,
  FetcherReturnData extends Record<string, any>,
  CacheKeys = Record<string, unknown>,
  TConfig extends PagesOrInfiniteConfig = PagesOrInfiniteConfig,
>(
  /**
   * The parameters will be passed to the fetcher.
   */
  params: Params,
  /**
   * A Promise returning function to fetch your data.
   */
  fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined,
  /**
   * Internal configuration of the hook.
   */
  config: TConfig,
  cacheKeys: CacheKeys,
) => PaginatedResources<ExtractData<FetcherReturnData>, TConfig['infinite']>;

/**
 * A flexible pagination hook that supports both traditional pagination and infinite loading.
 * It provides a unified API for handling paginated data fetching, with built-in caching through SWR.
 * The hook can operate in two modes:
 * - Traditional pagination: Fetches one page at a time with page navigation
 * - Infinite loading: Accumulates data as more pages are loaded.
 *
 * Features:
 * - Cache management with SWR
 * - Loading and error states
 * - Page navigation helpers
 * - Data revalidation and updates
 * - Support for keeping previous data while loading.
 *
 * @internal
 */
export const usePagesOrInfinite: UsePagesOrInfinite = (params, fetcher, config, cacheKeys) => {
  const [paginatedPage, setPaginatedPage] = useState(params.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(params.initialPage ?? 1);
  const pageSizeRef = useRef(params.pageSize ?? 10);

  const enabled = config.enabled ?? true;
  const cacheMode = config.__experimental_mode === 'cache';
  const triggerInfinite = config.infinite ?? false;
  const keepPreviousData = config.keepPreviousData ?? false;

  const pagesCacheKey = {
    ...cacheKeys,
    ...params,
    initialPage: paginatedPage,
    pageSize: pageSizeRef.current,
  };

  // cacheMode being `true` indicates that the cache key is defined, but the fetcher is not.
  // This allows to ready the cache instead of firing a request.
  const shouldFetch = !triggerInfinite && enabled && (!cacheMode ? !!fetcher : true);
  const swrKey = shouldFetch ? pagesCacheKey : null;
  const swrFetcher =
    !cacheMode && !!fetcher
      ? (cacheKeyParams: Record<string, unknown>) => {
          // @ts-ignore
          const requestParams = getDifferentKeys(cacheKeyParams, cacheKeys);
          return fetcher({ ...params, ...requestParams });
        }
      : null;

  const {
    data: swrData,
    isValidating: swrIsValidating,
    isLoading: swrIsLoading,
    error: swrError,
    mutate: swrMutate,
  } = useSWR(swrKey, swrFetcher, { keepPreviousData, ...cachingSWROptions });

  const {
    data: swrInfiniteData,
    isLoading: swrInfiniteIsLoading,
    isValidating: swrInfiniteIsValidating,
    error: swrInfiniteError,
    size,
    setSize,
    mutate: swrInfiniteMutate,
  } = useSWRInfinite(
    pageIndex => {
      if (!triggerInfinite || !enabled) {
        return null;
      }

      return {
        ...params,
        ...cacheKeys,
        initialPage: initialPageRef.current + pageIndex,
        pageSize: pageSizeRef.current,
      };
    },
    cacheKeyParams => {
      // @ts-ignore
      const requestParams = getDifferentKeys(cacheKeyParams, cacheKeys);
      // @ts-ignore
      return fetcher?.(requestParams);
    },
    cachingSWROptions,
  );

  const page = useMemo(() => {
    if (triggerInfinite) {
      return size;
    }
    return paginatedPage;
  }, [triggerInfinite, size, paginatedPage]);

  const fetchPage: ValueOrSetter<number> = useCallback(
    numberOrgFn => {
      if (triggerInfinite) {
        void setSize(numberOrgFn);
        return;
      }
      return setPaginatedPage(numberOrgFn);
    },
    [setSize],
  );

  const data = useMemo(() => {
    if (triggerInfinite) {
      return swrInfiniteData?.map(a => a?.data).flat() ?? [];
    }
    return swrData?.data ?? [];
  }, [triggerInfinite, swrData, swrInfiniteData]);

  const count = useMemo(() => {
    if (triggerInfinite) {
      return swrInfiniteData?.[swrInfiniteData?.length - 1]?.total_count || 0;
    }
    return swrData?.total_count ?? 0;
  }, [triggerInfinite, swrData, swrInfiniteData]);

  const isLoading = triggerInfinite ? swrInfiniteIsLoading : swrIsLoading;
  const isFetching = triggerInfinite ? swrInfiniteIsValidating : swrIsValidating;
  const error = (triggerInfinite ? swrInfiniteError : swrError) ?? null;
  const isError = !!error;
  /**
   * Helpers.
   */
  const fetchNext = useCallback(() => {
    fetchPage(n => Math.max(0, n + 1));
  }, [fetchPage]);

  const fetchPrevious = useCallback(() => {
    fetchPage(n => Math.max(0, n - 1));
  }, [fetchPage]);

  const offsetCount = (initialPageRef.current - 1) * pageSizeRef.current;

  const pageCount = Math.ceil((count - offsetCount) / pageSizeRef.current);
  const hasNextPage = count - offsetCount * pageSizeRef.current > page * pageSizeRef.current;
  const hasPreviousPage = (page - 1) * pageSizeRef.current > offsetCount * pageSizeRef.current;

  const setData: CacheSetter = triggerInfinite
    ? value =>
        swrInfiniteMutate(value, {
          revalidate: false,
        })
    : value =>
        swrMutate(value, {
          revalidate: false,
        });

  const revalidate = triggerInfinite ? () => swrInfiniteMutate() : () => swrMutate();

  return {
    data,
    count,
    error,
    isLoading,
    isFetching,
    isError,
    page,
    pageCount,
    fetchPage,
    fetchNext,
    fetchPrevious,
    hasNextPage,
    hasPreviousPage,
    // Let the hook return type define this type
    revalidate: revalidate as any,
    // Let the hook return type define this type
    setData: setData as any,
  };
};
