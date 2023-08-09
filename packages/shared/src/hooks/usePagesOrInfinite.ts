import { useCallback, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import type { ValueOrSetter } from './types';
import type { PaginatedResources } from './types';

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

type ArrayType<DataArray> = DataArray extends Array<infer ElementType> ? ElementType : never;
type ExtractData<Type> = Type extends { data: infer Data } ? ArrayType<Data> : Type;

type UsePagesOrInfinite = <
  Params extends PagesOrInfiniteOptions,
  FetcherReturnData extends Record<string, any>,
  CacheKeys = Record<string, unknown>,
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
  options: {
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
  },
  cacheKeys: CacheKeys,
) => PaginatedResources<ExtractData<FetcherReturnData>> & {
  unstable__mutate: () => Promise<unknown>;
};

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

  const isomorphicPage = useMemo(() => {
    if (triggerInfinite) {
      return size;
    }
    return paginatedPage;
  }, [triggerInfinite, size, paginatedPage]);

  const isomorphicSetPage: ValueOrSetter<number> = useCallback(
    numberOrgFn => {
      if (triggerInfinite) {
        void setSize(numberOrgFn);
        return;
      }
      return setPaginatedPage(numberOrgFn);
    },
    [setSize],
  );

  const isomorphicData = useMemo(() => {
    if (triggerInfinite) {
      return swrInfiniteData?.map(a => a?.data).flat() ?? [];
    }
    return swrData?.data ?? [];
  }, [triggerInfinite, swrData, swrInfiniteData]);

  const isomorphicCount = useMemo(() => {
    if (triggerInfinite) {
      return swrInfiniteData?.[swrInfiniteData?.length - 1]?.total_count || 0;
    }
    return swrData?.total_count ?? 0;
  }, [triggerInfinite, swrData, swrInfiniteData]);

  const isomorphicIsLoading = triggerInfinite ? swrInfiniteIsLoading : swrIsLoading;
  const isomorphicIsFetching = triggerInfinite ? swrInfiniteIsValidating : swrIsValidating;
  const isomorphicIsError = !!(triggerInfinite ? swrInfiniteError : swrError);
  /**
   * Helpers
   */
  const fetchNext = useCallback(() => {
    isomorphicSetPage(n => Math.max(0, n + 1));
  }, [isomorphicSetPage]);

  const fetchPrevious = useCallback(() => {
    isomorphicSetPage(n => Math.max(0, n - 1));
  }, [isomorphicSetPage]);

  const offsetCount = (initialPageRef.current - 1) * pageSizeRef.current;

  const pageCount = Math.ceil((isomorphicCount - offsetCount) / pageSizeRef.current);
  const hasNextPage = isomorphicCount - offsetCount * pageSizeRef.current > isomorphicPage * pageSizeRef.current;
  const hasPreviousPage = (isomorphicPage - 1) * pageSizeRef.current > offsetCount * pageSizeRef.current;

  const unstable__mutate = triggerInfinite ? swrInfiniteMutate : swrMutate;

  return {
    data: isomorphicData,
    count: isomorphicCount,
    isLoading: isomorphicIsLoading,
    isFetching: isomorphicIsFetching,
    isError: isomorphicIsError,
    page: isomorphicPage,
    pageCount,
    fetchPage: isomorphicSetPage,
    fetchNext,
    fetchPrevious,
    hasNextPage,
    hasPreviousPage,
    unstable__mutate,
  };
};
