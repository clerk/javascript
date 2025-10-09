/**
 * Stripped down version of useBaseQuery from @tanstack/query-core.
 * This implementation allows for an observer to be created every time a query client changes.
 */

'use client';
import type { QueryKey, QueryObserver, QueryObserverResult } from '@tanstack/query-core';
import { noop, notifyManager } from '@tanstack/query-core';
import * as React from 'react';

import type { UseBaseQueryOptions } from './types';
import { useClerkQueryClient } from './use-clerk-query-client';

/**
 *
 */
export function useBaseQuery<TQueryFnData, TError, TData, TQueryData, TQueryKey extends QueryKey>(
  options: UseBaseQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>,
  Observer: typeof QueryObserver,
): QueryObserverResult<TData, TError> {
  const client = useClerkQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);

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

  // Handle result property usage tracking
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
