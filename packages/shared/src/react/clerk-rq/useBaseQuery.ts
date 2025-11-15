/**
 * Stripped down version of useBaseQuery from @tanstack/query-core.
 * This implementation allows for an observer to be created every time a query client changes.
 */

'use client';
import type { DefaultedQueryObserverOptions, QueryKey, QueryObserverResult } from '@tanstack/query-core';
import { noop, notifyManager } from '@tanstack/query-core';
import * as React from 'react';

import type { UseBaseQueryOptions } from './types';
import { useClerkQueryClient } from './use-clerk-query-client';

export type DistributivePick<T, K extends PropertyKey> = T extends unknown ? Pick<T, Extract<K, keyof T>> : never;

export type CommonQueryResult = 'data' | 'error' | 'isLoading' | 'isFetching' | 'status';

/**
 * An alternative `useBaseQuery` implementation that allows for an observer to be created every time a query client changes.
 *
 * @internal
 */
export type ObserverKind = 'query' | 'infinite';

/**
 *
 */
export function useBaseQuery<TQueryFnData, TError, TData, TQueryData, TQueryKey extends QueryKey>(
  options: UseBaseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
  observerKind: ObserverKind,
): DistributivePick<QueryObserverResult<TData, TError>, CommonQueryResult> {
  const [client, isQueryClientLoaded, clerkQueryClient] = useClerkQueryClient();
  const ObserverCtor = React.useMemo(() => {
    if (!clerkQueryClient || clerkQueryClient.__tag !== 'clerk-rq-client') {
      return undefined;
    }
    return observerKind === 'query'
      ? clerkQueryClient.QueryObserver
      : (clerkQueryClient.InfiniteQueryObserver as unknown as typeof clerkQueryClient.QueryObserver);
  }, [clerkQueryClient, observerKind]);
  const defaultedOptions = isQueryClientLoaded
    ? client.defaultQueryOptions(options)
    : (options as DefaultedQueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>);

  // Make sure results are optimistically set in fetching state before subscribing or updating options
  defaultedOptions._optimisticResults = 'optimistic';

  const observer = React.useMemo(() => {
    if (!ObserverCtor) {
      return null;
    }
    return new ObserverCtor<TQueryFnData, TError, TData, TQueryData, TQueryKey>(client, defaultedOptions);
  }, [ObserverCtor, client]);

  // note: this must be called before useSyncExternalStore
  const fallbackResult = React.useMemo(
    () => ({
      data: undefined,
      error: null,
      isLoading: false,
      isFetching: false,
      status: 'pending' as const,
    }),
    [],
  );

  const result = observer?.getOptimisticResult(defaultedOptions) ?? fallbackResult;

  const shouldSubscribe = options.subscribed !== false;
  React.useSyncExternalStore(
    React.useCallback(
      onStoreChange => {
        if (!observer || !shouldSubscribe) {
          return noop;
        }
        const unsubscribe = observer.subscribe(notifyManager.batchCalls(onStoreChange));

        // Update result to make sure we did not miss any query updates
        // between creating the observer and subscribing to it.
        observer.updateResult();

        return unsubscribe;
      },
      [observer, shouldSubscribe],
    ),
    () => observer?.getCurrentResult() ?? fallbackResult,
    () => observer?.getCurrentResult() ?? fallbackResult,
  );

  React.useEffect(() => {
    observer?.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);

  if (!isQueryClientLoaded || !ObserverCtor || !observer) {
    // In this step we attempt to return a dummy result that matches RQ's pending state while on SSR or until the query client is loaded on the client (after clerk-js loads).
    // When the query client is not loaded, we return the result as if the query was not enabled.
    // `isLoading` and `isFetching` need to be `false` because we can't know if the query will be enabled during SSR since most conditions rely on client-only data that are available after clerk-js loads.
    return fallbackResult;
  }

  // Handle result property usage tracking
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
