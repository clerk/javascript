'use client';

import type { InfiniteData, QueryKey } from '@tanstack/query-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ClerkPaginatedResponse } from '../../types';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkInfiniteQuery } from '../clerk-rq/useInfiniteQuery';
import { useClerkQuery } from '../clerk-rq/useQuery';
import type { CacheSetter, ValueOrSetter } from '../types';
import type { UsePagesOrInfiniteSignature } from './usePageOrInfinite.types';
import { getDifferentKeys, useWithSafeValues } from './usePagesOrInfinite.shared';

export const usePagesOrInfinite: UsePagesOrInfiniteSignature = (params, fetcher, config, cacheKeys) => {
  const [paginatedPage, setPaginatedPage] = useState(params.initialPage ?? 1);
  const [cacheTick, forceCacheTick] = useState(0);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(params.initialPage ?? 1);
  const pageSizeRef = useRef(params.pageSize ?? 10);

  const enabled = config.enabled ?? true;
  const triggerInfinite = config.infinite ?? false;
  const cacheMode = config.__experimental_mode === 'cache';
  const signedInConstraint = config.isSignedIn ?? true;
  // TODO: Support keepPreviousData
  // const _keepPreviousData = config.keepPreviousData ?? false;

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

  const serializedPagesQueryKey = useMemo(() => JSON.stringify(pagesQueryKey), [pagesQueryKey]);

  const cachedSinglePageData = cacheMode
    ? queryClient.getQueryData<ClerkPaginatedResponse<any>>(pagesQueryKey)
    : undefined;

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
    enabled: enabled && !cacheMode && !triggerInfinite && Boolean(fetcher) && signedInConstraint,
    ...(cacheMode && cachedSinglePageData
      ? {
          initialData: cachedSinglePageData,
          placeholderData: cachedSinglePageData,
        }
      : {}),
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

  const serializedInfiniteQueryKey = useMemo(() => JSON.stringify(infiniteQueryKey), [infiniteQueryKey]);

  const cachedInfiniteData = cacheMode
    ? queryClient.getQueryData<InfiniteData<ClerkPaginatedResponse<any>>>(infiniteQueryKey)
    : undefined;

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
    enabled: enabled && !cacheMode && triggerInfinite && Boolean(fetcher) && signedInConstraint,
    ...(cacheMode && cachedInfiniteData
      ? {
          initialData: cachedInfiniteData,
          placeholderData: cachedInfiniteData,
        }
      : {}),
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

  const resolvedSinglePageData = cacheMode ? (cachedSinglePageData ?? singlePageQuery.data) : singlePageQuery.data;

  const resolvedInfiniteData: InfiniteData<ClerkPaginatedResponse<any>> | undefined = cacheMode
    ? (cachedInfiniteData ?? infiniteQuery.data)
    : infiniteQuery.data;

  const data = useMemo(() => {
    if (triggerInfinite) {
      const pages = resolvedInfiniteData?.pages ?? [];
      return pages.map(a => a?.data).flat() ?? [];
    }
    return resolvedSinglePageData?.data ?? [];
  }, [triggerInfinite, resolvedSinglePageData, resolvedInfiniteData, cacheTick]);

  const count = useMemo(() => {
    if (triggerInfinite) {
      const pages = resolvedInfiniteData?.pages ?? [];
      return pages[pages.length - 1]?.total_count || 0;
    }
    return resolvedSinglePageData?.total_count ?? 0;
  }, [triggerInfinite, resolvedSinglePageData, resolvedInfiniteData, cacheTick]);

  useEffect(() => {
    if (!cacheMode) {
      return;
    }

    const queryCache = queryClient.getQueryCache();

    const unsubscribe = queryCache.subscribe(event => {
      if (event.type !== 'queryUpdated' && event.type !== 'queryAdded') {
        return;
      }

      const key = event.query.queryKey as QueryKey | undefined;
      if (!key) {
        return;
      }

      const keyString = (() => {
        try {
          return JSON.stringify(key);
        } catch (_err) {
          return undefined;
        }
      })();

      if (!keyString) {
        return;
      }

      if (
        (serializedPagesQueryKey && keyString === serializedPagesQueryKey) ||
        (serializedInfiniteQueryKey && keyString === serializedInfiniteQueryKey)
      ) {
        forceCacheTick(t => t + 1);
      }
    });

    return unsubscribe;
  }, [cacheMode, queryClient, serializedPagesQueryKey, serializedInfiniteQueryKey, triggerInfinite]);

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

  const setData: CacheSetter = async updater => {
    if (triggerInfinite) {
      const previous = queryClient.getQueryData<InfiniteData<ClerkPaginatedResponse<any>> | undefined>(
        infiniteQueryKey,
      );

      const currentPages = previous?.pages;
      const nextPages =
        typeof updater === 'function'
          ? await (
              updater as (
                existing?: (ClerkPaginatedResponse<any> | undefined)[],
              ) =>
                | Promise<(ClerkPaginatedResponse<any> | undefined)[] | undefined>
                | (ClerkPaginatedResponse<any> | undefined)[]
                | undefined
            )(currentPages)
          : (updater as (ClerkPaginatedResponse<any> | undefined)[] | undefined);

      if (typeof nextPages === 'undefined') {
        return previous;
      }

      const result = queryClient.setQueryData<InfiniteData<ClerkPaginatedResponse<any>> | undefined>(
        infiniteQueryKey,
        prev => {
          const base = prev ?? { pages: [], pageParams: [] };
          return {
            ...base,
            pages: nextPages,
          };
        },
      );

      if (cacheMode) {
        forceCacheTick(t => t + 1);
      }

      return result;
    }

    const previous = queryClient.getQueryData<ClerkPaginatedResponse<any> | undefined>(pagesQueryKey);
    const nextValue =
      typeof updater === 'function'
        ? await (
            updater as (
              existing?: ClerkPaginatedResponse<any> | undefined,
            ) => Promise<ClerkPaginatedResponse<any> | undefined> | ClerkPaginatedResponse<any> | undefined
          )(previous)
        : (updater as ClerkPaginatedResponse<any> | undefined);

    if (typeof nextValue === 'undefined') {
      return previous;
    }

    const result = queryClient.setQueryData<ClerkPaginatedResponse<any> | undefined>(pagesQueryKey, nextValue);

    if (cacheMode) {
      forceCacheTick(t => t + 1);
    }

    return result;
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
