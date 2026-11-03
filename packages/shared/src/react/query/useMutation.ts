import type { DefaultError, MutationObserverOptions } from '@tanstack/query-core';
import { MutationObserver, notifyManager } from '@tanstack/query-core';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { useClerkQueryClient } from './use-clerk-query-client';

export function useClerkMutation<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>(
  options: MutationObserverOptions<TData, TError, TVariables, TContext>,
) {
  const [client, isLoaded] = useClerkQueryClient();
  const [state, setState] = useState(() => ({
    client,
    observer: new MutationObserver<TData, TError, TVariables, TContext>(client, options),
  }));
  if (state.client !== client) {
    setState({ client, observer: new MutationObserver<TData, TError, TVariables, TContext>(client, options) });
  }
  const { observer } = state;

  useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);

  const result = useSyncExternalStore(
    useCallback(onStoreChange => observer.subscribe(notifyManager.batchCalls(onStoreChange)), [observer]),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult(),
  );

  const mutateAsync = useCallback(
    (variables: TVariables) => {
      if (!isLoaded) {
        return Promise.reject(new Error('The Clerk query client is not available.'));
      }
      return observer.mutate(variables);
    },
    [observer, isLoaded],
  );

  return { ...result, mutate: mutateAsync, mutateAsync };
}
