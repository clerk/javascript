import type {
  DefaultError,
  DefinedInfiniteQueryObserverResult,
  DefinedQueryObserverResult,
  InfiniteQueryObserverOptions,
  InfiniteQueryObserverResult,
  OmitKeyof,
  QueryKey,
  QueryObserverOptions,
  QueryObserverResult,
} from '@tanstack/query-core';

export type AnyUseBaseQueryOptions = UseBaseQueryOptions<any, any, any, any, any>;
export interface UseBaseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey> {
  /**
   * Set this to `false` to unsubscribe this observer from updates to the query cache.
   * Defaults to `true`.
   */
  subscribed?: boolean;
}

export type AnyUseQueryOptions = UseQueryOptions<any, any, any, any>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UseQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends OmitKeyof<UseBaseQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>, 'suspense'> {}

export type AnyUseInfiniteQueryOptions = UseInfiniteQueryOptions<any, any, any, any, any>;
export interface UseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> extends OmitKeyof<InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, 'suspense'> {
  /**
   * Set this to `false` to unsubscribe this observer from updates to the query cache.
   * Defaults to `true`.
   */
  subscribed?: boolean;
}

export type UseBaseQueryResult<TData = unknown, TError = DefaultError> = QueryObserverResult<TData, TError>;

export type UseQueryResult<TData = unknown, TError = DefaultError> = UseBaseQueryResult<TData, TError>;

export type DefinedUseQueryResult<TData = unknown, TError = DefaultError> = DefinedQueryObserverResult<TData, TError>;

export type UseInfiniteQueryResult<TData = unknown, TError = DefaultError> = InfiniteQueryObserverResult<TData, TError>;

export type DefinedUseInfiniteQueryResult<TData = unknown, TError = DefaultError> = DefinedInfiniteQueryObserverResult<
  TData,
  TError
>;
