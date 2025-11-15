'use client';
import type { DefaultError, NoInfer, QueryKey } from '@tanstack/query-core';

import type { DefinedInitialDataOptions, UndefinedInitialDataOptions } from './queryOptions';
import type { DefinedUseQueryResult, UseQueryOptions, UseQueryResult } from './types';
import type { CommonQueryResult, DistributivePick } from './useBaseQuery';
import { useBaseQuery } from './useBaseQuery';

export function useClerkQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): DistributivePick<DefinedUseQueryResult<NoInfer<TData>, TError>, CommonQueryResult>;

export function useClerkQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): DistributivePick<UseQueryResult<NoInfer<TData>, TError>, CommonQueryResult>;

export function useClerkQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): DistributivePick<UseQueryResult<NoInfer<TData>, TError>, CommonQueryResult>;

/**
 *
 */
export function useClerkQuery(options: UseQueryOptions) {
  return useBaseQuery(options, 'query');
}
