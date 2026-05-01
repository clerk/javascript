/**
 * Stripped down version of useBaseQuery from @tanstack/query-core.
 * This implementation allows for an observer to be created every time a query client changes.
 */

'use client';
import type { DefaultedQueryObserverOptions, QueryKey, QueryObserver, QueryObserverResult } from '@tanstack/query-core';
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
export function useBaseQuery<TQueryFnData, TError, TData, TQueryData, TQueryKey extends QueryKey>(
  options: UseBaseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
  Observer: typeof QueryObserver,
): DistributivePick<QueryObserverResult<TData, TError>, CommonQueryResult> {
  const [client, isQueryClientLoaded] = useClerkQueryClient();
  const defaultedOptions = isQueryClientLoaded
    ? client.defaultQueryOptions(options)
    : (options as DefaultedQueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>);

  // Make sure results are optimistically set in fetching state before subscribing or updating options
  defaultedOptions._optimisticResults = 'optimistic';

  const observer = React.useMemo(() => {
    return new Observer<TQueryFnData, TError, TData, TQueryData, TQueryKey>(client, defaultedOptions);
  }, [client]);

  // note: this must be called before useSyncExternalStore
  const result = observer.getOptimisticResult(defaultedOptions);

  const shouldSubscribe = options.subscribed !== false;
  React.useSyncExternalStore(
    React.useCallback(
      onStoreChange => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;

        // Update result to make sure we did not miss any query updates
        // between creating the observer and subscribing to it.
        observer.updateResult();

        return unsubscribe;
      },
      [observer, shouldSubscribe],
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult(),
  );

  React.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);

  if (!isQueryClientLoaded) {
    // Return a dummy result that matches RQ's pending state until the query client loads
    // (SSR, or on the client before clerk-js finishes bootstrapping it).
    // `isLoading` reflects whether the query *would* run once the client attaches — otherwise
    // consumers see `isLoading: false` with empty data and render a spurious "no results" state
    // in the window between clerk.loaded and the query client being ready.
    const isEnabled = options.enabled !== false;
    return {
      data: undefined,
      error: null,
      isLoading: isEnabled,
      isFetching: false,
      status: 'pending',
    };
  }

  // Handle result property usage tracking
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
