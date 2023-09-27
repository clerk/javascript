'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useSWR, useSWRInfinite } from './clerk-swr';
import type { CacheSetter, PaginatedResources, ValueOrSetter } from './types';

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

type PagesOrInfiniteOptions = {
  /**
   * This the starting point for your fetched results. The initial value persists between re-renders
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request. The initial value persists between re-renders
   */
  pageSize?: number;
};

export const useWithSafeValues = <T extends PagesOrInfiniteOptions>(params: T | true | undefined, defaultValues: T) => {
  const shouldUseDefaults = typeof params === 'boolean' && params;

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(
    shouldUseDefaults ? defaultValues.initialPage : params?.initialPage ?? defaultValues.initialPage,
  );
  const pageSizeRef = useRef(shouldUseDefaults ? defaultValues.pageSize : params?.pageSize ?? defaultValues.pageSize);

  const newObj: Record<string, unknown> = {};
  for (const key of Object.keys(defaultValues)) {
    // @ts-ignore
    newObj[key] = shouldUseDefaults ? defaultValues[key] : params?.[key] ?? defaultValues[key];
  }

  return {
    ...newObj,
    initialPage: initialPageRef.current,
    pageSize: pageSizeRef.current,
  } as T;
};

type ArrayType<DataArray> = DataArray extends Array<infer ElementType> ? ElementType : never;
type ExtractData<Type> = Type extends { data: infer Data } ? ArrayType<Data> : Type;

type DefaultOptions = {
  /**
   * Persists the previous pages with new ones in the same array
   */
  infinite?: boolean;
  /**
   * Return the previous key's data until the new data has been loaded
   */
  keepPreviousData?: boolean;
  /**
   * Should a request be triggered
   */
  enabled?: boolean;
};

type UsePagesOrInfinite = <
  Params extends PagesOrInfiniteOptions,
  FetcherReturnData extends Record<string, any>,
  CacheKeys = Record<string, unknown>,
  TOptions extends DefaultOptions = DefaultOptions,
>(
  /**
   * The parameters will be passed to the fetcher
   */
  params: Params,
  /**
   * A Promise returning function to fetch your data
   */
  fetcher: ((p: Params) => FetcherReturnData | Promise<FetcherReturnData>) | undefined,
  /**
   * Internal configuration of the hook
   */
  options: TOptions,
  cacheKeys: CacheKeys,
) => PaginatedResources<ExtractData<FetcherReturnData>, TOptions['infinite'], FetcherReturnData>;

export const usePagesOrInfinite: UsePagesOrInfinite = (params, fetcher, options, cacheKeys) => {
  const [paginatedPage, setPaginatedPage] = useState(params.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(params.initialPage ?? 1);
  const pageSizeRef = useRef(params.pageSize ?? 10);

  const enabled = options.enabled ?? true;
  const triggerInfinite = options.infinite ?? false;
  const keepPreviousData = options.keepPreviousData ?? false;

  const pagesCacheKey = {
    ...cacheKeys,
    ...params,
    initialPage: paginatedPage,
    pageSize: pageSizeRef.current,
  };

  const {
    data: swrData,
    isValidating: swrIsValidating,
    isLoading: swrIsLoading,
    error: swrError,
    mutate: swrMutate,
  } = useSWR(
    !triggerInfinite && !!fetcher && enabled ? pagesCacheKey : null,
    cacheKeyParams => {
      // @ts-ignore
      const requestParams = getDifferentKeys(cacheKeyParams, cacheKeys);
      // @ts-ignore
      return fetcher?.(requestParams);
    },
    { keepPreviousData },
  );

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
  const isError = !!(triggerInfinite ? swrInfiniteError : swrError);
  /**
   * Helpers
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

  const setCache: CacheSetter = triggerInfinite
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
    setCache: setCache as any,
  };
};
