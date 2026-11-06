import type {
  DefaultError,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { useMosaicQueryClient } from './use-mosaic-query-client';

export function useMosaicQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>): DefinedUseQueryResult<TData, TError>;

export function useMosaicQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError>;

export function useMosaicQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError>;

export function useMosaicQuery(options: UseQueryOptions) {
  return useQuery(options, useMosaicQueryClient());
}
