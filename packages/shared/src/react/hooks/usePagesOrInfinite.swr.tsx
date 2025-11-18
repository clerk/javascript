'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useSWR, useSWRInfinite } from '../clerk-swr';
import type { CacheSetter, ValueOrSetter } from '../types';
import type { UsePagesOrInfiniteSignature } from './usePageOrInfinite.types';
import { getDifferentKeys, useWithSafeValues } from './usePagesOrInfinite.shared';
import { usePreviousValue } from './usePreviousValue';

const cachingSWROptions = {
  dedupingInterval: 1000 * 60,
  focusThrottleInterval: 1000 * 60 * 2,
} satisfies Parameters<typeof useSWR>[2];

const cachingSWRInfiniteOptions = {
  ...cachingSWROptions,
  revalidateFirstPage: false,
} satisfies Parameters<typeof useSWRInfinite>[2];

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
export const usePagesOrInfinite: UsePagesOrInfiniteSignature = params => {
  const { fetcher, config, keys } = params;
  const [paginatedPage, setPaginatedPage] = useState(config.initialPage ?? 1);

  // Cache initialPage and initialPageSize until unmount
  const initialPageRef = useRef(config.initialPage ?? 1);
  const pageSizeRef = useRef(config.pageSize ?? 10);

  const enabled = config.enabled ?? true;
  const cacheMode = config.__experimental_mode === 'cache';
  const triggerInfinite = config.infinite ?? false;
  const keepPreviousData = config.keepPreviousData ?? false;
  const isSignedIn = config.isSignedIn;

  const pagesCacheKey = {
    type: keys.queryKey[0],
    ...keys.queryKey[2],
    ...keys.queryKey[3].args,
    initialPage: paginatedPage,
    pageSize: pageSizeRef.current,
  };

  const previousIsSignedIn = usePreviousValue(isSignedIn);

  // cacheMode being `true` indicates that the cache key is defined, but the fetcher is not.
  // This allows to ready the cache instead of firing a request.
  const shouldFetch = !triggerInfinite && enabled && (!cacheMode ? !!fetcher : true);

  // Attention:
  //
  // This complex logic is necessary to ensure that the cached data is not used when the user is signed out.
  // `useSWR` with `key` set to `null` and `keepPreviousData` set to `true` will return the previous cached data until the hook unmounts.
  // So for hooks that render authenticated data, we need to ensure that the cached data is not used when the user is signed out.
  //
  // 1. Fetcher should not fire if user is signed out on mount. (fetcher does not run, loading states are not triggered)
  // 2. If user was signed in and then signed out, cached data should become null. (fetcher runs and returns null, loading states are triggered)
  //
  // We achieve (2) by setting the key to the cache key when the user transitions to signed out and forcing the fetcher to return null.
  const swrKey =
    typeof isSignedIn === 'boolean'
      ? previousIsSignedIn === true && isSignedIn === false
        ? pagesCacheKey
        : isSignedIn
          ? shouldFetch
            ? pagesCacheKey
            : null
          : null
      : shouldFetch
        ? pagesCacheKey
        : null;

  const swrFetcher =
    !cacheMode && !!fetcher
      ? (cacheKeyParams: Record<string, unknown>) => {
          if (isSignedIn === false || shouldFetch === false) {
            return null;
          }
          const requestParams = getDifferentKeys(cacheKeyParams, { type: keys.queryKey[0], ...keys.queryKey[2] });
          // @ts-ignore - fetcher expects Params subset; narrowing at call-site
          return fetcher(requestParams);
        }
      : null;

  // TODO: Replace useSWR with the react-query equivalent.
  const {
    data: swrData,
    isValidating: swrIsValidating,
    isLoading: swrIsLoading,
    error: swrError,
    mutate: swrMutate,
  } = useSWR(swrKey, swrFetcher, { keepPreviousData, ...cachingSWROptions });

  // Attention:
  //
  // Cache behavior for infinite loading when signing out:
  //
  // Unlike `useSWR` above (which requires complex transition handling), `useSWRInfinite` has simpler sign-out semantics:
  // 1. When user is signed out on mount, the key getter returns `null`, preventing any fetches.
  // 2. When user transitions from signed in to signed out, the key getter returns `null` for all page indices.
  // 3. When `useSWRInfinite`'s key getter returns `null`, SWR will not fetch data and considers that page invalid.
  // 4. Unlike paginated mode, `useSWRInfinite` does not support `keepPreviousData`, so there's no previous data retention.
  //
  // This simpler behavior works because:
  // - `useSWRInfinite` manages multiple pages internally, each with its own cache key
  // - When the key getter returns `null`, all page fetches are prevented and pages become invalid
  // - Without `keepPreviousData`, the hook will naturally reflect the empty/invalid state
  //
  // Result: No special transition logic needed - just return `null` from key getter when `isSignedIn === false`.
  // TODO: Replace useSWRInfinite with the react-query equivalent.
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
      if (!triggerInfinite || !enabled || isSignedIn === false) {
        return null;
      }

      return {
        type: keys.queryKey[0],
        ...keys.queryKey[2],
        ...keys.queryKey[3].args,
        initialPage: initialPageRef.current + pageIndex,
        pageSize: pageSizeRef.current,
      };
    },
    cacheKeyParams => {
      // @ts-ignore - fetcher expects Params subset; narrowing at call-site
      const requestParams = getDifferentKeys(cacheKeyParams, { type: keys.queryKey[0], ...keys.queryKey[2] });
      // @ts-ignore - fetcher expects Params subset; narrowing at call-site
      return fetcher?.(requestParams);
    },
    cachingSWRInfiniteOptions,
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
    // Let the hook return type define this type
    revalidate: revalidate as any,
    // Let the hook return type define this type
    setData: setData as any,
  };
};

export { useWithSafeValues };
