import type { QueryClient } from '@tanstack/query-core';
import { useEffect, useState } from 'react';

import { useClerkInstanceContext } from '../contexts';

export type RecursiveMock = {
  (...args: unknown[]): RecursiveMock;
} & {
  readonly [key in string | symbol]: RecursiveMock;
};

/**
 * Creates a recursively self-referential Proxy that safely handles:
 * - Arbitrary property access (e.g., obj.any.prop.path)
 * - Function calls at any level (e.g., obj.a().b.c())
 * - Construction (e.g., new obj.a.b())
 *
 * Always returns itself to allow infinite chaining without throwing.
 */
function createRecursiveProxy(label: string): RecursiveMock {
  // The callable target for the proxy so that `apply` works
  const callableTarget = function noop(): void {};

  // eslint-disable-next-line prefer-const
  let self: RecursiveMock;
  const handler: ProxyHandler<typeof callableTarget> = {
    get(_target, prop) {
      // Avoid being treated as a Promise/thenable by test runners or frameworks
      if (prop === 'then') {
        return undefined;
      }
      if (prop === 'toString') {
        return () => `[${label}]`;
      }
      if (prop === Symbol.toPrimitive) {
        return () => 0;
      }
      return self;
    },
    apply() {
      return self;
    },
    construct() {
      return self as unknown as object;
    },
    has() {
      return false;
    },
    set() {
      return false;
    },
  };

  self = new Proxy(callableTarget, handler) as unknown as RecursiveMock;
  return self;
}

const mockQueryClient = createRecursiveProxy('ClerkMockQueryClient') as unknown as QueryClient;

type QueryObserverConstructor = (typeof import('@tanstack/query-core'))['QueryObserver'];
type InfiniteQueryObserverConstructor = (typeof import('@tanstack/query-core'))['InfiniteQueryObserver'];

export type ClerkInternalQueryClient = {
  __tag: 'clerk-rq-client';
  client: QueryClient;
  QueryObserver: QueryObserverConstructor;
  InfiniteQueryObserver: InfiniteQueryObserverConstructor;
};

const useClerkQueryClient = (): [QueryClient, boolean, ClerkInternalQueryClient | undefined] => {
  const clerk = useClerkInstanceContext();

  // @ts-expect-error - __internal_queryClient is not typed
  const queryClient = clerk.__internal_queryClient as ClerkInternalQueryClient | undefined;
  const [, setQueryClientLoaded] = useState(
    typeof queryClient === 'object' && '__tag' in queryClient && queryClient?.__tag === 'clerk-rq-client',
  );

  useEffect(() => {
    const _setQueryClientLoaded = () => setQueryClientLoaded(true);
    // @ts-expect-error - queryClientStatus is not typed
    clerk.on('queryClientStatus', _setQueryClientLoaded);
    return () => {
      // @ts-expect-error - queryClientStatus is not typed
      clerk.off('queryClientStatus', _setQueryClientLoaded);
    };
  }, [clerk, setQueryClientLoaded]);

  const isLoaded =
    typeof queryClient === 'object' && '__tag' in queryClient && queryClient?.__tag === 'clerk-rq-client';

  return [queryClient?.client || mockQueryClient, isLoaded, queryClient];
};

export { useClerkQueryClient };
