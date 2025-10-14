'use client';

import type { ClerkPaginatedResponse } from '@clerk/types';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkInfiniteQuery } from '../clerk-rq/useInfiniteQuery';
import { useClerkQuery } from '../clerk-rq/useQuery';
import type { CacheSetter, ValueOrSetter } from '../types';
import type { UsePagesOrInfiniteSignature } from './usePageOrInfinite.types';
import { getDifferentKeys, useWithSafeValues } from './usePagesOrInfinite.shared';

export const usePagesOrInfinite: UsePagesOrInfiniteSignature = (params, fetcher, config, cacheKeys) => {
  const [paginatedPage, setPaginatedPage] = useState(params.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(params.initialPage ?? 1);
  const pageSizeRef = useRef(params.pageSize ?? 10);

  const enabled = config.enabled ?? true;
  const triggerInfinite = config.infinite ?? false;
  // Support keepPreviousData
  const _keepPreviousData = config.keepPreviousData ?? false;

  const [queryClient] = useClerkQueryClient();

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
      // console.log('-hehe', key, requestParams);

      // @ts-ignore - params type differs slightly but is structurally compatible
      return fetcher(requestParams as Params);
    },
    staleTime: 60_000,
    enabled: enabled && !triggerInfinite && Boolean(fetcher),
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
    enabled: enabled && triggerInfinite && Boolean(fetcher),
  });

  const page = useMemo(() => {
    if (triggerInfinite) {
      return (infiniteQuery.data?.pages?.length ?? 0) || 0;
    }
    return paginatedPage;
  }, [triggerInfinite, infiniteQuery.data?.pages?.length, paginatedPage]);

  const fetchPage: ValueOrSetter<number> = useCallback(
    numberOrgFn => {
      if (triggerInfinite) {
        const next = typeof numberOrgFn === 'function' ? (numberOrgFn as (n: number) => number)(page) : numberOrgFn;
        const targetCount = Math.max(0, next);
        const currentCount = infiniteQuery.data?.pages?.length ?? 0;
        const toFetch = targetCount - currentCount;
        if (toFetch > 0) {
          void infiniteQuery.fetchNextPage({ cancelRefetch: false });
        }
        return;
      }
      return setPaginatedPage(numberOrgFn);
    },
    [infiniteQuery, page, triggerInfinite],
  );

  const data = useMemo(() => {
    if (triggerInfinite) {
      return infiniteQuery.data?.pages?.map(a => a?.data).flat() ?? [];
    }
    return singlePageQuery.data?.data ?? [];
  }, [triggerInfinite, singlePageQuery.data, infiniteQuery.data]);

  const count = useMemo(() => {
    if (triggerInfinite) {
      const pages = infiniteQuery.data?.pages ?? [];
      return pages[pages.length - 1]?.total_count || 0;
    }
    return singlePageQuery.data?.total_count ?? 0;
  }, [triggerInfinite, singlePageQuery.data, infiniteQuery.data]);

  const isLoading = triggerInfinite ? infiniteQuery.isLoading : singlePageQuery.isLoading;
  const isFetching = triggerInfinite ? infiniteQuery.isFetching : singlePageQuery.isFetching;
  const error = (triggerInfinite ? (infiniteQuery.error as any) : (singlePageQuery.error as any)) ?? null;
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
      return queryClient.setQueryData(infiniteQueryKey, (prevValue: any) => {
        return { ...prevValue, pages: typeof value === 'function' ? value(prevValue.pages) : value };
      }) as any;
    }
    return queryClient.setQueryData(pagesQueryKey, value) as any;
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
