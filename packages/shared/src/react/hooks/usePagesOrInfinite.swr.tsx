'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useSWR, useSWRInfinite } from '../clerk-swr';
import type { CacheSetter, ValueOrSetter } from '../types';
import type { UsePagesOrInfiniteSignature } from './usePageOrInfinite.types';
import { getDifferentKeys, useWithSafeValues } from './usePagesOrInfinite.shared';

const cachingSWROptions = {
  dedupingInterval: 1000 * 60,
  focusThrottleInterval: 1000 * 60 * 2,
} satisfies Parameters<typeof useSWR>[2];

export const usePagesOrInfinite: UsePagesOrInfiniteSignature = (params, fetcher, config, cacheKeys) => {
  const [paginatedPage, setPaginatedPage] = useState(params.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(params.initialPage ?? 1);
  const pageSizeRef = useRef(params.pageSize ?? 10);

  const enabled = config.enabled ?? true;
  const cacheMode = config.__experimental_mode === 'cache';
  const triggerInfinite = config.infinite ?? false;
  const keepPreviousData = config.keepPreviousData ?? false;
  const isSignedIn = config.isSignedIn;

  const pagesCacheKey = {
    ...cacheKeys,
    ...params,
    initialPage: paginatedPage,
    pageSize: pageSizeRef.current,
  };

  const shouldFetch = !triggerInfinite && enabled && (!cacheMode ? !!fetcher : true);
  const swrKey = isSignedIn ? pagesCacheKey : shouldFetch ? pagesCacheKey : null;
  const swrFetcher =
    !cacheMode && !!fetcher
      ? (cacheKeyParams: Record<string, unknown>) => {
          if (isSignedIn === false || shouldFetch === false) {
            return null;
          }
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
      // @ts-ignore - swr provider passes back cacheKey object, compute fetcher params
      const requestParams = getDifferentKeys(cacheKeyParams, cacheKeys);
      // @ts-ignore - params narrowing deferred to fetcher time
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
    [setSize, triggerInfinite],
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
    revalidate: revalidate as any,
    setData: setData as any,
  };
};

export { useWithSafeValues };
