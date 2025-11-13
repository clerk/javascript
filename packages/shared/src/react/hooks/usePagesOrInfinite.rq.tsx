'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ClerkPaginatedResponse } from '../../types';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkInfiniteQuery } from '../clerk-rq/useInfiniteQuery';
import { useClerkQuery } from '../clerk-rq/useQuery';
import type { CacheSetter, ValueOrSetter } from '../types';
import type { UsePagesOrInfiniteSignature } from './usePageOrInfinite.types';
import { getDifferentKeys, useWithSafeValues } from './usePagesOrInfinite.shared';
import { usePreviousValue } from './usePreviousValue';

/**
 * @internal
 */
function KeepPreviousDataFn<Data>(previousData: Data): Data {
  return previousData;
}

export const usePagesOrInfinite: UsePagesOrInfiniteSignature = (params, fetcher, config, cacheKeys) => {
  const [paginatedPage, setPaginatedPage] = useState(params.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(params.initialPage ?? 1);
  const pageSizeRef = useRef(params.pageSize ?? 10);

  const enabled = config.enabled ?? true;
  const isSignedIn = config.isSignedIn;
  const triggerInfinite = config.infinite ?? false;
  const cacheMode = config.__experimental_mode === 'cache';
  const keepPreviousData = config.keepPreviousData ?? false;

  const [queryClient] = useClerkQueryClient();

  // Compute the actual enabled state for queries (considering all conditions)
  const queriesEnabled = enabled && Boolean(fetcher) && !cacheMode && isSignedIn !== false;

  // Force re-render counter for cache-only updates
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const forceUpdate = useCallback((updater: (n: number) => number) => {
    setForceUpdateCounter(updater);
  }, []);

  // Non-infinite mode: single page query
  const pagesQueryKey = useMemo(() => {
    return [
      'clerk-pages',
      {
        ...cacheKeys,
        ...params,
        initialPage: paginatedPage,
        pageSize: pageSizeRef.current,
      },
    ];
  }, [cacheKeys, params, paginatedPage]);

  const singlePageQuery = useClerkQuery({
    queryKey: pagesQueryKey,
    queryFn: ({ queryKey }) => {
      const [, key] = queryKey as [string, Record<string, unknown>];

      if (!fetcher) {
        return undefined as any;
      }

      const requestParams = getDifferentKeys(key, cacheKeys);

      // @ts-ignore - params type differs slightly but is structurally compatible
      return fetcher({ ...params, ...requestParams } as Params);
    },
    staleTime: 60_000,
    enabled: queriesEnabled && !triggerInfinite,
    // Use placeholderData to keep previous data while fetching new page
    placeholderData: keepPreviousData ? KeepPreviousDataFn : undefined,
  });

  // Infinite mode: accumulate pages
  const infiniteQueryKey = useMemo(() => {
    return [
      'clerk-pages-infinite',
      {
        ...cacheKeys,
        ...params,
      },
    ];
  }, [cacheKeys, params]);

  const infiniteQuery = useClerkInfiniteQuery<ClerkPaginatedResponse<any>>({
    queryKey: infiniteQueryKey,
    initialPageParam: params.initialPage ?? 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const total = lastPage?.total_count ?? 0;
      const consumed = (allPages.length + (params.initialPage ? params.initialPage - 1 : 0)) * (params.pageSize ?? 10);
      return consumed < total ? (lastPageParam as number) + 1 : undefined;
    },
    queryFn: ({ pageParam }) => {
      if (!fetcher) {
        return undefined as any;
      }
      // @ts-ignore - merging page params for fetcher call
      return fetcher({ ...params, initialPage: pageParam, pageSize: pageSizeRef.current } as Params);
    },
    staleTime: 60_000,
    enabled: queriesEnabled && triggerInfinite,
  });

  // Track previous isSignedIn state to detect sign-out transitions
  const previousIsSignedIn = usePreviousValue(isSignedIn);

  // Detect sign-out and clear queries
  useEffect(() => {
    const isNowSignedOut = isSignedIn === false;

    if (previousIsSignedIn && isNowSignedOut) {
      // Clear ALL queries matching the base query keys (including old userId)
      // Use predicate to match queries that start with 'clerk-pages' or 'clerk-pages-infinite'

      queryClient.removeQueries({
        predicate: query => {
          const key = query.queryKey;
          return (
            (Array.isArray(key) && key[0] === 'clerk-pages') ||
            (Array.isArray(key) && key[0] === 'clerk-pages-infinite')
          );
        },
      });

      // Reset paginated page to initial
      setPaginatedPage(initialPageRef.current);

      // Force re-render to reflect cache changes
      void Promise.resolve().then(() => forceUpdate(n => n + 1));
    }
  }, [isSignedIn, queryClient, previousIsSignedIn, forceUpdate]);

  const page = useMemo(() => {
    if (triggerInfinite) {
      // Read from query data first, fallback to cache
      const cachedData = queryClient.getQueryData<{ pages?: Array<ClerkPaginatedResponse<any>> }>(infiniteQueryKey);
      const pages = infiniteQuery.data?.pages ?? cachedData?.pages ?? [];
      // Return pages.length if > 0, otherwise return initialPage (default 1)
      return pages.length > 0 ? pages.length : initialPageRef.current;
    }
    return paginatedPage;
  }, [triggerInfinite, infiniteQuery.data?.pages, paginatedPage, queryClient, infiniteQueryKey]);

  const fetchPage: ValueOrSetter<number> = useCallback(
    numberOrgFn => {
      if (triggerInfinite) {
        const next = typeof numberOrgFn === 'function' ? (numberOrgFn as (n: number) => number)(page) : numberOrgFn;
        const targetCount = Math.max(0, next);
        const cachedData = queryClient.getQueryData<{ pages?: Array<ClerkPaginatedResponse<any>> }>(infiniteQueryKey);
        const pages = infiniteQuery.data?.pages ?? cachedData?.pages ?? [];
        const currentCount = pages.length;
        const toFetch = targetCount - currentCount;
        if (toFetch > 0) {
          void infiniteQuery.fetchNextPage({ cancelRefetch: false });
        }
        return;
      }
      return setPaginatedPage(numberOrgFn);
    },
    [infiniteQuery, page, triggerInfinite, queryClient, infiniteQueryKey],
  );

  const data = useMemo(() => {
    if (triggerInfinite) {
      const cachedData = queryClient.getQueryData<{ pages?: Array<ClerkPaginatedResponse<any>> }>(infiniteQueryKey);
      // When query is disabled, the hook's data is stale, so only read from cache
      const pages = queriesEnabled ? (infiniteQuery.data?.pages ?? cachedData?.pages ?? []) : (cachedData?.pages ?? []);
      return pages.map((a: ClerkPaginatedResponse<any>) => a?.data).flat() ?? [];
    }

    // When query is disabled (via enabled flag), the hook's data is stale, so only read from cache
    // This ensures that after cache clearing, we return empty data
    const pageData = queriesEnabled
      ? (singlePageQuery.data ?? queryClient.getQueryData<ClerkPaginatedResponse<any>>(pagesQueryKey))
      : queryClient.getQueryData<ClerkPaginatedResponse<any>>(pagesQueryKey);
    return pageData?.data ?? [];
  }, [
    queriesEnabled,
    forceUpdateCounter,
    triggerInfinite,
    singlePageQuery.data,
    infiniteQuery.data,
    queryClient,
    pagesQueryKey,
    infiniteQueryKey,
  ]);

  const count = useMemo(() => {
    if (triggerInfinite) {
      const cachedData = queryClient.getQueryData<{ pages?: Array<ClerkPaginatedResponse<any>> }>(infiniteQueryKey);
      // When query is disabled, the hook's data is stale, so only read from cache
      const pages = queriesEnabled ? (infiniteQuery.data?.pages ?? cachedData?.pages ?? []) : (cachedData?.pages ?? []);
      return pages[pages.length - 1]?.total_count || 0;
    }

    // When query is disabled (via enabled flag), the hook's data is stale, so only read from cache
    // This ensures that after cache clearing, we return 0
    const pageData = queriesEnabled
      ? (singlePageQuery.data ?? queryClient.getQueryData<ClerkPaginatedResponse<any>>(pagesQueryKey))
      : queryClient.getQueryData<ClerkPaginatedResponse<any>>(pagesQueryKey);
    return pageData?.total_count ?? 0;
  }, [
    queriesEnabled,
    forceUpdateCounter,
    triggerInfinite,
    singlePageQuery.data,
    infiniteQuery.data,
    queryClient,
    pagesQueryKey,
    infiniteQueryKey,
  ]);

  const isLoading = triggerInfinite ? infiniteQuery.isLoading : singlePageQuery.isLoading;
  const isFetching = triggerInfinite ? infiniteQuery.isFetching : singlePageQuery.isFetching;
  const error = (triggerInfinite ? (infiniteQuery.error as any) : singlePageQuery.error) ?? null;
  const isError = !!error;

  const fetchNext = useCallback(() => {
    if (triggerInfinite) {
      void infiniteQuery.fetchNextPage({ cancelRefetch: false });
      return;
    }
    setPaginatedPage(n => Math.max(0, n + 1));
  }, [infiniteQuery, triggerInfinite]);

  const fetchPrevious = useCallback(() => {
    if (triggerInfinite) {
      // not natively supported by forward-only pagination; noop
      return;
    }
    setPaginatedPage(n => Math.max(0, n - 1));
  }, [triggerInfinite]);

  const offsetCount = (initialPageRef.current - 1) * pageSizeRef.current;
  const pageCount = Math.ceil((count - offsetCount) / pageSizeRef.current);
  const hasNextPage = triggerInfinite
    ? Boolean(infiniteQuery.hasNextPage)
    : count - offsetCount * pageSizeRef.current > page * pageSizeRef.current;
  const hasPreviousPage = triggerInfinite
    ? Boolean(infiniteQuery.hasPreviousPage)
    : (page - 1) * pageSizeRef.current > offsetCount * pageSizeRef.current;

  const setData: CacheSetter = value => {
    if (triggerInfinite) {
      queryClient.setQueryData(infiniteQueryKey, (prevValue: any = {}) => {
        const prevPages = Array.isArray(prevValue?.pages) ? prevValue.pages : [];
        const nextPages = (typeof value === 'function' ? value(prevPages) : value) as Array<
          ClerkPaginatedResponse<any>
        >;
        return { ...prevValue, pages: nextPages };
      });
      // Force re-render to reflect cache changes
      forceUpdate(n => n + 1);
      return Promise.resolve();
    }
    queryClient.setQueryData(pagesQueryKey, (prevValue: any = { data: [], total_count: 0 }) => {
      const nextValue = (typeof value === 'function' ? value(prevValue) : value) as ClerkPaginatedResponse<any>;
      return nextValue;
    });
    // Force re-render to reflect cache changes
    forceUpdate(n => n + 1);
    return Promise.resolve();
  };

  const revalidate = () => {
    if (triggerInfinite) {
      return queryClient.invalidateQueries({ queryKey: infiniteQueryKey });
    }
    return queryClient.invalidateQueries({ queryKey: pagesQueryKey });
  };

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
