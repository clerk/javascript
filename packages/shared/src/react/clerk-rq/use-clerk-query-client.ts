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

type ClerkRQClient = { __tag: 'clerk-rq-client'; client: QueryClient };

const isTaggedRQClient = (value: unknown): value is ClerkRQClient => {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__tag' in (value as Record<string, unknown>) &&
    (value as Record<string, unknown>).__tag === 'clerk-rq-client'
  );
};

const getQueryClientState = (clerk: unknown): { client: QueryClient; isLoaded: boolean } => {
  const internal = (clerk as { __internal_queryClient?: ClerkRQClient | undefined }).__internal_queryClient;

  if (isTaggedRQClient(internal)) {
    return { client: internal.client, isLoaded: true };
  }

  return { client: mockQueryClient, isLoaded: false };
};

const useClerkQueryClient = (): [QueryClient, boolean] => {
  const clerk = useClerkInstanceContext();

  const [state, setState] = useState<{ client: QueryClient; isLoaded: boolean }>(() => getQueryClientState(clerk));

  useEffect(() => {
    const handleStatusChange = () => {
      setState(getQueryClientState(clerk));
    };

    // @ts-expect-error - queryClientStatus is not typed on Clerk
    clerk.on('queryClientStatus', handleStatusChange);

    return () => {
      // @ts-expect-error - queryClientStatus is not typed on Clerk
      clerk.off('queryClientStatus', handleStatusChange);
    };
  }, [clerk]);

  return [state.client, state.isLoaded];
};

export { useClerkQueryClient };
