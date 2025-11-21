import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ClerkPaginatedResponse } from '../../types';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkInfiniteQuery } from '../clerk-rq/useInfiniteQuery';
import { useClerkQuery } from '../clerk-rq/useQuery';
import type { CacheSetter, ValueOrSetter } from '../types';
import type { UsePagesOrInfiniteSignature } from './usePageOrInfinite.types';
import { useWithSafeValues } from './usePagesOrInfinite.shared';
import { usePreviousValue } from './usePreviousValue';

export const usePagesOrInfinite: UsePagesOrInfiniteSignature = params => {
  const { fetcher, config, keys } = params;

  const [paginatedPage, setPaginatedPage] = useState(config.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(config.initialPage ?? 1);
  const pageSizeRef = useRef(config.pageSize ?? 10);

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
    const [stablePrefix, authenticated, tracked, untracked] = keys.queryKey;

    return [
      stablePrefix,
      authenticated,
      tracked,
      {
        ...untracked,
        args: {
          ...untracked.args,
          initialPage: paginatedPage,
          pageSize: pageSizeRef.current,
        },
      },
    ] as const;
  }, [keys.queryKey, paginatedPage]);

  const singlePageQuery = useClerkQuery({
    queryKey: pagesQueryKey,
    queryFn: ({ queryKey }) => {
      const { args } = queryKey[3];

      if (!fetcher) {
        return undefined as any;
      }

      return fetcher(args);
    },
    staleTime: 60_000,
    enabled: queriesEnabled && !triggerInfinite,
    // Use placeholderData to keep previous data while fetching new page
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
  });

  // Infinite mode: accumulate pages
  const infiniteQueryKey = useMemo(() => {
    const [stablePrefix, authenticated, tracked, untracked] = keys.queryKey;

    return [stablePrefix + '-inf', authenticated, tracked, untracked] as const;
  }, [keys.queryKey]);

  const infiniteQuery = useClerkInfiniteQuery<ClerkPaginatedResponse<any>, any, any, typeof infiniteQueryKey, any>({
    queryKey: infiniteQueryKey,
    initialPageParam: config.initialPage ?? 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const total = lastPage?.total_count ?? 0;
      const consumed = (allPages.length + (config.initialPage ? config.initialPage - 1 : 0)) * (config.pageSize ?? 10);
      return consumed < total ? (lastPageParam as number) + 1 : undefined;
    },
    queryFn: ({ pageParam, queryKey }) => {
      const { args } = queryKey[3];
      if (!fetcher) {
        return undefined as any;
      }
      return fetcher({ ...args, initialPage: pageParam, pageSize: pageSizeRef.current });
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
      queryClient.removeQueries({
        predicate: query => {
          const [stablePrefix, authenticated] = query.queryKey;
          return (
            authenticated === true &&
            typeof stablePrefix === 'string' &&
            (stablePrefix === keys.queryKey[0] || stablePrefix === keys.queryKey[0] + '-inf')
          );
        },
      });

      // Reset paginated page to initial
      setPaginatedPage(initialPageRef.current);

      // Force re-render to reflect cache changes
      void Promise.resolve().then(() => forceUpdate(n => n + 1));
    }
  }, [isSignedIn, queryClient, previousIsSignedIn, forceUpdate]);

  // Compute data, count and page from the same data source to ensure consistency
  const computedValues = useMemo(() => {
    if (triggerInfinite) {
      // Read from query data first, fallback to cache
      const cachedData = queryClient.getQueryData<{ pages?: Array<ClerkPaginatedResponse<any>> }>(infiniteQueryKey);
      const pages = queriesEnabled ? (infiniteQuery.data?.pages ?? cachedData?.pages ?? []) : (cachedData?.pages ?? []);

      // Ensure pages is always an array and filter out null/undefined pages
      const validPages = Array.isArray(pages) ? pages.filter(Boolean) : [];

      return {
        data:
          validPages
            .map((a: ClerkPaginatedResponse<any>) => a?.data)
            .flat()
            .filter(Boolean) ?? [],
        count: validPages[validPages.length - 1]?.total_count ?? 0,
        page: validPages.length > 0 ? validPages.length : initialPageRef.current,
      };
    }

    // When query is disabled (via enabled flag), the hook's data is stale, so only read from cache
    // This ensures that after cache clearing, we return consistent empty state
    const pageData = queriesEnabled
      ? (singlePageQuery.data ?? queryClient.getQueryData<ClerkPaginatedResponse<any>>(pagesQueryKey))
      : queryClient.getQueryData<ClerkPaginatedResponse<any>>(pagesQueryKey);

    return {
      data: Array.isArray(pageData?.data) ? pageData.data : [],
      count: typeof pageData?.total_count === 'number' ? pageData.total_count : 0,
      page: paginatedPage,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- forceUpdateCounter is used to trigger re-renders for cache updates
  }, [
    queriesEnabled,
    forceUpdateCounter,
    triggerInfinite,
    infiniteQuery.data?.pages,
    singlePageQuery.data,
    queryClient,
    infiniteQueryKey,
    pagesQueryKey,
    paginatedPage,
  ]);

  const { data, count, page } = computedValues;

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

  const isLoading = triggerInfinite ? infiniteQuery.isLoading : singlePageQuery.isLoading;
  const isFetching = triggerInfinite ? infiniteQuery.isFetching : singlePageQuery.isFetching;
  const error = (triggerInfinite ? infiniteQuery.error : singlePageQuery.error) ?? null;
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
      // Force immediate re-render to reflect cache changes
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

  const revalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: keys.invalidationKey });
    const [stablePrefix, ...rest] = keys.invalidationKey;
    return queryClient.invalidateQueries({ queryKey: [stablePrefix + '-inf', ...rest] });
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
