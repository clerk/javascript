import type { QueryClient } from '@tanstack/query-core';
import { useEffect, useState } from 'react';

import { useClerkInstanceContext } from '../contexts';

export type RecursiveMock = {
  (...args: unknown[]): RecursiveMock;
} & {
  readonly [key in string | symbol]: RecursiveMock | boolean | string | number | undefined;
};

const CLERK_RECURSIVE_MOCK = Symbol.for('clerk.recursiveMock');

type TaggedQueryClient = { __tag: 'clerk-rq-client'; client: QueryClient };

const isTaggedQueryClient = (value: unknown): value is TaggedQueryClient => {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__tag' in value &&
    (value as { __tag?: unknown }).__tag === 'clerk-rq-client'
  );
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
      if (prop === CLERK_RECURSIVE_MOCK) {
        return true;
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

const isClerkRecursiveMock = (value: unknown): value is RecursiveMock => {
  return typeof value === 'function' && (value as RecursiveMock)[CLERK_RECURSIVE_MOCK] === true;
};

const useClerkQueryClient = (): [QueryClient, boolean] => {
  const clerk = useClerkInstanceContext();

  // @ts-expect-error - __internal_queryClient is not typed
  const queryClient = clerk.__internal_queryClient as TaggedQueryClient | undefined;
  const [queryClientLoaded, setQueryClientLoaded] = useState(isTaggedQueryClient(queryClient));

  useEffect(() => {
    const handleQueryClientStatus = () => {
      // @ts-expect-error - __internal_queryClient is not typed
      const nextQueryClient = clerk.__internal_queryClient as TaggedQueryClient | undefined;
      if (isTaggedQueryClient(nextQueryClient)) {
        setQueryClientLoaded(true);
      }
    };
    // @ts-expect-error - queryClientStatus is not typed
    clerk.on('queryClientStatus', handleQueryClientStatus);
    return () => {
      // @ts-expect-error - queryClientStatus is not typed
      clerk.off('queryClientStatus', handleQueryClientStatus);
    };
  }, [clerk, setQueryClientLoaded]);

  useEffect(() => {
    if (!queryClientLoaded && isTaggedQueryClient(queryClient)) {
      setQueryClientLoaded(true);
    }
  }, [queryClientLoaded, queryClient, setQueryClientLoaded]);

  const isLoaded = queryClientLoaded && isTaggedQueryClient(queryClient);
  const resolvedQueryClient = isTaggedQueryClient(queryClient) ? queryClient.client : mockQueryClient;

  return [resolvedQueryClient, isLoaded];
};

export { CLERK_RECURSIVE_MOCK, isClerkRecursiveMock, useClerkQueryClient };
