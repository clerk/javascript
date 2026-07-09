import type { QueryClient } from '@tanstack/query-core';

import { getClerkQueryClient } from './clerk-query-client';

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

/**
 * Returns `[client, isLoaded]`. The real client is owned by `@clerk/shared`
 * and lazily instantiated on the browser only — SSR returns the proxy mock
 * + `isLoaded: false` so per-request renders never share a query cache.
 */
const useClerkQueryClient = (): [QueryClient, boolean] => {
  const client = getClerkQueryClient();
  return [client ?? mockQueryClient, Boolean(client)];
};

export { useClerkQueryClient };
