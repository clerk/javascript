import type { DefaultError, InfiniteData, QueryKey, QueryObserver } from '@tanstack/query-core';
import { InfiniteQueryObserver } from '@tanstack/query-core';

import type { DefinedInitialDataInfiniteOptions, UndefinedInitialDataInfiniteOptions } from './infiniteQueryOptions';
import type { DefinedUseInfiniteQueryResult, UseInfiniteQueryOptions, UseInfiniteQueryResult } from './types';
import { useBaseQuery } from './useBaseQuery';

export function useClerkInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): DefinedUseInfiniteQueryResult<TData, TError>;

export function useClerkInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryResult<TData, TError>;

export function useClerkInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryResult<TData, TError>;
/**
 *
 */
export function useClerkInfiniteQuery(options: UseInfiniteQueryOptions) {
  return useBaseQuery(options, InfiniteQueryObserver as unknown as typeof QueryObserver);
}
