'use client';
import type { DefaultError, NoInfer, QueryKey } from '@tanstack/query-core';
import { QueryObserver } from '@tanstack/query-core';

import type { DefinedInitialDataOptions, UndefinedInitialDataOptions } from './queryOptions';
import type { DefinedUseQueryResult, UseQueryOptions, UseQueryResult } from './types';
import { useBaseQuery } from './useBaseQuery';

export function useClerkQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): DefinedUseQueryResult<NoInfer<TData>, TError>;

export function useClerkQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<NoInfer<TData>, TError>;

export function useClerkQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<NoInfer<TData>, TError>;

/**
 *
 */
export function useClerkQuery(options: UseQueryOptions) {
  return useBaseQuery(options, QueryObserver);
}
